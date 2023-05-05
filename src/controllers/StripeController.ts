import { ErrorGenerator } from "./../utils/ErrorGenerator";
import { UtilsClasses } from "./../app";
import { Request, Response, Router } from "express";
import Stripe from "stripe";
import { UsersRepository } from "./../repository/UsersRepository";
import { AuthMiddlewareClass } from "./../middlewares/AuthMiddleware";

export class StripeController {
  router: Router;
  path: string;
  stripe: Stripe;
  usersRepository: UsersRepository;
  authMiddleware: AuthMiddlewareClass;
  constructor(path: string, utilsClasses: UtilsClasses) {
    (this.router = Router()), (this.path = path);
    this.stripe = utilsClasses.stripe;
    this.usersRepository = utilsClasses.usersRepository;
    this.authMiddleware = utilsClasses.authMiddleware
    this.router.post("/payment", this.authMiddleware.isAuthorized, this.createPaymentLink);
    this.router.post("/webhook", this.handleWebhook);
  }

  public createPaymentLink = async (
    req: Request<
      {},
      {},
      {
        successLink: string;
        failLink: string;
        albumID: string;
        phone: string;
      },
      {}
    >,
    res: Response
  ) => {
    try {
      const { albumID, phone ,successLink,failLink } = req.body;
      if (await this.usersRepository.isBoughtAlbum(phone,albumID)) throw new ErrorGenerator(400, "You already bought this album");
      const session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: albumID,
              },
              unit_amount: 5000,
            },
            quantity: 1,
          },
        ],
        success_url: successLink,
        cancel_url: failLink,
        metadata: {
          phone,
          albumID,
        },
      });
      return res.status(200).send(session.url);
    } catch (err) {
      console.log(err);
      if (err instanceof ErrorGenerator) {
        return res.status(err.status).send(err.message);
      }
      return res.status(500).send("Server Error");
    }
  };

  public handleWebhook = async (
    request: Request<{}, {}, string | Buffer, {}>,
    response: Response
  ) => {
    try {
      const endpointSecret = "whsec_Bu9U88ouNoFKiGm38TKEX4689QJMntpc";
      const sig = request.headers["stripe-signature"] as string;
      console.log(sig);

      /// <reference types="stripe-event-types" />
      const event = this.stripe.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret
      ) as Stripe.DiscriminatedEvent;

      switch (event.type) {
        case "checkout.session.completed":
          const checkoutSessionCompleted = event.data.object;
          console.log(checkoutSessionCompleted);
          const status = checkoutSessionCompleted.payment_status
          // Then define and call a function to handle the event checkout.session.completed
          if (status === "paid") {
            const { metadata } = checkoutSessionCompleted;
            if (!metadata || !metadata.phone || !metadata.albumID) return response.status(502).send("Bad request");
            const { phone, albumID } = metadata;
            await this.usersRepository.addAlbum(phone, albumID);
            // ... handle other event types
            break;
          }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      return response.send();
    } catch (err) {
      return response.status(500).send(err);
    }
  };
}
