import { IRental, RentalModel } from "../models/rental";
import {Request, Response} from "express";
import { IUser, UserModel } from "../models/user";
import {ImageUpload} from "../services/image-upload";

export class RentalController {

    /**
     * @param req{Request}
     * @param res{Response}
     * @param callback {any}
     * */
    public static getRentals(req: Request, res: Response, callback: any) {
      const city = req.query.city;
      const query = city ? {city: city.toLowerCase()} : {};
      RentalModel.find(query)
        .select("-bookings")
        .exec(function (err, rentals) {
          if (err) {
            return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
          }
          if (city && rentals.length === 0) {
            return res.status(422).send({errors: [{title: "No Rentals Found!", detail: `There are no rentals for city ${city}`}]});
          }
          callback(rentals);
        });
    }

    /**
     * @param req{Request}
     * @param res{Response}
     * @param callback {any}
     * */
    public static getRentalById(req: Request, res: Response, callback: any) {
        const rentalId = req.params.id;
        RentalModel.findById(rentalId)
          .populate("user", "username -_id")
          .populate("bookings", "startAt endAt -_id")
          .exec(function(err, foundRental) {
              if (err || !foundRental) {
                  return res.status(422).send({errors: [{title: "Rental Error!", detail: "Could not find Rental!"}]});
              }
              callback(foundRental);
          });
    }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
    public static getRentalsByCurrentUser(req: Request, res: Response) {
      const user: IUser = res.locals.user;
      RentalModel
        .where("user", user)
        .populate("bookings")
        .exec(function(err: Error, rentals: IRental[]) {
          if (err) {
            return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
          }
          return res.json(rentals);
        });
    }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
    public static checkVerifyUser(req: Request, res: Response) {
      const user: IUser = res.locals.user;
      RentalModel
        .findById(req.params.id)
        .populate("user")
        .exec(function(err: Error, rental: IRental) {
          if (err) {
            return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
          }
          if (rental.user.id !== user.id) {
            return res.status(422).send({errors: [{title: "Invalid User!", detail: "You are not rental owner!"}]});
          }
          return res.json({status: "verified"});
        });
    }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
    public static addRental(req: Request, res: Response) {
      const { title, city, street, category, image, shared, bedrooms, description, dailyRate } = req.body;
      const user: IUser = res.locals.user;
      const rental = new RentalModel({title, city, street, category, image, shared, bedrooms, description, dailyRate});
      rental.user = user;
      RentalModel.create(rental, function(err: Error, newRental: IRental) {
        if (err) {
          return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
        }
        UserModel
          .findById(user.id)
          .exec(function(err: Error, foundUser: IUser) {
            if (err) {
              return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
            }
            foundUser.rentals.push(newRental);
            foundUser.save();
            return res.json(newRental);
        });
      });
    }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
    public static editRental(req: Request, res: Response) {
      const rentalData = req.body;
      const user: IUser = res.locals.user;
      RentalModel
        .findById(req.params.id)
        .populate("user")
        .exec(function(err: Error, rental: IRental) {
          if (err) {
            return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
          }
          if (rental.user.id !== user.id) {
            return res.status(422).send({errors: [{title: "Invalid User!", detail: "You are not rental owner!"}]});
          }
          rental.set(rentalData);
          rental.save(function(err: Error) {
            if (err) {
              return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
            }
            return res.status(200).send(rental);
          });
        });
    }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
    public static deleteRental(req: Request, res: Response) {
      const user: IUser = res.locals.user;
      RentalModel
        .findById(req.params.id)
        .populate("user", "_id")
        .populate({
          path: "bookings",
          select: "startAt",
          match: { startAt: { $gt: new Date()}}
        })
        .exec(function(err: Error, rental: IRental) {
          if (err) {
            return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
          }
          if (user.id !== rental.user.id) {
            return res.status(422).send({errors: [{title: "Invalid User!", detail: "You are not rental owner!"}]});
          }
          if (rental.bookings.length > 0) {
            return res.status(422).send({errors: [{title: "Active Bookings!", detail: "Cannot delete rental with active bookings!"}]});
          }
          user.rentals.splice(rental.id, 1);
          rental.remove(function(err: Error) {
            if (err) {
              return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
            }
            user.save();
            return res.json({"status": "deleted"});
          });
        });
    }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
    public static imageUpload(req: Request, res: Response) {
      const singleUpload = ImageUpload.getMulter().single("image");
      singleUpload(req, res, function(err) {
        if (err) {
          return res.status(422).send({errors: [{title: "Image Upload Error", detail: err.message}]});
        }
        return res.json({"imageUrl": (<any>req.file).location});
      });
    }
}
