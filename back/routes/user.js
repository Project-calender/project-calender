const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { createClient, RedisClient } = require("redis");

const refresh = require("../utils/refresh");
const { sequelize, Calendar } = require("../models");
const { User, PrivateEvent, PrivateCalendar } = require("../models");
const router = express.Router();
const jwt = require("../utils/jwt-util");
const redisClient = require("../utils/redis");
const authJWT = require("../utils/authJWT");
const { client, mget } = require("../utils/redis");

router.post("/checkedCalendar", authJWT, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const me = User.findOne({
      where: { id: req.myId },
    });

    await me.update(
      {
        checkedCalender: req.body.checkedList,
      },
      { transaction: t }
    );

    return res.status(200).status({ success: true });
  } catch (error) {
    console.error(error);
    await t.rollback();
    next(error);
  }
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(401).send({
      ok: false,
      message: "user not exist",
    });
  }
  const chk = await bcrypt.compare(password, user.password);
  if (!chk) {
    return res.status(401).send({
      ok: false,
      message: "password is incorrect",
    });
  }
  const accessToken = jwt.sign(user);
  const refreshToken = jwt.refresh();
  redisClient.set(user.id, refreshToken);
  const fullUserWithoutPassword = await User.findOne({
    where: { email: user.email },
    attributes: {
      exclude: ["password"],
    },
  });
  return res.status(200).send({
    fullUserWithoutPassword,
    refreshToken,
    accessToken,
  });
});

router.post("/signup", async (req, res, next) => {
  try {
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (exUser) {
      return res.status(403).send({ message: "이미 사용중인 아이디입니다." });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        {
          email: req.body.email,
          password: hashedPassword,
          nickname: req.body.nickname,
        },
        { transaction: t }
      );

      await newUser.createPrivateCalendar(
        {
          name: "MyCalendar",
        },
        { transaction: t }
      );
    });

    return res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/refresh", authJWT, refresh);

router.post("/logout", authJWT, async (req, res) => {
  // req.logout();
  const client = createClient({
    url: `redis://${process.env.REDIS_HOST}`,
    password: process.env.REDIS_PASSWORD,
  });

  await client.connect();
  await client.del(req.body.user.id);
  await client.disconnect();
  res.status(200).send("ok");
});

module.exports = router;
