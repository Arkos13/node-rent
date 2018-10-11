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
        router.route("/rentals").get(UserController.authMiddleware, function (req: Request, res: Response) {
            RentalController.getRentals(req, res, function (data) {
                return res.json(data);
            });
        });

        router.route("/rentals/:id").get(UserController.authMiddleware, function (req: Request, res: Response) {
            RentalController.getRentalById(req, res, function (data) {
                return res.json(data);
            });
        });
    }
}
