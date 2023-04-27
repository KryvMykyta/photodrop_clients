import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray } from "drizzle-orm/expressions";
import { userphotos, users, UsersType } from "./../schemas/userSchema";
import { sql } from "drizzle-orm";
import { ErrorGenerator } from "utils/ErrorGenerator";

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
  public changeName = async (phone: string, newName: string) => {
    await this.db.update(users).set({name: newName}).where(eq(users.phone,phone))
  }

  public changeEmail = async (phone: string, newEmail: string) => {
    await this.db.update(users).set({email: newEmail}).where(eq(users.phone,phone))
  }

  public changePhone = async (phone: string, newPhone: string) => {
    const usersFound = await this.getUserByPhone(newPhone)
    if (usersFound[0]) throw new ErrorGenerator(401,"User with that number already exists")
    await this.db.update(users).set({phone: newPhone}).where(eq(users.phone,phone))
    await this.db.update(userphotos).set({phone: newPhone}).where(eq(userphotos.phone,phone))
  }
}

