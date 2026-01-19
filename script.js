const filterButtons = document.querySelectorAll(".filter-btn");
const workItems = document.querySelectorAll(".work-item");
const root = document.documentElement;
const accentCycle = [
  "var(--red)",
  "var(--orange)",
  "var(--yellow)",
  "var(--green)",
  "var(--blue)",
  "var(--purple)",
];
let accentIndex = 0;

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    workItems.forEach((item) => {
      const matches = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("hidden", !matches);
    });
  });
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "color") {
      accentIndex = (accentIndex + 1) % accentCycle.length;
      root.style.setProperty("--accent", accentCycle[accentIndex]);
    }

    if (action === "scroll") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (action === "email") {
      window.location.href = "mailto:hello@ryderthomas.com";
    }

    if (action === "highlight") {
      document.querySelector(".hero").classList.add("pulse");
      setTimeout(() => {
        document.querySelector(".hero").classList.remove("pulse");
      }, 600);
    }
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
      }
    });
  },
  { threshold: 0.2 }
);

document
  .querySelectorAll(".capability-card, .panel, .work-item")
  .forEach((item) => {
    item.classList.add("reveal-ready");
    observer.observe(item);
  });
