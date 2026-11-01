/**
 * user-model.test.ts — Unit tests for User Mongoose Model instance methods & lifecycle
 */
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';

describe('User Model Instance Methods', () => {
  it('comparePassword returns true for matching password and false otherwise', async () => {
    const rawPassword = 'StrongPassword@123';
    const hash = await bcrypt.hash(rawPassword, 10);

    const user = new User({
      name: 'Test Admin',
      email: 'test@bac.edu.in',
      password: hash,
      role: 'master_admin',
    });

    const isMatch = await user.comparePassword(rawPassword);
    expect(isMatch).toBe(true);

    const isMismatch = await user.comparePassword('WrongPassword@999');
    expect(isMismatch).toBe(false);
  });

  it('comparePassword returns false if password is not set on doc', async () => {
    const user = new User({
      name: 'Test Admin',
      email: 'test@bac.edu.in',
      role: 'master_admin',
    });
    const isMatch = await user.comparePassword('AnyPassword');
    expect(isMatch).toBe(false);
  });

  it('isLocked returns true if lockUntil is in the future and false otherwise', () => {
    const lockedUser = new User({
      name: 'Locked User',
      email: 'locked@bac.edu.in',
      password: 'password',
      lockUntil: new Date(Date.now() + 60000), // 1 minute in future
    });
    expect(lockedUser.isLocked()).toBe(true);

    const expiredLockUser = new User({
      name: 'Expired Lock User',
      email: 'expired@bac.edu.in',
      password: 'password',
      lockUntil: new Date(Date.now() - 60000), // 1 minute in past
    });
    expect(expiredLockUser.isLocked()).toBe(false);

    const normalUser = new User({
      name: 'Normal User',
      email: 'normal@bac.edu.in',
      password: 'password',
    });
    expect(normalUser.isLocked()).toBe(false);
  });

  it('incLoginAttempts atomically transitions to locked state on 5th attempt in a single query', async () => {
    const user = new User({
      name: 'Test User',
      email: 'attempts@bac.edu.in',
      password: 'password',
      failedLoginAttempts: 4,
    });

    const lockDate = new Date(Date.now() + 15 * 60 * 1000);
    const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue({
      failedLoginAttempts: 5,
      lockUntil: lockDate,
    } as any);

    await user.incLoginAttempts();

    expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
      {
        _id: user._id,
        failedLoginAttempts: { $gte: 4 },
      },
      {
        $inc: { failedLoginAttempts: 1 },
        $set: { lockUntil: expect.any(Date) },
      },
      expect.objectContaining({ new: true })
    );

    expect(user.failedLoginAttempts).toBe(5);
    expect(user.lockUntil).toEqual(lockDate);

    findOneAndUpdateSpy.mockRestore();
  });

  it('incLoginAttempts increments counter without locking when attempts < 4', async () => {
    const user = new User({
      name: 'Test User',
      email: 'attempts_low@bac.edu.in',
      password: 'password',
      failedLoginAttempts: 2,
    });

    // findOneAndUpdate returns null because failedLoginAttempts is not >= 4
    const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(null);
    const findByIdAndUpdateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({
      failedLoginAttempts: 3,
    } as any);

    await user.incLoginAttempts();

    expect(findOneAndUpdateSpy).toHaveBeenCalled();
    expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
      user._id,
      { $inc: { failedLoginAttempts: 1 } },
      expect.objectContaining({ new: true })
    );
    expect(user.failedLoginAttempts).toBe(3);
    expect(user.lockUntil).toBeUndefined();

    findOneAndUpdateSpy.mockRestore();
    findByIdAndUpdateSpy.mockRestore();
  });

  it('safely handles concurrent failed attempts at threshold without race conditions', async () => {
    const user = new User({
      name: 'Concurrent User',
      email: 'concurrent@bac.edu.in',
      password: 'password',
      failedLoginAttempts: 4,
    });

    const lockDate = new Date(Date.now() + 15 * 60 * 1000);
    let currentAttempts = 4;
    const findOneAndUpdateSpy = jest.spyOn(User, 'findOneAndUpdate').mockImplementation((() => {
      currentAttempts++;
      return Promise.resolve({
        failedLoginAttempts: currentAttempts,
        lockUntil: lockDate,
      });
    }) as any);

    // Simulate 3 concurrent failed login attempts hitting at the exact same moment
    await Promise.all([
      user.incLoginAttempts(),
      user.incLoginAttempts(),
      user.incLoginAttempts(),
    ]);

    expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(3);
    expect(user.isLocked()).toBe(true);

    findOneAndUpdateSpy.mockRestore();
  });

  it('incLoginAttempts resets counter if previous lock expired', async () => {
    const user = new User({
      name: 'Test User',
      email: 'attempts2@bac.edu.in',
      password: 'password',
      failedLoginAttempts: 5,
      lockUntil: new Date(Date.now() - 10000), // expired lock
    });

    const updateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({} as any);

    await user.incLoginAttempts();
    expect(updateSpy).toHaveBeenCalledWith(user._id, {
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });

    updateSpy.mockRestore();
  });

  it('resetLoginAttempts resets failedLoginAttempts and unsets lockUntil', async () => {
    const user = new User({
      name: 'Test User',
      email: 'reset@bac.edu.in',
      password: 'password',
      failedLoginAttempts: 3,
      lockUntil: new Date(),
    });

    const updateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({} as any);

    await user.resetLoginAttempts();
    expect(updateSpy).toHaveBeenCalledWith(user._id, {
      $set: { failedLoginAttempts: 0 },
      $unset: { lockUntil: 1 },
    });

    updateSpy.mockRestore();
  });

  it('toJSON transform removes password, tokenVersion, and internal fields', () => {
    const user = new User({
      name: 'Transform User',
      email: 'transform@bac.edu.in',
      password: 'secret_password_hash',
      role: 'master_admin',
      tokenVersion: 5,
      failedLoginAttempts: 2,
    });

    const json = user.toJSON();
    expect(json.name).toBe('Transform User');
    expect(json.email).toBe('transform@bac.edu.in');
    expect((json as any).password).toBeUndefined();
    expect((json as any).tokenVersion).toBeUndefined();
    expect((json as any).failedLoginAttempts).toBeUndefined();
    expect((json as any).lockUntil).toBeUndefined();
    expect((json as any).__v).toBeUndefined();
  });
});
