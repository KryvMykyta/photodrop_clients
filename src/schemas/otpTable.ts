import { InferModel } from 'drizzle-orm';
import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const otpTokens = sqliteTable('otps', {
  phone: text('phone').primaryKey().notNull(),
  otp: text('otp').notNull(),
  createdAt: real('createdat').notNull()
})

export type OtpToken = InferModel<typeof otpTokens>