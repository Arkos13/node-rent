import {Request, Response} from "express";
import * as dotenv from "dotenv";
import { IUser, UserModel } from "../models/user";
import { IPayment, PaymentModel } from "../models/payment";
import { BookingModel, IBooking } from "../models/booking";
import * as Stripe from "stripe";
import { RentalModel } from "../models/rental";
dotenv.config();

export class PaymentController {

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static getPendingPayments(req: Request, res: Response) {
    const user: IUser = res.locals.user;
    PaymentModel
      .where("toUser", user)
      .populate({
        path: "booking",
        populate: { path: "rental" },
      })
      .populate("fromUser", "username")
      .exec((err: Error, foundPayments: IPayment[]) => {
        if (err) {
          return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
        }
        return res.json(foundPayments);
      });
  }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static confirmPayment(req: Request, res: Response) {
    const payment = req.body;
    const user: IUser = res.locals.user;
    PaymentModel.findById(payment._id)
      .populate("toUser")
      .populate("booking")
      .exec((err: Error, foundPayment: IPayment) => {
        if (err) {
          return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
        }
        if (foundPayment.status === "pending" && user.id === foundPayment.toUser.id) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          const booking: IBooking = foundPayment.booking;
          const charge = stripe.charges.create({
            amount: booking.totalPrice,
            currency: "usd",
            customer: foundPayment.fromStripeCustomerId
          });
          if (charge) {
            booking.status = "active";
            booking.save();
            foundPayment.charge = charge;
            foundPayment.status = "paid";
            foundPayment.save((err: Error) => {
              if (err) {
                return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
              }
              UserModel.update({_id: foundPayment.toUser},
                { $inc: {revenue: foundPayment.amount}},
                (err: Error, user: IUser) => {
                  if (err) {
                    return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
                  }
                  return res.json({status: "paid"});
                });
            });
          }
        }
      });
  }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static declinePayment(req: Request, res: Response) {
    const payment = req.body;
    const { booking }: {booking: IBooking} = payment;
    BookingModel.deleteOne({id: booking._id}, (err: Error) => {
      if (err) {
        return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
      }
      PaymentModel.update({_id: payment._id}, {status: "declined"});
      RentalModel.update({_id: booking.renal}, {$pull: {bookings: booking._id}});
      return res.json({status: "deleted"});
    });
  }
}
