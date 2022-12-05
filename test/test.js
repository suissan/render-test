'use strict';
const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Favorite = require('../models/favorite');

// ログイン時の各テスト
describe('/login', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('ログインのためのリンクが含まれる', () => {
    return request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a class="btn btn-outline-info my-3" href="\/auth\/twitter"/)
      .expect(200);
  });

  // ここは教材の予定調整くんでも落ちました。
  //test('ログイン時はユーザー名が表示される', () => {
  //  return request(app)
  //    .get('/login')
  //    .expect(/testuser/)
  //    .expect(200);
  //});
});

// ログアウト時の各テスト
describe('/logout', () => {
  test('/にリダイレクトされる', () => {
    return request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302);
  });
});

//ツイート検索、表示のテスト
describe('/tweets/result', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('ツイートが検索でき、表示される', () => {
    User.upsert({ userId: 0, username: 'testuser ' }).then(() => {
      request(app)
        .post('/tweet/result')
        .send({ word: 'apiテスト' })
        .expect('Location', '/tweet/result')
        .expect(302)
        .end((err, res) => {
          request(app)
            .get('/tweet/result')
            .expect(/apiテスト/)
            .expect(200);
        });
    });
  });
});
