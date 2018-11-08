import {Document, model, Model, Schema} from "mongoose";
import { IUser } from "./user";
import { IRental } from "./rental";
import { IPayment } from "./payment";

const bookingSchema: Schema = new Schema({
  startAt: { type: Date, required: "Starting date is required"},
  endAt: { type: Date, required: "Ending date is required"},
  totalPrice: Number,
  days: Number,
  guests: Number,
  createdAt: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "User"},
  rental: { type: Schema.Types.ObjectId, ref: "Rental"},
  payment: { type: Schema.Types.ObjectId, ref: "Payment"},
  status: {type: String, default: "pending"}
});

export interface IBooking extends Document {
  startAt: Date;
  endAt: Date;
  totalPrice: number;
  days: number;
  createdAt: Date;
  user: IUser;
  renal: IRental;
  payment: IPayment;
  status: string;
}

const BookingModel: Model<IBooking> = model<IBooking>("Booking", bookingSchema);

export {BookingModel};
