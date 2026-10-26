document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => {
    document.querySelectorAll("video").forEach((other) => {
      if (other !== video) other.pause();
    });
  });
  const showError = () => {
    video.closest(".film-card").querySelector(".video-error").hidden = false;
  };
  video.addEventListener("error", showError);
  video.querySelector("source").addEventListener("error", showError);
});
