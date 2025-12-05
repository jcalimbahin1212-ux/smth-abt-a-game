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
