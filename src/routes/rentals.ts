import {Request, Response, Router } from "express";
import {RentalController} from "../controllers/rental";
import {UserController} from "../controllers/user";

/**
 * @class RentalRoute
 * */
export class RentalRoute {

    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @param router{Router}
     * @static
     */
    public static create(router: Router) {
        router.route("/rentals/manage").get(UserController.authMiddleware, RentalController.getRentalsByCurrentUser);
        router.route("/rentals").get(function (req: Request, res: Response) {
            RentalController.getRentals(req, res, function (data) {
                return res.json(data);
            });
        });

        router.route("/rentals/:id").get(function (req: Request, res: Response) {
            RentalController.getRentalById(req, res, function (data) {
                return res.json(data);
            });
        });


        router.route("/rentals/:id/verify-user").get(UserController.authMiddleware, RentalController.checkVerifyUser);
        router.route("/rentals/new").post(UserController.authMiddleware, RentalController.addRental);
        router.route("/rentals/edit/:id").patch(UserController.authMiddleware, RentalController.editRental);
        router.route("/rentals/delete/:id").delete(UserController.authMiddleware, RentalController.deleteRental);
    }
}
