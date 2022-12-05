'use strict';
// 各モジュールの読み込みと設定
const express = require('express');
const router = express.Router();
const Twitter = require('twitter');
const Favorite = require('../models/favorite');
const moment = require('moment-timezone');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const authenticationEnsurer = require('./authentication-ensurer');

// 上から API key, API secret key, Access token, Access token secret

const TWITTER_CONSUMER_KEY = process.env. TWITTER_CONSUMER_KEY
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET
const TWITTER_ACCESS_TOKEN_KEY = process.env.TWITTER_ACCESS_TOKEN_KEY
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
});

/**
 * 保存したユーザーとリクエストが来たユーザーが同じか検証する関数
 * @param {object} req リクエストオブジェクト
 * @param {array} favorite データベース
 */
function isMine(req, favorite) {
  return favorite && parseInt(favorite.clickedBy) === parseInt(req.user.id);
}

// twitterapiを利用した検索
router.post('/result', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const params = {
    q: req.body.word, // 検索ワード
    count: 100, // 一週間のうち100件取得
    tweet_mode: 'extended', // full_textを取得する
    exclude: 'retweets', // リツイートを除外
  };
  const tweetsColle = []; // ツイートを一時的に格納する配列を作成
  client.get('search/tweets', params, (error, tweets, response) => {
    if (!error) {
      for (let i = 0; i < tweets.statuses.length; i++) { // ツイートの数だけループ
        tweetsColle.push(tweets.statuses[i]); // 作成した配列にtweets.statusesオブジェクトを格納
      }
    } else {
      const err = new Error('読み込みに失敗しました');
      err.status = 401; // とりあえず設定してみました。401は権限がない場合にも使われるそうなのでapiKey切れのことも含めて...
      next(err);
      //console.log('読み込みに失敗しました'); 再開発のためにデバックログ残してます
    }
    res.render('result', {
      user: req.user,
      word: params.q,
      tweets: tweetsColle, // tweetsとして配列をresult.pugに描画
      csrfToken: req.csrfToken()
    });
  });
});

router.post('/:twId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Favorite.findOne({
    where: {
      twId: req.params.twId // ツイートの固有のIDで検索
    }
  }).then((favorite) => {
    if ((isMine(req, favorite))) { // 保存したユーザー、リクエストしてきたユーザーが同じが検証
      if (parseInt(req.query.delete) === 1) { // クエリ検証
        favorite.destroy(); // 指定したお気に入りツイートを削除
        res.redirect('/tweets/favorite'); // 削除実行後お気に入り一覧へリダイレクト
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('指定したツイートがないか、または操作する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

// お気に入りしたツイートをデータベースから読み込んでいる
router.get('/favorite', authenticationEnsurer, csrfProtection, (req, res, next) => {
  if (req.user) {
    Favorite.findAll({
      where: {
        clickedBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]
    }).then((favorites) => {
      favorites.forEach((favorite) => {
        favorite.formattedUpdatedAt = moment(favorite.updateAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm'); //時間の表示を変更
      });
      res.render('favorite', {
        user: req.user,
        favorites: favorites, // formattedUpdatedAtも含め、お気に入りしたツイートをfavorite.pugに描画
        csrfToken: req.csrfToken()
      });
    });
  }
});

module.exports = router;