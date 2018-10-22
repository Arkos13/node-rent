import * as cookieParser from "cookie-parser";
import * as body_parser from "body-parser";
import * as express from "express";
import * as logger from "morgan";
import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import {createServer, Server} from "http";
import {RentalRoute} from "./routes/rentals";
import { UserRoute } from "./routes/user";
import { BookingRoute } from "./routes/booking";

dotenv.config();

/**
 * The server.
 *
 * @class ServerApp
 */

export class ServerApp {
    public app: express.Application;
    private  server : Server;
    private port : string | number;

    /**
     * Constructor
     *
     * @class Server
     * @constructor
     */

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.listen();
        this.connectDB();
        this.routes();
    }

    private createApp() : void {
        this.app = express();
    }

    /**
     * Configure application
     *
     * @class Server
     * @method config
     * */
    public config() {
        this.port = process.env.PORT || 8080;
        this.app.use(logger("dev"));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(body_parser.json());

        this.app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
            res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        // catch 404 and forward to error handler
        this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            err.status = 404;
            next(err);
        });

        // error handler
        this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get("env") === "development" ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render("error");
        });
    }

    private createServer() : void {
        this.server = createServer(this.app);
    }

    private listen() {
        this.server.listen(this.port, () => {
            console.log("Running server on port %s", this.port);
        });
    }

    /**
     * Connect DB
     *
     * @class Server
     * @method connectDB
     */
    public connectDB() {
        mongoose.connect(process.env.DB_URI, { useNewUrlParser: true }).then(() => {
            console.log("Connection has been established successfully.");
        }).catch((err) => {
            console.error("Unable to connect to the database:", err);
        });
    }

    /**
     * Create router
     *
     * @class Server
     * @method routes
     */
    public routes() {
        let router: express.Router;
        router = express.Router();
        RentalRoute.create(router);
        UserRoute.create(router);
        BookingRoute.create(router);
        this.app.use("/api/v1", router);
    }

    public getApp(): express.Application {
        return this.app;
    }
}
