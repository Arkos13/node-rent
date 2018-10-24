import {Request, Response} from "express";
import { BookingModel, IBooking } from "../models/booking";
import { IUser } from "../models/user";
import {RentalModel, IRental} from "../models/rental";
import * as moment from "moment";

export class BookingController {

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static createBooking(req: Request, res: Response) {
    const { startAt, endAt, totalPrice, guests, days, rental } = req.body;
    const user: IUser = res.locals.user;
    RentalModel.findById(rental._id)
      .populate("bookings")
      .populate("user")
      .exec(function(err: Error, rental: IRental) {
        if (err) {
          return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
        }
        if (rental.user && rental.user.id === user.id) {
          return res.status(422).send({errors: [{title: "Invalid User!", detail: "Cannot create booking on your Rental!"}]});
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
          rental.bookings.push(booking);
          user.bookings.push(booking);
          booking.save((err: Error) => {
            if (err) {
              return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
            }
            rental.save();
            user.save();
            return res.json({startAt: booking.startAt, endAt: booking.endAt});
          });
        } else {
          return res.status(422).send({errors: [{title: "Invalid Booking!", detail: "Choosen dates are already taken!"}]});
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
}
