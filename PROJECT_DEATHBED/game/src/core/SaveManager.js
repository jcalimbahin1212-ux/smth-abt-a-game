/**
 * PROJECT DEATHBED - Save Manager
 * Handles game saves, progress tracking, and persistence
 */

export class SaveManager {
    constructor() {
        this.saveKey = 'PROJECT_DEATHBED_SAVE';
        this.settingsKey = 'PROJECT_DEATHBED_SETTINGS';
        this.currentSave = null;
        
        // Game progression stages
        this.stages = [
            'intro',           // Cinematic intro with music
            'prologue_1',      // "What Once Was" animation - memory of brothers
            'prologue_2',      // Adrian's Journal animation - documenting The Light  
            'act1_apartment',  // Apartment interactive scene
            'act1_shelter',    // Convoy Shelter
            'act1_workshop',   // Tanner's Workshop
            'act1_exterior',   // Exterior
            'act2_journey',    // Future content
            'epilogue'         // Future content
        ];
        
        this.load();
    }
    
    /**
     * Create a new save file
     */
    createNewSave(slotIndex = 0) {
        const save = {
            slot: slotIndex,
            created: Date.now(),
            lastPlayed: Date.now(),
            currentStage: 'intro',
            stageIndex: 0,
            completedStages: [],
            playTime: 0,
            playerData: {
                name: 'Player',
                hasSeenIntro: false,
                hasSeenPrologue1: false,
                hasSeenPrologue2: false
            },
            flags: {},
            dialogueHistory: [],
            collectibles: [],
            achievements: []
        };
        
        this.currentSave = save;
        this.save();
        return save;
    }
    
    /**
     * Save current progress
     */
    save() {
        if (!this.currentSave) return false;
        
        this.currentSave.lastPlayed = Date.now();
        
        try {
            // Get all saves
            const allSaves = this.getAllSaves();
            allSaves[this.currentSave.slot] = this.currentSave;
            
            localStorage.setItem(this.saveKey, JSON.stringify(allSaves));
            console.log('Game saved successfully');
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }
    
    /**
     * Load save data
     */
    load(slotIndex = 0) {
        try {
            const allSaves = this.getAllSaves();
            if (allSaves[slotIndex]) {
                this.currentSave = allSaves[slotIndex];
                return this.currentSave;
            }
        } catch (e) {
            console.error('Failed to load save:', e);
        }
        return null;
    }
    
    /**
     * Get all save slots
     */
    getAllSaves() {
        try {
            const data = localStorage.getItem(this.saveKey);
            return data ? JSON.parse(data) : [{}, {}, {}]; // 3 save slots
        } catch (e) {
            return [{}, {}, {}];
        }
    }
    
    /**
     * Delete a save slot
     */
    deleteSave(slotIndex) {
        try {
            const allSaves = this.getAllSaves();
            allSaves[slotIndex] = {};
            localStorage.setItem(this.saveKey, JSON.stringify(allSaves));
            
            if (this.currentSave && this.currentSave.slot === slotIndex) {
                this.currentSave = null;
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Check if any save exists
     */
    hasSaveData() {
        const saves = this.getAllSaves();
        return saves.some(save => save && save.created);
    }
    
    /**
     * Get the current stage
     */
    getCurrentStage() {
        return this.currentSave ? this.currentSave.currentStage : 'intro';
    }
    
    /**
     * Get the current stage index
     */
    getCurrentStageIndex() {
        return this.currentSave ? this.currentSave.stageIndex : 0;
    }
    
    /**
     * Advance to next stage
     */
    advanceStage() {
        if (!this.currentSave) return null;
        
        const currentIndex = this.currentSave.stageIndex;
        
        // Mark current stage as completed
        if (!this.currentSave.completedStages.includes(this.stages[currentIndex])) {
            this.currentSave.completedStages.push(this.stages[currentIndex]);
        }
        
        // Move to next stage
        if (currentIndex < this.stages.length - 1) {
            this.currentSave.stageIndex = currentIndex + 1;
            this.currentSave.currentStage = this.stages[currentIndex + 1];
        }
        
        this.save();
        return this.currentSave.currentStage;
    }
    
    /**
     * Set a specific stage
     */
    setStage(stageName) {
        if (!this.currentSave) return;
        
        const index = this.stages.indexOf(stageName);
        if (index !== -1) {
            this.currentSave.stageIndex = index;
            this.currentSave.currentStage = stageName;
            this.save();
        }
    }
    
    /**
     * Check if a stage is completed
     */
    isStageCompleted(stageName) {
        return this.currentSave ? 
            this.currentSave.completedStages.includes(stageName) : false;
    }
    
    /**
     * Set a game flag
     */
    setFlag(key, value) {
        if (!this.currentSave) return;
        this.currentSave.flags[key] = value;
        this.save();
    }
    
    /**
     * Get a game flag
     */
    getFlag(key, defaultValue = null) {
        if (!this.currentSave) return defaultValue;
        return this.currentSave.flags[key] ?? defaultValue;
    }
    
    /**
     * Update play time
     */
    updatePlayTime(deltaSeconds) {
        if (!this.currentSave) return;
        this.currentSave.playTime += deltaSeconds;
    }
    
    /**
     * Get formatted play time
     */
    getFormattedPlayTime() {
        if (!this.currentSave) return '00:00:00';
        
        const totalSeconds = Math.floor(this.currentSave.playTime);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Save settings (separate from game saves)
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Load settings
     */
    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (e) {
            return this.getDefaultSettings();
        }
    }
    
    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            masterVolume: 0.7,
            musicVolume: 0.6,
            sfxVolume: 0.8,
            ambientVolume: 0.5,
            mouseSensitivity: 1.0,
            invertY: false,
            showSubtitles: true,
            graphicsQuality: 'high'
        };
    }
}
