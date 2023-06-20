import { AuthMiddlewareClass } from "./../middlewares/AuthMiddleware";
import { UtilsClasses } from "./../app";
import { StripeController } from "./../controllers/StripeController";
import { Router } from "express";

export class StripeRouter {
  router: Router;
  controller: StripeController;
  authMiddleware: AuthMiddlewareClass;

  constructor(public path: string, public utilsClasses: UtilsClasses) {
    this.router = Router();
    this.authMiddleware = this.utilsClasses.authMiddleware;

    this.controller = new StripeController(utilsClasses);

    this.router.post(
      "/payment",
      this.authMiddleware.isAuthorized,
      this.controller.createPaymentLink
    );
    this.router.post("/webhook", this.controller.handleWebhook);
  }
}
