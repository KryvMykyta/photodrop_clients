import { Pool } from "pg";
import { PhotoRepository } from "./repository/PhotosRepository";
import dotenv from "dotenv";
import Stripe from "stripe";
import { UsersRepository } from "./repository/UsersRepository";
dotenv.config()

const photographersPool = new Pool({
    connectionString: process.env.DB_CONN_STRING as string,
});
const photoRepository = new UsersRepository(photographersPool)

const s = new PhotoRepository(photographersPool)
const stripe = new Stripe(process.env.STRIPE_API_KEY as string,{apiVersion: "2022-11-15"})



const main = async () => {
    const l = await photoRepository.isBoughtAlbum('123','123456')
    console.log(l);
}

main()