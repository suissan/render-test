'use strict';
// 各モジュールの読み込みと設定
const express = require('express');
const router = express.Router();
// layout.pugに検索機能があるのでindex.jsでもCSRF対策モジュールを実装
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/* GET home page. */
router.get('/', csrfProtection, (req, res, next) => {
  res.render('index', {
    user: req.user,
    csrfToken: req.csrfToken()
  });
});

module.exports = router;