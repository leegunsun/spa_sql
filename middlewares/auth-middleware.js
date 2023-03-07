const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;

  //Bearer aksdg28g0dglkhs;lkgh
  //undefined
  //authorization 쿠키가 존재하지 않았을때를 대비

  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (authType !== "Bearer" || !authToken) {
    res.status(400).json({
      errorMessage: "로그인 후 이용할 수 있는 기능입니다.",
    });
    return;
  }

  try {
    //1. authToken이 만료 되었는지 확인
    //2. authToken이 서버가 발급한 토큰이 맞는지 검증
    const { userId } = jwt.verify(authToken, "customized-secret-key");

    //3. authToken이 있는 userId에 해당하는 사용자가 실제 DB에 존재하는지 확인
    const user = await Users.findByPk(userId);

    res.locals.user = user;
    next();
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ errorMessage: "로그인 후에 이용할 수 있는 기능입니다." });
    return;
  }
};
