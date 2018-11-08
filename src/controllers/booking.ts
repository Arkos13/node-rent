import {Request, Response} from "express";
import { BookingModel, IBooking } from "../models/booking";
import { IUser } from "../models/user";
import {RentalModel, IRental} from "../models/rental";
import * as moment from "moment";
import * as Stripe from "stripe";
import * as dotenv from "dotenv";
import { IPayment, PaymentModel } from "../models/payment";
dotenv.config();

export class BookingController {

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static createBooking(req: Request, res: Response) {
    const { startAt, endAt, totalPrice, guests, days, rental, paymentToken } = req.body;
    const user: IUser = res.locals.user;
    RentalModel.findById(rental._id)
      .populate("bookings")
      .populate("user")
      .exec(async function(err: Error, rental: IRental) {
        if (err) {
          return res.status(422).send({ errors: [{ title: "Invalid Query!", detail: err.message }] });
        }
        if (rental.user && rental.user.id === user.id) {
          return res.status(422).send({ errors: [{ title: "Invalid User!", detail: "Cannot create booking on your Rental!" }] });
        }
        const booking = new BookingModel({
          startAt,
          endAt,
          totalPrice,
          guests,
          days,
          user,
          rental
        });
        if (BookingController.isValidBooking(booking, rental)) {
          const { payment, errPayment } = await BookingController.createPayment(booking, rental.user, paymentToken);
          if (payment) {
            rental.bookings.push(booking);
            user.bookings.push(booking);
            booking.payment = payment;
            booking.save((err: Error) => {
              if (err) {
                return res.status(422).send({ errors: [{ title: "Invalid Query!", detail: err.message }] });
              }
              rental.save();
              user.save();
              return res.json({ startAt: booking.startAt, endAt: booking.endAt });
            });
          } else {
            return res.status(422).send({ errors: [{ title: "Invalid Payment!", detail: errPayment }] });
          }
        } else {
          return res.status(422).send({ errors: [{ title: "Invalid Booking!", detail: "Choosen dates are already taken!" }] });
        }
      });
  }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static getUserBookings(req: Request, res: Response) {
    const user: IUser = res.locals.user;
    BookingModel
      .where("user", user)
      .populate("rental")
      .exec((err: Error, foundBookings: IBooking) => {
        if (err) {
          return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
        }
        return res.json(foundBookings);
      });
  }

  /**
   * @param proposedBooking {IBooking}
   * @param rental {IRental}
   * @return boolean
   * */
  private static isValidBooking(proposedBooking: IBooking, rental: IRental): boolean {
    let isValid = true;
    if (rental.bookings && rental.bookings.length > 0) {
      isValid = rental.bookings.every((booking: IBooking) => {
        const proposedStart = moment(proposedBooking.startAt);
        const proposedEnd = moment(proposedBooking.endAt);
        const actualStart = moment(booking.startAt);
        const actualEnd = moment(booking.endAt);
        return ((actualStart < proposedStart && actualEnd < proposedStart) || (proposedEnd < actualEnd && proposedEnd < actualStart));
      });
    }
    return isValid;
  }

  /**
   * @param booking {IBooking}
   * @param toUser {IUser}
   * @param paymentToken {any}
   * @return Promise<IPayment | any>
   * */
  private static async createPayment(booking: IBooking, toUser: IUser, paymentToken: any): Promise<IPayment | any> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { user } = booking;
    const customer = await stripe.customers.create({
      source: paymentToken.id,
      email: user.email
    });
    if (customer) {
      try {
        user.stripeCustomerId = customer.id;
        await user.save();
        const payment = new PaymentModel({
          fromUser: user,
          toUser,
          fromStripeCustomerId: customer.id,
          booking,
          tokenId: paymentToken.id,
          amount: booking.totalPrice * 100
        });
        const savedPayment = await payment.save();
        return { payment: savedPayment};
      } catch (err) {
        return { err: err.message };
      }
    } else {
      return {err: "Cannot process Payment!"};
    }
  }
}
