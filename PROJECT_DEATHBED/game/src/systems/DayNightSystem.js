/**
 * PROJECT DEATHBED - Day/Night Cycle System
 * Manages the time of day and whether the Light is active
 * Safe during the day, dangerous at night
 */

export class DayNightSystem {
    constructor(game) {
        this.game = game;
        
        // Time settings (in game hours, 0-24)
        this.currentHour = 7; // Start at 7 AM (safe)
        this.minutesPerSecond = 1; // How fast time passes (1 minute = 1 real second)
        
        // Day/Night boundaries
        this.sunriseHour = 6;    // 6 AM - Light becomes inactive
        this.sunsetHour = 20;    // 8 PM - Light becomes active
        
        // State
        this.isNight = false;
        this.lightActive = false;
        this.transitionProgress = 0; // 0 = day, 1 = night
        
        // Time tracking
        this.elapsedMinutes = 0;
        
        // Callbacks
        this.onNightfall = null;
        this.onDaybreak = null;
        this.onTimeChange = null;
        
        // UI element
        this.timeDisplay = null;
        this.createTimeDisplay();
        
        this.updateDayNightState();
    }
    
    createTimeDisplay() {
        this.timeDisplay = document.createElement('div');
        this.timeDisplay.id = 'time-display';
        this.timeDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 1.2em;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        // Sun/Moon icon
        this.timeIcon = document.createElement('span');
        this.timeIcon.textContent = '☀️';
        this.timeIcon.style.fontSize = '1.3em';
        this.timeDisplay.appendChild(this.timeIcon);
        
        // Time text
        this.timeText = document.createElement('span');
        this.timeText.textContent = '7:00 AM';
        this.timeDisplay.appendChild(this.timeText);
        
        // Safety indicator
        this.safetyIndicator = document.createElement('span');
        this.safetyIndicator.style.cssText = `
            font-size: 0.8em;
            padding: 3px 8px;
            border-radius: 3px;
            margin-left: 5px;
        `;
        this.safetyIndicator.textContent = 'SAFE';
        this.safetyIndicator.style.background = 'rgba(68, 200, 68, 0.5)';
        this.safetyIndicator.style.color = '#88ff88';
        this.timeDisplay.appendChild(this.safetyIndicator);
        
        document.body.appendChild(this.timeDisplay);
    }
    
    showTimeDisplay() {
        if (this.timeDisplay) {
            this.timeDisplay.style.opacity = '1';
        }
    }
    
    hideTimeDisplay() {
        if (this.timeDisplay) {
            this.timeDisplay.style.opacity = '0';
        }
    }
    
    /**
     * Update the system (called each frame)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Advance time
        this.elapsedMinutes += deltaTime * this.minutesPerSecond;
        
        if (this.elapsedMinutes >= 1) {
            this.elapsedMinutes -= 1;
            this.advanceMinute();
        }
        
        // Update transition progress for smooth lighting changes
        this.updateTransitionProgress();
    }
    
    advanceMinute() {
        // Advance the hour every 60 minutes
        const minutes = Math.floor((this.currentHour % 1) * 60) + 1;
        if (minutes >= 60) {
            this.currentHour = Math.floor(this.currentHour) + 1;
            if (this.currentHour >= 24) {
                this.currentHour = 0;
            }
        } else {
            this.currentHour = Math.floor(this.currentHour) + minutes / 60;
        }
        
        this.updateDayNightState();
        this.updateUI();
        
        if (this.onTimeChange) {
            this.onTimeChange(this.currentHour, this.isNight);
        }
    }
    
    updateDayNightState() {
        const hour = Math.floor(this.currentHour);
        const wasNight = this.isNight;
        
        // Check if it's night (between sunset and sunrise)
        if (hour >= this.sunsetHour || hour < this.sunriseHour) {
            this.isNight = true;
            this.lightActive = true;
        } else {
            this.isNight = false;
            this.lightActive = false;
        }
        
        // Trigger callbacks on state change
        if (wasNight !== this.isNight) {
            if (this.isNight) {
                console.log('[DayNightSystem] Night has fallen - The Light is active!');
                if (this.onNightfall) {
                    this.onNightfall();
                }
                this.showNightfallWarning();
            } else {
                console.log('[DayNightSystem] Day has broken - Safe to go outside');
                if (this.onDaybreak) {
                    this.onDaybreak();
                }
                this.showDaybreakMessage();
            }
        }
    }
    
    updateTransitionProgress() {
        const hour = this.currentHour;
        
        if (hour >= this.sunsetHour - 1 && hour < this.sunsetHour) {
            // Approaching sunset
            this.transitionProgress = (hour - (this.sunsetHour - 1));
        } else if (hour >= this.sunriseHour - 1 && hour < this.sunriseHour) {
            // Approaching sunrise
            this.transitionProgress = 1 - (hour - (this.sunriseHour - 1));
        } else if (this.isNight) {
            this.transitionProgress = 1;
        } else {
            this.transitionProgress = 0;
        }
    }
    
    updateUI() {
        if (!this.timeDisplay) return;
        
        const hour = Math.floor(this.currentHour);
        const minutes = Math.floor((this.currentHour % 1) * 60);
        const isPM = hour >= 12;
        const displayHour = hour % 12 || 12;
        const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
        
        this.timeText.textContent = timeString;
        
        // Update icon and colors
        if (this.isNight) {
            this.timeIcon.textContent = '🌙';
            this.safetyIndicator.textContent = 'DANGER';
            this.safetyIndicator.style.background = 'rgba(200, 68, 68, 0.5)';
            this.safetyIndicator.style.color = '#ff8888';
            this.timeDisplay.style.borderColor = 'rgba(255, 100, 100, 0.3)';
        } else {
            this.timeIcon.textContent = '☀️';
            this.safetyIndicator.textContent = 'SAFE';
            this.safetyIndicator.style.background = 'rgba(68, 200, 68, 0.5)';
            this.safetyIndicator.style.color = '#88ff88';
            this.timeDisplay.style.borderColor = 'rgba(100, 255, 100, 0.3)';
        }
        
        // Warning colors near sunset/sunrise
        if (hour >= this.sunsetHour - 1 && hour < this.sunsetHour) {
            this.timeIcon.textContent = '🌅';
            this.safetyIndicator.textContent = 'SUNSET';
            this.safetyIndicator.style.background = 'rgba(255, 150, 50, 0.5)';
            this.safetyIndicator.style.color = '#ffaa55';
        } else if (hour >= this.sunriseHour - 1 && hour < this.sunriseHour) {
            this.timeIcon.textContent = '🌄';
            this.safetyIndicator.textContent = 'SUNRISE';
            this.safetyIndicator.style.background = 'rgba(255, 200, 100, 0.5)';
            this.safetyIndicator.style.color = '#ffcc88';
        }
    }
    
    showNightfallWarning() {
        // Show a warning notification
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Night has fallen. The Light is active. Seek shelter!', 5000);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(100, 20, 20, 0.9);
                border: 2px solid #ff4444;
                color: #ffaaaa;
                font-family: 'Georgia', serif;
                font-size: 1.5em;
                padding: 30px 50px;
                border-radius: 10px;
                z-index: 2000;
                text-align: center;
                animation: pulse 1s ease-in-out infinite;
            `;
            notification.innerHTML = `
                <div style="font-size: 2em; margin-bottom: 10px;">⚠️</div>
                <div>Night has fallen.</div>
                <div style="color: #ff5555; margin-top: 10px;">The Light is active. Seek shelter!</div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transition = 'opacity 1s ease';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 1000);
            }, 4000);
        }
    }
    
    showDaybreakMessage() {
        // Show a relief notification
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Dawn breaks. It is safe to go outside.', 4000);
        } else {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(20, 60, 40, 0.9);
                border: 2px solid #44aa66;
                color: #aaffaa;
                font-family: 'Georgia', serif;
                font-size: 1.5em;
                padding: 30px 50px;
                border-radius: 10px;
                z-index: 2000;
                text-align: center;
            `;
            notification.innerHTML = `
                <div style="font-size: 2em; margin-bottom: 10px;">☀️</div>
                <div>Dawn breaks.</div>
                <div style="color: #88ff88; margin-top: 10px;">It is safe to go outside.</div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transition = 'opacity 1s ease';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 1000);
            }, 3000);
        }
    }
    
    /**
     * Set the current time directly
     * @param {number} hour - Hour (0-24)
     */
    setTime(hour) {
        this.currentHour = hour % 24;
        this.updateDayNightState();
        this.updateUI();
    }
    
    /**
     * Set how fast time passes
     * @param {number} minutesPerSecond - How many game minutes per real second
     */
    setTimeSpeed(minutesPerSecond) {
        this.minutesPerSecond = minutesPerSecond;
    }
    
    /**
     * Check if it's currently safe (day time)
     */
    isSafe() {
        return !this.lightActive;
    }
    
    /**
     * Check if it's dangerous (night time)
     */
    isDangerous() {
        return this.lightActive;
    }
    
    /**
     * Get current hour (0-24)
     */
    getCurrentHour() {
        return this.currentHour;
    }
    
    /**
     * Get transition progress (0 = day, 1 = night)
     */
    getTransitionProgress() {
        return this.transitionProgress;
    }
    
    /**
     * Get formatted time string
     */
    getTimeString() {
        const hour = Math.floor(this.currentHour);
        const minutes = Math.floor((this.currentHour % 1) * 60);
        const isPM = hour >= 12;
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
    }
    
    /**
     * Clean up
     */
    dispose() {
        if (this.timeDisplay && this.timeDisplay.parentNode) {
            this.timeDisplay.remove();
        }
    }
}
