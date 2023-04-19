import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray} from "drizzle-orm/expressions";
import { photos, PhotosType } from "./../schemas/photoSchema";
import { sql } from "drizzle-orm";


export class PhotoRepository {
    db: NodePgDatabase;

    constructor(pool: Pool) {
        const db = drizzle(pool)
        this.db = db
    }

    public getPhotosWithUserInAlbum = async (albumID: string, phoneNumber: string) => {
        return ((await this.db.execute<PhotosType>(sql`select * from photos where ${phoneNumber} = any (people) and albumid = ${albumID}`)).rows)
    }

    public getAlbumsWithUser = async (phoneNumber: string) => {
        return ((await this.db.execute<PhotosType>(sql`select distinct albumid from photos where ${phoneNumber} = any (people)`)).rows)
    }

    public getUsersAllPhotos = async (phoneNumber: string) => {
        return ((await this.db.execute<PhotosType>(sql`select * from photos where ${phoneNumber} = any (people)`)).rows)
    }

}
