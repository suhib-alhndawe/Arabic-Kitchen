import express, { type Express } from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(helmet());
app.use(compression());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env["SESSION_SECRET"] || "fasah-restaurant-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env["NODE_ENV"] === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env["NODE_ENV"] === "production" ? "none" : "lax"
    },
    proxy: process.env["NODE_ENV"] === "production",
  }),
);

app.use("/api", router);

export default app;
