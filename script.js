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
const galleryItems = document.querySelectorAll(".gallery-item");

const shuffleNodes = (container) => {
  if (!container) return;
  const items = Array.from(container.children);
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((item) => container.appendChild(item));
};

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

button?.addEventListener("click", setPalette);

shuffleNodes(document.querySelector(".gallery-track"));
shuffleNodes(document.querySelector(".design-grid"));

galleryItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    item.style.transform = "translateY(-10px)";
  });
  item.addEventListener("mouseleave", () => {
    item.style.transform = "translateY(0px)";
  });
});
