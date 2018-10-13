import {UserModel, IUser} from "../models/user";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export class UserController {

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
        return res.status(422).send({errors: err.message});
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
        return res.status(422).send({errors: err.message});
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
          return res.status(422).send({errors: err.message});
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
          return res.status(422).send({errors: err.message});
        }
        if (existingUser) {
          res.locals.user = user;
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