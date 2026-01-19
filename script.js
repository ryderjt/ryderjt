const palette = [
  "#ff2d2d",
  "#ff7a00",
  "#ffd000",
  "#00c853",
  "#1e4dff",
  "#7b2dff",
];

const button = document.querySelector(".palette-button");
const root = document.documentElement;
const heroIcon = document.querySelector(".hero-icon");
const galleryItems = document.querySelectorAll(".gallery-item");

const setPalette = () => {
  const [accent, accent2, accent3] = palette
    .map((color) => ({ color, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 3)
    .map((item) => item.color);

  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-2", accent2);
  root.style.setProperty("--accent-3", accent3);
};

const onMove = (event) => {
  const { innerWidth, innerHeight } = window;
  const moveX = (event.clientX / innerWidth - 0.5) * 10;
  const moveY = (event.clientY / innerHeight - 0.5) * 10;

  if (heroIcon) {
    heroIcon.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }
};

button?.addEventListener("click", setPalette);
window.addEventListener("mousemove", onMove);

galleryItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    item.style.transform = "translateY(-10px)";
  });
  item.addEventListener("mouseleave", () => {
    item.style.transform = "translateY(0px)";
  });
});
