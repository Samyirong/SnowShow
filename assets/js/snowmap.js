(() => {
  const resorts = window.SNOW_RESORTS || [];
  const list = document.querySelector("#resort-list");
  const search = document.querySelector("#resort-search");
  const filters = [...document.querySelectorAll("[data-country]")];
  const countries = filters.map((button) => button.dataset.country);
  const requestedCountry = new URLSearchParams(window.location.search).get(
    "country",
  );
  let country = countries.includes(requestedCountry)
    ? requestedCountry
    : "全部";
  let map;
  let markers;
  let tileLayer;
  let tileFailures = 0;
  const markerById = new Map();
  // 以太平洋為中心，避免美洲負經度讓亞洲與美洲分散在地圖兩端。
  const position = (resort) => [
    resort.lat,
    resort.lng < 0 ? resort.lng + 360 : resort.lng,
  ];
  const error = document.querySelector("#map-error");

  if (window.L) {
    map = L.map("map", { scrollWheelZoom: false, zoomControl: false }).setView(
      [25, 180],
      2,
    );
    L.control.zoom({ position: "topright" }).addTo(map);
    tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      },
    );
    tileLayer.on("tileerror", () => {
      tileFailures += 1;
      if (tileFailures >= 3) error.hidden = false;
    });
    tileLayer.on("tileload", () => {
      tileFailures = 0;
      error.hidden = true;
    });
    tileLayer.addTo(map);
    L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);
    markers = L.featureGroup().addTo(map);
    resorts.forEach((resort) => {
      const popup = document.createElement("div");
      popup.className = "resort-popup";
      const label = document.createElement("span");
      label.className = "eyebrow";
      label.textContent = resort.country + " / SNOW MEMORIES";
      const title = document.createElement("h3");
      title.textContent = resort.name;
      const years = document.createElement("p");
      years.textContent = resort.years.join(" · ");
      popup.append(label, title, years);
      if (resort.video) {
        const link = document.createElement("a");
        link.href = resort.video;
        link.textContent = "觀看雪上影像 ↗";
        popup.append(link);
      }
      const icon = L.divIcon({
        className: "snow-pin-wrap",
        html: '<span class="snow-pin"><span>↟</span></span>',
        iconSize: [30, 38],
        iconAnchor: [15, 38],
        popupAnchor: [0, -36],
      });
      const marker = L.marker(position(resort), {
        icon,
        title: resort.name,
        alt: resort.name,
        riseOnHover: true,
      })
        .bindPopup(popup)
        .bindTooltip(resort.name, { direction: "top", offset: [0, -32] });
      marker.on("click", () => {
        list.querySelectorAll("button").forEach((button) => {
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.id === String(resort.id)),
          );
        });
      });
      markerById.set(resort.id, marker);
    });
  } else {
    error.hidden = false;
    document.querySelector("#reset-map").disabled = true;
  }

  function fitResorts(visible) {
    if (!map || !visible.length) return;
    map.closePopup();
    map.fitBounds(L.latLngBounds(visible.map(position)), {
      padding: [48, 48],
      maxZoom: 11,
      animate: false,
    });
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = resorts
      .filter(
        (resort) =>
          (country === "全部" || resort.country === country) &&
          (resort.name + resort.country + resort.years.join(" "))
            .toLocaleLowerCase()
            .includes(query),
      )
      .sort(
        (a, b) => Math.max(...b.years) - Math.max(...a.years) || a.id - b.id,
      );
    filters.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.country === country),
      );
    });
    list.replaceChildren();
    if (markers) markers.clearLayers();
    visible.forEach((resort) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.id = resort.id;
      button.setAttribute("aria-pressed", "false");
      const details = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = resort.name;
      const meta = document.createElement("span");
      meta.className = "resort-meta";
      meta.textContent = resort.country + " · " + resort.years.join(" / ");
      details.append(title, meta);
      const arrow = document.createElement("span");
      arrow.className = "resort-arrow";
      arrow.textContent = "↗";
      arrow.setAttribute("aria-hidden", "true");
      button.append(details, arrow);
      button.addEventListener("click", () => {
        if (!map) return;
        list.querySelectorAll("button").forEach((other) => {
          other.setAttribute("aria-pressed", String(other === button));
        });
        const marker = markerById.get(resort.id);
        map.setView(position(resort), 11, { animate: false });
        marker.openPopup();
        if (window.matchMedia("(max-width: 760px)").matches)
          document
            .querySelector(".map-stage")
            .scrollIntoView({ block: "center" });
      });
      item.append(button);
      list.append(item);
      if (markers) markers.addLayer(markerById.get(resort.id));
    });
    document.querySelector("#result-count").textContent =
      "顯示 " + visible.length + " / " + resorts.length + " 座雪場";
    document.querySelector("#no-results").hidden = visible.length > 0;
    fitResorts(visible);
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      country = button.dataset.country;
      render();
    }),
  );
  search.addEventListener("input", render);
  document.querySelector("#reset-map").addEventListener("click", () => {
    country = "全部";
    search.value = "";
    render();
  });
  render();
})();
