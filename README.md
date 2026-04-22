# Dress-Up Studio (Browser MVP)

This is a vanilla `HTML/CSS/JS` dress-up game MVP with:
- Start screen (`Play`, `Settings`)
- Character customization (skin, eyes, eye color, mouth, hair, hair color)
- Dress-up categories (shirts, skirts, pants, shoes, accessories)
- Finish screen

## How to run (important)
Because the app loads `./data/options.json` via `fetch()`, you **must** run it from a local web server (opening `index.html` as `file://` will usually fail).

### Option 1: Node (works without npm)
From the `dress-up-game/` folder:

```bash
node ./serve.mjs
```

Then open:
- `http://localhost:8000/`

### Option 2: VS Code / Cursor Live Server
- Install/use a Live Server extension
- Serve the `dress-up-game/` folder

### Option 3: Python (if you install it)
From the `dress-up-game/` folder:

```bash
python -m http.server 8000
```

## Adding an asset pack
1. Put images under `dress-up-game/assets/...` (keep transparent PNGs/SVGs aligned to the same canvas size).
2. Update `dress-up-game/data/options.json` to point `src` to your new files.

## Layering
The preview is built by stacking images in `dress-up-game/app.js` inside `renderLayerStack()`.
