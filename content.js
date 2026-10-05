// rules.json はページ読み込み (新規タブ・アドレスバー・外部リンク) だけを捕まえる。
// YouTube 内の遷移は SPA なのでリクエストが飛ばず、ここで拾う。

const STRIP = ["list", "index", "start_radio"];

// /watch の URL から再生リスト系パラメータを外した URL を返す。外す物が無ければ null。
function clean(href) {
  const u = new URL(href, location.href);
  if (u.pathname !== "/watch" || !u.searchParams.has("list")) return null;
  STRIP.forEach((k) => u.searchParams.delete(k));
  return u.href;
}

// SPA ルーターは href ではなく内部データ (playlistId) で遷移するため、href の書き換えでは効かない。
// capture 段階でクリックを先に奪い、素の URL へ通常遷移させる。
// 修飾キー付き・中クリックは新規タブになり rules.json 側で処理されるので素通しする。
document.addEventListener(
  "click",
  (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a[href]");
    const to = a && clean(a.href);
    if (!to) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.assign(to);
  },
  true
);

// クリック以外 (自動再生の次動画・キーボード・戻る) で list 付きに遷移した時の保険。
const check = () => {
  const to = clean(location.href);
  if (to) location.replace(to);
};
document.addEventListener("yt-navigate-finish", check);
window.addEventListener("popstate", check);
check();
