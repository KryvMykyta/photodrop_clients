import { UtilsClasses } from "./../app";
import { AuthController } from "./../controllers/AuthController";
import { Router } from "express";

export class AuthRouter {
  router: Router;
  controller: AuthController;

  constructor(public path: string, public utilsClasses: UtilsClasses) {
    this.router = Router();

    this.controller = new AuthController(utilsClasses);

    this.router.post("/login", this.controller.login);
    this.router.post("/login/verify", this.controller.verifyLogin);
  }
}
