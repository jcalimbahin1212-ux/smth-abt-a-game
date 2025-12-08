/**
 * PROJECT DEATHBED - Face Wash Animation
 * Animation for washing face at sink, followed by static/headache effect
 */

export class FaceWashAnimation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.phase = 0; // 0 = washing, 1 = blur, 2 = static, 3 = recovery
        this.phaseTimer = 0;
    }
    
    start() {
        this.create();
        this.isPlaying = true;
        this.phase = 0;
        this.phaseTimer = 0;
        
        // Start the animation sequence
        this.runSequence();
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'face-wash-animation';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3000;
            pointer-events: none;
        `;
        
        // Black overlay for eye-closing effect
        this.blackOverlay = document.createElement('div');
        this.blackOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        this.container.appendChild(this.blackOverlay);
        
        // Water droplet effect
        this.waterOverlay = document.createElement('div');
        this.waterOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, rgba(150, 200, 255, 0.3) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        this.container.appendChild(this.waterOverlay);
        
        // Blur overlay
        this.blurOverlay = document.createElement('div');
        this.blurOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
            transition: backdrop-filter 0.5s ease;
        `;
        this.container.appendChild(this.blurOverlay);
        
        // Static noise canvas
        this.staticCanvas = document.createElement('canvas');
        this.staticCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            mix-blend-mode: overlay;
        `;
        this.staticCanvas.width = 400;
        this.staticCanvas.height = 300;
        this.staticCtx = this.staticCanvas.getContext('2d');
        this.container.appendChild(this.staticCanvas);
        
        // Red pain overlay
        this.painOverlay = document.createElement('div');
        this.painOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, rgba(180, 50, 50, 0.4) 0%, rgba(100, 20, 20, 0.6) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        this.container.appendChild(this.painOverlay);
        
        // Text overlay
        this.textOverlay = document.createElement('div');
        this.textOverlay.style.cssText = `
            position: absolute;
            bottom: 25%;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            font-family: 'Georgia', serif;
            font-size: 1.8em;
            font-style: italic;
            text-align: center;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
            opacity: 0;
            transition: opacity 0.5s ease;
            max-width: 80%;
        `;
        this.container.appendChild(this.textOverlay);
        
        document.body.appendChild(this.container);
    }
    
    runSequence() {
        // Phase 0: Water splash and eye close (0-2s)
        this.showText("*Splashing cold water on face*");
        this.waterOverlay.style.opacity = '0.6';
        
        setTimeout(() => {
            this.blackOverlay.style.opacity = '0.8';
            this.waterOverlay.style.opacity = '0';
        }, 500);
        
        setTimeout(() => {
            this.blackOverlay.style.opacity = '0.95';
            this.showText("*Eyes closed... the cold feels good...*");
        }, 1000);
        
        // Phase 1: Opening eyes with blur (2-3s)
        setTimeout(() => {
            this.blackOverlay.style.opacity = '0.3';
            this.blurOverlay.style.backdropFilter = 'blur(15px)';
            this.blurOverlay.style.webkitBackdropFilter = 'blur(15px)';
            this.showText("");
        }, 2000);
        
        // Phase 2: Static attack! (3-5s)
        setTimeout(() => {
            this.blackOverlay.style.opacity = '0';
            this.triggerStaticAttack();
        }, 3000);
        
        // Phase 3: Headache dialogue (5-7s)
        setTimeout(() => {
            this.stopStatic();
            this.painOverlay.style.opacity = '0.5';
            this.blurOverlay.style.backdropFilter = 'blur(5px)';
            this.showText("Gah... My head... It's pounding...");
        }, 5000);
        
        // Phase 4: Recovery (7-9s)
        setTimeout(() => {
            this.painOverlay.style.opacity = '0.2';
            this.showText("I need something for this headache... Maybe there's medicine in the kitchen.");
        }, 7000);
        
        // Phase 5: End (9s)
        setTimeout(() => {
            this.complete();
        }, 9500);
    }
    
    triggerStaticAttack() {
        this.staticCanvas.style.opacity = '0.8';
        this.painOverlay.style.opacity = '0.3';
        this.blurOverlay.style.backdropFilter = 'blur(8px)';
        
        // Play static sound if available
        if (this.audioManager) {
            this.audioManager.playSound('static');
        }
        
        // Animate static
        this.staticInterval = setInterval(() => {
            this.drawStatic();
        }, 50);
        
        // Screen shake effect
        this.shakeInterval = setInterval(() => {
            const shakeX = (Math.random() - 0.5) * 10;
            const shakeY = (Math.random() - 0.5) * 10;
            this.container.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        }, 50);
    }
    
    drawStatic() {
        const imageData = this.staticCtx.createImageData(this.staticCanvas.width, this.staticCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = Math.random() * 150 + 50; // A
        }
        
        this.staticCtx.putImageData(imageData, 0, 0);
    }
    
    stopStatic() {
        if (this.staticInterval) {
            clearInterval(this.staticInterval);
            this.staticInterval = null;
        }
        if (this.shakeInterval) {
            clearInterval(this.shakeInterval);
            this.shakeInterval = null;
        }
        this.container.style.transform = '';
        this.staticCanvas.style.opacity = '0';
    }
    
    showText(text) {
        if (text) {
            this.textOverlay.textContent = text;
            this.textOverlay.style.opacity = '1';
        } else {
            this.textOverlay.style.opacity = '0';
        }
    }
    
    complete() {
        this.isPlaying = false;
        this.stopStatic();
        
        // Fade out everything
        this.blackOverlay.style.opacity = '0';
        this.blurOverlay.style.backdropFilter = 'blur(0px)';
        this.painOverlay.style.opacity = '0';
        this.textOverlay.style.opacity = '0';
        
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            if (this.onComplete) {
                this.onComplete();
            }
        }, 500);
    }
}
