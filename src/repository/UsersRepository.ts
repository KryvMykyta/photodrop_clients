import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray } from "drizzle-orm/expressions";
import { users, UsersType } from "./../schemas/userSchema";
import { sql } from "drizzle-orm";

export class UsersRepository {
  db: NodePgDatabase;

  constructor(pool: Pool) {
    const db = drizzle(pool);
    this.db = db;
  }

  public getUserByPhone = async (phone: string) => {
    return await this.db.select().from(users).where(eq(users.phone, phone));
  };

  public addUser = async (phone: string) => {
    const usersFound = await this.getUserByPhone(phone);
    if (!usersFound[0]) {
      await this.db.insert(users).values({ phone });
    }
  };

  public addAlbum = async (phone: string, albumID: string) => {
    await this.db.execute(sql`update users set albums = array_append(albums, ${albumID}) where phone = ${phone}`)
  }

  public isBoughtAlbum = async (phone: string, albumID: string) => {
    const user = (await this.db.execute<UsersType>(sql`select * from users where phone = ${phone} and ${albumID} = any(albums)`)).rows
    if (!user[0]) return false
    return true
  }
}

