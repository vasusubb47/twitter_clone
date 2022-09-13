import {Request, Response} from "express";
import { client, cookies, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const genRandString = (len: number):String => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890~!@#$%^&*";
    let result = "";

    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

export const authorize = async (req : Request, res : Response, next : Function) => {
    const { authToken , userToken } : {
        authToken: string,
        userToken: string
    } = req.cookies;
    
    const db_cookie = (await prisma.$queryRaw`SELECT * FROM cookies WHERE uid = ${userToken}`) as cookies[];

    if ((db_cookie.length > 0) && (db_cookie[0].cookie == authToken)) {
        next();
    }else {
        res.status(400).send({
            "Status": "Not Authorized"
        });
    }
}
