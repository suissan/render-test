const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

// モデルの読み込み
const User = require('./models/user');
const Favorite = require('./models/favorite');
User.sync().then(() => {
  Favorite.belongsTo(User, { foreignKey: 'clickedBy' });
  Favorite.sync();
});

const TwitterStrategy = require('passport-twitter').Strategy;
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET

// セッションに保存
passport.serializeUser(function (user, done) {
  done(null, user);
});

// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/twitter/callback' : 'https://localhost:8000/auth/twitter/callback'
},
  // 認証後の処理
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        done(null, profile);
      })
    });
  }
));

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const twitterRouter = require('./routes/twitter');
const favoriteRouter = require('./routes/favorite');

const app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ユーザ情報をセッションに保存するので初期化（開発中は false で）
app.use(session({ secret: '6e8b7102cc1ac2f0', resave: false, saveUninitialized: false }));
// passport自体の初期化
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/tweets', twitterRouter); // 検索結果やお気に入りの複数表示なので「tweets」
app.use('/tweets', favoriteRouter); // 一個ずつ処理していくので「tweet」

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function (req, res) {
    const loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom &&
      !loginFrom.includes('http://') &&
      !loginFrom.includes('https://')) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
