/**
 * PROJECT DEATHBED - Audio Manager
 * Handles ambient music, sound effects, and the somber soundtrack
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.ambientGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        
        this.currentAmbient = null;
        this.ambientOscillators = [];
        this.isInitialized = false;
        
        // Volume settings
        this.volumes = {
            master: 0.7,
            ambient: 0.4,
            sfx: 0.6,
            music: 0.5
        };
        
        // Initialize on first user interaction
        document.addEventListener('click', () => this.initialize(), { once: true });
        document.addEventListener('keydown', () => this.initialize(), { once: true });
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volumes.master;
            this.masterGain.connect(this.audioContext.destination);
            
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = this.volumes.ambient;
            this.ambientGain.connect(this.masterGain);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.volumes.sfx;
            this.sfxGain.connect(this.masterGain);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.volumes.music;
            this.musicGain.connect(this.masterGain);
            
            this.isInitialized = true;
            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }
    
    // Generate procedural somber ambient soundtrack
    playAmbient(type = 'somber_ambient') {
        if (!this.isInitialized) return;
        
        // Stop current ambient
        this.stopAmbient();
        
        switch (type) {
            case 'somber_ambient':
                this.createSomberAmbient();
                break;
            case 'light_presence':
                this.createLightPresenceAmbient();
                break;
            case 'tension':
                this.createTensionAmbient();
                break;
            default:
                this.createSomberAmbient();
        }
    }
    
    createSomberAmbient() {
        // Deep, mournful drone in D minor
        const baseFreq = 73.42; // D2
        
        // Create multiple layers
        const layers = [
            { freq: baseFreq, gain: 0.15, type: 'sine' },
            { freq: baseFreq * 2, gain: 0.08, type: 'sine' },
            { freq: baseFreq * 1.5, gain: 0.06, type: 'sine' }, // A (fifth)
            { freq: baseFreq * 1.2, gain: 0.04, type: 'sine' }, // F (minor third)
        ];
        
        layers.forEach(layer => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = layer.type;
            osc.frequency.value = layer.freq;
            
            gain.gain.value = layer.gain;
            
            // Add subtle LFO for movement
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.type = 'sine';
            lfo.frequency.value = 0.1 + Math.random() * 0.1;
            lfoGain.gain.value = layer.freq * 0.01;
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            osc.connect(gain);
            gain.connect(this.ambientGain);
            
            osc.start();
            lfo.start();
            
            this.ambientOscillators.push({ osc, gain, lfo });
        });
        
        // Add filtered noise for texture (like wind)
        const noise = this.createFilteredNoise();
        this.ambientOscillators.push(noise);
        
        this.currentAmbient = 'somber_ambient';
    }
    
    createLightPresenceAmbient() {
        // Higher, more ethereal tones
        const baseFreq = 293.66; // D4
        
        const layers = [
            { freq: baseFreq, gain: 0.08, type: 'sine' },
            { freq: baseFreq * 1.5, gain: 0.06, type: 'sine' },
            { freq: baseFreq * 2, gain: 0.04, type: 'sine' },
            { freq: baseFreq * 2.5, gain: 0.03, type: 'sine' },
        ];
        
        layers.forEach(layer => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = layer.type;
            osc.frequency.value = layer.freq;
            gain.gain.value = layer.gain;
            
            // More pronounced LFO for eerie effect
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.type = 'sine';
            lfo.frequency.value = 0.3 + Math.random() * 0.2;
            lfoGain.gain.value = layer.gain * 0.5;
            
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            
            osc.connect(gain);
            gain.connect(this.ambientGain);
            
            osc.start();
            lfo.start();
            
            this.ambientOscillators.push({ osc, gain, lfo });
        });
        
        this.currentAmbient = 'light_presence';
    }
    
    createTensionAmbient() {
        // Dissonant, unsettling
        const baseFreq = 82.41; // E2
        
        const layers = [
            { freq: baseFreq, gain: 0.12, type: 'sawtooth' },
            { freq: baseFreq * 1.059, gain: 0.08, type: 'sine' }, // Minor second
            { freq: baseFreq * 1.414, gain: 0.06, type: 'sine' }, // Tritone
        ];
        
        layers.forEach(layer => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = layer.type;
            osc.frequency.value = layer.freq;
            
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            filter.Q.value = 2;
            
            gain.gain.value = layer.gain;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambientGain);
            
            osc.start();
            
            this.ambientOscillators.push({ osc, gain, filter });
        });
        
        this.currentAmbient = 'tension';
    }
    
    createFilteredNoise() {
        // Create noise buffer
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 1;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.02;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        
        noise.start();
        
        return { osc: noise, gain, filter };
    }
    
    stopAmbient() {
        this.ambientOscillators.forEach(layer => {
            if (layer.osc) {
                try {
                    layer.osc.stop();
                } catch (e) {}
            }
            if (layer.lfo) {
                try {
                    layer.lfo.stop();
                } catch (e) {}
            }
        });
        this.ambientOscillators = [];
        this.currentAmbient = null;
    }
    
    // Play sound effects
    playSound(type) {
        if (!this.isInitialized) return;
        
        switch (type) {
            case 'interact':
                this.playInteractSound();
                break;
            case 'dialogue_choice':
                this.playDialogueChoiceSound();
                break;
            case 'memory_anchor':
                this.playMemoryAnchorSound();
                break;
            case 'light_pulse':
                this.playLightPulseSound();
                break;
            case 'footstep':
                this.playFootstepSound();
                break;
        }
    }
    
    playInteractSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    playDialogueChoiceSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.05); // E5
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    playMemoryAnchorSound() {
        // Warm, resonant bell-like sound
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(startTime);
            osc.stop(startTime + 1);
        });
    }
    
    playLightPulseSound() {
        // Ethereal, slightly unsettling
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc1.type = 'sine';
        osc1.frequency.value = 220;
        osc2.type = 'sine';
        osc2.frequency.value = 223; // Slight detuning for beating
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.5);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 1.5);
        osc2.stop(this.audioContext.currentTime + 1.5);
    }
    
    playFootstepSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = 80 + Math.random() * 20;
        
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    // The Hum - the sound of the Light
    startHum(intensity = 0.5) {
        if (!this.isInitialized) return;
        
        if (this.humOscillators) {
            this.stopHum();
        }
        
        this.humOscillators = [];
        
        // Low frequency oscillators
        const baseFreq = 40;
        const harmonics = [1, 2, 3, 5, 7];
        
        harmonics.forEach((h, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = baseFreq * h;
            
            gain.gain.value = (intensity * 0.1) / (i + 1);
            
            osc.connect(gain);
            gain.connect(this.ambientGain);
            
            osc.start();
            
            this.humOscillators.push({ osc, gain });
        });
    }
    
    stopHum() {
        if (this.humOscillators) {
            this.humOscillators.forEach(layer => {
                try {
                    layer.osc.stop();
                } catch (e) {}
            });
            this.humOscillators = null;
        }
    }
    
    setHumIntensity(intensity) {
        if (this.humOscillators) {
            this.humOscillators.forEach((layer, i) => {
                layer.gain.gain.value = (intensity * 0.1) / (i + 1);
            });
        }
    }
    
    // ========== CUSTOM MUSIC PLAYBACK ==========
    
    /**
     * Play a custom music file (MP3, WAV, OGG, etc.)
     * Place your music files in: PROJECT_DEATHBED/game/public/music/
     * 
     * Example usage:
     *   audioManager.playCustomMusic('my_song.mp3');
     *   audioManager.playCustomMusic('ambient_track.ogg', { loop: true, volume: 0.6 });
     * 
     * @param {string} filename - The music file name (e.g., 'my_song.mp3')
     * @param {object} options - { loop: boolean, volume: number (0-1), fadeIn: number (seconds) }
     */
    async playCustomMusic(filename, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const loop = options.loop !== undefined ? options.loop : true;
        const volume = options.volume !== undefined ? options.volume : 0.5;
        const fadeIn = options.fadeIn !== undefined ? options.fadeIn : 2;
        
        // Stop current custom music if playing
        this.stopCustomMusic();
        
        try {
            // Create audio element for the file
            this.customMusicElement = new Audio(`/music/${filename}`);
            this.customMusicElement.loop = loop;
            this.customMusicElement.volume = 0;
            
            // Connect to Web Audio API for better control
            this.customMusicSource = this.audioContext.createMediaElementSource(this.customMusicElement);
            this.customMusicGain = this.audioContext.createGain();
            this.customMusicGain.gain.value = 0;
            
            this.customMusicSource.connect(this.customMusicGain);
            this.customMusicGain.connect(this.musicGain);
            
            // Start playing
            await this.customMusicElement.play();
            
            // Fade in
            const now = this.audioContext.currentTime;
            this.customMusicGain.gain.setValueAtTime(0, now);
            this.customMusicGain.gain.linearRampToValueAtTime(volume, now + fadeIn);
            
            console.log(`Now playing: ${filename}`);
            return true;
        } catch (error) {
            console.error(`Failed to play music file: ${filename}`, error);
            console.log('Make sure the file is in: PROJECT_DEATHBED/game/public/music/');
            return false;
        }
    }
    
    /**
     * Stop custom music with optional fade out
     * @param {number} fadeOut - Fade out duration in seconds
     */
    stopCustomMusic(fadeOut = 1) {
        if (this.customMusicGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.customMusicGain.gain.linearRampToValueAtTime(0, now + fadeOut);
            
            setTimeout(() => {
                if (this.customMusicElement) {
                    this.customMusicElement.pause();
                    this.customMusicElement = null;
                }
            }, fadeOut * 1000);
        }
    }
    
    /**
     * Set custom music volume
     * @param {number} volume - Volume level (0-1)
     */
    setCustomMusicVolume(volume) {
        if (this.customMusicGain) {
            this.customMusicGain.gain.value = volume;
        }
    }
    
    /**
     * Pause custom music
     */
    pauseCustomMusic() {
        if (this.customMusicElement) {
            this.customMusicElement.pause();
        }
    }
    
    /**
     * Resume custom music
     */
    resumeCustomMusic() {
        if (this.customMusicElement) {
            this.customMusicElement.play();
        }
    }
    
    /**
     * Load and play a music file from a URL or file input
     * @param {File|Blob|string} source - File object, Blob, or URL
     * @param {object} options - Playback options
     */
    async playMusicFromSource(source, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        this.stopCustomMusic();
        
        const loop = options.loop !== undefined ? options.loop : true;
        const volume = options.volume !== undefined ? options.volume : 0.5;
        
        try {
            let url;
            if (source instanceof File || source instanceof Blob) {
                url = URL.createObjectURL(source);
            } else {
                url = source;
            }
            
            this.customMusicElement = new Audio(url);
            this.customMusicElement.loop = loop;
            
            this.customMusicSource = this.audioContext.createMediaElementSource(this.customMusicElement);
            this.customMusicGain = this.audioContext.createGain();
            this.customMusicGain.gain.value = volume;
            
            this.customMusicSource.connect(this.customMusicGain);
            this.customMusicGain.connect(this.musicGain);
            
            await this.customMusicElement.play();
            return true;
        } catch (error) {
            console.error('Failed to play music from source:', error);
            return false;
        }
    }
    
    // Volume controls
    setMasterVolume(value) {
        this.volumes.master = value;
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }
    
    setAmbientVolume(value) {
        this.volumes.ambient = value;
        if (this.ambientGain) {
            this.ambientGain.gain.value = value;
        }
    }
    
    setSfxVolume(value) {
        this.volumes.sfx = value;
        if (this.sfxGain) {
            this.sfxGain.gain.value = value;
        }
    }
    
    setMusicVolume(value) {
        this.volumes.music = value;
        if (this.musicGain) {
            this.musicGain.gain.value = value;
        }
    }
}
