-- CreateTable
CREATE TABLE "image" (
    "id" UUID NOT NULL,
    "data" BYTEA NOT NULL,
    "image_size" INTEGER NOT NULL,
    "image_type" VARCHAR(25) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "digest" VARCHAR(128) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "user_name" VARCHAR(30) NOT NULL,
    "sex" VARCHAR(7) NOT NULL,
    "dob" DATE NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password_hash" BYTEA NOT NULL,
    "salt" BYTEA NOT NULL,
    "bio" VARCHAR(120),
    "piid" UUID,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hashtag" (
    "id" UUID NOT NULL,
    "hashtag" VARCHAR(30) NOT NULL,

    CONSTRAINT "hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweet" (
    "id" UUID NOT NULL,
    "uid" UUID NOT NULL,
    "body" VARCHAR(240) NOT NULL,
    "ptid" UUID,
    "time" TIMESTAMP NOT NULL,

    CONSTRAINT "tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liked_tweets" (
    "tid" UUID NOT NULL,
    "uid" UUID NOT NULL,

    CONSTRAINT "liked_tweets_pkey" PRIMARY KEY ("tid","uid")
);

-- CreateTable
CREATE TABLE "retweets" (
    "tid" UUID NOT NULL,
    "otid" UUID NOT NULL,
    "uid" UUID NOT NULL,

    CONSTRAINT "retweets_pkey" PRIMARY KEY ("tid","uid","otid")
);

-- CreateTable
CREATE TABLE "tweeted_hashtags" (
    "tid" UUID NOT NULL,
    "htid" UUID NOT NULL,

    CONSTRAINT "tweeted_hashtags_pkey" PRIMARY KEY ("tid","htid")
);

-- CreateTable
CREATE TABLE "client_taged_tweets" (
    "tid" UUID NOT NULL,
    "uid" UUID NOT NULL,

    CONSTRAINT "client_taged_tweets_pkey" PRIMARY KEY ("tid","uid")
);

-- CreateTable
CREATE TABLE "followers" (
    "uid" UUID NOT NULL,
    "fuid" UUID NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("uid","fuid")
);

-- CreateTable
CREATE TABLE "cookies" (
    "uid" UUID NOT NULL,
    "cookie" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "client_user_name_key" ON "client"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hashtag_hashtag_key" ON "hashtag"("hashtag");

-- CreateIndex
CREATE UNIQUE INDEX "cookies_uid_key" ON "cookies"("uid");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "profile_img_id" FOREIGN KEY ("piid") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tweet" ADD CONSTRAINT "tweet_owner" FOREIGN KEY ("uid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tweet" ADD CONSTRAINT "reply_tweet_id" FOREIGN KEY ("ptid") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "liked_tweets" ADD CONSTRAINT "liked_client" FOREIGN KEY ("uid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "liked_tweets" ADD CONSTRAINT "liked_tweet" FOREIGN KEY ("tid") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "retweets" ADD CONSTRAINT "retweetd_client" FOREIGN KEY ("uid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "retweets" ADD CONSTRAINT "retweet" FOREIGN KEY ("tid") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "retweets" ADD CONSTRAINT "original_tweet" FOREIGN KEY ("otid") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tweeted_hashtags" ADD CONSTRAINT "hashtags" FOREIGN KEY ("htid") REFERENCES "hashtag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tweeted_hashtags" ADD CONSTRAINT "taged_tweets" FOREIGN KEY ("tid") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_taged_tweets" ADD CONSTRAINT "taged_client" FOREIGN KEY ("uid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_taged_tweets" ADD CONSTRAINT "client_taged_tweet" FOREIGN KEY ("tid") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "follower_client" FOREIGN KEY ("fuid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "leader_client" FOREIGN KEY ("uid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cookies" ADD CONSTRAINT "client_cookie" FOREIGN KEY ("uid") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
