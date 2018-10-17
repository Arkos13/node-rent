import { Router } from "express";
import {BookingController} from "../controllers/booking";
import { UserController } from "../controllers/user";

/**
 * @class BookingRoute
 * */
export class BookingRoute {

  /**
   * Create the routes.
   *
   * @class BookingRoute
   * @method create
   * @param router{Router}
   * @static
   */
  public static create(router: Router) {
    router.route("/bookings/new").post(UserController.authMiddleware, BookingController.createBooking);
    router.route("/bookings").get(UserController.authMiddleware, BookingController.getUserBookings);
  }
}
