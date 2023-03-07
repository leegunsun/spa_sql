const express = require("express");
const router = express.Router();
const { Users } = require("../models");

router.post("/signup", async (req, res) => {
  const { nickname, password, confirm } = req.body;
  //   const findUser = await User.findOne({
  //     where: { nickname: nickname },
  //   });
  const maxUserId = await Users.findOne({
    order: [["userId", "DESC"]],
  });
  const userId = maxUserId ? maxUserId.userId + 1 : 1;
  const nicknameRegex = /^[A-Za-z0-9]{3,}$/;
  const passwordLengthRegex = /^[A-Za-z0-9]{4,}$/;
  const passwordRegex = new RegExp(`^(?!.*${nickname}).+$`);

  try {
    if (nicknameRegex.test(nickname)) {
      const existsUsers = await Users.findOne({
        where: { nickname: nickname },
      });
      if (existsUsers) {
        return res.status(412).json({
          errorMessage: "중복된 닉네임입니다.",
        });
      }
      // 닉네임 실패

      if (passwordLengthRegex.test(password)) {
        if (!passwordRegex.test(password)) {
          return res
            .status(412)
            .json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
        }
        //패스워드에 닉네임 포함되어있는지 감지 못함 해야함
        //!넣어봄

        if (password !== confirm) {
          return res
            .status(412)
            .json({ errorMessage: "패스워드가 일치하지 않습니다." });
        }

        await Users.create({ nickname, password, userId });

        res.status(201).json({ message: "회원 가입에 성공하였습니다." });
        //패스워드 실패
      } else {
        return res
          .status(412)
          .json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });
      }
    } else {
      return res
        .status(412)
        .json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }

  //   # 412 닉네임 형식이 비정상적인 경우
  //   {"errorMessage": "닉네임의 형식이 일치하지 않습니다."}
  //   # 412 password가 일치하지 않는 경우
  //   {"errorMessage": "패스워드가 일치하지 않습니다."}
  //   # 412 password 형식이 비정상적인 경우
  //   {"errorMessage": "패스워드 형식이 일치하지 않습니다.}
  //   # 412 password에 닉네임이 포함되어있는 경우
  //   {"errorMessage": "패스워드에 닉네임이 포함되어 있습니다."}

  //   # 400 예외 케이스에서 처리하지 못한 에러
  //   {"errorMessage": "요청한 데이터 형식이 올바르지 않습니다."}
  //   # 412 닉네임이 중복된 경우
  //   {"errorMessage": "중복된 닉네임입니다."}
});

module.exports = router;
