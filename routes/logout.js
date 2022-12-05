'use strict';
// 各モジュールの読み込みと設定
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;