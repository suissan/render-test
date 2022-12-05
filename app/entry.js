'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

$('.form-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const username = button.data('tweet-username');
    const text = button.data('tweet-text');
    const twId = button.data('tweet-id');
    const word = button.data('tweet-word');
    const video = button.data('tweet-video');
    const img = button.data('tweet-img');
    const isAddFavorite = confirm('お気に入りに追加しますか？');
    if (isAddFavorite) {
      $.post(
        `/tweets`, // 保存は一個ずつなので「tweet」
        {
          username: username, // ツイート本人のユーザー名
          text: text, // ツイート本文
          twId: twId, // ツイートURLにある固有のID（固有のIDがあったのでUUIDは使いませんでした）
          word: word, // 検索ワード
          video: video, // 動画（今回はm3u8形式の動画は表示させることができませんでした）
          img: img, // 画像
        },
        (data) => { // 二回目以降の登録済みツイートをアナウンス
          if (data.isAlready) {
            alert('既に登録されています');
          }
        });
    }
  });
});

$(function () {
  const topBtn = $('.to-top');
  topBtn.hide(); // formのhiddenと同じ「隠す」
  // スクロールしてページトップから100に達したらボタンを表示
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) { // .指定がないのでグローバルオブジェクトのウィンドウオブジェクト（？）
      topBtn.fadeIn(); // 出現!!
    } else {
      topBtn.fadeOut(); // 避難!!
    }
  });
  // スクロールしてトップへ戻る
  topBtn.click(function () {
    $('body,html').animate({
      scrollTop: 0 // トップへ戻る
    }, 500);
    return false;
  });
});