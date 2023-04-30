import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray} from "drizzle-orm/expressions";
import { photos, PhotosType } from "./../schemas/photoSchema";
import { sql } from "drizzle-orm";
import { userphotos, users } from "./../schemas/userSchema";
import { albums } from "./../schemas/albumsSchema";


export class PhotoRepository {
    db: NodePgDatabase;

    constructor(pool: Pool) {
        const db = drizzle(pool)
        this.db = db
    }

    public getUsersPhotos = async (phoneNumber: string) => {
        const userPhotos = await this.db.select({
            photoID: photos.photoID,
            albumID: photos.albumID,
            login: photos.photographerLogin,
            albumName: albums.albumName,
            albumDate: albums.date,
            location: albums.location
        }).from(photos).leftJoin(userphotos, eq(photos.photoID, userphotos.photoID))
        .leftJoin(albums, eq(photos.albumID, albums.albumID))
        .where(and(eq(userphotos.phone, phoneNumber)))
        return userPhotos
    }

}
