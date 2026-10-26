(() => {
  const resorts = window.SNOW_RESORTS || [];
  const setCount = (selector, value) =>
    document
      .querySelectorAll(selector)
      .forEach((el) => (el.textContent = value));
  if (resorts.length) {
    setCount(
      "[data-home-albums]",
      resorts.filter((r) => r.photos?.length).length,
    );
    setCount(
      "[data-home-clips]",
      resorts.reduce((sum, r) => sum + (r.videos?.length || 0), 0),
    );
    document.querySelectorAll("[data-home-resort-count]").forEach((el) => {
      const resort = resorts.find(
        (r) => r.id === Number(el.dataset.homeResortCount),
      );
      if (resort)
        el.textContent = `${resort.photos?.length || 0} 張照片${resort.videos?.length ? " · 有短片" : ""}`;
    });
  }
  const filter = document.querySelector(".home-filter");
  if (!filter) return;
  const buttons = [...filter.querySelectorAll("button")];
  const journeys = [...document.querySelectorAll("[data-journey-country]")];
  filter.hidden = false;
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const country = button.dataset.country;
      buttons.forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
      journeys.forEach(
        (card) =>
          (card.hidden =
            country !== "全部" && card.dataset.journeyCountry !== country),
      );
      document.querySelector("#journey-status").textContent =
        `${journeys.filter((card) => !card.hidden).length} 段${country === "全部" ? "精選" : country}旅行`;
    }),
  );
})();
