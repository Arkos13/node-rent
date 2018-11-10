import {UserModel, IUser} from "../models/user";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { IRental, RentalModel } from "../models/rental";
dotenv.config();

export class UserController {

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static getUser(req: Request, res: Response) {
    const requestedUserId = req.params.id;
    const user: IUser = res.locals.user;
    if (requestedUserId === user.id) {
      UserModel.findById(requestedUserId, (err: Error, foundUser: IUser) => {
        if (err) {
          return res.status(422).send({errors: [{title: "Query error!", detail: err.message}]});
        }
        return res.json(foundUser);
      });
    } else {
      UserModel.findById(requestedUserId)
        .select("-revenue -stripeCustomerId -password")
        .exec((err: Error, foundUser: IUser) => {
        if (err) {
          return res.status(422).send({errors: [{title: "Query error!", detail: err.message}]});
        }
        return res.json(foundUser);
      });
    }
  }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static editUser(req: Request, res: Response) {
    const userData = req.body;
    const user: IUser = res.locals.user;
    UserModel
      .findById(user.id)
      .exec(function(err: Error, userFound: IUser) {
        if (err) {
          return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
        }
        userFound.set(userData);
        userFound.save(function(err: Error) {
          if (err) {
            return res.status(422).send({errors: [{title: "Invalid Query!", detail: err.message}]});
          }
          return res.status(200).send(userFound);
        });
      });
  }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static auth(req: Request, res: Response) {
    const {email, password} = req.body;
    if (!password || !email) {
      return res.status(422).send({errors: [{title: "Data missing!", detail: "Provide email and password!"}]});
    }
    UserModel.findOne({email: email}, function(err: Error, user: IUser) {
      if (err) {
        return res.status(422).send({errors: [{title: "Query error!", detail: err.message}]});
      }
      if (!user) {
        return res.status(422).send({errors: [{title: "Invalid User!", detail: "User does not exist"}]});
      }
      if (user.hasSamePassword(password)) {
        const token = jwt.sign({
          userId: user.id,
          username: user.username
        }, process.env.SECRET, { expiresIn: "1h"});
        return res.json(token);
      } else {
        return res.status(422).send({errors: [{title: "Wrong Data!", detail: "Wrong email or password"}]});
      }
    });
  }

  /**
   * @param req{Request}
   * @param res{Response}
   * */
  public static register(req: Request, res: Response) {
    const { username, email, password, passwordConfirmation } = req.body;

    if (!password || !email) {
      return res.status(422).send({errors: [{title: "Data missing!", detail: "Provide email and password!"}]});
    }

    if (password !== passwordConfirmation) {
      return res.status(422).send({errors: [{title: "Invalid passsword!", detail: "Password is not a same as confirmation!"}]});
    }

    UserModel.findOne({email: email}, function(err: Error, existingUser: IUser) {
      if (err) {
        return res.status(422).send({errors: [{title: "Query error!", detail: err.message}]});
      }

      if (existingUser) {
        return res.status(422).send({errors: [{title: "Invalid email!", detail: "User with this email already exist!"}]});
      }

      const user = new UserModel({
        username,
        email,
        password
      });

      user.save(function(err: Error) {
        if (err) {
          return res.status(422).send({errors: [{title: "Save error!", detail: err.message}]});
        }
        return res.json({"registered": true});
      });
    });

  }

  /**
   * @param req{Request}
   * @param res{Response}
   * @param next{NextFunction}
   * */
  public static authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (token) {
      const user = UserController.parseToken(token);
      UserModel.findById((<any>user).userId, function(err: Error, existingUser: IUser) {
        if (err) {
          return res.status(422).send({errors: [{title: "Query error!", detail: err.message}]});
        }
        if (existingUser) {
          res.locals.user = existingUser;
          next();
        } else {
          return UserController.notAuthorized(res);
        }
      });
    } else {
      return UserController.notAuthorized(res);
    }
  }

  private static parseToken(token: string) {
    return jwt.verify(token.split(" ")[1], process.env.SECRET);
  }

  private static notAuthorized(res: Response) {
    return res.status(401).send({errors: [{title: "Not authorized!", detail: "You need to login to get access!"}]});
  }
}
