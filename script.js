const shuffleNodes = (container) => {
  if (!container) return;
  const items = Array.from(container.children);
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((item) => container.appendChild(item));
};

shuffleNodes(document.querySelector(".gallery-track"));
shuffleNodes(document.querySelector(".design-grid"));

const stackGalleryItems = () => {
  const galleryItems = document.querySelectorAll(".gallery-item");
  if (!galleryItems.length) return;

  const setOffset = (img, ratio) => {
    const delta = Math.min(1.2, Math.abs(1 - ratio));
    const magnitude = Math.round(12 + delta * 48);
    const direction = ratio >= 1 ? 1 : -1;
    img.closest(".gallery-item")?.style.setProperty(
      "--stack-offset",
      `${magnitude * direction}px`
    );
  };

  galleryItems.forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;
    if (img.complete && img.naturalWidth) {
      setOffset(img, img.naturalWidth / img.naturalHeight);
    } else {
      img.addEventListener("load", () => {
        if (img.naturalWidth) {
          setOffset(img, img.naturalWidth / img.naturalHeight);
        }
      });
    }
  });
};

stackGalleryItems();
