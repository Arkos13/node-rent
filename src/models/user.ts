import {Document, model, Model, Schema} from "mongoose";
import {compareSync, genSalt, hash} from "bcrypt";
import { NextFunction } from "express";
import { IRental } from "./rental";
import { IBooking } from "./booking";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  stripeCustomerId: string;
  revenue: number;
  rentals: Array<IRental>;
  bookings: Array<IBooking>;
  hasSamePassword(password: string): boolean;
}

const userSchema: Schema = new Schema({
  username: {
    type: String,
    min: [4, "Too short, min is 4 characters"],
    max: [32, "Too long, max is 32 characters"]
  },
  email: {
    type: String,
    min: [4, "Too short, min is 4 characters"],
    max: [32, "Too long, max is 32 characters"],
    unique: true,
    lowercase: true,
    required: "Email is required",
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
  },
  password: {
    type: String,
    min: [4, "Too short, min is 4 characters"],
    max: [32, "Too long, max is 32 characters"],
    required: "Password is required"
  },
  rentals: [{type: Schema.Types.ObjectId, ref: "Rental"}],
  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
  stripeCustomerId: String,
  revenue: Number
});

userSchema.methods.hasSamePassword = function(requestedPassword: string): boolean {
  return compareSync(requestedPassword, this.password);
};

userSchema.pre<IUser>("save", function(next: NextFunction) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  genSalt(10, function(err, salt) {
    hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

export const UserModel: Model<IUser> = model<IUser>("User", userSchema);
