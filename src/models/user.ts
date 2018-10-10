import {Document, model, Model, Schema} from "mongoose";
import {compareSync} from "bcrypt";

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

/** TODO add hash for password*/
userSchema.pre("save", function(next) {
  const user = this;
});

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

const UserModel: Model<IUser> = model<IUser>("User", userSchema);

export {UserModel, IUser};
