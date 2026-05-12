# Dress-Up Studio

A web-based dress-up game where players customize characters and create stylish outfits. Built with vanilla HTML, CSS, and JavaScript that can be run using a Python server with flask or directly in a web browser.

## How to Play

### Option 1: Quick Play
**No installation required**
1. Download the game files
2. Double-click `index.html` 
3. Start playing immediately in your web browser

### Option 2: Python Server
**For a local server**
1. Install dependencies (see Development Setup below)
2. Run the server:
   ```bash
   python app.py
   ```
3. Open in browser:
   - `http://localhost:8000/`

#### Development Setup
**To run locally**

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

## Features

- **Start Screen**: Welcome screen with Play and Settings buttons
- **Character Customization**: 
  - Skin tone selection
  - Eye color selection
  - Mouth selection
  - Hairstyle selection
  - Eyelashes, face decorations
  - Ears automatically rendered with skin tone matching (no user category)
- **Dress-Up Mode**: 
  - Multiple clothing categories (tops, bottoms, dresses, shoes, accessories)
  - Feminine casual outfits with multiple options per category
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
- **Audio Settings**:
  - Music toggle (off by default)
  - Sound effects toggle (off by default)
  - Sound effects and background music only play when enabled

  ## Reflection

-  I had an interest in web development along with game development, so I wanted to learn more about HTML, CSS, and JavaScript and how exactly they work together. First I did research online and found a [tutorial](https://stashable.wordpress.com/2018/12/30/make-a-dress-up-game-using-javascript-html-and-css/) that showed me how to build a basic dress-up game with javascript html and css. I attempted to follow the tutorial with the asset packs I chose, but it was a bit difficult. That was a rough-rough draft. Then I created a plan with an AI agent and asked it to revise my draft and expand it to include specific features as desired. Initially there were quite a lot of bugs due to the complexity of the code and the way it was structured, but I was able to fix them through trial and error and by using the AI agent to help me debug the code. Finally, I had a product that I was satisfied!

## Credits

- The asset packs were designed by [MaelleMarylloup](https://linktr.ee/Maelle_Marylloup)
