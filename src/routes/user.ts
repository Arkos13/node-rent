import {Router } from "express";
import {UserController} from "../controllers/user";

/**
 * @class UserRoute
 * */
export class UserRoute {

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @param router{Router}
   * @static
   */
  public static create(router: Router) {
    router.route("/auth").post(UserController.auth);
    router.route("/register").post(UserController.register);
    router.route("/users/:id").get(UserController.authMiddleware, UserController.getUser);
    router.route("/users/edit").patch(UserController.authMiddleware, UserController.editUser);
  }
}
