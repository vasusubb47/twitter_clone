
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { authorize } from "../util";

const prisma = new PrismaClient();
const router = express.Router();

router.use(authorize);

router.get ("/", async (req : Request, res : Response) => {

  const { userToken } : {
    authToken: string,
    userToken: string
  } = req.cookies;

  const id = (await prisma.$queryRaw`
    SELECT piid 
    FROM client
    WHERE id = ${userToken}` as {
      piid: string
  });

  console.log(id);

  if (id != null) {
    const profile = await prisma.image.findFirst({
      where: {
        id: id.piid,
      }
    });

    res.send({
      "status": "OK",
      "image": profile
    });

  }else {

    res.send({
      "Status": "no profile Image"
    });

  }
});

router.get ("/:id", async (req : Request, res : Response) => {
  const id = req.params.id;

  const img = await prisma.image.findUnique({
    where: {
      id: id
    }
  });

  res.send({
    "status": "OK",
    "image": img
  });
  
});

module.exports = router;
