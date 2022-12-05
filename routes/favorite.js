'use strict';
const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const authenticationEnsurer = require('./authentication-ensurer');

// お気に入りを押されたツイートをデータベースに保存
router.post('/', authenticationEnsurer, (req, res, next) => {
  const updatedAt = new Date();
  Favorite.findOne({
    where: {
      twId: req.body.twId // ツイートの固有のIDで検索
    }
  }).then((favorite) => {
    if (favorite) { // 上で検索して、固有IDが既にあったら（既に保存してたら）はじく
      res.json({ status: 'OK', isAlready: true }); // entry.jsへtrueを返しアラートを表示
      return;
    } else Favorite.upsert({
      username: req.body.username, // ツイート本人のユーザー名
      text: req.body.text, // ツイート本文
      twId: req.body.twId, // ツイートURLにある固有のID（固有のIDがあったのでUUIDは使いませんでした）
      word: req.body.word, // 検索ワード
      video: req.body.video, // 動画（今回はm3u8形式の動画は表示させることができませんでした）
      // ↓ 画像が一枚だと配列ではなくオブジェクトで送られてくるため、保存形式を統一
      img: req.body['img[]'] ? req.body['img[]'].toString() : '',
      clickedBy: req.user.id, // お気に入り追加をしたユーザー
      updatedAt: updatedAt // 更新日時
    }).then(() => {
      res.end();
    });
  });
});

module.exports = router;