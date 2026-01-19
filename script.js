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
