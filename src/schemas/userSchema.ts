import { InferModel } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  phone: text("phone").notNull().primaryKey(),
  albums: text("albums").array(),
});

export type UsersType = InferModel<typeof users>;