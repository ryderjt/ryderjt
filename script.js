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
const scribbles = document.querySelectorAll(".hero-scribble");
const collageItems = document.querySelectorAll(".photo-collage figure");

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
  const moveX = (event.clientX / innerWidth - 0.5) * 12;
  const moveY = (event.clientY / innerHeight - 0.5) * 12;

  scribbles.forEach((scribble, index) => {
    const depth = (index + 1) * 0.7;
    scribble.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px) rotate(${index ? 3 : -5}deg)`;
  });
};

button?.addEventListener("click", setPalette);
window.addEventListener("mousemove", onMove);

collageItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    item.style.transform = "translateY(-8px)";
  });
  item.addEventListener("mouseleave", () => {
    item.style.transform = "translateY(0px)";
  });
});
