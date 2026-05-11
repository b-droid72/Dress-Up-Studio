# AI Usage Report

## Code Structure

The project follows a simple web application structure with separate files for different purposes:

- **index.html**: The main HTML file defines the page structure. It contains different "screens" (e.g. start, settings, character customization, dress-up, wardrobe, finished) that show or hide based on what the user is doing. It also includes audio elements for background music andbutton sounds.

- **app.js**: The JavaScript file handles the game logic. It manages the current state (which screen is showing, what character options are selected, what clothes are chosen), responds to button clicks, updates the display, and handles saving/loading outfits to the browser's local storage.

- **styles.css**: The CSS file controls how everything looks. It defines colors, sizes, positions, animations, and the overall visual style of the game.

- **app.py**: A simple Python Flask server that serves the files to the browser so you can run the game locally.

- **data/options.json**: A configuration file that lists all the available customization options (skin tones, hairstyles, clothing items, etc.) and where their image files are located.

- **assets/**: A folder containing all the images and audio files used in the game, organized into subfolders for character features, body parts, and clothing.


## Functionality

The Dress-Up Studio is a web-based character customization game with the following features:

**Core Game Mechanics:**
- The game has multiple screens: a welcome screen, settings, character customization, dress-up mode, wardrobe view, and a finished screen showing the final result.
- Players start by customizing their character's facial features (skin tone, eyes, mouth, hair, etc.), then move to selecting clothing items.
- The game uses a layer-based rendering system - different body parts and clothes are stacked on top of each other like paper cutouts to create the final character image.

**User Interactions:**
- Users click buttons to navigate between screens and make selections.
- In character customization, users select options from different categories (skin tone, eyes, mouth, hair) using clickable buttons that show preview images.
- In dress-up mode, users choose clothing items from categories like tops, bottoms, dresses, shoes, and accessories.
- Users can save their completed outfits with custom names and view them later in the wardrobe.
- Settings allow users to toggle sound on/off.

**Rendering and Display Logic:**
- The game uses HTML elements (divs) as layers for each body part and clothing item.
- When the state changes, the JavaScript updates which images are shown in these layer containers.
- The layering order is carefully defined (face decorations behind eyes, hair on top, etc.) so items appear in the correct visual order.
- Images are loaded from the assets folder based on the selections stored in the state.

**Storage and Persistence:**
- Saved outfits are stored in the browser's localStorage, which is a built-in browser feature that saves data even after closing the tab.
- Each saved outfit includes the character selections and clothing choices, plus a name and timestamp.
- The wardrobe screen displays all saved outfits in a grid, and clicking one loads it back into the game.

## What AI Agents Taught Me & Strategies Used

- The AI agents taught me how to expand on the existing HTML structure from the tutorial with new coding techniques. I also asked for debugging strategies to go through when bugs arose, which helped me understand how to approach problems for the future. Additionally, the agents made helpful suggestions to simplify and improve the code I wrote. Most importantly, I learned how to effectively use AI as a tool to enhance my own coding skills rather than replace them. I'm finishing the project with more knowledge about game logic and web functionality which is primarily thanks to the AI agents.

- I didn't have any strategies in mind when I used the AI agent, but as I asked for assistance, I definitely learned to be more specific with my prompts and to verify the code that the AI generated. The main thing I would do is drop multiple requests at the time, so I could go through and test the entire game instead of only testing one feature at a time.

