const cursor = document.getElementById('cursor');
const hoverables = document.querySelectorAll('a, button, [data-tilt]');
const splitElements = document.querySelectorAll('[data-split]');
const viewButtons = document.querySelectorAll('[data-view-target]');
const views = document.querySelectorAll('[data-view]');
const workspacePanel = document.querySelector('.workspace__panel');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeToggleLabel = themeToggle?.querySelector('.theme-toggle__label');
const themeToggleIcon = themeToggle?.querySelector('.theme-toggle__icon');
const galleryGrid = document.getElementById('gallery-grid');
const galleryStage = galleryGrid?.querySelector('.gallery__stage');
const galleryGridView = galleryGrid?.querySelector('.gallery__grid');
const galleryPrev = galleryGrid?.querySelector('.gallery__nav--prev');
const galleryNext = galleryGrid?.querySelector('.gallery__nav--next');
const galleryToggle = galleryGrid?.querySelector('.gallery__toggle');
const videoGallery = document.getElementById('video-gallery');
const videoGrid = videoGallery?.querySelector('.video-gallery__grid');
const videoEmptyState = videoGallery?.querySelector('.video-gallery__empty');
const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('.lightbox__image');
const lightboxCaption = lightbox?.querySelector('.lightbox__caption');
const lightboxClose = lightbox?.querySelector('.lightbox__close');

const applyMediaGuards = (element) => {
  if (!element) return;
  element.setAttribute('draggable', 'false');
  element.addEventListener('dragstart', (event) => event.preventDefault());
  element.addEventListener('contextmenu', (event) => event.preventDefault());
};

document.body?.classList.add('media-guarded');

const lerp = (a, b, n) => (1 - n) * a + n * b;
const shuffleArray = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
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

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

const getStoredTheme = () => localStorage.getItem('theme-preference');
const setStoredTheme = (theme) => localStorage.setItem('theme-preference', theme);

const applyTheme = (theme, persist = true) => {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.body.dataset.theme = nextTheme;

  if (themeToggleLabel) {
    themeToggleLabel.textContent = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
  }

  if (themeToggleIcon) {
    themeToggleIcon.textContent = nextTheme === 'dark' ? '☀' : '☾';
  }

  themeToggle?.setAttribute('aria-pressed', nextTheme === 'dark' ? 'true' : 'false');

  if (persist) {
    setStoredTheme(nextTheme);
  }
};

const resolvePreferredTheme = () => getStoredTheme() || (prefersDarkScheme.matches ? 'dark' : 'light');

applyTheme(resolvePreferredTheme(), false);

prefersDarkScheme.addEventListener('change', (event) => {
  if (getStoredTheme()) return;
  applyTheme(event.matches ? 'dark' : 'light', false);
});

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
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

document
  .querySelectorAll('.hero__polaroid-image, .lightbox__image')
  .forEach((element) => applyMediaGuards(element));

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

const createGalleryItem = (src, index = 0, options = {}) => {
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
  applyMediaGuards(image);

  const caption = document.createElement('figcaption');
  caption.textContent = formatCaption(src);

  figure.appendChild(image);
  figure.appendChild(caption);
  figure.addEventListener('contextmenu', (event) => event.preventDefault());

  if (!options?.suppressLightbox) {
    const activate = () => openLightbox(src);
    figure.addEventListener('click', activate);
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  }

  return figure;
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov'];

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

const changeSlide = (delta) => {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex + delta + galleryImages.length) % galleryImages.length;
  renderStage();
};

const discoverDirectoryVideos = async () => {
  try {
    const response = await fetch('assets/videos/', {
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
      .filter((href) => VIDEO_EXTENSIONS.some((ext) => href.toLowerCase().endsWith(ext)))
      .map((href) => `assets/videos/${href}`);
  } catch (error) {
    console.warn('Unable to read video directory listing', error);
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

let galleryImages = [];
let galleryIndex = 0;
let galleryIsGrid = false;
let stageResizeHandler = null;

const renderStage = () => {
  if (!galleryStage) return;
  galleryStage.innerHTML = '';

  if (!galleryImages.length) {
    galleryStage.innerHTML =
      '<p class="gallery__empty">Drop your stills into <span>assets/gallery</span> and they will automatically surface here.</p>';
    return;
  }

  const src = galleryImages[galleryIndex];
  const figure = createGalleryItem(src, galleryIndex, { suppressLightbox: true });
  figure.classList.add('gallery__item--single');
  figure.addEventListener('click', () => openLightbox(src));

  const image = figure.querySelector('img');
  const resizeToImage = () => {
    if (!image || !galleryStage) return;
    const { naturalWidth, naturalHeight } = image;
    if (!naturalWidth || !naturalHeight) return;

    const stageRect = galleryStage.getBoundingClientRect();
    const maxWidth = stageRect.width || naturalWidth;
    const maxHeight = stageRect.height || naturalHeight;

    const baseScale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
    let scale = baseScale * 1.1;

    let width = naturalWidth * scale;
    let height = naturalHeight * scale;

    if (width > maxWidth || height > maxHeight) {
      scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
      width = naturalWidth * scale;
      height = naturalHeight * scale;
    }

    figure.style.setProperty('--media-width', `${width}px`);
    figure.style.setProperty('--media-height', `${height}px`);
    figure.style.width = `${width}px`;
    figure.style.height = `${height}px`;
  };

  if (image) {
    if (stageResizeHandler) {
      window.removeEventListener('resize', stageResizeHandler);
    }

    if (image.complete && image.naturalWidth) {
      resizeToImage();
    } else {
      image.addEventListener('load', resizeToImage, { once: true });
    }

    stageResizeHandler = resizeToImage;
    window.addEventListener('resize', stageResizeHandler, { passive: true });
  }

  galleryStage.appendChild(figure);
};

const renderGridView = () => {
  if (!galleryGridView) return;
  galleryGridView.innerHTML = '';

  if (!galleryImages.length) return;

  const fragment = document.createDocumentFragment();
  galleryImages.forEach((src, index) => {
    const figure = createGalleryItem(src, index, { suppressLightbox: true });
    figure.addEventListener('click', () => {
      galleryIndex = index;
      galleryIsGrid = false;
      galleryGrid?.classList.remove('is-grid');
      galleryToggle?.setAttribute('aria-pressed', 'false');
      renderStage();
    });
    fragment.appendChild(figure);
  });

  galleryGridView.appendChild(fragment);
};

const updateNavState = () => {
  const disabled = galleryImages.length <= 1;
  if (galleryPrev) galleryPrev.disabled = disabled;
  if (galleryNext) galleryNext.disabled = disabled;
};

const renderGallery = async () => {
  if (!galleryGrid) return;

  const [directoryImages, manifestImages, githubImages] = await Promise.all([
    discoverDirectoryImages(),
    loadManifestImages(),
    discoverGithubImages(),
  ]);

  const seen = new Set();
  galleryImages = shuffleArray(
    [...directoryImages, ...manifestImages, ...githubImages].filter((src) => {
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    }),
  );

  if (!galleryImages.length) {
    renderStage();
    return;
  }

  galleryIndex = 0;
  galleryIsGrid = false;
  galleryGrid.classList.remove('is-grid');
  galleryToggle?.setAttribute('aria-pressed', 'false');
  renderStage();
  renderGridView();
  updateNavState();
};

const createVideoItem = (src) => {
  const figure = document.createElement('figure');
  figure.className = 'video-gallery__item';

  const video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  const caption = document.createElement('figcaption');
  caption.textContent = formatCaption(src);

  figure.appendChild(video);
  figure.appendChild(caption);

  return figure;
};

const renderVideoGallery = async () => {
  if (!videoGallery || !videoGrid) return;

  const videoSources = await discoverDirectoryVideos();
  videoGrid.innerHTML = '';

  if (!videoSources.length) {
    videoGallery.classList.add('is-empty');
    if (videoEmptyState) videoEmptyState.hidden = false;
    return;
  }

  videoGallery.classList.remove('is-empty');
  if (videoEmptyState) videoEmptyState.hidden = true;

  const fragment = document.createDocumentFragment();
  videoSources.forEach((src) => {
    const item = createVideoItem(src);
    fragment.appendChild(item);
  });

  videoGrid.appendChild(fragment);
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

if (lightboxImage) {
  let hoverRaf;

  lightboxImage.addEventListener('mousemove', (event) => {
    if (hoverRaf) cancelAnimationFrame(hoverRaf);
    hoverRaf = requestAnimationFrame(() => {
      const rect = lightboxImage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      lightboxImage.style.transformOrigin = `${x}% ${y}%`;
      lightboxImage.classList.add('is-zoomed');
    });
  });

  lightboxImage.addEventListener('mouseleave', () => {
    if (hoverRaf) cancelAnimationFrame(hoverRaf);
    lightboxImage.classList.remove('is-zoomed');
    lightboxImage.style.transformOrigin = '';
  });
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

const showView = (name) => {
  views.forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === name);
  });

  viewButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.viewTarget === name);
  });

  if (workspacePanel) {
    workspacePanel.dataset.activeView = name;
  }
};

viewButtons.forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.viewTarget));
});

galleryPrev?.addEventListener('click', () => changeSlide(-1));
galleryNext?.addEventListener('click', () => changeSlide(1));

galleryToggle?.addEventListener('click', () => {
  galleryIsGrid = !galleryIsGrid;
  galleryToggle.setAttribute('aria-pressed', galleryIsGrid ? 'true' : 'false');
  galleryGrid?.classList.toggle('is-grid', galleryIsGrid);
});

const initialView =
  (viewButtons[0] && viewButtons[0].dataset.viewTarget) ||
  (views[0] && views[0].dataset.view) ||
  'photography';
showView(initialView);

renderGallery();
renderVideoGallery();
