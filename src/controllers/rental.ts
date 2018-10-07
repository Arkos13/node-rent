import {RentalModel} from "../models/rental";
import {Request, Response} from "express";

export class RentalController {

    /**
     * @param req{Request}
     * @param res{Response}
     * @param callback {any}
     * */
    public static getRentals(req: Request, res: Response, callback: any) {
        RentalModel.find({})
            .exec(function (err, rentals) {
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
            .exec(function(err, foundRental) {
                if (err || !foundRental) {
                    return res.status(422).send({errors: [{title: "Rental Error!", detail: "Could not find Rental!"}]});
                }
                callback(foundRental);
            });
    }
}
