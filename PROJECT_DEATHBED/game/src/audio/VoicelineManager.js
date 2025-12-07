// VoicelineManager.js
// Manages voiceline playback for character dialogue
// Currently a placeholder for future implementation

export class VoicelineManager {
    constructor() {
        this.audioContext = null;
        this.currentVoiceline = null;
        this.voicelineVolume = 1.0;
        this.isPlaying = false;
        this.voicelineQueue = [];
        
        // Voiceline mappings - to be populated with actual audio files
        this.voicelines = {
            // Character voicelines will be added here
            // Format: 'voiceline_id': '/voicelines/character/filename.mp3'
            // Example:
            // 'protagonist_headache': '/voicelines/protagonist/headache.mp3',
            // 'tanner_greeting': '/voicelines/tanner/greeting.mp3',
            // 'brother_memory': '/voicelines/brother/memory.mp3',
        };
        
        // Subtitle mappings for voicelines
        this.subtitles = {
            // Format: 'voiceline_id': { text: 'Subtitle text', duration: 2000 }
        };
        
        this.onVoicelineEnd = null;
        this.onSubtitleUpdate = null;
    }
    
    /**
     * Initialize the voiceline manager with an audio context
     * @param {AudioContext} audioContext - The Web Audio API context
     */
    init(audioContext) {
        this.audioContext = audioContext;
        console.log('[VoicelineManager] Initialized');
    }
    
    /**
     * Register a voiceline with its audio path and optional subtitle
     * @param {string} id - Unique identifier for the voiceline
     * @param {string} audioPath - Path to the audio file
     * @param {Object} subtitleData - Optional subtitle data { text: string, duration: number }
     */
    registerVoiceline(id, audioPath, subtitleData = null) {
        this.voicelines[id] = audioPath;
        if (subtitleData) {
            this.subtitles[id] = subtitleData;
        }
    }
    
    /**
     * Play a voiceline by ID
     * @param {string} id - The voiceline ID to play
     * @param {Object} options - Playback options { volume: number, onEnd: function }
     * @returns {Promise} Resolves when voiceline ends
     */
    async play(id, options = {}) {
        const audioPath = this.voicelines[id];
        if (!audioPath) {
            console.warn(`[VoicelineManager] Voiceline not found: ${id}`);
            return Promise.resolve();
        }
        
        // Stop any currently playing voiceline
        this.stop();
        
        return new Promise((resolve) => {
            const audio = new Audio(audioPath);
            audio.volume = options.volume ?? this.voicelineVolume;
            
            this.currentVoiceline = audio;
            this.isPlaying = true;
            
            // Show subtitle if available
            const subtitle = this.subtitles[id];
            if (subtitle && this.onSubtitleUpdate) {
                this.onSubtitleUpdate(subtitle.text, subtitle.duration);
            }
            
            audio.onended = () => {
                this.isPlaying = false;
                this.currentVoiceline = null;
                
                if (options.onEnd) {
                    options.onEnd();
                }
                if (this.onVoicelineEnd) {
                    this.onVoicelineEnd(id);
                }
                
                resolve();
            };
            
            audio.onerror = (error) => {
                console.error(`[VoicelineManager] Error playing voiceline ${id}:`, error);
                this.isPlaying = false;
                this.currentVoiceline = null;
                resolve();
            };
            
            audio.play().catch(error => {
                console.error(`[VoicelineManager] Playback failed for ${id}:`, error);
                this.isPlaying = false;
                this.currentVoiceline = null;
                resolve();
            });
        });
    }
    
    /**
     * Queue a voiceline to play after current one finishes
     * @param {string} id - The voiceline ID to queue
     * @param {Object} options - Playback options
     */
    queue(id, options = {}) {
        this.voicelineQueue.push({ id, options });
        
        if (!this.isPlaying) {
            this.playNext();
        }
    }
    
    /**
     * Play the next voiceline in the queue
     */
    async playNext() {
        if (this.voicelineQueue.length === 0) {
            return;
        }
        
        const next = this.voicelineQueue.shift();
        await this.play(next.id, next.options);
        
        // Continue playing queue
        this.playNext();
    }
    
    /**
     * Stop the currently playing voiceline
     */
    stop() {
        if (this.currentVoiceline) {
            this.currentVoiceline.pause();
            this.currentVoiceline.currentTime = 0;
            this.currentVoiceline = null;
        }
        this.isPlaying = false;
    }
    
    /**
     * Clear the voiceline queue
     */
    clearQueue() {
        this.voicelineQueue = [];
    }
    
    /**
     * Set the master volume for voicelines
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        this.voicelineVolume = Math.max(0, Math.min(1, volume));
        if (this.currentVoiceline) {
            this.currentVoiceline.volume = this.voicelineVolume;
        }
    }
    
    /**
     * Set callback for when a voiceline ends
     * @param {Function} callback - Function called with voiceline ID when it ends
     */
    setOnVoicelineEnd(callback) {
        this.onVoicelineEnd = callback;
    }
    
    /**
     * Set callback for subtitle updates
     * @param {Function} callback - Function called with (text, duration) when subtitle should show
     */
    setOnSubtitleUpdate(callback) {
        this.onSubtitleUpdate = callback;
    }
    
    /**
     * Preload voicelines for smoother playback
     * @param {Array<string>} ids - Array of voiceline IDs to preload
     */
    preload(ids) {
        ids.forEach(id => {
            const audioPath = this.voicelines[id];
            if (audioPath) {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = audioPath;
            }
        });
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        this.clearQueue();
        this.voicelines = {};
        this.subtitles = {};
        this.audioContext = null;
    }
}

// Singleton instance
export const voicelineManager = new VoicelineManager();
