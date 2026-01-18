const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  document.body.classList.add('reduce-motion');
}

const yearStamp = document.querySelector('[data-year]');
if (yearStamp) {
  yearStamp.textContent = new Date().getFullYear();
}

const navLinks = document.querySelectorAll('.site-nav a');
const sections = document.querySelectorAll('section[id]');

if (navLinks.length && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const targetId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
        });
      });
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}
