import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { TokenGenerator } from "utils/Tokens";
import { Pool } from "pg";
import Database from "better-sqlite3";
import AWS from "aws-sdk";
import { OtpRepository } from "repository/OtpsRepository";
import { AuthMiddlewareClass } from "middlewares/AuthMiddleware";
import { UsersRepository } from "repository/UsersRepository";
import { TelegramSenderBot } from "utils/TelegramBot";
import { PhotoRepository } from "repository/PhotosRepository";
import Stripe from "stripe";
import { S3Repository } from "s3/S3";
import { AuthRouter } from "routes/AuthRouter";
import { PhotosRouter } from "routes/PhotosRouter";
import { UserRouter } from "routes/UserRouter";
import { StripeRouter } from "routes/StripeRouter";
dotenv.config();
const app = express();
const PORT = 3000;
app.use("/stripe/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(cors());
AWS.config.update({
  apiVersion: "2010-12-01",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "eu-central-1",
});

const S3Instance = new AWS.S3();
const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2022-11-15",
});
const otpSqlite = new Database("otpTokens.db");
const s3 = new S3Repository(S3Instance)
const photographersPool = new Pool({
  connectionString: process.env.DB_CONN_STRING,
});
const bot = new TelegramBot(process.env.BOT_KEY, { polling: true });
const telegBot = new TelegramSenderBot(bot);
const tokenGenerator = new TokenGenerator();
const otpRepository = new OtpRepository(otpSqlite);
const photoRepository = new PhotoRepository(photographersPool);
const usersRepository = new UsersRepository(photographersPool);
const authMiddleware = new AuthMiddlewareClass(tokenGenerator, usersRepository);

const utilsClasses = {
  tokenGenerator,
  otpRepository,
  usersRepository,
  authMiddleware,
  telegBot,
  photoRepository,
  stripe,
  s3
};
export type UtilsClasses = typeof utilsClasses;

const authRouter = new AuthRouter("/auth", utilsClasses)
const photosRouter = new PhotosRouter("/info", utilsClasses)
const stripeRouter = new StripeRouter("/stripe", utilsClasses)
const userRouter = new UserRouter("/user", utilsClasses)

const routes = [authRouter, photosRouter, stripeRouter, userRouter];
routes.forEach((route) => {
  app.use(route.path, route.router);
});

app.listen(PORT, () => {
  console.log("started");
});
