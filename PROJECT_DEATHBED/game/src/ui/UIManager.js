/**
 * PROJECT DEATHBED - UI Manager
 * Handles updating UI elements based on game state
 */

export class UIManager {
    constructor() {
        // Status bars
        this.stabilityBar = document.getElementById('stability-bar');
        this.lucidityBar = document.getElementById('lucidity-bar');
        this.shapeBar = document.getElementById('shape-bar');
        
        // Status panel
        this.statusPanel = document.getElementById('status-panel');
        
        // Player lucidity bar (for outside exposure)
        this.playerLucidityContainer = null;
        this.playerLucidityBar = null;
        this.vestIndicator = null;
        this.vestDurabilityBar = null;
        
        // Create player status UI
        this.createPlayerStatusUI();
        
        // Warning overlay for lucidity danger
        this.warningOverlay = null;
    }
    
    createPlayerStatusUI() {
        // Container for player status (bottom left)
        this.playerLucidityContainer = document.createElement('div');
        this.playerLucidityContainer.id = 'player-lucidity-container';
        this.playerLucidityContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(10, 10, 18, 0.85);
            border: 1px solid rgba(255, 100, 100, 0.3);
            border-radius: 8px;
            padding: 15px;
            font-family: 'Georgia', serif;
            display: none;
            z-index: 100;
            min-width: 200px;
        `;
        
        // Player lucidity label
        const lucidityLabel = document.createElement('div');
        lucidityLabel.innerHTML = '⚠ EXPOSURE';
        lucidityLabel.style.cssText = `
            color: #ff6b6b;
            font-size: 0.9em;
            margin-bottom: 8px;
            letter-spacing: 0.1em;
        `;
        this.playerLucidityContainer.appendChild(lucidityLabel);
        
        // Player lucidity bar background
        const lucidityBarBg = document.createElement('div');
        lucidityBarBg.style.cssText = `
            width: 180px;
            height: 12px;
            background: rgba(50, 30, 30, 0.8);
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 10px;
        `;
        
        // Player lucidity bar fill
        this.playerLucidityBar = document.createElement('div');
        this.playerLucidityBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #ff4444);
            border-radius: 6px;
            transition: width 0.3s ease;
        `;
        lucidityBarBg.appendChild(this.playerLucidityBar);
        this.playerLucidityContainer.appendChild(lucidityBarBg);
        
        // Vest indicator
        this.vestIndicator = document.createElement('div');
        this.vestIndicator.style.cssText = `
            display: none;
            margin-top: 8px;
        `;
        
        const vestLabel = document.createElement('div');
        vestLabel.innerHTML = '🦺 VEST';
        vestLabel.style.cssText = `
            color: #6aff6a;
            font-size: 0.8em;
            margin-bottom: 5px;
        `;
        this.vestIndicator.appendChild(vestLabel);
        
        // Vest durability bar background
        const vestBarBg = document.createElement('div');
        vestBarBg.style.cssText = `
            width: 180px;
            height: 8px;
            background: rgba(30, 50, 30, 0.8);
            border-radius: 4px;
            overflow: hidden;
        `;
        
        this.vestDurabilityBar = document.createElement('div');
        this.vestDurabilityBar.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #6aff6a, #44ff44);
            border-radius: 4px;
            transition: width 0.3s ease;
        `;
        vestBarBg.appendChild(this.vestDurabilityBar);
        this.vestIndicator.appendChild(vestBarBg);
        
        this.playerLucidityContainer.appendChild(this.vestIndicator);
        document.body.appendChild(this.playerLucidityContainer);
        
        // Create warning overlay
        this.warningOverlay = document.createElement('div');
        this.warningOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            opacity: 0;
            transition: opacity 0.5s ease;
            background: radial-gradient(ellipse at center, transparent 30%, rgba(255, 50, 50, 0.3) 100%);
        `;
        document.body.appendChild(this.warningOverlay);
    }
    
    update(gameState) {
        if (!gameState) return;
        
        // Update Luis's condition bars
        if (this.stabilityBar) {
            this.stabilityBar.style.width = `${gameState.luisCondition.physicalStability}%`;
            this.updateBarColor(this.stabilityBar, gameState.luisCondition.physicalStability);
        }
        
        if (this.lucidityBar) {
            this.lucidityBar.style.width = `${gameState.luisCondition.lucidity}%`;
            this.updateBarColor(this.lucidityBar, gameState.luisCondition.lucidity);
        }
        
        if (this.shapeBar) {
            this.shapeBar.style.width = `${gameState.luisCondition.shapeIntegrity}%`;
            this.updateBarColor(this.shapeBar, gameState.luisCondition.shapeIntegrity);
        }
        
        // Update player lucidity UI
        this.updatePlayerLucidityUI(gameState);
    }
    
    updatePlayerLucidityUI(gameState) {
        // Safety check - ensure UI elements exist
        if (!this.playerLucidityContainer || !this.playerLucidityBar) {
            return;
        }
        
        const isOutside = gameState.isOutside;
        const lucidityPercent = gameState.getPlayerLucidityPercent();
        const isWearingVest = gameState.isVestEquipped();
        const vestDurability = gameState.getVestDurabilityPercent();
        
        // Show/hide player lucidity container based on location
        if (isOutside || lucidityPercent > 0) {
            this.playerLucidityContainer.style.display = 'block';
        } else {
            this.playerLucidityContainer.style.display = 'none';
        }
        
        // Update player lucidity bar
        if (this.playerLucidityBar) {
            this.playerLucidityBar.style.width = `${lucidityPercent}%`;
            
            // Color changes based on danger level
            if (lucidityPercent > 80) {
                this.playerLucidityBar.style.background = 'linear-gradient(90deg, #ff2222, #ff0000)';
                this.playerLucidityBar.style.animation = 'pulse 0.5s infinite';
            } else if (lucidityPercent > 50) {
                this.playerLucidityBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4444)';
                this.playerLucidityBar.style.animation = 'pulse 1s infinite';
            } else {
                this.playerLucidityBar.style.background = 'linear-gradient(90deg, #ffaa6b, #ff8844)';
                this.playerLucidityBar.style.animation = 'none';
            }
        }
        
        // Update vest indicator
        if (isWearingVest && this.vestIndicator && this.vestDurabilityBar) {
            this.vestIndicator.style.display = 'block';
            this.vestDurabilityBar.style.width = `${vestDurability}%`;
            
            // Color based on durability
            if (vestDurability < 25) {
                this.vestDurabilityBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4444)';
            } else if (vestDurability < 50) {
                this.vestDurabilityBar.style.background = 'linear-gradient(90deg, #ffaa6a, #ff8844)';
            } else {
                this.vestDurabilityBar.style.background = 'linear-gradient(90deg, #6aff6a, #44ff44)';
            }
        } else if (this.vestIndicator) {
            this.vestIndicator.style.display = 'none';
        }
        
        // Update warning overlay based on lucidity
        if (this.warningOverlay) {
            if (lucidityPercent > 60 && isOutside) {
                const intensity = (lucidityPercent - 60) / 40; // 0 to 1 as lucidity goes 60-100
                this.warningOverlay.style.opacity = intensity * 0.6;
            } else {
                this.warningOverlay.style.opacity = '0';
            }
        }
    }
    
    updateBarColor(bar, value) {
        // Add visual warning when values get low
        if (value < 25) {
            bar.style.animation = 'pulse 1s infinite';
        } else if (value < 50) {
            bar.style.opacity = '0.9';
            bar.style.animation = 'none';
        } else {
            bar.style.opacity = '1';
            bar.style.animation = 'none';
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(10, 10, 18, 0.95);
            border: 1px solid ${type === 'warning' ? '#c94444' : 'rgba(201, 162, 39, 0.5)'};
            color: ${type === 'warning' ? '#ff6b6b' : '#e0e0e0'};
            padding: 15px 30px;
            border-radius: 4px;
            font-family: 'Georgia', serif;
            z-index: 1000;
            animation: fadeInOut ${duration}ms ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
    
    showMemoryAnchorCollected(anchorName) {
        this.showNotification(`Memory Anchor: "${anchorName}"`, 'success', 4000);
    }
    
    showConditionChange(stat, amount) {
        const prefix = amount > 0 ? '+' : '';
        const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
        this.showNotification(`${statName} ${prefix}${amount}`, amount > 0 ? 'info' : 'warning', 2000);
    }
    
    hideStatusPanel() {
        if (this.statusPanel) {
            this.statusPanel.style.display = 'none';
        }
    }
    
    showStatusPanel() {
        if (this.statusPanel) {
            this.statusPanel.style.display = 'block';
        }
    }
}
