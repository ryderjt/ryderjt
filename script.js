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
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  if (!galleryItems.length) return;

  const setOffset = (img, ratio) => {
    const delta = Math.min(1.5, Math.abs(1 - ratio));
    const magnitude = Math.round(24 + delta * 80);
    const direction = ratio >= 1 ? 1 : -1;
    const item = img.closest(".gallery-item");
    if (!item) return;
    item.style.setProperty("--stack-offset", `${magnitude * direction}px`);
    item.style.setProperty("--stack-z", ratio >= 1 ? "2" : "1");
  };

  const updateItem = (item) => {
    const img = item.querySelector("img");
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth) {
      setOffset(img, img.naturalWidth / img.naturalHeight);
      return Promise.resolve();
    }
    return img
      .decode()
      .then(() => {
        if (img.naturalWidth) {
          setOffset(img, img.naturalWidth / img.naturalHeight);
        }
      })
      .catch(() => {
        img.addEventListener(
          "load",
          () => {
            if (img.naturalWidth) {
              setOffset(img, img.naturalWidth / img.naturalHeight);
            }
          },
          { once: true }
        );
      });
  };

  galleryItems.forEach((item) => {
    updateItem(item);
  });
};

window.addEventListener("load", () => {
  stackGalleryItems();
});
