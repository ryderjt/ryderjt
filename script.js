const body = document.body;
const paletteName = document.getElementById("palette-name");

const themeButtons = document.querySelectorAll(".chip");
const highlightButtons = document.querySelectorAll(".pill");

const setTheme = (theme) => {
  body.classList.remove(
    "theme-red",
    "theme-yellow",
    "theme-blue",
    "theme-green",
    "theme-purple"
  );
  body.classList.add(`theme-${theme}`);
  paletteName.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
};

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.theme);
  });
});

highlightButtons.forEach((button) => {
  button.addEventListener("mouseenter", () => {
    const highlight = button.dataset.highlight;
    body.classList.add(`highlight-${highlight}`);
  });
  button.addEventListener("mouseleave", () => {
    body.classList.remove("highlight-red", "highlight-blue", "highlight-yellow");
  });
});

setTheme("red");
