import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response, Router } from "express";
import { TokenGenerator } from "./../utils/Tokens";
import { OtpRepository } from "./../repository/OtpsRepository";
import { UsersRepository } from "repository/UsersRepository";
import { AuthMiddlewareClass } from "middlewares/AuthMiddleware";
import { PhotoRepository } from "repository/PhotosRepository";

export class PhotosController {
  router: Router;
  path: string;
  tokenGenerator: TokenGenerator;
  otpRepository: OtpRepository;
  usersRepository: UsersRepository;
  authMiddleware: AuthMiddlewareClass
  photoRepository: PhotoRepository
  constructor(path: string, utilsClasses: UtilsClasses) {
    (this.router = Router()), (this.path = path);
    this.usersRepository = utilsClasses.usersRepository
    this.tokenGenerator = utilsClasses.tokenClass;
    this.otpRepository = utilsClasses.otpRepository;
    this.authMiddleware = utilsClasses.authMiddleware;
    this.photoRepository = utilsClasses.photoRepository
    this.router.get("/photos",this.authMiddleware.isAuthorized, this.getPhotos);
    this.router.get("/albums",this.authMiddleware.isAuthorized, this.getAlbums)
    // this.router.get('/allPhotos', this.authMiddleware.isAuthorized, this.getAllPhotos)
  }

  // public getAllPhotos = async (
  //   req: Request<{}, {}, { phone: string }, {}>,
  //   res: Response
  // ) => {
  //   try {
  //     const { phone } = req.body;
  //     const photos = await this.photoRepository.getUsersAllPhotos(phone)
  //     return res.status(200).send(photos);
  //   } catch (err) {
  //     console.log(err);
  //     if (err instanceof ErrorGenerator) {
  //       return res.status(err.status).send(err.message);
  //     }
  //     return res.status(500).send("Server Error");
  //   }
  // };



  public getPhotos = async (
    req: Request<{}, {}, { phone: string }, { albumID: string}>,
    res: Response
  ) => {
    try {
      const { phone } = req.body;
      const {albumID} = req.query
      if (!albumID) throw new ErrorGenerator(502,"Bad request")
      const photos = await this.photoRepository.getPhotosWithUserInAlbum(albumID, phone)
      return res.status(200).send(photos);
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
      const albums = (await this.photoRepository.getAlbumsWithUser(phone)).map((albumRecord) => {return albumRecord.albumID})
      return res.status(200).send(albums);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };
}
