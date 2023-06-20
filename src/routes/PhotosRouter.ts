import { UtilsClasses } from "./../app";
import { PhotosController } from "./../controllers/PhotosController";
import { Router } from "express";
import { AuthMiddlewareClass } from "./../middlewares/AuthMiddleware";

export class PhotosRouter {
  router: Router;
  controller: PhotosController;
  authMiddleware: AuthMiddlewareClass;

  constructor(public path: string, public utilsClasses: UtilsClasses) {
    this.router = Router();
    this.authMiddleware = this.utilsClasses.authMiddleware;

    this.controller = new PhotosController(utilsClasses);

    this.router.get(
      "/photos",
      this.authMiddleware.isAuthorized,
      this.controller.getPhotosInAlbum
    );
    this.router.get(
      "/albums",
      this.authMiddleware.isAuthorized,
      this.controller.getAlbums
    );
    this.router.get(
      "/addSelfie",
      this.authMiddleware.isAuthorized,
      this.controller.addSelfie
    );
    this.router.get(
      "/getMe",
      this.authMiddleware.isAuthorized,
      this.controller.getMe
    );
    this.router.get(
      "/getPhoto",
      this.authMiddleware.isAuthorized,
      this.controller.getPhoto
    );
  }
}
