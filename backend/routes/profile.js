const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middlewares");
const { User, Block, Achievement, Badge, UserInfo, Follow, Myteam, Post, UserPoint, UserPayment, ActiveLog, Image } = require("../models");
const { assignTeamBadge } = require('../services/badge/trigger');

// userId 로 사용자 프로필 불러오기
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (isNaN(userId)) { return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." }); }

    const userIdNum = parseInt(userId, 10);

    const fullUser = await User.findOne({
      where: { id: userIdNum },
      attributes: ["id", "nickname", "profile_img", "theme_mode", "is_private", "myteam_id", "role", "email"],
      include: [
        { model: UserInfo },
        { model: Post, include: [ Image, { model: Post, as: 'Regram', include: [Image], }, ], separate: true, order: [['id', 'DESC']], },
        { model: Post, as: 'BookmarkedPosts', include: [Image],  through: { attributes: [] }, },
        { model: Post, as: 'Liked', include: [Image], through: { attributes: [] } },
        { model: Follow, as: 'Followings', include: [
          { model: User, as: 'Followers', attributes: ['id', 'nickname', 'profile_img'], }
        ], },
        { model: Follow, as: 'Followers', include: [
          { model: User, as: 'Followings', attributes: ['id', 'nickname', 'profile_img'], },
        ], },
        { model: Achievement, attributes: ['id', 'name', 'description'], through: { attributes: ['createdAt', 'updatedAt'], }, },
        { model: Badge, attributes: ['id', 'name', 'img', 'description'], through: { attributes: ['createdAt', 'updatedAt'], }, },
        { model: Myteam, attributes: ['id', 'teamname', 'teamcolor', 'region'], },
        { model: Block, as: 'Blockeds', include: [
          { model: User, as: 'Blocked', attributes: ['id', 'nickname', 'profile_img'], } ] },
        { model: ActiveLog },
        { model: UserPoint },
        { model: UserPayment },
      ],
    })

    // 계정 비공개 상태일 시 정보 접근 제한
    if (fullUser.is_private == 1) { return res.status(403).json("접근이 제한된 계정입니다"); }

    if (fullUser) {
      const data = fullUser.toJSON();
      //////////// 율비 isBlocked 여부 추가
      if (req.user) {
        const me = req.user.id;

        // 내가 이 유저를 차단했는지
        const blocked = await Block.findOne({
          where: {
            from_user_id: me,
            to_user_id: fullUser.id,
          },
        });
        data.isBlocked = !!blocked;

        // 이 유저가 나를 차단했는지 (추가)
        const blockedByTarget = await Block.findOne({
          where: {
            from_user_id: fullUser.id,
            to_user_id: me,
          },
        });
        data.isBlockedByTarget = !!blockedByTarget;
      } else {
        data.isBlocked = false;
        data.isBlockedByTarget = false;
      }
      //////////////////////////////

      // ------------------- [리그램/원본 숨김 연동 추가] -------------------
      // helper: 원본글 리턴 (리그램이면 원본, 아니면 자기자신)
      function getBasePost(post) {
        return post.Regram || post;
      }
      const myId = req.user?.id;

      // 1. 내가 쓴글(리그램 포함)에서 원본 비공개/삭제된 리그램글 제거
      if (Array.isArray(data.Posts)) {
        data.Posts = data.Posts.filter(post => {
          if (post.regram_id && post.Regram) {
            if (post.Regram.private_post && post.Regram.user_id !== myId) return false;
            if (!post.Regram) return false;
          }
          return true;
        });
      }
      // 2. 북마크/좋아요 리스트에서도 원본글 숨김/삭제 적용
      const postSetFilter = (arr) => Array.isArray(arr) ? arr.filter(post => {
        if (post.regram_id && post.Regram) {
          if (post.Regram.private_post && post.Regram.user_id !== myId) return false;
          if (!post.Regram) return false;
        }
        return true;
      }) : [];

      if (Array.isArray(data.BookmarkedPosts)) data.BookmarkedPosts = postSetFilter(data.BookmarkedPosts);
      if (Array.isArray(data.Liked)) data.Liked = postSetFilter(data.Liked);

      // 3. 각 post에서 원본글 데이터 병합(이미지/내용/북마크/좋아요 등)
      const patchWithBasePost = (post) => {
        if (post.regram_id && post.Regram) {
          Object.assign(post, {
            basePost: post.Regram,
            content: post.Regram.content,
            Images: post.Regram.Images,
            Likers: post.Regram.Likers,
            Bookmarkers: post.Regram.Bookmarkers,
            Hashtags: post.Regram.Hashtags,
          });
        }
        return post;
      };
      if (Array.isArray(data.Posts)) data.Posts = data.Posts.map(patchWithBasePost);
      if (Array.isArray(data.BookmarkedPosts)) data.BookmarkedPosts = data.BookmarkedPosts.map(patchWithBasePost);
      if (Array.isArray(data.Liked)) data.Liked = data.Liked.map(patchWithBasePost);
      // -----------------------------------------------------------

      res.status(200).json(data);
    } else {
      res.status(404).json("존재하지 않는 계정입니다");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 사용자 정보 통합 수정
router.patch("/update", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { nickname, email, is_private, profile_img, myteam_id, theme_mode, } = req.body;
    const { introduce, phone } = req.body;

    const userFields = {};
    if (nickname !== undefined) userFields.nickname = nickname;
    if (email !== undefined) userFields.email = email;
    if (is_private !== undefined) userFields.is_private = is_private;
    if (profile_img !== undefined) userFields.profile_img = profile_img;
    if (myteam_id !== undefined) userFields.myteam_id = myteam_id;
    if (theme_mode !== undefined) userFields.theme_mode = theme_mode;

    if (Object.keys(userFields).length > 0) {
      await User.update(userFields, { where: { id: userId } });
    }

    const userInfoFields = {};
    if (introduce !== undefined) userInfoFields.introduce = introduce;
    if (phone !== undefined) userInfoFields.phone = phone;

    if (Object.keys(userInfoFields).length > 0) {
      await UserInfo.update(userInfoFields, { where: { users_id: userId } });
    }

    // 응원팀 변경 시 뱃지 재부여
    if (myteam_id !== undefined) { await assignTeamBadge(userId); }

    res.status(200).json({ message: "사용자 정보가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
