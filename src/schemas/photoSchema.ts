import { InferModel } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export const photos = pgTable("photos", {
  albumID: text("albumid").notNull(),
  people: text("people").array(),
  photoID: text("photoid").notNull(),
  photographerLogin: text('photographerlogin').notNull()
});

export type PhotosType = InferModel<typeof photos>;