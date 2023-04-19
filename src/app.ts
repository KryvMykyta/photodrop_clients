import express from 'express'
import cors from 'cors'
import dotenv from "dotenv";
import TelegramBot from 'node-telegram-bot-api';
import { AuthController } from './controllers/AuthController';
import { TokenGenerator } from 'utils/Tokens';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import { OtpRepository } from 'repository/OtpsRepository';
import { AuthMiddlewareClass } from 'middlewares/AuthMiddleware';
import { UsersRepository } from 'repository/UsersRepository';
import { PhotosController } from 'controllers/PhotosController';
import { TelegramSenderBot } from 'utils/TelegramBot';
import { PhotoRepository } from 'repository/PhotosRepository';
import Stripe from "stripe";
import { StripeController } from 'controllers/StripeController';
dotenv.config();
const app = express()
const PORT = 3000
app.use('/stripe/webhook', express.raw({type: "*/*"}))
app.use(express.json())
app.use(cors())
const stripe = new Stripe(process.env.STRIPE_API_KEY as string,{apiVersion: "2022-11-15"})
const otpSqlite = new Database('otpTokens.db')
const photographersPool = new Pool({
    connectionString: process.env.DB_CONN_STRING as string,
});
const bot = new TelegramBot(process.env.BOT_KEY as string, {polling:true})
const telegBot = new TelegramSenderBot(bot)
const tokenClass = new TokenGenerator()
const otpRepository = new OtpRepository(otpSqlite)
const photoRepository = new PhotoRepository(photographersPool)
const usersRepository = new UsersRepository(photographersPool)
const authMiddleware = new AuthMiddlewareClass(tokenClass,usersRepository)
const utilsClasses = {
    tokenClass,
    otpRepository,
    usersRepository,
    authMiddleware,
    telegBot,
    photoRepository,
    stripe
}
export type UtilsClasses = typeof utilsClasses
const authController = new AuthController("/auth",utilsClasses)
const photosController = new PhotosController("/info",utilsClasses)
const stripeController = new StripeController("/stripe", utilsClasses)



const controllers = [authController, photosController, stripeController]
controllers.forEach((controller) => {
    app.use(controller.path, controller.router)
})


app.listen(PORT, () => {
    console.log("started")
})