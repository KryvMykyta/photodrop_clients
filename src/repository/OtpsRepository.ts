import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { OtpType, otpTokens } from "./../schemas/otpTable";
import { eq, and, gte, lte } from "drizzle-orm/expressions";
import { Database } from "better-sqlite3";

export class OtpRepository {
  db: BetterSQLite3Database;

  constructor(connection: Database) {
    const db = drizzle(connection);
    this.db = db;
  }

  public updateOtp = (phone: string, otp: string) => {
    const phoneRecord = this.db
      .select()
      .from(otpTokens)
      .where(eq(otpTokens.phone, phone))
      .all();
    if (!phoneRecord[0]) {
      const newOtp: OtpType = {
        otp,
        phone,
        createdAt: new Date().getTime(),
      };
      this.db.insert(otpTokens).values(newOtp).run();
      return;
    }
    this.db.update(otpTokens)
      .set({ otp, createdAt: new Date().getTime()})
      .where(eq(otpTokens.phone, phone))
      .run();
    this.db.delete(otpTokens).where(lte(otpTokens.createdAt, new Date().getTime() - 120*1000))
  };

  public getToken = (phone: string) => {
    const timeStart = new Date().getTime() - 120*1000
    const phoneRecord = this.db
      .select()
      .from(otpTokens)
      .where(and(eq(otpTokens.phone, phone),gte(otpTokens.createdAt,timeStart)))
      .all();
    return phoneRecord
  }
}
