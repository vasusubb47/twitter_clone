
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { authorize } from "../util";
import console from 'console';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authorize);

router.post("/", async (req : Request, res : Response) => {
    const { userToken } : {
        authToken: string,
        userToken: string
    } = req.cookies;

    const {tweet, reply_tweet_id, og_tweet_id} :{
        tweet: string,
        reply_tweet_id: string | null
        og_tweet_id: string | null
    } = req.body;

    //extract hashtags and userTags
    const hashtagRegx = /^#\w{3,30}$/;
    const usertagRegx = /^@[a-z0-9]{3,30}$/;

    let hashtags :string[] = [];
    let usertags :string[] = [];

    for (const str of tweet.split(" ")) {
        if (hashtagRegx.test(str)) {
            hashtags.push(str);
        }
        if (usertagRegx.test(str)) {
            usertags.push(str);
        }
    }

    hashtags = [...new Set(hashtags)];
    usertags = [...new Set(usertags)];

    const newTweet = await prisma.tweet.create({
        data: {
            uid: userToken,
            body: tweet,
            ptid: reply_tweet_id,
            time: new Date()
        }
    });

    if (og_tweet_id != null) {
        await prisma.retweets.create({
            data: {
                tid: newTweet.id,
                uid: userToken,
                otid: og_tweet_id
            }
        });
    }

    hashtags.forEach( async ( hashtag ) => {
        let db_hashtag = await prisma.hashtag.findUnique({
            where: {
                hashtag: hashtag
            }
        });

        if (db_hashtag == null) {
            db_hashtag = await prisma.hashtag.create({
                data: {
                    hashtag: hashtag
                }
            });
        }

        await prisma.tweeted_hashtags.create({
            data: {
                tid: newTweet.id,
                htid: db_hashtag.id
            }
        });
    });

    usertags.forEach( async ( tag ) => {
        const client = await prisma.client.findUnique({
            where: {
                user_name: tag.substring(1, tag.length)
            }
        });

        if (client != null) {
            await prisma.client_taged_tweets.create({
                data: {
                    tid: newTweet.id,
                    uid: client.id
                }
            });
        }
    });

    res.send({
        "Status": "OK",
        "Message": newTweet
    });
        
});

router.get('/:id', async (req : Request, res : Response) => {
    const id = req.params.id;
    const tweets : {
        id: string,
        uid: string,
        body: string,
        reply_tweet_id: string,
        no_likes: number,
        reply_tweets: {
            id: string,
            uid: string,
            body: string
        }[]
        no_reply_tweets: number,
        no_reTweets: number
    }[] = await prisma.$queryRaw`
    SELECT id, uid, body, reply_tweet_id 
    FROM tweet 
    where id = ${id}`;

    const no_likes :{
        count: number
    }[]= await prisma.$queryRaw`SELECT COUNT(*) FROM liked_tweets WHERE tid = ${id}`;
    const reply_tweets :{
        id: string,
        uid: string,
        body: string
    }[] = await prisma.$queryRaw`SELECT id, uid, body FROM tweet WHERE reply_tweet_id = ${id}`;
    const reTweetCount :{
        count : number
    }[] = await prisma.$queryRaw`SELECT count(*) FROM forword_tweet WHERE ftid = ${id}`;
    
    tweets[0].no_likes = no_likes[0].count;
    tweets[0].reply_tweets = reply_tweets;
    tweets[0].no_reply_tweets =  reply_tweets.length;
    tweets[0].no_reTweets = reTweetCount[0].count;

    res.send({
        "status": "OK",
        "data": tweets[0]
    });
});

router.post("/like", async (req : Request, res : Response) => {
    try {
        const { userToken } : {
            authToken: string,
            userToken: string
        } = req.cookies;
        const tid = req.body.tid;

        const liked_tweet = await prisma.liked_tweets.create({
            data: {
                tid: tid,
                uid: userToken
            }
        });

        res.send({
            "status": "OK",
            "data": liked_tweet
        });

    } catch (err) {
        console.log(err);
        res.status(400).send({
           "status": "error",
           "error": err 
        });
    }
});

module.exports = router;
