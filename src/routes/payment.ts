import { Router } from "express";
import { PaymentController } from "../controllers/payment";
import { UserController } from "../controllers/user";

/**
 * @class PaymentRoute
 * */
export class PaymentRoute {

  /**
   * Create the routes.
   *
   * @class PaymentRoute
   * @method create
   * @param router{Router}
   * @static
   */
  public static create(router: Router) {
    router.route("/payments").get(UserController.authMiddleware, PaymentController.getPendingPayments);
    router.route("/payments/confirm").post(UserController.authMiddleware, PaymentController.confirmPayment);
    router.route("/payments/decline").post(UserController.authMiddleware, PaymentController.declinePayment);
  }
}
