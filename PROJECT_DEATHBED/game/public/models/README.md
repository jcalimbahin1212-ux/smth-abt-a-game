# 3D Models Directory

Place your 3D model files here. The game supports the following formats:

## Supported Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| GLTF/GLB | `.gltf`, `.glb` | ✅ Recommended - Characters, props, scenes with animations |
| FBX | `.fbx` | Characters with animations from Mixamo |
| OBJ | `.obj` | Simple static geometry |

## Directory Structure

```
models/
├── characters/     # Character models (Adrian, Luis, Tanner, NPCs)
│   ├── adrian.glb
│   ├── luis.glb
│   └── tanner.glb
├── props/          # Interactive objects (furniture, items)
│   ├── coffee_maker.glb
│   └── medicine_bottle.glb
└── environments/   # Scene elements (buildings, terrain)
    └── tanner_house.glb
```

## How to Get Models

### Option 1: Mixamo (Free Characters + Animations)
1. Go to https://www.mixamo.com/
2. Sign in with Adobe account (free)
3. Choose a character
4. Apply animations (Idle, Walk, Talk, etc.)
5. Download as FBX or GLTF
6. Place in `characters/` folder

### Option 2: Sketchfab (Free & Paid Models)
1. Go to https://sketchfab.com/
2. Search for models
3. Download in GLTF format
4. Place in appropriate folder

### Option 3: Create Your Own
- Use **Blender** (free) to create models
- Export as GLTF/GLB format
- Include armature/skeleton for animations

## Usage in Code

```javascript
import { modelLoader } from '../utils/ModelLoader.js';

// Load a character model
const character = await modelLoader.loadGLTF('/models/characters/adrian.glb', {
    scale: 1.0,
    position: { x: 0, y: 0, z: 0 }
});

// Add to scene
scene.add(character.scene);

// Play animation
if (character.actions['Idle']) {
    character.actions['Idle'].play();
}

// Update animations in game loop
character.mixer.update(deltaTime);
```

## Recommended Character Specs

- **Height**: ~1.8 units (meters)
- **Origin**: At feet level
- **Facing**: +Z direction
- **Animations**: Idle, Walk, Talk, Reach (if available)
