(() => {
  "use strict";
  const resorts = window.SNOW_RESORTS || [];
  const collection = document.querySelector("#resort-films");
  const detail = document.querySelector("#resort-film-players");
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const selected = collection
    ? resorts
    : resorts.filter((resort) => String(resort.id) === requestedId);
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  let count = 0;
  const shownSources = new Set();
  selected.forEach((resort) => {
    (resort.videos || []).forEach((clip) => {
      if (collection && shownSources.has(clip.src)) return;
      shownSources.add(clip.src);
      const displayName = clip.sharedTitle || resort.name;
      const card = create("article", "film-card resort-film-card");
      card.dataset.resortId = resort.id;
      const player = create("div", "film-player");
      const video = create("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "none";
      video.muted = true;
      video.poster = clip.poster;
      video.setAttribute("aria-label", displayName + " · " + clip.title);
      const source = create("source");
      source.src = clip.src;
      source.type = "video/mp4";
      video.append(
        source,
        document.createTextNode("你的瀏覽器不支援影片播放。"),
      );
      player.append(video);
      const meta = create("div", "film-meta");
      const number = create(
        "span",
        "film-number",
        String(++count).padStart(2, "0"),
      );
      const body = create("div");
      const kind =
        clip.kind === "slideshow"
          ? "照片剪輯"
          : clip.kind === "route"
            ? "滑行軌跡 · 非實景"
            : "現場片段";
      body.append(
        create(
          "p",
          "eyebrow",
          `${clip.year} / ${Math.round(clip.duration)} 秒 / ${kind}`,
        ),
      );
      body.append(
        create(collection ? "h2" : "h3", "film-resort-title", displayName),
      );
      body.append(create("p", "film-description", clip.title));
      const link = create("a", "small-note film-album-link", "查看雪場風景 ↗");
      link.href = "resort.html?id=" + resort.id;
      if (collection) body.append(link);
      meta.append(number, body);
      const error = create("p", "video-error");
      error.hidden = true;
      const direct = create("a", "", "直接開啟影片");
      direct.href = clip.src;
      error.append(
        document.createTextNode("影片暫時無法載入，請稍後再試，或"),
        direct,
        document.createTextNode("。"),
      );
      card.append(player, meta, error);
      (collection || detail)?.append(card);
    });
  });
  const section = document.querySelector("#resort-films-section");
  if (section) section.hidden = count === 0;
  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("play", () => {
      document.querySelectorAll("video").forEach((other) => {
        if (other !== video) other.pause();
      });
    });
    const showError = () => {
      const error = video.closest(".film-card")?.querySelector(".video-error");
      if (error) error.hidden = false;
    };
    video.addEventListener("error", showError);
    video.querySelector("source")?.addEventListener("error", showError);
  });
})();
