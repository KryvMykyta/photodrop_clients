import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response, Router } from "express";
import { TokenGenerator } from "./../utils/Tokens";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "repository/UsersRepository";
import { AuthMiddlewareClass } from "middlewares/AuthMiddleware";
import { PhotoRepository } from "repository/PhotosRepository";
import { DataFormatter } from "./../utils/DataFormatter";
import { S3Repository } from "./../s3/S3";

export class PhotosController {
  router: Router;
  path: string;
  tokenGenerator: TokenGenerator;
  otpRepository: OtpRepository;
  usersRepository: UsersRepository;
  authMiddleware: AuthMiddlewareClass
  photoRepository: PhotoRepository
  s3: S3Repository
  constructor(path: string, utilsClasses: UtilsClasses) {
    (this.router = Router()), (this.path = path);
    this.s3 = utilsClasses.s3
    this.usersRepository = utilsClasses.usersRepository
    this.tokenGenerator = utilsClasses.tokenClass;
    this.otpRepository = utilsClasses.otpRepository;
    this.authMiddleware = utilsClasses.authMiddleware;
    this.photoRepository = utilsClasses.photoRepository
    this.router.get("/photos",this.authMiddleware.isAuthorized, this.getPhotosInAlbum);
    this.router.get("/albums",this.authMiddleware.isAuthorized, this.getAlbums)
  }

  public getPhotosInAlbum = async (
    req: Request<{}, {}, { phone: string }, { albumID: string}>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const {albumID} = req.query
      if (!albumID) throw new ErrorGenerator(502,"Bad request")
      const photos = await this.photoRepository.getUsersPhotos(phone)
      const isBought = await this.usersRepository.isBoughtAlbum(phone,albumID)
      const formattedRecords = new DataFormatter().getAlbumPhotos(photos,albumID,isBought)
      const photosResponse = formattedRecords.map((record) => {
        return {
          photoID: record.photoID,
          url: this.s3.getPhotoUrl(record.key)
        }
      })

      return res.status(200).send(photosResponse);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };

  public getAlbums = async (
    req: Request<{}, {}, { phone: string }, {}>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const albums = (await this.photoRepository.getUsersPhotos(phone))
      const uniqueAlbums = new DataFormatter().getAlbumsOfUser(albums)
      const responseAlbums = await Promise.all(uniqueAlbums.map(async (album) => {
        const isBought = await this.usersRepository.isBoughtAlbum(phone,album.albumID)
        if (isBought) {
          return {
            albumID: album.albumID,
            url: this.s3.getPhotoUrl(`thumbnail/${album.key}`)
          }
        }
        return {
          albumID: album.albumID,
          url: this.s3.getPhotoUrl(`full/${album.key}`)
        }
      }))
      return res.status(200).send(responseAlbums);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
