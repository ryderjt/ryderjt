const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('[data-reveal]').forEach((el, index) => {
  el.style.setProperty('--delay', `${index * 60}ms`);
  observer.observe(el);
});

const cursor = document.createElement('div');
cursor.className = 'cinema-cursor';
document.body.appendChild(cursor);

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetX = cursorX;
let targetY = cursorY;

window.addEventListener('pointermove', (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
});

function animateCursor() {
  cursorX += (targetX - cursorX) * 0.2;
  cursorY += (targetY - cursorY) * 0.2;
  cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
  requestAnimationFrame(animateCursor);
}

animateCursor();

const interactiveSelectors = 'a, button, .gallery__item';
document.querySelectorAll(interactiveSelectors).forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '80px';
    cursor.style.height = '80px';
    cursor.style.borderColor = 'rgba(59, 130, 246, 0.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '50px';
    cursor.style.height = '50px';
    cursor.style.borderColor = 'rgba(17, 24, 39, 0.2)';
  });
});

const reelFrame = document.querySelector('.reel-frame');
if (reelFrame) {
  const baseTilt = -3;
  const updateTilt = () => {
    const rect = reelFrame.getBoundingClientRect();
    const offset = baseTilt + (window.innerHeight / 2 - rect.top) * 0.0008;
    reelFrame.style.transform = `rotate(${offset}deg)`;
  };
  updateTilt();
  window.addEventListener('scroll', updateTilt);
}
