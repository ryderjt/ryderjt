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
const shapes = document.querySelectorAll(".shape");

const setPalette = () => {
  const [accent, accent2] = palette
    .map((color) => ({ color, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 2)
    .map((item) => item.color);

  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-2", accent2);
};

button?.addEventListener("click", setPalette);

window.addEventListener("mousemove", (event) => {
  const { innerWidth, innerHeight } = window;
  const moveX = (event.clientX / innerWidth - 0.5) * 10;
  const moveY = (event.clientY / innerHeight - 0.5) * 10;

  shapes.forEach((shape, index) => {
    const depth = (index + 1) * 0.6;
    shape.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
  });
});
