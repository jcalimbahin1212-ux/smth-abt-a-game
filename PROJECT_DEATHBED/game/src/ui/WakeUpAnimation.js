/**
 * PROJECT DEATHBED - Wake Up Animation
 * Adrian wakes up in bed after the falling dream
 * First-person perspective, slowly opening eyes
 */

import * as THREE from 'three';

export class WakeUpAnimation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 6000; // 6 seconds
        this.animationFrame = null;
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'wakeup-animation';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 3000;
            overflow: hidden;
        `;
        
        // Eyelid overlay (top)
        this.eyelidTop = document.createElement('div');
        this.eyelidTop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 50%;
            background: #000;
            z-index: 10;
            transition: transform 2s ease-out;
        `;
        this.container.appendChild(this.eyelidTop);
        
        // Eyelid overlay (bottom)
        this.eyelidBottom = document.createElement('div');
        this.eyelidBottom.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50%;
            background: #000;
            z-index: 10;
            transition: transform 2s ease-out;
        `;
        this.container.appendChild(this.eyelidBottom);
        
        // Blurry vision layer
        this.blurLayer = document.createElement('div');
        this.blurLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 5;
            transition: backdrop-filter 3s ease-out, opacity 3s ease-out;
        `;
        this.container.appendChild(this.blurLayer);
        
        // Bedroom view (simple canvas render)
        this.bedroomCanvas = document.createElement('canvas');
        this.bedroomCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        this.container.appendChild(this.bedroomCanvas);
        this.ctx = this.bedroomCanvas.getContext('2d');
        
        // Text overlay
        this.textOverlay = document.createElement('div');
        this.textOverlay.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.8);
            font-family: 'Georgia', serif;
            font-size: 1.5em;
            font-style: italic;
            text-align: center;
            z-index: 15;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        this.container.appendChild(this.textOverlay);
        
        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.innerHTML = 'skip →';
        this.skipButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: transparent;
            border: 1px solid rgba(150, 170, 200, 0.4);
            color: rgba(150, 170, 200, 0.7);
            padding: 10px 20px;
            font-family: 'Georgia', serif;
            font-size: 14px;
            cursor: pointer;
            z-index: 100;
            opacity: 0;
            transition: all 0.5s ease;
        `;
        this.skipButton.onmouseenter = () => {
            this.skipButton.style.borderColor = 'rgba(180, 200, 230, 0.7)';
            this.skipButton.style.color = 'rgba(180, 200, 230, 0.9)';
        };
        this.skipButton.onmouseleave = () => {
            this.skipButton.style.borderColor = 'rgba(150, 170, 200, 0.4)';
            this.skipButton.style.color = 'rgba(150, 170, 200, 0.7)';
        };
        this.skipButton.onclick = () => this.skip();
        this.container.appendChild(this.skipButton);
        
        // Show skip after 1 second
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 1000);
        
        // Keyboard skip
        this.keyHandler = (e) => {
            if (e.code === 'Escape' || e.code === 'Space') {
                this.skip();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        window.addEventListener('resize', () => this.onResize());
        document.body.appendChild(this.container);
        
        this.onResize();
    }
    
    onResize() {
        if (this.bedroomCanvas) {
            this.bedroomCanvas.width = window.innerWidth;
            this.bedroomCanvas.height = window.innerHeight;
        }
    }
    
    drawBedroom() {
        const w = this.bedroomCanvas.width;
        const h = this.bedroomCanvas.height;
        
        // Background - ceiling view
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a1825');
        gradient.addColorStop(1, '#2a2535');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);
        
        // Ceiling
        this.ctx.fillStyle = '#252230';
        this.ctx.fillRect(0, 0, w, h * 0.4);
        
        // Ceiling light (off, dim)
        this.ctx.beginPath();
        this.ctx.arc(w / 2, h * 0.15, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = '#3a3845';
        this.ctx.fill();
        
        // Walls visible from bed perspective
        // Left wall
        this.ctx.fillStyle = '#2a2535';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h * 0.3);
        this.ctx.lineTo(w * 0.2, h * 0.4);
        this.ctx.lineTo(w * 0.2, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Right wall
        this.ctx.beginPath();
        this.ctx.moveTo(w, h * 0.3);
        this.ctx.lineTo(w * 0.8, h * 0.4);
        this.ctx.lineTo(w * 0.8, h);
        this.ctx.lineTo(w, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Window with morning light
        this.ctx.fillStyle = '#4a5a7a';
        this.ctx.fillRect(w * 0.7, h * 0.35, w * 0.15, h * 0.25);
        
        // Window glow
        const windowGlow = this.ctx.createRadialGradient(
            w * 0.775, h * 0.475, 10,
            w * 0.775, h * 0.475, 100
        );
        windowGlow.addColorStop(0, 'rgba(150, 170, 200, 0.3)');
        windowGlow.addColorStop(1, 'rgba(150, 170, 200, 0)');
        this.ctx.fillStyle = windowGlow;
        this.ctx.fillRect(w * 0.5, h * 0.2, w * 0.4, h * 0.5);
        
        // Blanket at bottom of view
        this.ctx.fillStyle = '#3a4555';
        this.ctx.fillRect(0, h * 0.75, w, h * 0.25);
        
        // Blanket folds
        this.ctx.strokeStyle = '#2a3545';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(w * 0.1 + i * w * 0.2, h * 0.75);
            this.ctx.quadraticCurveTo(
                w * 0.15 + i * w * 0.2, h * 0.85,
                w * 0.2 + i * w * 0.2, h * 0.78
            );
            this.ctx.stroke();
        }
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Draw the static bedroom
        this.drawBedroom();
        
        // Start animation sequence
        this.animate();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const progress = elapsed / (this.duration / 1000);
        
        // Phase 1: Eyes closed (0-1s)
        if (elapsed < 1) {
            // Still black
        }
        // Phase 2: Eyes start opening (1-3s)
        else if (elapsed < 3) {
            const openProgress = (elapsed - 1) / 2;
            this.eyelidTop.style.transform = `translateY(-${openProgress * 100}%)`;
            this.eyelidBottom.style.transform = `translateY(${openProgress * 100}%)`;
        }
        // Phase 3: Vision clears (3-5s)
        else if (elapsed < 5) {
            const clearProgress = (elapsed - 3) / 2;
            this.blurLayer.style.backdropFilter = `blur(${20 - clearProgress * 20}px)`;
            this.blurLayer.style.webkitBackdropFilter = `blur(${20 - clearProgress * 20}px)`;
            
            // Show text
            if (elapsed > 3.5) {
                this.textOverlay.textContent = "Just a dream...";
                this.textOverlay.style.opacity = '1';
            }
        }
        // Phase 4: Fully awake (5-6s)
        else {
            this.textOverlay.style.opacity = '0';
            this.blurLayer.style.opacity = '0';
        }
        
        // Check completion
        if (elapsed >= this.duration / 1000) {
            this.complete();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    complete() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove keyboard handler
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        // Fade out
        this.container.style.transition = 'opacity 1s ease';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.remove();
            if (this.onComplete) this.onComplete();
        }, 1000);
    }
    
    skip() {
        if (!this.isPlaying) return;
        
        // Remove keyboard handler
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        this.isPlaying = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Quick fade out
        this.container.style.transition = 'opacity 0.5s ease';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.remove();
            if (this.onComplete) this.onComplete();
        }, 500);
    }
}
