(() => {
  const resorts = window.SNOW_RESORTS || [];
  const groups = window.SNOW_SHARED_GALLERIES || [];
  const albums = [...resorts.filter((r) => !r.sharedGalleryId), ...groups];
  const parameters = new URLSearchParams(window.location.search);
  const requestedId = parameters.get("id");
  const requestedGroup = parameters.get("group");
  const galleryUrl = (album) =>
    "resort.html?" +
    (album.memberIds ? "group=" : "id=") +
    encodeURIComponent(album.id);
  const $ = (selector) => document.querySelector(selector);
  if (requestedId !== null || requestedGroup !== null) {
    const original = resorts.find((item) => String(item.id) === requestedId);
    if (original?.sharedGalleryId) {
      window.location.replace(
        "resort.html?group=" + encodeURIComponent(original.sharedGalleryId),
      );
      return;
    }
    const resort =
      requestedGroup !== null
        ? groups.find((item) => item.id === requestedGroup)
        : original;
    $("#catalog").hidden = true;
    $("#resort-detail").hidden = false;
    if (!resort) {
      $("#scenery-title").textContent = "找不到這座雪場";
      $("#scenery-description").textContent =
        "請回到雪場風景集，選擇要瀏覽的相簿。";
      $("#scenery-pending").hidden = false;
      $("#scenery-pending h2").textContent = "從地圖，重新出發。";
      $("#scenery-pending p").textContent = "目前沒有對應的雪場紀錄。";
      $("#detail-map-link").hidden = true;
      return;
    }
    document.title = resort.name + "風景 — SnowShow";
    $("#scenery-title").textContent = resort.name;
    $("#scenery-eyebrow").textContent = resort.country + " / MOUNTAIN SCENES";
    const photos = resort.photos || [];
    $("#scenery-description").textContent =
      resort.years.join(" · ") +
      " 滑雪足跡" +
      (photos.length
        ? " / " + photos.length + " " + (resort.photoLabel || "張精選風景")
        : " / 風景照片整理中");
    $("#detail-map-link").href =
      "snowmap.html?country=" + encodeURIComponent(resort.country);
    $("#scenery-pending").hidden = photos.length > 0;
    if (resort.sceneryNote && !photos.length)
      $("#scenery-pending p").textContent = resort.sceneryNote;
    if (resort.classificationNote) {
      const note = document.createElement("p");
      note.className = "small-note";
      note.style.marginBottom = "24px";
      note.textContent = resort.classificationNote;
      $("#scenery-photos").before(note);
    }
    const renderPhotos = (year = "all") => {
      $("#scenery-photos").replaceChildren();
      photos
        .filter((photo) => year === "all" || String(photo.year) === year)
        .forEach((photo) => {
          const figure = document.createElement("figure");
          const link = document.createElement("a");
          link.href = photo.src;
          link.dataset.gallery = "";
          const image = document.createElement("img");
          image.src = photo.src;
          image.alt = photo.alt;
          image.loading = "lazy";
          if (photo.position) image.style.objectPosition = photo.position;
          const caption = document.createElement("figcaption");
          caption.textContent =
            (photo.year ? photo.year + " · " : "") +
            photo.alt.replace(/^20\d{2} 年/, "");
          link.append(image);
          figure.append(link, caption);
          $("#scenery-photos").append(figure);
        });
    };
    const years = [
      ...new Set(photos.map((photo) => photo.year).filter(Boolean)),
    ].sort((a, b) => b - a);
    if (years.length > 1) {
      const toolbar = document.createElement("div");
      toolbar.className = "scenery-toolbar";
      const label = document.createElement("label");
      label.textContent = "照片年份 ";
      const select = document.createElement("select");
      select.id = "photo-year";
      select.setAttribute("aria-label", "篩選照片年份");
      for (const year of ["all", ...years]) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year === "all" ? "全部年份" : year + " 年";
        select.append(option);
      }
      select.addEventListener("change", () => renderPhotos(select.value));
      label.append(select);
      toolbar.append(label);
      $("#scenery-photos").before(toolbar);
    }
    renderPhotos();
    return;
  }
  const render = () => {
    const query = $("#scenery-search").value.trim().toLocaleLowerCase();
    const country = $("#scenery-country").value;
    const filtered = albums
      .filter(
        (resort) =>
          (country === "全部" || resort.country === country) &&
          (
            resort.name +
            (resort.memberNames || []).join(" ") +
            resort.country +
            resort.years.join(" ")
          )
            .toLocaleLowerCase()
            .includes(query),
      )
      .sort(
        (a, b) =>
          Number(Boolean(b.photos?.length)) -
            Number(Boolean(a.photos?.length)) ||
          Math.max(...b.years) - Math.max(...a.years) ||
          (a.memberIds?.[0] || a.id) - (b.memberIds?.[0] || b.id),
      );
    const gallery = $("#resort-catalog");
    gallery.replaceChildren();
    filtered.forEach((resort) => {
      const link = document.createElement("a");
      link.href = galleryUrl(resort);
      link.className = "scenery-card";
      if (resort.photos?.length) {
        const image = document.createElement("img");
        image.src = resort.photos[0].src;
        image.alt = resort.photos[0].alt;
        image.loading = "lazy";
        link.append(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "scenery-placeholder";
        const mountain = document.createElement("span");
        mountain.textContent = "↟";
        mountain.setAttribute("aria-hidden", "true");
        const status = document.createElement("span");
        status.textContent = "風景照整理中";
        placeholder.append(mountain, status);
        link.append(placeholder);
      }
      const body = document.createElement("div");
      body.className = "scenery-card-body";
      const meta = document.createElement("p");
      meta.className = "eyebrow";
      meta.textContent =
        resort.country +
        " / " +
        resort.years.join(" · ") +
        (resort.memberIds ? " / 連通行程・未逐張定位" : "");
      const title = document.createElement("h2");
      title.textContent = resort.name;
      const count = document.createElement("span");
      count.textContent = resort.photos?.length
        ? resort.photos.length + " 張精選照片 ↗"
        : "查看雪場紀錄 ↗";
      body.append(meta, title, count);
      link.append(body);
      gallery.append(link);
    });
    const ready = new Set(
      filtered
        .filter((resort) => resort.photos?.length)
        .map((resort) => resort.galleryGroup || resort.id),
    ).size;
    $("#scenery-count").textContent =
      resorts.filter((r) => country === "全部" || r.country === country)
        .length +
      " 座雪場紀錄 · " +
      ready +
      " 本風景相簿（連通雪域各僅一個入口）";
    $("#catalog-empty").hidden = filtered.length > 0;
  };
  $("#scenery-search").addEventListener("input", render);
  $("#scenery-country").addEventListener("change", render);
  render();
})();
