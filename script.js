const cursor = document.getElementById('cursor');
const hoverables = document.querySelectorAll('a, button, [data-tilt]');
const splitElements = document.querySelectorAll('[data-split]');
const galleryGrid = document.getElementById('portfolio-grid');
const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('.lightbox__image');
const lightboxCaption = lightbox?.querySelector('.lightbox__caption');
const lightboxClose = lightbox?.querySelector('.lightbox__close');
const tabButtons = document.querySelectorAll('.hero__link');
const displayViews = document.querySelectorAll('.display__view');
let hasRenderedPortfolio = false;

const lerp = (a, b, n) => (1 - n) * a + n * b;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetX = cursorX;
let targetY = cursorY;

function animateCursor() {
  cursorX = lerp(cursorX, targetX, 0.3);
  cursorY = lerp(cursorY, targetY, 0.3);
  const halfWidth = cursor.offsetWidth / 2;
  const halfHeight = cursor.offsetHeight / 2;
  cursor.style.transform = `translate3d(${cursorX - halfWidth}px, ${cursorY - halfHeight}px, 0)`;
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
  revealSplit(element);
});

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

const setActiveView = async (target) => {
  const normalized = target || 'portfolio';

  tabButtons.forEach((button) => {
    const isMatch = button.dataset.target === normalized;
    button.classList.toggle('is-active', isMatch);
    button.setAttribute('aria-selected', String(isMatch));
  });

  displayViews.forEach((view) => {
    const isMatch = view.dataset.view === normalized;
    view.classList.toggle('is-active', isMatch);
    view.toggleAttribute('hidden', !isMatch);
  });

  if (normalized === 'portfolio' && !hasRenderedPortfolio) {
    await renderGallery();
    hasRenderedPortfolio = true;
  }
};

tabButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveView(button.dataset.target));
});

const formatCaption = (src) => {
  const fileName = src.split('/').pop() || '';
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeSource = (src) => {
  if (!src) return '';
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('assets/')) return trimmed;
  return `assets/gallery/${trimmed.replace(/^\.?(\/)*/, '')}`;
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('is-active');
  document.body.classList.remove('is-locked');
  lightbox.setAttribute('aria-hidden', 'true');
};

const openLightbox = (src) => {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = src;
  lightboxImage.alt = formatCaption(src);
  lightboxCaption.textContent = formatCaption(src);
  lightbox.classList.add('is-active');
  document.body.classList.add('is-locked');
  lightbox.setAttribute('aria-hidden', 'false');
};

const layoutCycle = ['statement', 'tall', 'wide', '', 'tall', 'spotlight', 'wide'];

const createGalleryItem = (src, index = 0) => {
  const figure = document.createElement('figure');
  figure.className = 'gallery__item';
  const layout = layoutCycle[index % layoutCycle.length];
  if (layout) {
    figure.classList.add(`gallery__item--${layout}`);
  }
  figure.tabIndex = 0;

  const image = document.createElement('img');
  image.src = src;
  image.alt = formatCaption(src);

  const caption = document.createElement('figcaption');
  caption.textContent = formatCaption(src);

  figure.appendChild(image);
  figure.appendChild(caption);

  const activate = () => openLightbox(src);
  figure.addEventListener('click', activate);
  figure.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });

  return figure;
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

const sanitizeFileName = (file) => file.split(/[?#]/)[0].replace(/^\/?\.\//, '').replace(/^\//, '');

const guessGithubRepo = () => {
  const explicitRepo = document.documentElement.dataset.galleryRepo;
  if (explicitRepo) return explicitRepo;

  const { hostname, pathname } = window.location;
  const isGithubPages = hostname.endsWith('github.io');
  if (!isGithubPages) return 'ryderjt/ryderjt';

  const owner = hostname.replace('.github.io', '');
  const [, firstSegment] = pathname.split('/');
  const repoName = firstSegment || `${owner}.github.io`;
  return `${owner}/${repoName}`;
};

const discoverGithubImages = async () => {
  const repo = guessGithubRepo();
  const branchCandidates = [
    document.documentElement.dataset.galleryBranch,
    'work',
    'main',
    'gh-pages',
    'master',
  ].filter(Boolean);

  for (const branch of branchCandidates) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/assets/gallery?ref=${encodeURIComponent(branch)}`,
        {
          headers: { Accept: 'application/vnd.github.v3+json' },
          cache: 'no-store',
        }
      );

      if (!response.ok) continue;

      const files = await response.json();
      if (!Array.isArray(files)) continue;

      return files
        .filter((item) => item.type === 'file' && typeof item.name === 'string')
        .filter((item) => IMAGE_EXTENSIONS.some((ext) => item.name.toLowerCase().endsWith(ext)))
        .map((item) => item.download_url || normalizeSource(item.path));
    } catch (error) {
      console.warn('Unable to read gallery via GitHub API', error);
    }
  }

  return [];
};

const discoverDirectoryImages = async () => {
  try {
    const response = await fetch('assets/gallery/', {
      headers: { Accept: 'text/html,application/xhtml+xml' },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) return [];

    const directoryHtml = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(directoryHtml, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));

    return links
      .map((link) => link.getAttribute('href') || '')
      .map(sanitizeFileName)
      .filter((href) => IMAGE_EXTENSIONS.some((ext) => href.toLowerCase().endsWith(ext)))
      .map(normalizeSource);
  } catch (error) {
    console.warn('Unable to read gallery directory listing', error);
    return [];
  }
};

const loadManifestImages = async () => {
  try {
    const response = await fetch('assets/gallery/manifest.json', { cache: 'no-store' });
    if (!response.ok) return [];

    const manifest = await response.json();
    const images = Array.isArray(manifest) ? manifest : manifest.images;
    return (images || []).map(normalizeSource).filter(Boolean);
  } catch (error) {
    console.warn('Unable to load gallery manifest', error);
    return [];
  }
};

const renderGallery = async () => {
  if (!galleryGrid) return;

  const [directoryImages, manifestImages, githubImages] = await Promise.all([
    discoverDirectoryImages(),
    loadManifestImages(),
    discoverGithubImages(),
  ]);

  const seen = new Set();
  const normalizedImages = [...directoryImages, ...manifestImages, ...githubImages].filter((src) => {
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  });

  if (!normalizedImages.length) {
    galleryGrid.innerHTML =
      '<p class="gallery__empty">Drop your stills into <span>assets/gallery</span> and they will automatically surface here.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  normalizedImages.forEach((src, index) => fragment.appendChild(createGalleryItem(src, index)));
  galleryGrid.innerHTML = '';
  galleryGrid.appendChild(fragment);
};

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.classList.contains('lightbox__scrim')) {
      closeLightbox();
    }
  });
}

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
  }
});

animateCursor();

window.addEventListener('load', () => {
  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;
  const spans = heroTitle.querySelectorAll('span');
  spans.forEach((span, index) => {
    setTimeout(() => span.classList.add('visible'), index * 140);
  });
});

setActiveView('portfolio');
