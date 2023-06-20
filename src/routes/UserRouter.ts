import { AuthMiddlewareClass } from "./../middlewares/AuthMiddleware";
import { UtilsClasses } from "./../app";
import { UserController } from "./../controllers/UserController";
import { Router } from "express";

export class UserRouter {
  router: Router;
  controller: UserController;
  authMiddleware: AuthMiddlewareClass;

  constructor(public path: string, public utilsClasses: UtilsClasses) {
    this.router = Router();
    this.authMiddleware = this.utilsClasses.authMiddleware;

    this.controller = new UserController(utilsClasses);

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
    this.router.post(
      "/changeName",
      this.authMiddleware.isAuthorized,
      this.controller.changeName
    );
    this.router.post(
      "/changeEmail",
      this.authMiddleware.isAuthorized,
      this.controller.changeEmail
    );
    this.router.post(
      "/changePhone/request",
      this.authMiddleware.isAuthorized,
      this.controller.changePhoneRequest
    );
    this.router.post(
      "/changePhone/verify",
      this.authMiddleware.isAuthorized,
      this.controller.changePhoneVerify
    );
  }
}
