import { InferModel } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  phone: text("phone").notNull().primaryKey(),
  albums: text("albums").array(),
  name: text("name"),
  email: text("email")
});

export const userphotos = pgTable("userphotos", {
  phone: text("phone").notNull(),
  photoID: text("photoid").notNull()
});

export type User = InferModel<typeof users>;