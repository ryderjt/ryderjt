const cursor = document.getElementById('cursor');
const hoverables = document.querySelectorAll('a, button, [data-tilt]');
const splitElements = document.querySelectorAll('[data-split]');
const panels = document.querySelectorAll('.panel');

const lerp = (a, b, n) => (1 - n) * a + n * b;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetX = cursorX;
let targetY = cursorY;

function animateCursor() {
  cursorX = lerp(cursorX, targetX, 0.2);
  cursorY = lerp(cursorY, targetY, 0.2);
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  requestAnimationFrame(animateCursor);
}

window.addEventListener('mousemove', (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

hoverables.forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('active'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

function splitText(element) {
  const text = element.textContent;
  const words = text.split(' ');
  const spans = words
    .map((word) => `<span>${word}&nbsp;</span>`)
    .join('');
  element.innerHTML = spans;
  element.classList.add('split');
}

function revealSplit(element, baseDelay = 0) {
  const spans = element.querySelectorAll('span');
  spans.forEach((span, index) => {
    setTimeout(() => span.classList.add('visible'), baseDelay + index * 60);
  });
}

splitElements.forEach((element) => {
  splitText(element);
  if (!element.closest('.panel')) {
    revealSplit(element);
  }
});

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        const splits = entry.target.querySelectorAll('.split');
        splits.forEach((split, index) => revealSplit(split, index * 160));
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

panels.forEach((panel) => observer.observe(panel));

document.querySelectorAll('[data-tilt]').forEach((item) => {
  let rafId;
  let bounds;

  const calculate = (event) => {
    if (!bounds) bounds = item.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    item.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const reset = () => {
    item.style.transform = '';
    bounds = null;
  };

  item.addEventListener('mousemove', (event) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => calculate(event));
  });

  item.addEventListener('mouseleave', () => {
    if (rafId) cancelAnimationFrame(rafId);
    item.classList.remove('is-hovered');
    item.style.transform = '';
  });

  item.addEventListener('mouseenter', () => {
    item.classList.add('is-hovered');
  });
});

const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

animateCursor();

window.addEventListener('load', () => {
  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;
  const spans = heroTitle.querySelectorAll('span');
  spans.forEach((span, index) => {
    setTimeout(() => span.classList.add('visible'), index * 140);
  });
});
