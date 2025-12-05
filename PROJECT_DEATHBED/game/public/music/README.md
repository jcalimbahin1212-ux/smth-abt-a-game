# Custom Music Guide for PROJECT DEATHBED

## How to Add Your Own Music

1. **Place your music files in this folder:**
   `PROJECT_DEATHBED/game/public/music/`

2. **Supported formats:**
   - MP3 (.mp3) - Most compatible
   - OGG (.ogg) - Good quality, smaller size
   - WAV (.wav) - High quality, larger size
   - AAC (.aac/.m4a)

## Playing Your Music in the Game

### Method 1: Auto-play on Scene Load
Edit the scene file (e.g., `ConvoyShelterScene.js`) and add:

```javascript
// In the constructor or an init method:
this.game.audioManager.playCustomMusic('your_song.mp3', {
    loop: true,      // Loop the track
    volume: 0.5,     // Volume (0-1)
    fadeIn: 2        // Fade in over 2 seconds
});
```

### Method 2: From the Browser Console (Testing)
Open the browser console (F12) and type:

```javascript
game.audioManager.playCustomMusic('your_song.mp3');
```

### Method 3: Trigger on Player Action
In an interactable object's `onInteract`:

```javascript
onInteract: (game) => {
    game.audioManager.playCustomMusic('dramatic_moment.mp3', {
        loop: false,
        volume: 0.7
    });
}
```

## Audio Manager Methods

```javascript
// Play a music file
audioManager.playCustomMusic('filename.mp3', options);

// Stop music with fade out
audioManager.stopCustomMusic(fadeOutSeconds);

// Pause/Resume
audioManager.pauseCustomMusic();
audioManager.resumeCustomMusic();

// Adjust volume
audioManager.setCustomMusicVolume(0.5);  // 0-1
audioManager.setMusicVolume(0.5);        // Master music volume
audioManager.setMasterVolume(0.7);       // Master volume for all audio

// Play from a file input or URL
audioManager.playMusicFromSource(fileOrUrl, options);
```

## Recommended Music Setup by Scene

| Scene | Mood | Suggested Tempo |
|-------|------|-----------------|
| Apartment | Warm, nostalgic | Slow, gentle |
| Rooftop | Tense, transformative | Building |
| Convoy Shelter | Somber, intimate | Very slow |
| Tanner's Workshop | Hopeful, busy | Medium |
| Exterior | Eerie, vast | Ambient |

## Tips

1. **Keep file sizes reasonable** - Compress to 128-192 kbps MP3 for web
2. **Use seamless loops** - For ambient tracks, ensure the end connects smoothly to the start
3. **Match the mood** - Dark blue atmosphere + warm amber accents = melancholic but hopeful
4. **Layer with procedural audio** - Your music plays alongside the game's generated ambient sounds

## Quick Test

1. Drop an MP3 file named `test.mp3` in this folder
2. Start the game
3. Open browser console (F12)
4. Type: `game.audioManager.playCustomMusic('test.mp3')`
5. Your music should play!
