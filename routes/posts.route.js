// routes/posts.route.js

const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { Posts, Users } = require("../models");
const router = express.Router();

router.get("/posts", async (req, res, next) => {
  const posts = await Posts.findAll();
  const rename = posts.map((ele) => {
    return {
      postId: ele.postId,
      userId: ele.userId,
      nickname: ele.nickname,
      title: ele.title,
      createdAt: ele.createdAt,
      updatedAt: ele.updatedAt,
    };
  });

  try {
    if (posts.length) {
      res.status(200).json({ posts: rename });
    } else {
      return res.status(412).json({ errorMessage: "데이터가 없습니다." });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const post = await Posts.findOne({ where: { postId: postId } });

  try {
    if (post) {
      const result = {
        postId: post.postId,
        userId: post.userId,
        nickname: post.nickname,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };

      res.status(200).json({ post: result });
    } else {
      return res
        .status(400)
        .json({ errorMessage: "게시글 조회에 실패하였습니다." });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

router.post("/posts", authMiddleware, async (req, res, next) => {
  const { title, content } = req.body;
  const { userId } = res.locals.user;
  const user = await Users.findOne({ where: { userId: userId } });
  const maxPostId = await Posts.findOne({ order: [["postId", "DESC"]] });
  const postId = maxPostId ? maxPostId.postId + 1 : 1;

  if (!title && !content) {
    return res
      .status(412)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    if (!title) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    } else if (!content) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }

    await Posts.create({
      UserId: userId,
      postId: postId,
      nickname: user.nickname,
      title,
      content,
    });

    res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const post = await Posts.findOne({ where: { postId: postId } });
  const { title, content } = req.body;
  const { userId } = res.locals.user;

  if (!title && !content) {
    return res
      .status(412)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    if (userId !== post.UserId) {
      return res
        .status(403)
        .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }

    if (!title) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    } else if (!content) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }

    if (post) {
      await Posts.update(
        {
          title: title,
          content: content,
        },
        { where: { postId: postId } }
      );
      res.status(200).json({ message: "게시글을 수정하였습니다." });
    } else {
      return res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    }
  } catch {
    return res
      .status(400)
      .json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const post = await Posts.findOne({ where: { postId: postId } });

  try {
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (post.UserId == userId) {
      try {
        await post.destroy({ where: { id: postId } });
        res.status(200).json({ message: "게시글을 삭제하였습니다." });
      } catch (errer) {
        return res
          .status(200)
          .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
      }
    } else {
      res
        .status(403)
        .json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
