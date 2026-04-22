# Dress-Up Studio (Python + Flask)

This is a Python web project that serves a vanilla `HTML/CSS/JS` dress-up game using Flask.
It includes:
- Start screen (`Play`, `Settings`)
- Character customization (skin, eyes, eye color, mouth, hair, hair color)
- Dress-up categories (shirts, skirts, pants, shoes, accessories)
- Finish screen

## How to run
Because the app loads `./data/options.json` via `fetch()`, you must run it from a web server (opening `index.html` as `file://` will usually fail).

From the `dress-up-game/` folder:

```bash
python -m venv .venv
```

Activate your virtual environment:

```bash
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Install dependencies and run:

```bash
pip install -r requirements.txt
python app.py
```

Open:
- `http://localhost:8000/`

## Adding an asset pack
1. Put images under `dress-up-game/assets/...` (keep transparent PNGs/SVGs aligned to the same canvas size).
2. Update `dress-up-game/data/options.json` to point `src` to your new files.

## Layering
The preview is built by stacking images in `dress-up-game/app.js` inside `renderLayerStack()`.
