
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { authorize } from "../util";
import { EmitFlags } from 'typescript';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authorize);

router.get("/", async (req : Request, res : Response) => {
    const { userToken } : {
        authToken: string,
        userToken: string
    } = req.cookies;

    const client :{
        id: string,
        piid: string,
        name: string,
        user_name: string,
        email: string,
        sex: string,
        bio: string,
        dob: Date
    }[] = await prisma.$queryRaw`
        SELECT id, piid, name, user_name, email, sex, bio, dob 
        FROM client 
        WHERE id = ${userToken}`;
    
    res.send({
        "status": "OK",
        "data": client[0]
    });
});

router.get("/:id", async (req : Request, res : Response) => {
    const id = req.params.id;

    const client :{
        id: string,
        piid: string,
        name: string,
        user_name: string,
        sex: string,
        bio: string
    }[] = await prisma.$queryRaw`
        SELECT id, piid, name, user_name, sex, bio 
        FROM client 
        WHERE id = ${id}`;
    
    res.send({
        "status": "OK",
        "data": client[0]
    });
});

router.post("/profile", async (req : Request, res : Response) => {
    const { userToken } : {
        authToken: string,
        userToken: string
    } = req.cookies;

    const image = (req as any ).files.profile;

    try {
        const oldProfImg = (await prisma.$queryRaw`
            SELECT piid 
            FROM client
            WHERE id = ${userToken}` as {
                piid: string
        }[])[0];

        const profImg = await prisma.image.create({
            data: {
                name: image.name,
                image_type: image.mimetype,
                image_size: image.size,
                digest: image.md5,
                data: image.data
            }
        });

        await prisma.client.update({
            where: {
                id: userToken
            }, data : {
                piid: profImg.id
            }
        });

        if (oldProfImg != null && oldProfImg.piid != null) {
            await prisma.image.delete({
                where: {
                    id: oldProfImg.piid
                }
            });
        }

        res.send({
            "Status": "updated profile Image",
        });
    } catch (err) {
        res.status(500).send({
            "Status": "Error",
            "Message": "some error occurred"
        });
    }

});

router.patch("/", async (req: Request, res : Response) => {
    const { userToken } : {
        authToken: string,
        userToken: string
    } = req.cookies;

    const {
        name,
        email,
        dob,
        sex,
        bio
    }: {
        name: string, email: string, dob: Date,
        sex: string, bio: string
    } = req.body;

    let fault = false;
    const message :any = {};

    const emailRegx  = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    const db_clientData = await prisma.client.findUnique({
        where: {
            id: userToken
        }
    });

    if (db_clientData == null) {
        res.status(400).send({
            "Status": "invalid userToken",
        });
        return;
    }

    const data :{
        name: string, email: string, dob: Date,
        sex: string, bio: string
    } = {...db_clientData} as any;

    if ((name != null) && (!(/^[a-zA-Z ]{3,30}$/.test(name))) ) {
        fault = true;
        message.name = "the name is invalid";
    }else if (name != null){
        data.name = name;
    }

    if ( (email != null) && ( 
        (email.length > 50) || (!emailRegx.test(email))
    )) {
        fault = true;
        message.email = "the email is invalid";
    }else if (email != null){

        const clientEmail = await prisma.client.findUnique({
            where: { 
                email: email
            }
        });

        if (clientEmail != null){
            fault = true;
            message.email = "the email is already in use";
        }else {
            data.email = email;
        }
    }

    if ( (sex != null) &&
        (sex.toLowerCase() != "male" && sex.toLowerCase() != "female")
    ) {
        fault = true;
        message.sex = "the sex should be male or female";
    }else if ( sex != null ){
        data.sex = sex;
    }

    if ( (bio != null) && (bio.length > 120)) {
        fault = true;
        message.bio = "the bio should be less than or equal to 120 characters";
    }else if ( bio != null ){
        data.bio = bio;
    }

    if (fault) {
        console.log(message);
        res.status(400).send({
            "Status": "fault",
            "Message": message
        });
        return;
    }

    await prisma.client.update({
        where: {
            id: userToken
        },
        data: {
            ...data
        }
    });

    res.send({
        "Status": "Ok"
    });

});

module.exports = router;
