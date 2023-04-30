import { InferModel } from 'drizzle-orm';
import {
    integer,
    pgTable,
    text
  } from 'drizzle-orm/pg-core';

export const albums = pgTable('albums', {
  photographerLogin: text('photographerLogin').notNull(),
  albumID: text('albumID').notNull(),
  albumName: text('albumName').notNull(),
  date: text('date').notNull(),
  location: text('location').notNull()
})

export type AlbumType = InferModel<typeof albums>

