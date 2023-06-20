import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and } from "drizzle-orm/expressions";
import { photos, PhotosType } from "./../schemas/photoSchema";
import { userphotos } from "./../schemas/userSchema";
import { albums } from "./../schemas/albumsSchema";
import { UserPhoto } from "./../types/types";

export class PhotoRepository {
  db: NodePgDatabase;

  constructor(pool: Pool) {
    const db = drizzle(pool);
    this.db = db;
  }

  public getUsersPhotos = async (phoneNumber: string): Promise<UserPhoto[]> => {
    const userPhotos = await this.db
      .select({
        photoID: photos.photoID,
        albumID: photos.albumID,
        login: photos.photographerLogin,
        albumName: albums.albumName,
        albumDate: albums.date,
        location: albums.location,
      })
      .from(photos)
      .innerJoin(userphotos, eq(photos.photoID, userphotos.photoID))
      .innerJoin(albums, eq(photos.albumID, albums.albumID))
      .where(and(eq(userphotos.phone, phoneNumber)));
    return userPhotos;
  };

  public getPhoto = async (photoID: string): Promise<PhotosType> => {
    const photo = await this.db
      .select()
      .from(photos)
      .where(eq(photos.photoID, photoID));
    return photo[0];
  };
}
