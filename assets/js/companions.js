(() => {
  "use strict";
  const data = window.SNOW_COMPANIONS;
  if (!data) return;
  const $ = (selector) => document.querySelector(selector);
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const photos = [
    data.hero,
    ...data.years.flatMap((entry) =>
      entry.photos.map((photo) => ({ ...photo, year: entry.year })),
    ),
    ...data.moments,
  ];
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const photoLink = (photo, eager = false) => {
    const link = create("a", "friends-photo-link");
    link.href = photo.src;
    link.dataset.openPhoto = photo.id;
    link.setAttribute("aria-label", "放大照片：" + photo.alt);
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    image.loading = eager ? "eager" : "lazy";
    image.decoding = "async";
    if (eager) image.fetchPriority = "high";
    const expand = create("span", "friends-photo-expand", "↗");
    expand.setAttribute("aria-hidden", "true");
    link.append(image, expand);
    return link;
  };
  $("#hero-photo").append(photoLink(data.hero, true));
  const resortLabels = new Map([
    [6, "舞子"],
    [7, "岩原"],
    [10, "苗場"],
    [11, "神樂"],
    [16, "菅平高原"],
    [17, "杉之原"],
    [23, "八方尾根"],
    [30, "藏王"],
    [32, "二世谷"],
    [33, "安比高原"],
    [35, "KIRORO"],
    [36, "惠斯勒"],
  ]);
  data.years.forEach((entry) => {
    const article = create("article", "memory");
    article.dataset.memoryYear = entry.year;
    article.setAttribute("aria-labelledby", "memory-title-" + entry.year);
    const year = create("div", "memory-year", String(entry.year));
    year.setAttribute("aria-hidden", "true");
    const body = create("div", "memory-body");
    const copy = create("div", "memory-copy");
    const meta = create("p", "eyebrow", entry.year + " / " + entry.place);
    const title = create("h3", "", entry.title);
    title.id = "memory-title-" + entry.year;
    copy.append(meta, title, create("p", "", entry.text));
    const resorts = create("div", "memory-resorts");
    for (const id of entry.resorts) {
      const link = create("a", "", (resortLabels.get(id) || "雪場") + "風景 ↗");
      link.href = "resort.html?id=" + id;
      resorts.append(link);
    }
    copy.append(resorts);
    const gallery = create(
      "div",
      "memory-photos" + (entry.photos.length > 1 ? " two" : ""),
    );
    entry.photos.forEach((photo) => {
      const figure = create("figure", "memory-photo");
      figure.append(photoLink(photo), create("figcaption", "", photo.caption));
      gallery.append(figure);
    });
    body.append(copy, gallery);
    article.append(year, body);
    $("#timeline-list").append(article);
  });
  for (const choice of [
    "all",
    ...data.years.map((entry) => String(entry.year)),
  ]) {
    const button = create("button", "", choice === "all" ? "全部" : choice);
    button.type = "button";
    button.dataset.filterYear = choice;
    button.setAttribute("aria-pressed", String(choice === "all"));
    $("#year-filter").append(button);
  }
  const filter = (year) => {
    document.querySelectorAll("[data-memory-year]").forEach((entry) => {
      entry.hidden = year !== "all" && entry.dataset.memoryYear !== year;
    });
    document
      .querySelectorAll("[data-filter-year]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filterYear === year),
        ),
      );
    const visible = data.years.filter(
      (entry) => year === "all" || String(entry.year) === year,
    );
    const count = visible.reduce((sum, entry) => sum + entry.photos.length, 0);
    $("#memory-status").textContent =
      year === "all"
        ? visible.length + " 個有合照的年份 · " + count + " 張同行紀錄"
        : year + " 年 · " + count + " 張同行紀錄";
  };
  $("#year-filter").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-year]");
    if (!button) return;
    filter(button.dataset.filterYear);
    $("#timeline-list").scrollIntoView({ block: "start", behavior: "auto" });
  });
  filter("all");
  data.moments.forEach((photo) => {
    const figure = create("figure", "friends-moment");
    const caption = create("figcaption", "", photo.caption);
    caption.append(
      create("small", "", String(photo.year) + " / A MOMENT TO KEEP"),
    );
    figure.append(photoLink(photo), caption);
    $("#moments-grid").append(figure);
  });
  const dialog = $("#friends-viewer");
  let active = [],
    index = 0,
    opener;
  const renderViewer = () => {
    const photo = byId.get(active[index]);
    $("#viewer-image").src = photo.src;
    $("#viewer-image").alt = photo.alt;
    $("#viewer-caption").textContent =
      (photo.year ? photo.year + " · " : "") + photo.alt;
    $("#viewer-count").textContent = index + 1 + " / " + active.length;
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-open-photo]");
    if (!link || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    active = [...document.querySelectorAll("[data-open-photo]")]
      .filter((node) => !node.closest("[hidden]"))
      .map((node) => node.dataset.openPhoto);
    index = active.indexOf(link.dataset.openPhoto);
    opener = link;
    renderViewer();
    dialog.showModal();
    $("#viewer-close").focus();
  });
  const move = (step) => {
    index = (index + step + active.length) % active.length;
    renderViewer();
  };
  $("#viewer-prev").addEventListener("click", () => move(-1));
  $("#viewer-next").addEventListener("click", () => move(1));
  $("#viewer-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () =>
    opener?.focus({ preventScroll: true }),
  );
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  });
})();
