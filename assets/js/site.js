document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
if (window.SNOW_RESORTS) {
  document.querySelectorAll("[data-total-resorts]").forEach((el) => {
    el.textContent = window.SNOW_RESORTS.length;
  });
  document.querySelectorAll("[data-total-countries]").forEach((el) => {
    el.textContent = new Set(
      window.SNOW_RESORTS.map((resort) => resort.country),
    ).size;
  });
}
const lightbox = document.querySelector(".lightbox");
if (lightbox && typeof lightbox.showModal === "function") {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-gallery]");
    if (!link) return;
    event.preventDefault();
    const sourceImage = link.querySelector("img");
    const image = lightbox.querySelector("img");
    image.src = link.href;
    image.alt = sourceImage.alt;
    lightbox.querySelector(".lightbox-caption").textContent = sourceImage.alt;
    lightbox.showModal();
  });
  lightbox
    .querySelector("button")
    .addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}
