import express, {Request, Response} from "express";
import bodyParser from "body-parser";
const upload = require("express-fileupload");
const cookieParser = require("cookie-parser");
import { client, cookies, PrismaClient } from '@prisma/client';
const MD5 = require("md5");

import { genRandString, authorize } from "./util";

const prisma = new PrismaClient();
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload());
const PORT = 8088;

app.post("/signup", async (req : Request, res : Response) => {
    
    /**
     * This regx is for validating password
     * (?=.*[a-z]) -> small letters
     * (?=.*[A-Z]) -> capital letters
     * (?=.*\d)    -> digits
     * (?=.*\W)    -> special characters
     * .{8,}        -> min length is 8 
    */
    const passRegx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

    const {
        name,
        email,
        user_name,
        dob,
        sex,
        bio,
        password
    }: {
        name: string, email: string, user_name: string, dob: string,
        sex: string, bio: string, password: string
    } = req.body;

    const db_data = (await prisma.$queryRaw`
        SELECT user_name, email
        FROM client 
        WHERE user_name = ${user_name.toLowerCase()}
        OR email = ${email.toLowerCase()}
    `) as {
        user_name: string,
        email: string
    }[];

    if (db_data.length != 0) {
        const msg :any = {};
        for (const data of db_data) {
            if (data.user_name == user_name.toLowerCase()) {
                msg.user_name = "The user name" + user_name.toLowerCase() + " already exits";
            }
            if (data.email == email.toLowerCase()) {
                msg.email = "The email is already in used";
            }
        }
        res.status(403).send({
            "Status": "Invalid",
            "Message": msg
        });
    }else if (!passRegx.test(password)) {
        res.status(400).send({
            "Status": "Invalid",
            "Message": "The password did not pass the required validation"
        });
    }else {

        let fault = false;
        const message :any = {};

        const emailRegx  = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

        if (!(/^[a-zA-Z ]{3,30}$/.test(name))) {
            fault = true;
            message.name = "the name is invalid";
        }
        if (!(/^[a-zA-Z0-9_]{3,30}$/.test(user_name))) {
            fault = true;
            message.user_name = "the user_name is invalid";
        }
        if ((email.length > 50) || (!emailRegx.test(email))) {
            fault = true;
            message.email = "the email is invalid";
        }
        if (sex.toLowerCase() != "male" && sex.toLowerCase() != "female") {
            fault = true;
            message.sex = "the sex should be male or female";
        }
        if (bio.length > 120) {
            fault = true;
            message.bio = "the bio should be less than or equal to 120 characters";
        }

        if (fault) {
            console.log(message);
            res.status(400).send({
                "Status": "fault",
                "Message": message
            });
            return;
        }
        
        const salt = genRandString(64);
        await prisma.client.create({
            data: {
                name: name,
                user_name: user_name.toLocaleLowerCase(),
                email: email,
                sex: sex,
                dob: new Date(2000, 1, 1),
                bio: bio,
                password_hash: Buffer.from(MD5(password + salt)),
                salt: Buffer.from(salt)
            }
        });
        res.send({
            "Status": "OK"
        });
    }

});

app.post("/login", async (req : Request, res : Response) => {
    
    const {user_name, password} = req.body;

    const db_data = await prisma.client.findFirst({
        where: {
            user_name: user_name.toLowerCase()
        }
    });
    
    if (db_data) {
        const {id, password_hash, salt} = db_data;

        if (password_hash.toString() != MD5(password + salt.toString())) {
            res.status(400).send({
                "Status": "Not logged in",
                "Message": "wrong user_name or password"
            });
            return;
        }

        let db_data_cookie = (await prisma.$queryRaw`
        SELECT * 
        FROM cookies 
        WHERE uid = ${id}`) as cookies[];

        if (db_data_cookie.length < 1) {
            console.log("creating cookie");
            db_data_cookie.push((await prisma.cookies.create({
                data: {
                    uid: db_data.id
                }
            })) as cookies);
        }

        res.cookie("authToken", db_data_cookie[0].cookie);
        res.cookie("userToken", id);
        res.send({
            "Status" : "Ok",
            "signin": true
        });
    }else {
        res.status(404).send({
            "Status": "Invalid username",
            "Message": "The user_name dosn't exist"
        });
    }
});

app.use(authorize);

app.get("/", (req: Request, res: Response) => {
    res.send({
        "result" : "it's working"
    });
});

const ImageRouter = require("./routes/Image");
const ClientRouter = require("./routes/Client");
const TweetsRouter = require("./routes/Tweet");

app.use("/img", ImageRouter);
app.use("/client", ClientRouter);
app.use("/tweet", TweetsRouter);

app.listen (PORT, () => {
    console.clear();
    console.log("running on port " + PORT);
});
