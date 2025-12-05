# PROJECT DEATHBED - 3D Game

A narrative-driven 3D game built with Three.js about love, loss, and a lonely sky.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Controls

- **WASD** - Move
- **Mouse** - Look around (click to enable mouse lock)
- **E** - Interact with objects and NPCs
- **SPACE** - Continue dialogue
- **ESC** - Exit mouse lock / Pause

## Game Structure

```
game/
├── src/
│   ├── main.js              # Entry point
│   ├── core/
│   │   ├── Game.js          # Main game loop
│   │   ├── Renderer.js      # WebGL renderer (dark blue theme)
│   │   ├── InputManager.js  # Keyboard/mouse input
│   │   └── GameState.js     # Game state management
│   ├── scenes/
│   │   ├── SceneManager.js  # Scene loading/management
│   │   └── ConvoyShelterScene.js  # Main shelter scene
│   ├── entities/
│   │   ├── PlayerController.js    # First-person controls
│   │   ├── NPCEntity.js           # NPC characters (Luis)
│   │   ├── InteractableObject.js  # Interactive objects
│   │   └── LightEntity.js         # The sentient Light effects
│   ├── systems/
│   │   ├── InteractionSystem.js   # Object interaction
│   │   └── DialogueSystem.js      # Conversations & choices
│   ├── audio/
│   │   └── AudioManager.js        # Procedural somber soundtrack
│   └── ui/
│       └── UIManager.js           # UI updates
├── index.html
├── package.json
└── vite.config.js
```

## Features

### Visual Design
- **Dark blue color scheme** - Atmospheric, somber palette
- **Warm amber accents** - Candle light, the Light's glow
- **Dynamic lighting** - Flickering candles, pulsing glow effects
- **Atmospheric fog** - Creates depth and mood

### Audio
- **Procedural ambient soundtrack** - Somber drones in D minor
- **The Hum** - The Light's presence as sound
- **Interactive sound effects** - Dialogue, memory anchors

### Gameplay Systems
- **Luis's Condition Meters**
  - Physical Stability
  - Lucidity
  - Shape Integrity
- **Dialogue System** - Branching conversations with choices
- **Interaction System** - Examine objects, talk to NPCs
- **Memory Anchors** - Collect memories to preserve Luis's identity

### Models & Environment
- **Convoy Shelter** - Interior scene with:
  - Luis's cot with blanket
  - Medical supplies table
  - Adrian's chair
  - Candles and ambient lighting
  - Covered windows (Light filtering through)
  - Storage crates
- **Luis NPC** - Lying figure with subtle glow and breathing animation
- **The Light** - Ethereal fractures visible through windows

## Technical Notes

- Built with **Three.js** for 3D rendering
- **Vite** for fast development
- **Web Audio API** for procedural audio
- No external model files - geometry created programmatically
- All audio generated procedurally

## Story Context

This game is set in the convoy shelter from PROJECT DEATHBED. You play as Adrian, caring for your twin brother Luis who has been "touched" by the Light - a sentient atmospheric phenomenon that doesn't understand human fragility.

The scene represents a quiet moment of care and connection before the inevitable end.
