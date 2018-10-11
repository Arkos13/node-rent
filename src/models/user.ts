import {Document, model, Model, Schema} from "mongoose";
import {compareSync, genSalt, hash} from "bcrypt";
import { NextFunction } from "express";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
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
});

userSchema.method("hasSamePassword", function(requestedPassword): boolean {
  return compareSync(requestedPassword, this.password);
});

userSchema.pre<IUser>("save", function(next: NextFunction) {
  const user = this;
  genSalt(10, function(err, salt) {
    hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

const UserModel: Model<IUser> = model<IUser>("User", userSchema);

export {UserModel, IUser};
