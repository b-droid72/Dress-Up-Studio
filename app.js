const SCREENS = ["start", "settings", "character", "dressup", "wardrobe", "finished"];
const CHARACTER_LAYER_ORDER = [
  "faceDecor",
  "ears",
  "eyeColor",
  "eyelashes",
  "eyebrows",
  "nose",
  "mouth",
  "hair",
  "bangs"
];
const DRESSUP_LAYER_ORDER = ["underwear", "top", "bottom", "dress", "shoes", "jacket", "accessory"];

const LAYERS = {
  base: {
    body: { id: "body", src: "./assets/base/body.svg" }
  }
};

/**
 * App state uses option IDs. For image-based choices, we also store resolved src paths.
 */
const state = {
  screen: "start",
  settings: {
    music: false,
    sound: false
  },
  character: {
    skinTone: "tone_1",
    eyeColor: "pupils1a",
    mouth: "mouth1",
    hair: "none",
    eyelashes: "lashes1",
    faceDecor: "none",
    hairColor: "#5b3a22"
  },
  outfit: {},
  wardrobe: [],
  ui: {
    characterTab: "skinTone",
    dressupTab: "top"
  },
  justRestarted: false
};

let optionsData = null;
let optionIndex = null;
const hairSvgTemplates = new Map();

function sortTabsByLayerOrder(tabs, preferredOrder) {
  const rank = new Map(preferredOrder.map((id, idx) => [id, idx]));
  return [...tabs].sort((a, b) => {
    const aRank = rank.has(a.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bRank = rank.has(b.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function clampScreen(screen) {
  return SCREENS.includes(screen) ? screen : "start";
}

function setScreen(next) {
  state.screen = clampScreen(next);
  renderScreens();
}

function renderScreens() {
  qsa(".screen").forEach((el) => {
    const name = el.getAttribute("data-screen");
    el.classList.toggle("hidden", name !== state.screen);
  });
  qs("#homeBtn").disabled = state.screen === "start";
}

function buildOptionIndex(data) {
  const idx = {
    character: {},
    dressup: {}
  };

  for (const tab of data.character.tabs) {
    idx.character[tab.id] = {};
    for (const opt of tab.options) idx.character[tab.id][opt.id] = opt;
  }

  for (const tab of data.dressup.tabs) {
    idx.dressup[tab.id] = {};
    for (const opt of tab.options) idx.dressup[tab.id][opt.id] = opt;
  }

  return idx;
}

function resolveCharacterLayerSrc(key) {
  const valueId = state.character[key];
  const opt = optionIndex?.character?.[key]?.[valueId];
  return opt?.src ?? null;
}

function resolveCharacterLayerSrcs(key) {
  const valueId = state.character[key];
  const opt = optionIndex?.character?.[key]?.[valueId];
  if (!opt) return [];
  if (Array.isArray(opt.srcLayers)) return opt.srcLayers.filter(Boolean);
  return opt.src ? [opt.src] : [];
}

function resolveOutfitLayerSrcs(key) {
  const valueId = state.outfit[key];
  const opt = optionIndex?.dressup?.[key]?.[valueId];
  if (!opt) return [];
  if (Array.isArray(opt.srcLayers)) return opt.srcLayers.filter(Boolean);
  return opt.src ? [opt.src] : [];
}

function applyColorTint(imgEl, tintColor) {
  if (!tintColor) {
    imgEl.style.filter = "";
    return;
  }
  // Keep this simple: use CSS drop-shadow tinting. Works well enough for SVG placeholders.
  imgEl.style.filter = `drop-shadow(0 0 0 ${tintColor})`;
}

function resolveBodySrc() {
  const skinToneOpt = optionIndex?.character?.skinTone?.[state.character.skinTone];
  const baseSrc = skinToneOpt?.src ?? LAYERS.base.body.src;
  if (!baseSrc) return null;
  const textureId = state.character.skinTexture ?? "base";
  if (textureId === "base") return baseSrc;
  const match = baseSrc.match(/base_body_([a-z]+)\.png$/i);
  if (!match) return baseSrc;
  const suffix = match[1];
  if (textureId === "snake") return `./assets/bodypack/snake/snake_body_${suffix}.png`;
  if (textureId === "bubbles") return `./assets/bodypack/bubbles/bubbles_body_${suffix}.png`;
  return baseSrc;
}

async function preloadHairSvgTemplates() {
  hairSvgTemplates.clear();
  const hairTab = optionsData?.character?.tabs?.find((tab) => tab.id === "hair");
  if (!hairTab) return;

  const loads = hairTab.options
    .filter((opt) => typeof opt.src === "string" && opt.src.toLowerCase().endsWith(".svg"))
    .map(async (opt) => {
      try {
        const res = await fetch(opt.src);
        if (!res.ok) return;
        const svgText = await res.text();
        hairSvgTemplates.set(opt.id, svgText);
      } catch (_err) {
        // Keep rendering resilient; missing templates fall back to regular <img>.
      }
    });

  await Promise.all(loads);
}

function makeHairSvgLayer(hairId, hairColor) {
  const template = hairSvgTemplates.get(hairId);
  if (!template) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(template, "image/svg+xml");
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== "svg") return null;

  const tone = hairColor && /^#[0-9a-fA-F]{6}$/.test(hairColor) ? hairColor : "#5b3a22";
  svg.querySelectorAll("[fill]").forEach((node) => {
    const current = node.getAttribute("fill");
    if (!current || current === "none" || current === "transparent") return;
    if (current.toLowerCase() === "#5b3a22") {
      node.setAttribute("fill", tone);
    }
  });

  svg.classList.add("layerSvg", "layer--hair");
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

function renderLayerStack(rootEl) {
  rootEl.innerHTML = "";

  const makeImg = (id, src) => {
    if (!src) return null;
    const img = document.createElement("img");
    img.className = "layerImg";
    img.classList.add(`layer--${id}`);
    img.alt = "";
    img.draggable = false;
    img.decoding = "async";
    img.loading = "eager";
    img.dataset.layer = id;
    img.src = src;
    return img;
  };

  const hairTab = optionsData?.character?.tabs?.find((tab) => tab.id === "hair");

  // Render hair first (behind body)
  if (hairTab) {
    const hairColor = state.character.hairColor;
    const hairSvg = makeHairSvgLayer(state.character.hair, hairColor);
    if (hairSvg) {
      rootEl.appendChild(hairSvg);
    } else {
      const hairSrc = resolveCharacterLayerSrc("hair");
      if (hairSrc) {
        const hair = makeImg("hair", hairSrc);
        if (hair) {
          applyColorTint(hair, hairColor);
          rootEl.appendChild(hair);
        }
      }
    }
  }

  const body = makeImg(LAYERS.base.body.id, resolveBodySrc());
  if (body) {
    rootEl.appendChild(body);
    const skinOpt = optionIndex?.character?.skinTone?.[state.character.skinTone];
    applyColorTint(body, skinOpt?.color ?? null);
  }

  // Always render underwear first
  const underwearSrcs = ["./assets/clothes/underwear/bra.webp", "./assets/clothes/underwear/slip.webp"];
  for (const src of underwearSrcs) {
    const underwear = makeImg("underwear", src);
    if (underwear) rootEl.appendChild(underwear);
  }

  const orderedCharacterTabs = sortTabsByLayerOrder(
    optionsData?.character?.tabs ?? [],
    CHARACTER_LAYER_ORDER
  );
  for (const tab of orderedCharacterTabs) {
    if (tab.id === "skinTone" || tab.id === "hair") continue;
    // Only image-based tabs become visual layers.
    const hasImageOption = tab.options?.some((opt) => Object.prototype.hasOwnProperty.call(opt, "src"));
    if (!hasImageOption) continue;
    const layerSrcs = resolveCharacterLayerSrcs(tab.id);
    if (!layerSrcs.length) continue;
    for (const src of layerSrcs) {
      const img = makeImg(tab.id, src);
      if (!img) continue;
      if (tab.id === "eyeColor") {
        const skinOpt = optionIndex?.character?.skinTone?.[state.character.skinTone];
        applyColorTint(img, skinOpt?.color ?? null);
      }
      rootEl.appendChild(img);
    }
  }

  // Always render ears #1 with skin tone matching
  const earsImg = makeImg("ears", "./assets/features/ears/1.png");
  if (earsImg) {
    const skinOpt = optionIndex?.character?.skinTone?.[state.character.skinTone];
    applyColorTint(earsImg, skinOpt?.color ?? null);
    rootEl.appendChild(earsImg);
  }

  const orderedDressupTabs = sortTabsByLayerOrder(
    optionsData?.dressup?.tabs ?? [],
    DRESSUP_LAYER_ORDER
  );
  for (const tab of orderedDressupTabs) {
    const layerSrcs = resolveOutfitLayerSrcs(tab.id);
    if (!layerSrcs.length) continue;
    for (const src of layerSrcs) {
      const item = makeImg(tab.id, src);
      if (item) rootEl.appendChild(item);
    }
  }
}

function renderPreview() {
  renderLayerStack(qs("#previewStack"));
  renderLayerStack(qs("#previewStackDressup"));
  renderLayerStack(qs("#previewStackFinished"));
}

function setCharacterValue(key, optId) {
  state.character[key] = optId;
  renderCharacterTabContent();
  renderPreview();
}

function setOutfitValue(key, optId) {
  state.outfit[key] = optId;
  renderDressupTabContent();
  renderPreview();
}

function renderTabs(container, tabs, activeId, onClick) {
  container.innerHTML = "";
  for (const tab of tabs) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tab ${tab.id === activeId ? "active" : ""}`;
    btn.textContent = tab.label;
    btn.addEventListener("click", () => onClick(tab.id));
    container.appendChild(btn);
  }
}

function renderOptionGrid({ container, tab, activeId, onSelect, showSwatch }) {
  const grid = document.createElement("div");
  grid.className = "optionGrid";

  for (const opt of tab.options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `optionBtn ${opt.id === activeId ? "active" : ""}`;

    const left = document.createElement("div");
    left.style.fontWeight = "700";
    left.textContent = opt.label;

    const right = document.createElement("div");
    if (showSwatch && opt.color) {
      const sw = document.createElement("div");
      sw.className = "swatch";
      sw.style.background = opt.color;
      right.appendChild(sw);
    }

    btn.appendChild(left);
    if (right.children.length > 0) {
      btn.appendChild(right);
    }
    btn.addEventListener("click", () => onSelect(opt.id));
    grid.appendChild(btn);
  }

  container.appendChild(grid);
}

function renderCharacterTabContent() {
  const container = qs("#characterCategoryContent");
  const activeTabId = state.ui.characterTab;
  const tab = optionsData.character.tabs.find((t) => t.id === activeTabId) ?? optionsData.character.tabs[0];

  container.innerHTML = "";
  const group = document.createElement("div");
  group.className = "optionGroup";

  const title = document.createElement("div");
  title.style.fontWeight = "800";
  title.textContent = tab.label;
  group.appendChild(title);

  const activeId = state.character[tab.id];
  const isColor = tab.type === "color";

  renderOptionGrid({
    container: group,
    tab,
    activeId,
    onSelect: (optId) => setCharacterValue(tab.id, optId),
    showSwatch: isColor
  });

  container.appendChild(group);
}

function renderDressupTabContent() {
  const container = qs("#dressupCategoryContent");
  const activeTabId = state.ui.dressupTab;
  const tab = optionsData.dressup.tabs.find((t) => t.id === activeTabId) ?? optionsData.dressup.tabs[0];

  container.innerHTML = "";
  const group = document.createElement("div");
  group.className = "optionGroup";

  const title = document.createElement("div");
  title.style.fontWeight = "800";
  title.textContent = tab.label;
  group.appendChild(title);

  const activeId = state.outfit[tab.id];

  renderOptionGrid({
    container: group,
    tab,
    activeId,
    onSelect: (optId) => setOutfitValue(tab.id, optId),
    showSwatch: false
  });

  container.appendChild(group);
}

function renderCharacterControls() {
  renderTabs(qs("#characterCategoryTabs"), optionsData.character.tabs, state.ui.characterTab, (id) => {
    state.ui.characterTab = id;
    renderCharacterTabContent();
  });
  renderCharacterTabContent();
}

function renderDressupControls() {
  renderTabs(qs("#dressupCategoryTabs"), optionsData.dressup.tabs, state.ui.dressupTab, (id) => {
    state.ui.dressupTab = id;
    renderDressupTabContent();
  });
  renderDressupTabContent();
}

function applyDefaultsFromOptions() {
  state.outfit = {};
  for (const tab of optionsData.character.tabs) {
    if (state.character[tab.id] == null) state.character[tab.id] = tab.default;
  }
  for (const tab of optionsData.dressup.tabs) {
    if (state.outfit[tab.id] == null) state.outfit[tab.id] = tab.default;
  }
}

function resetCharacter() {
  for (const tab of optionsData.character.tabs) state.character[tab.id] = tab.default;
  state.ui.characterTab = optionsData.character.tabs[0]?.id ?? "skinTone";
  renderCharacterControls();
  renderPreview();
}

function resetOutfit() {
  for (const tab of optionsData.dressup.tabs) state.outfit[tab.id] = tab.default;
  state.ui.dressupTab = optionsData.dressup.tabs[0]?.id ?? "top";
  renderDressupControls();
  renderPreview();
}

function clearWardrobe() {
  state.wardrobe = [];
  state.justRestarted = true; // Set flag to prevent reloading
  localStorage.removeItem("dressupWardrobe");
  // Show success message
  const successMsg = document.createElement("div");
  successMsg.textContent = "Wardrobe cleared!";
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1001;
  `;
  document.body.appendChild(successMsg);
  setTimeout(() => document.body.removeChild(successMsg), 2000);
}

function initEvents() {
  // Ensure modals are hidden on page load
  qs("#nameModal").classList.remove("show");
  qs("#restartModal").classList.remove("show");
  
  qs("#homeBtn").addEventListener("click", () => setScreen("start"));
  qs("#testModalBtn").addEventListener("click", () => {
    qs("#testModal").style.display = "block";
    qs("#testModal").style.position = "fixed";
    qs("#testModal").style.top = "50vh";
    qs("#testModal").style.left = "50vw";
    qs("#testModal").style.transform = "translate(-50%, -50%)";
    qs("#testModal").style.zIndex = "99999";
  });
  qs("#closeTestModal").addEventListener("click", () => {
    qs("#testModal").style.display = "none";
  });

  qs("#playBtn").addEventListener("click", () => {
    setScreen("character");
    renderPreview();
  });
  qs("#settingsBtn").addEventListener("click", () => setScreen("settings"));
  qs("#settingsBackBtn").addEventListener("click", () => setScreen("start"));

  const toggle = (key, btnId) => {
    const btn = qs(btnId);
    btn.addEventListener("click", () => {
      state.settings[key] = !state.settings[key];
      btn.setAttribute("aria-pressed", String(state.settings[key]));
      btn.textContent = state.settings[key] ? "On" : "Off";
    });
  };
  toggle("music", "#toggleMusicBtn");
  toggle("sound", "#toggleSoundBtn");

  qs("#characterBackBtn").addEventListener("click", () => setScreen("start"));
  qs("#toDressupBtn").addEventListener("click", () => setScreen("dressup"));
  qs("#finishBtn").addEventListener("click", () => setScreen("finished"));

  qs("#dressupBackBtn").addEventListener("click", () => setScreen("character"));
  qs("#backToDressupBtn").addEventListener("click", () => setScreen("dressup"));
  qs("#restartBtn").addEventListener("click", () => {
    qs("#restartModal").style.display = "block";
  });
  qs("#confirmRestartBtn").addEventListener("click", () => {
    qs("#restartModal").style.display = "none";
    resetCharacter();
    resetOutfit();
    clearWardrobe(); // Clear wardrobe on restart
    setScreen("start");
  });
  qs("#cancelRestartBtn").addEventListener("click", () => {
    qs("#restartModal").style.display = "none";
  });
  qs("#saveOutfitBtn").addEventListener("click", () => {
    qs("#nameModal").style.display = "block";
    qs("#characterNameInput").value = "";
    qs("#characterNameInput").focus();
  });
  qs("#saveNameBtn").addEventListener("click", () => {
    const name = qs("#characterNameInput").value.trim();
    if (name) {
      saveOutfit(name);
      qs("#nameModal").style.display = "none";
    }
  });
  qs("#cancelNameBtn").addEventListener("click", () => {
    qs("#nameModal").style.display = "none";
  });
  qs("#saveAsPngBtn").addEventListener("click", () => {
    saveAsPNG();
  });
  qs("#wardrobeBtn").addEventListener("click", () => {
    setScreen("wardrobe");
    renderWardrobe();
  });
  qs("#wardrobeBackBtn").addEventListener("click", () => setScreen("dressup"));

  qs("#characterResetBtn").addEventListener("click", resetCharacter);
  qs("#dressupResetBtn").addEventListener("click", resetOutfit);
}

function renderWardrobe() {
  const grid = qs("#wardrobeGrid");
  grid.innerHTML = "";
  
  if (state.wardrobe.length === 0) {
    grid.innerHTML = "<p style='text-align: center; color: var(--muted);'>No saved outfits yet.</p>";
    return;
  }
  
  state.wardrobe.forEach((outfit, index) => {
    const item = document.createElement("div");
    item.className = "wardrobeItem";
    item.innerHTML = `
      <img src="${outfit.thumbnail}" alt="${outfit.name}">
      <div class="wardrobeItemName">${outfit.name}</div>
      <div class="wardrobeItemDate">${new Date(outfit.date).toLocaleDateString()}</div>
    `;
    item.addEventListener("click", () => loadOutfit(index));
    grid.appendChild(item);
  });
}

function saveOutfit(name) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const stack = qs("#previewStackFinished");
  const rect = stack.getBoundingClientRect();
  
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // Create a temporary stack to render the outfit
  const tempStack = document.createElement("div");
  tempStack.style.position = "absolute";
  tempStack.style.left = "-9999px";
  tempStack.style.width = rect.width + "px";
  tempStack.style.height = rect.height + "px";
  document.body.appendChild(tempStack);
  
  renderLayerStack(tempStack);
  
  // Wait for images to load
  const images = tempStack.querySelectorAll("img");
  let loadedCount = 0;
  
  images.forEach(img => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          captureAndSave();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          captureAndSave();
        }
      };
    }
  });
  
  if (loadedCount === images.length) {
    captureAndSave();
  }
  
  function captureAndSave() {
    // Draw each layer to canvas
    const layers = tempStack.querySelectorAll("img, svg");
    layers.forEach(layer => {
      if (layer.tagName === "IMG") {
        ctx.drawImage(layer, 0, 0, rect.width, rect.height);
      } else if (layer.tagName === "SVG") {
        const svgData = new XMLSerializer().serializeToString(layer);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    });
    
    const thumbnail = canvas.toDataURL("image/png");
    
    const outfit = {
      name: name,
      date: Date.now(),
      character: { ...state.character },
      outfit: { ...state.outfit },
      thumbnail: thumbnail
    };
    
    state.wardrobe.push(outfit);
    localStorage.setItem("dressupWardrobe", JSON.stringify(state.wardrobe));
    
    document.body.removeChild(tempStack);
    
    // Show success message
    const successMsg = document.createElement("div");
    successMsg.textContent = "Outfit saved successfully!";
    successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
    `;
    document.body.appendChild(successMsg);
    setTimeout(() => document.body.removeChild(successMsg), 3000);
  }
}

function loadOutfit(index) {
  const outfit = state.wardrobe[index];
  state.character = { ...outfit.character };
  state.outfit = { ...outfit.outfit };
  renderCharacterControls();
  renderDressupControls();
  renderPreview();
  setScreen("dressup");
}

function saveAsPNG() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const stack = qs("#previewStackFinished");
  const rect = stack.getBoundingClientRect();
  
  canvas.width = rect.width * 2; // Higher resolution
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  
  // Create a temporary stack to render the outfit
  const tempStack = document.createElement("div");
  tempStack.style.position = "absolute";
  tempStack.style.left = "-9999px";
  tempStack.style.width = rect.width + "px";
  tempStack.style.height = rect.height + "px";
  document.body.appendChild(tempStack);
  
  renderLayerStack(tempStack);
  
  // Wait for images to load
  const images = tempStack.querySelectorAll("img");
  let loadedCount = 0;
  
  images.forEach(img => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          captureAndDownload();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          captureAndDownload();
        }
      };
    }
  });
  
  if (loadedCount === images.length) {
    captureAndDownload();
  }
  
  function captureAndDownload() {
    // Draw each layer to canvas
    const layers = tempStack.querySelectorAll("img, svg");
    layers.forEach(layer => {
      if (layer.tagName === "IMG") {
        ctx.drawImage(layer, 0, 0, rect.width, rect.height);
      } else if (layer.tagName === "SVG") {
        const svgData = new XMLSerializer().serializeToString(layer);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    });
    
    document.body.removeChild(tempStack);
    
    // Download the image
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dress-up-character-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

async function init() {
  const res = await fetch("./data/options.json");
  optionsData = await res.json();
  optionIndex = buildOptionIndex(optionsData);
  await preloadHairSvgTemplates();

  // Load wardrobe from localStorage only if not just restarted
  if (!state.justRestarted) {
    const savedWardrobe = localStorage.getItem("dressupWardrobe");
    if (savedWardrobe) {
      state.wardrobe = JSON.parse(savedWardrobe);
    }
  }
  state.justRestarted = false; // Reset flag

  applyDefaultsFromOptions();
  initEvents();

  renderScreens();
  renderCharacterControls();
  renderDressupControls();
  renderPreview();
}

init().catch((err) => {
  console.error(err);
  alert("Failed to load game data. Check console for details.");
});

