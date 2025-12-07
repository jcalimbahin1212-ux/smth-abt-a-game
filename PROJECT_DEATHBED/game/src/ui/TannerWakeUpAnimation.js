/**
 * PROJECT DEATHBED - Tanner Wake Up Animation
 * Adrian wakes up in Tanner's house after the falling dream
 * Features alarm clock ringing, hitting the alarm, then headache dialogue
 * First-person perspective, slowly opening eyes in a well-lit room
 */

import * as THREE from 'three';

export class TannerWakeUpAnimation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 12000; // 12 seconds total
        this.animationFrame = null;
        this.alarmAudio = null;
        this.alarmStopped = false;
        this.headacheShown = false;
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'tanner-wakeup-animation';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 3000;
            overflow: hidden;
            cursor: default;
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
            transition: transform 2.5s ease-out;
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
            transition: transform 2.5s ease-out;
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
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            z-index: 5;
            transition: backdrop-filter 3s ease-out, opacity 3s ease-out;
        `;
        this.container.appendChild(this.blurLayer);
        
        // Bedroom view (canvas render)
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
        
        // Alarm clock overlay (pulsing)
        this.alarmOverlay = document.createElement('div');
        this.alarmOverlay.style.cssText = `
            position: absolute;
            top: 30%;
            right: 15%;
            width: 120px;
            height: 60px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #44ff44;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
            box-shadow: 0 0 20px rgba(68, 255, 68, 0.5);
            animation: alarmPulse 0.5s ease-in-out infinite alternate;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        this.alarmOverlay.innerHTML = `
            <span style="color: #44ff44; font-family: 'Courier New', monospace; font-size: 1.8em; font-weight: bold;">7:00</span>
        `;
        this.container.appendChild(this.alarmOverlay);
        
        // Add alarm pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes alarmPulse {
                0% { transform: scale(1); box-shadow: 0 0 20px rgba(68, 255, 68, 0.5); }
                100% { transform: scale(1.05); box-shadow: 0 0 35px rgba(68, 255, 68, 0.8); }
            }
            @keyframes handMove {
                0% { transform: translateX(0) rotate(0deg); }
                50% { transform: translateX(30px) rotate(-15deg); }
                100% { transform: translateX(0) rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
        this.styleElement = style;
        
        // Click to stop alarm
        this.alarmOverlay.onclick = () => this.stopAlarm();
        
        // Hand reaching overlay (appears when alarm is clicked)
        this.handOverlay = document.createElement('div');
        this.handOverlay.style.cssText = `
            position: absolute;
            bottom: 20%;
            right: 25%;
            width: 100px;
            height: 40px;
            background: linear-gradient(90deg, #8a6a5a 0%, #a07060 50%, #8a6a5a 100%);
            border-radius: 10px 50px 50px 10px;
            z-index: 15;
            opacity: 0;
            transform: translateX(-100px);
            transition: transform 0.5s ease-out, opacity 0.3s ease;
        `;
        this.container.appendChild(this.handOverlay);
        
        // Text overlay
        this.textOverlay = document.createElement('div');
        this.textOverlay.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.9);
            font-family: 'Georgia', serif;
            font-size: 1.5em;
            font-style: italic;
            text-align: center;
            z-index: 25;
            opacity: 0;
            transition: opacity 1s ease;
            text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        `;
        this.container.appendChild(this.textOverlay);
        
        // Instruction text
        this.instructionText = document.createElement('div');
        this.instructionText.style.cssText = `
            position: absolute;
            bottom: 35%;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(200, 220, 255, 0.7);
            font-family: 'Georgia', serif;
            font-size: 1em;
            text-align: center;
            z-index: 25;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        this.instructionText.textContent = '[ click the alarm to turn it off ]';
        this.container.appendChild(this.instructionText);
        
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
        
        // Show skip after 2 seconds
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 2000);
        
        // Keyboard controls
        this.keyHandler = (e) => {
            if (e.code === 'Escape') {
                this.skip();
            } else if (e.code === 'Space' || e.code === 'Enter') {
                if (!this.alarmStopped) {
                    this.stopAlarm();
                }
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
    
    drawBedroom(brightness = 1) {
        const w = this.bedroomCanvas.width;
        const h = this.bedroomCanvas.height;
        
        // Warm, bright background (Tanner's house is well-lit and safe)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, `rgb(${Math.floor(80 * brightness)}, ${Math.floor(70 * brightness)}, ${Math.floor(60 * brightness)})`);
        gradient.addColorStop(1, `rgb(${Math.floor(100 * brightness)}, ${Math.floor(85 * brightness)}, ${Math.floor(70 * brightness)})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);
        
        // Ceiling (looking up from bed)
        this.ctx.fillStyle = `rgb(${Math.floor(90 * brightness)}, ${Math.floor(85 * brightness)}, ${Math.floor(80 * brightness)})`;
        this.ctx.fillRect(0, 0, w, h * 0.35);
        
        // Ceiling light (on, warm glow)
        const lightGlow = this.ctx.createRadialGradient(
            w * 0.4, h * 0.15, 10,
            w * 0.4, h * 0.15, 150
        );
        lightGlow.addColorStop(0, `rgba(255, 238, 200, ${0.8 * brightness})`);
        lightGlow.addColorStop(0.3, `rgba(255, 220, 180, ${0.4 * brightness})`);
        lightGlow.addColorStop(1, 'rgba(255, 220, 180, 0)');
        this.ctx.fillStyle = lightGlow;
        this.ctx.fillRect(0, 0, w, h * 0.5);
        
        // Light fixture
        this.ctx.beginPath();
        this.ctx.arc(w * 0.4, h * 0.15, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 240, 200, ${brightness})`;
        this.ctx.fill();
        
        // Walls visible from bed perspective
        // Left wall (warm color)
        this.ctx.fillStyle = `rgb(${Math.floor(110 * brightness)}, ${Math.floor(95 * brightness)}, ${Math.floor(80 * brightness)})`;
        this.ctx.beginPath();
        this.ctx.moveTo(0, h * 0.25);
        this.ctx.lineTo(w * 0.15, h * 0.35);
        this.ctx.lineTo(w * 0.15, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Right wall
        this.ctx.beginPath();
        this.ctx.moveTo(w, h * 0.25);
        this.ctx.lineTo(w * 0.85, h * 0.35);
        this.ctx.lineTo(w * 0.85, h);
        this.ctx.lineTo(w, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Window on left wall with warm daylight
        this.ctx.fillStyle = `rgb(${Math.floor(200 * brightness)}, ${Math.floor(190 * brightness)}, ${Math.floor(160 * brightness)})`;
        this.ctx.fillRect(w * 0.02, h * 0.35, w * 0.08, h * 0.2);
        
        // Window glow (warm sunlight)
        const windowGlow = this.ctx.createRadialGradient(
            w * 0.06, h * 0.45, 10,
            w * 0.06, h * 0.45, 150
        );
        windowGlow.addColorStop(0, `rgba(255, 240, 200, ${0.5 * brightness})`);
        windowGlow.addColorStop(1, 'rgba(255, 240, 200, 0)');
        this.ctx.fillStyle = windowGlow;
        this.ctx.fillRect(0, h * 0.2, w * 0.3, h * 0.5);
        
        // Bedside table on right
        this.ctx.fillStyle = `rgb(${Math.floor(70 * brightness)}, ${Math.floor(55 * brightness)}, ${Math.floor(40 * brightness)})`;
        this.ctx.fillRect(w * 0.75, h * 0.5, w * 0.12, h * 0.2);
        
        // Lamp on bedside table
        this.ctx.fillStyle = `rgb(${Math.floor(140 * brightness)}, ${Math.floor(120 * brightness)}, ${Math.floor(100 * brightness)})`;
        this.ctx.beginPath();
        this.ctx.arc(w * 0.78, h * 0.48, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Blanket at bottom of view (blue/cozy)
        this.ctx.fillStyle = `rgb(${Math.floor(80 * brightness)}, ${Math.floor(100 * brightness)}, ${Math.floor(140 * brightness)})`;
        this.ctx.fillRect(0, h * 0.72, w, h * 0.28);
        
        // Blanket folds
        this.ctx.strokeStyle = `rgb(${Math.floor(60 * brightness)}, ${Math.floor(80 * brightness)}, ${Math.floor(120 * brightness)})`;
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(w * 0.08 + i * w * 0.18, h * 0.72);
            this.ctx.quadraticCurveTo(
                w * 0.12 + i * w * 0.18, h * 0.82,
                w * 0.18 + i * w * 0.18, h * 0.75
            );
            this.ctx.stroke();
        }
        
        // Dresser visible in corner
        this.ctx.fillStyle = `rgb(${Math.floor(70 * brightness)}, ${Math.floor(55 * brightness)}, ${Math.floor(40 * brightness)})`;
        this.ctx.fillRect(w * 0.02, h * 0.55, w * 0.08, h * 0.17);
    }
    
    playAlarmSound() {
        // Create alarm beeping sound using Web Audio API
        if (!this.audioManager?.audioContext) {
            // Fallback: create our own context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } else {
            this.audioContext = this.audioManager.audioContext;
        }
        
        this.alarmPlaying = true;
        this.playAlarmBeep();
    }
    
    playAlarmBeep() {
        if (!this.alarmPlaying || this.alarmStopped) return;
        
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Create two beeps
        for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = 880; // A5 note
            osc.type = 'square';
            
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.01);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.12);
            
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.15);
        }
        
        // Repeat every 0.8 seconds
        this.alarmTimeout = setTimeout(() => this.playAlarmBeep(), 800);
    }
    
    stopAlarm() {
        if (this.alarmStopped) return;
        this.alarmStopped = true;
        
        // Stop alarm sound
        this.alarmPlaying = false;
        if (this.alarmTimeout) {
            clearTimeout(this.alarmTimeout);
        }
        
        // Play click sound
        if (this.audioContext) {
            const ctx = this.audioContext;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 200;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
        
        // Hide alarm
        this.alarmOverlay.style.animation = 'none';
        this.alarmOverlay.style.opacity = '0.5';
        this.alarmOverlay.style.boxShadow = 'none';
        this.alarmOverlay.style.cursor = 'default';
        
        // Hide instruction
        this.instructionText.style.opacity = '0';
        
        // Show hand reaching animation
        this.handOverlay.style.opacity = '1';
        this.handOverlay.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            this.handOverlay.style.opacity = '0';
            this.handOverlay.style.transform = 'translateX(-100px)';
        }, 600);
        
        // Show headache text after a moment
        setTimeout(() => {
            this.showHeadacheText();
        }, 1200);
    }
    
    showHeadacheText() {
        if (this.headacheShown) return;
        this.headacheShown = true;
        
        this.textOverlay.textContent = "Ugh... my head is killing me...";
        this.textOverlay.style.opacity = '1';
        
        // After 3 seconds, show second text
        setTimeout(() => {
            this.textOverlay.style.opacity = '0';
            
            setTimeout(() => {
                this.textOverlay.textContent = "Another dream about falling...";
                this.textOverlay.style.opacity = '1';
                
                // Complete after 3 more seconds
                setTimeout(() => {
                    this.complete();
                }, 3000);
            }, 500);
        }, 3000);
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Draw the static bedroom
        this.drawBedroom(0.5);
        
        // Start alarm sound after 1 second
        setTimeout(() => {
            this.playAlarmSound();
        }, 1000);
        
        // Start animation sequence
        this.animate();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Phase 1: Eyes closed, alarm starts (0-1.5s)
        if (elapsed < 1.5) {
            const brightness = 0.3 + (elapsed / 1.5) * 0.2;
            this.drawBedroom(brightness);
        }
        // Phase 2: Eyes start opening (1.5-4s)
        else if (elapsed < 4) {
            const openProgress = (elapsed - 1.5) / 2.5;
            this.eyelidTop.style.transform = `translateY(-${openProgress * 100}%)`;
            this.eyelidBottom.style.transform = `translateY(${openProgress * 100}%)`;
            
            const brightness = 0.5 + openProgress * 0.3;
            this.drawBedroom(brightness);
            
            // Show alarm clock
            if (elapsed > 2.5 && !this.alarmStopped) {
                this.alarmOverlay.style.opacity = '1';
            }
        }
        // Phase 3: Vision clears, waiting for alarm interaction (4-8s)
        else if (elapsed < 8) {
            const clearProgress = Math.min(1, (elapsed - 4) / 2);
            const blurAmount = 25 - clearProgress * 25;
            this.blurLayer.style.backdropFilter = `blur(${blurAmount}px)`;
            this.blurLayer.style.webkitBackdropFilter = `blur(${blurAmount}px)`;
            
            this.drawBedroom(0.8 + clearProgress * 0.2);
            
            // Show instruction if alarm not stopped
            if (!this.alarmStopped && elapsed > 5) {
                this.instructionText.style.opacity = '1';
            }
        }
        // Phase 4: Fully awake, waiting for completion (8s+)
        else {
            this.blurLayer.style.opacity = '0';
            this.drawBedroom(1);
            
            // Auto-stop alarm if player hasn't clicked
            if (!this.alarmStopped && elapsed > 10) {
                this.stopAlarm();
            }
        }
        
        // Check manual completion (animation ends when headache text finishes)
        if (this.headacheShown && elapsed > 20) {
            this.complete();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    complete() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        // Stop all sounds
        this.alarmPlaying = false;
        if (this.alarmTimeout) {
            clearTimeout(this.alarmTimeout);
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove keyboard handler
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        // Remove style element
        if (this.styleElement) {
            this.styleElement.remove();
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
        
        // Stop all sounds
        this.alarmPlaying = false;
        if (this.alarmTimeout) {
            clearTimeout(this.alarmTimeout);
        }
        
        // Remove keyboard handler
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        // Remove style element
        if (this.styleElement) {
            this.styleElement.remove();
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
