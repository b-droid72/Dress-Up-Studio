# Dress-Up Studio (Python Flask + Vanilla HTML/CSS/JS)

This is a web-based dress-up game built with vanilla HTML, CSS, and JavaScript. It includes character customization, outfit selection, and a wardrobe save system.

## How to run

### Prerequisites
- Python 3.7 or higher
- Flask 2.0 or higher (for web serving)
- Standard Python libraries included with most Python installations

#### Dependencies Details
Your project requires minimal external dependencies:

**Core Dependencies:**
- **Flask 2.0+**: Web framework for serving HTTP requests and routing
- **Python Standard Library**: `pathlib` (for file path handling)

**What's Included:**
- `requirements.txt` contains only `Flask`
- No additional packages needed for basic functionality

**Installation:**
```bash
# Check if Flask is installed (optional)
pip show flask

# Install dependencies if not already present
pip install -r requirements.txt
```

**Python Version Check:**
```bash
python --version
```

#### Setup Instructions

#### Setup Instructions
1. **Install dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   python app.py
   ```

3. **Open in browser**:
   - `http://localhost:8000/`

#### Flask Server Features
- **Static file serving**: Automatically serves HTML, CSS, JS, and assets
- **Development mode**: Debug mode enabled for development
- **Port**: Default runs on port 8000
- **Root directory**: Serves from project root folder

## Features

- **Start Screen**: Welcome screen with Play and Settings buttons
- **Character Customization**: 
  - Skin tone selection (17 options)
  - Eye color selection
  - Mouth selection
  - Hairstyle selection (numbered 1-10)
  - Hair color selection (10 color options)
  - Eyelashes, face decorations
  - Ears automatically rendered with skin tone matching (no user category)
- **Dress-Up Mode**: 
  - Multiple clothing categories (tops, bottoms, dresses, shoes, accessories)
  - Feminine casual outfits with 10+ options per category
  - Real-time preview with layered rendering
- **Wardrobe System**: 
  - Save outfits with custom names
  - View saved outfits in a grid layout
  - Load saved outfits back to character
  - Persistent storage using localStorage
- **Export Features**:
  - Save character as PNG with transparent background
  - High-resolution export with proper layering
- **UI Features**:
  - Restart confirmation modal
  - Character naming modal
  - Responsive design with modern styling
  - Smooth animations and transitions

## Game Structure

### Character Customization
- **Separate Categories**: Hair styles (numbered) and hair colors (separate selection)
- **Default States**: All categories default to "none" except skin tone and basic features
- **Automatic Features**: Ears #1 automatically rendered with skin tone matching

### Wardrobe System
- **Save**: Name and save current outfit with thumbnail
- **Storage**: Uses localStorage for persistence
- **Load**: Click any saved outfit to restore it
- **Clear**: All outfits cleared when restarting game

### Technical Details

#### File Structure
```
dress-up-game/
├── index.html          # Main application file
├── styles.css          # Styling and animations
├── app.js             # Game logic and state management
├── app.py              # Flask Python server
├── data/
│   └── options.json    # Configuration for customization options
└── assets/             # All game assets (images, SVGs)
    ├── features/        # Character features (eyes, mouth, etc.)
    ├── bodypack/        # Body bases and underwear
    ├── clothes/          # Clothing items
    └── feminine casual outfits/  # Complete outfit sets
```

#### Key Components
- **State Management**: Centralized state object for character, outfit, and UI
- **Rendering System**: Dynamic image layering with proper z-index management
- **Modal System**: Center-screen pop-ups with backdrop and content
- **Asset Loading**: Preloading and caching for performance

## Adding Custom Content

### Adding New Clothing Items
1. Place images in appropriate category folders under `assets/`
2. Update `data/options.json` to include new options:
```json
{
  "dressup": {
    "tabs": [
      {
        "id": "your-category",
        "label": "Your Category",
        "type": "image",
        "default": "none",
        "options": [
          {
            "id": "item1",
            "label": "1",
            "src": "./assets/your-category/item1.png"
          }
        ]
      }
    ]
  }
}
```

### Adding New Character Features
1. Add feature images to `assets/features/`
2. Update character options in `data/options.json`
3. Ensure proper layering order in `app.js`

## Development

### Customization Tips
- **Images**: Use transparent PNGs for clothing items
- **Sizing**: Ensure all character parts align properly
- **Performance**: Preload frequently used assets
- **Compatibility**: Test across different browsers

### Troubleshooting
- **Assets not loading**: Check file paths in `options.json`
- **Modals not working**: Ensure no CSS conflicts with positioning
- **Wardrobe not saving**: Check localStorage availability
- **Character not rendering**: Verify layer order in `CHARACTER_LAYER_ORDER`
