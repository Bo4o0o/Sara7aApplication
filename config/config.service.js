import {resolve} from 'node:path';
import dotenv from 'dotenv';
const envPath =  {
    development : `dev.env`,
    production : `prod.env`,
    
}
dotenv.config({path: resolve(`./config/${envPath.development}`)});

export const PORT = process.env.PORT || 3000;
export const DB_URI = process.env.DB_URI ;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
export const ENC_KEY = process.env.ENC_KEY;