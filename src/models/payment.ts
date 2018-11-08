import {Document, model, Model, Schema} from "mongoose";
import { IUser } from "./user";
import { IBooking } from "./booking";

const paymentSchema: Schema = new Schema({
  fromUser: { type: Schema.Types.ObjectId, ref: "User"},
  fromStripeCustomerId: String,
  toUser: { type: Schema.Types.ObjectId, ref: "User"},
  booking: { type: Schema.Types.ObjectId, ref: "Booking" },
  amount: Number,
  tokenId: String,
  charge: Schema.Types.Mixed,
  status: {type: String, default: "pending"}
});

export interface IPayment extends Document {
  fromUser: IUser;
  fromStripeCustomerId: string;
  toUser: IUser;
  booking: IBooking;
  amount: number;
  tokenId: string;
  charge: any;
  status: string;
}

const PaymentModel: Model<IPayment> = model<IPayment>("Payment", paymentSchema);

export {PaymentModel};
