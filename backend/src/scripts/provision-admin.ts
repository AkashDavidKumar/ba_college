/**
 * provision-admin.ts — Controlled Administrative Account Provisioning Script
 *
 * Usage:
 *   npx ts-node src/scripts/provision-admin.ts
 *
 * Can read from environment variables:
 *   ADMIN_NAME="Dr. V. Anitha"
 *   ADMIN_EMAIL="admin@bac.edu.in"
 *   ADMIN_PASSWORD="SecurePassword@2026"
 * Or prompts interactively via stdin if variables are absent.
 *
 * Security:
 *  - Enforces strong password policy.
 *  - Normalizes email.
 *  - Never logs or exposes the password or hash.
 *  - Never creates hardcoded or backdoor accounts.
 */
import 'dotenv/config';
import readline from 'readline';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { provisionAdminSchema } from '../validations/auth.validation';
import logger from '../utils/logger';

function prompt(question: string, hidden = false): Promise<string> {
  if (hidden && process.stdin.isTTY) {
    return new Promise((resolve) => {
      process.stdout.write(question);
      const stdin = process.stdin;
      const wasRaw = stdin.isRaw;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let password = '';
      const onData = (ch: string) => {
        ch = String(ch);
        switch (ch) {
          case '\n':
          case '\r':
          case '\u0004': // Enter or EOF
            stdin.setRawMode(wasRaw || false);
            stdin.pause();
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(password.trim());
            break;
          case '\u0003': // Ctrl+C
            stdin.setRawMode(wasRaw || false);
            process.exit(130);
            break;
          case '\b':
          case '\x7f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
            }
            break;
          default:
            password += ch;
            break;
        }
      };
      stdin.on('data', onData);
    });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runProvisioning(): Promise<void> {
  const mongoUri = process.env['MONGODB_URI'];
  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not set in environment or .env file.');
    process.exit(1);
  }

  console.log('=== Bishop Ambrose College — Admin Account Provisioning ===\n');

  let name = process.env['ADMIN_NAME'];
  let email = process.env['ADMIN_EMAIL'];
  let password = process.env['ADMIN_PASSWORD'];

  if (!name) {
    name = await prompt('Enter Administrator Full Name: ');
  }
  if (!email) {
    email = await prompt('Enter Administrator Email: ');
  }
  if (!password) {
    password = await prompt(
      'Enter Strong Password (min 12 chars, upper, lower, number, symbol): ',
      true
    );
  }

  // Validate inputs
  const parseResult = provisionAdminSchema.safeParse({
    name,
    email,
    password,
    role: 'master_admin',
  });

  if (!parseResult.success) {
    console.error('\nValidation Error:');
    for (const issue of parseResult.error.issues) {
      console.error(` - ${issue.path.join('.') || 'field'}: ${issue.message}`);
    }
    process.exit(1);
  }

  const validData = parseResult.data;

  // Connect to database
  await mongoose.connect(mongoUri);
  console.log('Connected to database.');

  try {
    const existing = await User.findOne({ email: validData.email });
    if (existing) {
      console.error(
        `\nError: An account with email "${validData.email}" already exists (ID: ${String(existing._id)}).`
      );
      process.exitCode = 1;
      return;
    }

    const newUser = await User.create({
      name: validData.name,
      email: validData.email,
      password: validData.password,
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
    });

    console.log('\n[SUCCESS] Master Administrator account created successfully!');
    console.log(` - ID:    ${String(newUser._id)}`);
    console.log(` - Name:  ${newUser.name}`);
    console.log(` - Email: ${newUser.email}`);
    console.log(` - Role:  ${newUser.role}`);

    logger.info('Master administrator provisioned via CLI script', {
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err: unknown) {
    console.error('\nError creating account:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

void runProvisioning();
