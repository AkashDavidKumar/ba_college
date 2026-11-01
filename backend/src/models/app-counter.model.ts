/**
 * app-counter.model.ts — Dedicated Atomic Sequence Counter for Application Tracking Numbers
 *
 * Implements concurrent-safe atomic sequence increments via MongoDB findOneAndUpdate with $inc.
 * Generates tracking numbers conforming to format BAC-ADM-YYYY-XXXX.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppCounterDocument extends Document<string> {
  _id: string;
  seq: number;
  updatedAt?: Date;
}

const appCounterSchema = new Schema<IAppCounterDocument>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0, required: true },
  },
  {
    collection: 'app_counters',
    timestamps: true,
  }
);

export const AppCounter: Model<IAppCounterDocument> =
  (mongoose.models.AppCounter as Model<IAppCounterDocument>) ||
  mongoose.model<IAppCounterDocument>('AppCounter', appCounterSchema, 'app_counters');

/**
 * Atomically generates the next consecutive application tracking number for a given calendar year.
 * Format: BAC-ADM-YYYY-XXXX (e.g. BAC-ADM-2026-0001)
 *
 * Guarantees zero sequence gaps or duplicates under concurrent requests.
 */
export async function getNextApplicationNumber(year: number = new Date().getFullYear()): Promise<string> {
  const counterId = `admissions_${year}`;
  const counter = await AppCounter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seqPadded = String(counter.seq).padStart(4, '0');
  return `BAC-ADM-${year}-${seqPadded}`;
}
