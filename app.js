const SCREENS = ["start", "settings", "character", "dressup", "finished"];
const CHARACTER_LAYER_ORDER = [
  "ears",
  "eyes",
  "pupils",
  "eyelashes",
  "eyebrows",
  "nose",
  "mouth",
  "faceDecor",
  "hair"
];
const DRESSUP_LAYER_ORDER = ["top", "bottom", "dress", "socks", "shoes", "jacket", "accessory"];

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
    skinTone: "tone1",
    eyes: "eyes1",
    eyeColor: "blue",
    mouth: "mouth1",
    hair: "hair1",
    hairColor: "brown"
  },
  outfit: {},
  ui: {
    characterTab: "skinTone",
    dressupTab: "top"
  }
};

let optionsData = null;
let optionIndex = null;

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

function resolveOutfitLayerSrc(key) {
  const valueId = state.outfit[key];
  const opt = optionIndex?.dressup?.[key]?.[valueId];
  return opt?.src ?? null;
}

function applyColorTint(imgEl, tintColor) {
  if (!tintColor) {
    imgEl.style.filter = "";
    return;
  }
  // Keep this simple: use CSS drop-shadow tinting. Works well enough for SVG placeholders.
  imgEl.style.filter = `drop-shadow(0 0 0 ${tintColor})`;
}

function renderLayerStack(rootEl) {
  rootEl.innerHTML = "";

  const makeImg = (id, src) => {
    if (!src) return null;
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.decoding = "async";
    img.loading = "eager";
    img.dataset.layer = id;
    img.src = src;
    return img;
  };

  const body = makeImg(LAYERS.base.body.id, LAYERS.base.body.src);
  if (body) {
    rootEl.appendChild(body);
    const skinOpt = optionIndex?.character?.skinTone?.[state.character.skinTone];
    applyColorTint(body, skinOpt?.color ?? null);
  }

  const orderedCharacterTabs = sortTabsByLayerOrder(
    optionsData?.character?.tabs ?? [],
    CHARACTER_LAYER_ORDER
  );
  for (const tab of orderedCharacterTabs) {
    // Only image-based tabs become visual layers.
    const hasImageOption = tab.options?.some((opt) => Object.prototype.hasOwnProperty.call(opt, "src"));
    if (!hasImageOption) continue;
    const img = makeImg(tab.id, resolveCharacterLayerSrc(tab.id));
    if (!img) continue;
    if (tab.id === "eyes") {
      const eyeColorOpt = optionIndex?.character?.eyeColor?.[state.character.eyeColor];
      applyColorTint(img, eyeColorOpt?.color ?? null);
    }
    if (tab.id === "hair") {
      const hairColorOpt = optionIndex?.character?.hairColor?.[state.character.hairColor];
      applyColorTint(img, hairColorOpt?.color ?? null);
    }
    rootEl.appendChild(img);
  }

  const orderedDressupTabs = sortTabsByLayerOrder(
    optionsData?.dressup?.tabs ?? [],
    DRESSUP_LAYER_ORDER
  );
  for (const tab of orderedDressupTabs) {
    const item = makeImg(tab.id, resolveOutfitLayerSrc(tab.id));
    if (item) rootEl.appendChild(item);
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
    } else {
      const hint = document.createElement("div");
      hint.className = "muted small";
      hint.textContent = opt.src ? "Preview" : "None";
      right.appendChild(hint);
    }

    btn.appendChild(left);
    btn.appendChild(right);
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

function initEvents() {
  qs("#homeBtn").addEventListener("click", () => setScreen("start"));

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
    resetCharacter();
    resetOutfit();
    setScreen("start");
  });

  qs("#characterResetBtn").addEventListener("click", resetCharacter);
  qs("#dressupResetBtn").addEventListener("click", resetOutfit);
}

async function init() {
  const res = await fetch("./data/options.json");
  optionsData = await res.json();
  optionIndex = buildOptionIndex(optionsData);

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

