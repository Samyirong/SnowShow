(() => {
  const resorts = window.SNOW_RESORTS || [];
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const $ = (selector) => document.querySelector(selector);
  if (requestedId !== null) {
    const resort = resorts.find((item) => String(item.id) === requestedId);
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
    photos.forEach((photo) => {
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
      caption.textContent = photo.alt;
      link.append(image);
      figure.append(link, caption);
      $("#scenery-photos").append(figure);
    });
    return;
  }
  const render = () => {
    const query = $("#scenery-search").value.trim().toLocaleLowerCase();
    const country = $("#scenery-country").value;
    const filtered = resorts
      .filter(
        (resort) =>
          (country === "全部" || resort.country === country) &&
          (resort.name + resort.country + resort.years.join(" "))
            .toLocaleLowerCase()
            .includes(query),
      )
      .sort(
        (a, b) =>
          Number(Boolean(b.photos?.length)) -
            Number(Boolean(a.photos?.length)) ||
          Math.max(...b.years) - Math.max(...a.years) ||
          a.id - b.id,
      );
    const gallery = $("#resort-catalog");
    gallery.replaceChildren();
    filtered.forEach((resort) => {
      const link = document.createElement("a");
      link.href = "resort.html?id=" + resort.id;
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
      meta.textContent = resort.country + " / " + resort.years.join(" · ");
      const title = document.createElement("h2");
      title.textContent = resort.name;
      const count = document.createElement("span");
      count.textContent = resort.photos?.length
        ? resort.photos.length + " 張風景照片 ↗"
        : "查看雪場紀錄 ↗";
      body.append(meta, title, count);
      link.append(body);
      gallery.append(link);
    });
    const ready = filtered.filter((resort) => resort.photos?.length).length;
    $("#scenery-count").textContent =
      filtered.length + " 座雪場 · " + ready + " 本風景相簿";
    $("#catalog-empty").hidden = filtered.length > 0;
  };
  $("#scenery-search").addEventListener("input", render);
  $("#scenery-country").addEventListener("change", render);
  render();
})();
