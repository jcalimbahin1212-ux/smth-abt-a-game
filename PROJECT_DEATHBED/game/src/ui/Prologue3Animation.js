/**
 * PROJECT DEATHBED - Prologue 3: "The Fall"
 * Adrian falls from the rooftop in a dream sequence
 * Upside-down spinning animation with static soundtrack
 */

import * as THREE from 'three';

export class Prologue3Animation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 35000; // 35 seconds - slow, agonizing fall
        this.animationFrame = null;
        
        // Three.js scene
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Adrian's falling model
        this.adrian = null;
        this.buildings = [];
        
        // Slow-motion effect
        this.timeScale = 0.25; // Even slower motion
        
        // Direct audio element for guaranteed playback
        this.fallMusic = null;
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'prologue3-animation';
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
        
        // Create Three.js renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Create scene - falling through night sky
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.02);
        
        // Camera looking up at Adrian falling
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, -5, 8);
        this.camera.lookAt(0, 0, 0);
        
        // Create Adrian falling
        this.createAdrianFalling();
        
        // Create buildings rushing past
        this.createBuildings();
        
        // Create stars/lights
        this.createStars();
        
        // Lighting
        this.createLighting();
        
        // Static overlay
        this.staticCanvas = document.createElement('canvas');
        this.staticCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0;
            z-index: 10;
        `;
        this.container.appendChild(this.staticCanvas);
        this.staticCtx = this.staticCanvas.getContext('2d');
        
        // Vignette overlay for dramatic effect
        this.vignetteOverlay = document.createElement('div');
        this.vignetteOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 8;
            background: radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.8) 100%);
        `;
        this.container.appendChild(this.vignetteOverlay);
        
        // Fade overlay
        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            opacity: 1;
            pointer-events: none;
            z-index: 20;
            transition: opacity 1s ease;
        `;
        this.container.appendChild(this.fadeOverlay);
        
        // Text overlay for thoughts
        this.textOverlay = document.createElement('div');
        this.textOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255, 255, 255, 0.7);
            font-family: 'Georgia', serif;
            font-size: 2em;
            font-style: italic;
            text-align: center;
            pointer-events: none;
            z-index: 15;
            opacity: 0;
            transition: opacity 0.5s ease;
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
            border: 1px solid rgba(150, 150, 200, 0.4);
            color: rgba(150, 150, 200, 0.7);
            padding: 10px 20px;
            font-family: 'Georgia', serif;
            font-size: 14px;
            cursor: pointer;
            z-index: 100;
            opacity: 0;
            transition: all 0.5s ease;
        `;
        this.skipButton.onmouseenter = () => {
            this.skipButton.style.borderColor = 'rgba(180, 180, 255, 0.7)';
            this.skipButton.style.color = 'rgba(180, 180, 255, 0.9)';
        };
        this.skipButton.onmouseleave = () => {
            this.skipButton.style.borderColor = 'rgba(150, 150, 200, 0.4)';
            this.skipButton.style.color = 'rgba(150, 150, 200, 0.7)';
        };
        this.skipButton.onclick = () => this.skip();
        this.container.appendChild(this.skipButton);
        
        // Show skip button after a delay
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 2000);
        
        // Keyboard skip
        this.keyHandler = (e) => {
            if (e.code === 'Escape' || e.code === 'Space') {
                this.skip();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        window.addEventListener('resize', () => this.onResize());
        document.body.appendChild(this.container);
    }
    
    createAdrianFalling() {
        this.adrian = new THREE.Group();
        
        // Adrian's body - falling upside down
        // Torso
        const torsoGeometry = new THREE.CapsuleGeometry(0.2, 0.5, 8, 16);
        const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3d2d }); // Dark green jacket
        const torso = new THREE.Mesh(torsoGeometry, clothMaterial);
        torso.position.y = 0;
        this.adrian.add(torso);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 0.5;
        head.scale.set(1, 1.1, 1);
        this.adrian.add(head);
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x1a0a00 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.55;
        this.adrian.add(hair);
        
        // Arms spread out
        const armGeometry = new THREE.CapsuleGeometry(0.05, 0.4, 4, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
        leftArm.position.set(-0.35, 0.1, 0);
        leftArm.rotation.z = Math.PI / 3;
        this.adrian.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
        rightArm.position.set(0.35, 0.1, 0);
        rightArm.rotation.z = -Math.PI / 3;
        this.adrian.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.06, 0.5, 4, 8);
        const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a2a });
        
        const leftLeg = new THREE.Mesh(legGeometry, pantsMaterial);
        leftLeg.position.set(-0.12, -0.5, 0);
        this.adrian.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, pantsMaterial);
        rightLeg.position.set(0.12, -0.5, 0);
        this.adrian.add(rightLeg);
        
        // Start upside down
        this.adrian.rotation.x = Math.PI;
        this.adrian.position.set(0, 0, 0);
        
        this.scene.add(this.adrian);
    }
    
    createBuildings() {
        const buildingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a25,
            emissive: 0x050510,
            roughness: 0.9
        });
        
        // Create buildings rushing upward (from Adrian's perspective falling down)
        for (let i = 0; i < 20; i++) {
            const width = 2 + Math.random() * 4;
            const depth = 2 + Math.random() * 4;
            const height = 20 + Math.random() * 40;
            
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                buildingMaterial.clone()
            );
            
            // Position around Adrian
            const angle = (i / 20) * Math.PI * 2;
            const distance = 8 + Math.random() * 15;
            building.position.x = Math.cos(angle) * distance;
            building.position.z = Math.sin(angle) * distance;
            building.position.y = -30 - Math.random() * 20;
            
            // Add windows
            this.addBuildingWindows(building, width, height, depth);
            
            this.buildings.push(building);
            this.scene.add(building);
        }
    }
    
    addBuildingWindows(building, width, height, depth) {
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.4
        });
        
        const windowsPerFloor = Math.floor(width / 0.8);
        const floors = Math.floor(height / 2);
        
        for (let floor = 0; floor < floors; floor++) {
            for (let w = 0; w < windowsPerFloor; w++) {
                if (Math.random() > 0.4) {
                    const windowMesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(0.4, 0.6),
                        windowMaterial.clone()
                    );
                    windowMesh.position.x = (w - windowsPerFloor / 2 + 0.5) * 0.8;
                    windowMesh.position.y = (floor - floors / 2 + 0.5) * 2;
                    windowMesh.position.z = depth / 2 + 0.01;
                    building.add(windowMesh);
                }
            }
        }
    }
    
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        
        for (let i = 0; i < 500; i++) {
            starPositions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50 + 10,
                (Math.random() - 0.5) * 100
            );
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    createLighting() {
        // Dim ambient
        const ambient = new THREE.AmbientLight(0x101020, 0.5);
        this.scene.add(ambient);
        
        // Light from above (the sky)
        const skyLight = new THREE.DirectionalLight(0x3344aa, 0.3);
        skyLight.position.set(0, 10, 0);
        this.scene.add(skyLight);
        
        // Slight rim light on Adrian
        const rimLight = new THREE.PointLight(0x6688ff, 0.5, 10);
        rimLight.position.set(0, 2, 5);
        this.scene.add(rimLight);
    }
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.staticCanvas) {
            this.staticCanvas.width = window.innerWidth;
            this.staticCanvas.height = window.innerHeight;
        }
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Fade in slowly
        setTimeout(() => {
            this.fadeOverlay.style.transition = 'opacity 2s ease';
            this.fadeOverlay.style.opacity = '0';
        }, 100);
        
        // Play melancholic fall music using direct HTML5 Audio for guaranteed playback
        this.playFallMusic();
        
        // Also create atmospheric wind/falling sound
        this.createFallingAudio();
        
        // Create heartbeat sound effect overlay
        this.startHeartbeat();
        
        this.animate();
    }
    
    playFallMusic() {
        try {
            // Create audio element directly for reliable playback
            // Use "Untitled (Remastered)" for the fall sequence
            this.fallMusic = new Audio('/music/untitled-remastered.mp3');
            this.fallMusic.loop = false; // Don't loop - let it play through
            this.fallMusic.volume = 0; // Start silent for fade in
            
            // Play immediately
            const playPromise = this.fallMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Fall music (Untitled Remastered) started playing');
                    // Fade in over 4 seconds
                    this.fadeInMusic();
                }).catch(error => {
                    console.log('Music autoplay blocked, trying on interaction:', error);
                    // Try playing on next user interaction
                    const playOnInteraction = () => {
                        this.fallMusic.play().then(() => this.fadeInMusic());
                        document.removeEventListener('click', playOnInteraction);
                    };
                    document.addEventListener('click', playOnInteraction);
                });
            }
        } catch (e) {
            console.log('Could not create fall music:', e);
        }
    }
    
    fadeInMusic() {
        if (!this.fallMusic) return;
        
        let volume = 0;
        const targetVolume = 0.5;
        const fadeInterval = setInterval(() => {
            if (!this.isPlaying || volume >= targetVolume) {
                clearInterval(fadeInterval);
                return;
            }
            volume += 0.01;
            this.fallMusic.volume = Math.min(volume, targetVolume);
        }, 40); // Fade over ~2 seconds
    }
    
    stopFallMusic(fadeTime = 2) {
        if (!this.fallMusic) return;
        
        const startVolume = this.fallMusic.volume;
        const steps = fadeTime * 50;
        let step = 0;
        
        const fadeInterval = setInterval(() => {
            step++;
            this.fallMusic.volume = Math.max(0, startVolume * (1 - step / steps));
            
            if (step >= steps) {
                clearInterval(fadeInterval);
                this.fallMusic.pause();
                this.fallMusic = null;
            }
        }, 20);
    }
    
    createFallingAudio() {
        // Create atmospheric wind sound using Web Audio API
        try {
            this.fallingAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create wind noise
            const bufferSize = 2 * this.fallingAudioCtx.sampleRate;
            const noiseBuffer = this.fallingAudioCtx.createBuffer(1, bufferSize, this.fallingAudioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            // Generate brown noise (deeper, like wind)
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // Boost
            }
            
            this.windNoise = this.fallingAudioCtx.createBufferSource();
            this.windNoise.buffer = noiseBuffer;
            this.windNoise.loop = true;
            
            // Low pass filter for deep rumble
            this.windFilter = this.fallingAudioCtx.createBiquadFilter();
            this.windFilter.type = 'lowpass';
            this.windFilter.frequency.value = 300;
            
            // Gain for fade in
            this.windGain = this.fallingAudioCtx.createGain();
            this.windGain.gain.value = 0;
            
            this.windNoise.connect(this.windFilter);
            this.windFilter.connect(this.windGain);
            this.windGain.connect(this.fallingAudioCtx.destination);
            
            this.windNoise.start();
            
            // Fade in wind
            this.windGain.gain.linearRampToValueAtTime(0.15, this.fallingAudioCtx.currentTime + 3);
            
            // Gradually increase wind intensity during fall
            const fallDuration = this.duration / 1000;
            this.windFilter.frequency.linearRampToValueAtTime(600, this.fallingAudioCtx.currentTime + fallDuration * 0.7);
            this.windGain.gain.linearRampToValueAtTime(0.25, this.fallingAudioCtx.currentTime + fallDuration * 0.8);
            
        } catch (e) {
            console.log('Could not create falling audio:', e);
        }
    }
    
    stopFallingAudio(fadeTime = 1) {
        if (this.windGain && this.fallingAudioCtx) {
            this.windGain.gain.linearRampToValueAtTime(0, this.fallingAudioCtx.currentTime + fadeTime);
            setTimeout(() => {
                if (this.windNoise) {
                    this.windNoise.stop();
                }
                if (this.fallingAudioCtx) {
                    this.fallingAudioCtx.close();
                }
            }, fadeTime * 1000);
        }
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const progress = elapsed / (this.duration / 1000);
        
        // Slow-motion time for visual effects
        const slowElapsed = elapsed * this.timeScale;
        
        // Spin Adrian very slowly - agonizing rotation
        if (this.adrian) {
            // Slow, dreamlike rotation
            this.adrian.rotation.z += 0.008; // Much slower spin
            this.adrian.rotation.x = Math.PI + Math.sin(slowElapsed * 0.5) * 0.3;
            
            // Gentle drift side to side
            this.adrian.position.x = Math.sin(slowElapsed * 0.2) * 0.8;
            
            // Slight breathing/pulsing effect
            const breathe = 1 + Math.sin(elapsed * 2) * 0.02;
            this.adrian.scale.set(breathe, breathe, breathe);
        }
        
        // Move buildings upward very slowly (dreamlike fall)
        this.buildings.forEach((building, i) => {
            // Slow, surreal movement
            building.position.y += 0.15 + progress * 0.2;
            
            // Reset buildings that go too high
            if (building.position.y > 30) {
                building.position.y = -40;
            }
        });
        
        // Move stars slowly
        if (this.stars) {
            this.stars.position.y += 0.05;
            if (this.stars.position.y > 20) {
                this.stars.position.y = 0;
            }
        }
        
        // Gentle camera movements - like floating
        const shake = Math.min(progress * 0.05, 0.08);
        this.camera.position.x = Math.sin(slowElapsed * 2) * shake;
        this.camera.position.z = 8 + Math.cos(slowElapsed * 1.5) * shake * 0.5;
        
        // Slowly zoom in on Adrian as fall progresses
        this.camera.position.y = -5 + progress * 2;
        
        // Add vignette effect that intensifies
        this.updateVignette(progress);
        
        // Static effect increases
        this.updateStatic(progress);
        
        // Show thought text at certain times
        this.updateText(elapsed);
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Check completion
        if (elapsed >= this.duration / 1000) {
            this.complete();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    updateStatic(progress) {
        if (!this.staticCtx) return;
        
        const w = this.staticCanvas.width = window.innerWidth;
        const h = this.staticCanvas.height = window.innerHeight;
        
        // Increase static intensity over time
        const intensity = progress * 0.5;
        this.staticCanvas.style.opacity = intensity;
        
        // Draw static
        const imageData = this.staticCtx.createImageData(w, h);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const value = Math.random() * 255;
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            imageData.data[i + 3] = Math.random() * 50;
        }
        this.staticCtx.putImageData(imageData, 0, 0);
    }
    
    updateText(elapsed) {
        // More agonizing, drawn-out text moments for 35s fall
        const texts = [
            { time: 2, text: "Falling...", duration: 3 },
            { time: 6, text: "Time stretches.", duration: 3 },
            { time: 10, text: "Every second feels like an eternity.", duration: 3.5 },
            { time: 14, text: "The world spins around you.", duration: 3 },
            { time: 18, text: "Was this always inevitable?", duration: 3.5 },
            { time: 22, text: "Memories flash by...", duration: 3 },
            { time: 26, text: "The ground waits below.", duration: 3 },
            { time: 30, text: "Just let go.", duration: 3 },
            { time: 34, text: "", duration: 1 }
        ];
        
        for (const t of texts) {
            if (elapsed >= t.time && elapsed < t.time + t.duration) {
                if (this.textOverlay.textContent !== t.text) {
                    this.textOverlay.style.opacity = '0';
                    setTimeout(() => {
                        this.textOverlay.textContent = t.text;
                        this.textOverlay.style.opacity = '1';
                    }, 300);
                }
                break;
            }
        }
    }
    
    updateVignette(progress) {
        if (!this.vignetteOverlay) return;
        
        // Intensify vignette as fall progresses
        const innerTransparent = Math.max(0, 40 - progress * 30);
        const darkStart = Math.max(50, 70 - progress * 20);
        
        this.vignetteOverlay.style.background = `
            radial-gradient(ellipse at center, 
                transparent 0%, 
                transparent ${innerTransparent}%, 
                rgba(0,0,0,${0.3 + progress * 0.3}) ${darkStart}%, 
                rgba(0,0,0,${0.8 + progress * 0.2}) 100%)
        `;
    }
    
    startHeartbeat() {
        // Create a pulsing red overlay that simulates heartbeat
        this.heartbeatOverlay = document.createElement('div');
        this.heartbeatOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 7;
            background: radial-gradient(ellipse at center, rgba(80, 0, 0, 0) 0%, rgba(40, 0, 0, 0.2) 100%);
            opacity: 0;
        `;
        this.container.appendChild(this.heartbeatOverlay);
        
        // Heartbeat pulse animation - slow and agonizing
        let beatCount = 0;
        this.heartbeatInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(this.heartbeatInterval);
                return;
            }
            
            beatCount++;
            
            // Pulse effect
            this.heartbeatOverlay.style.transition = 'opacity 0.3s ease-out';
            this.heartbeatOverlay.style.opacity = '0.6';
            
            setTimeout(() => {
                this.heartbeatOverlay.style.transition = 'opacity 0.8s ease-in';
                this.heartbeatOverlay.style.opacity = '0';
            }, 300);
            
            // Heartbeat slows down as you fall (life fading)
            const newInterval = 1200 + beatCount * 100; // Slows down each beat
            if (newInterval < 3000) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = setInterval(() => {
                    if (!this.isPlaying) return;
                    this.heartbeatOverlay.style.transition = 'opacity 0.3s ease-out';
                    this.heartbeatOverlay.style.opacity = '0.6';
                    setTimeout(() => {
                        this.heartbeatOverlay.style.transition = 'opacity 0.8s ease-in';
                        this.heartbeatOverlay.style.opacity = '0';
                    }, 300);
                }, newInterval);
            }
        }, 1200); // Start with ~50bpm
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.heartbeatOverlay) {
            this.heartbeatOverlay.remove();
        }
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
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        // Stop falling audio
        this.stopFallingAudio(0.5);
        
        // Stop fall music
        this.stopFallMusic(1.5);
        
        // Flash to white (impact)
        this.fadeOverlay.style.background = '#fff';
        this.fadeOverlay.style.transition = 'opacity 0.1s ease';
        this.fadeOverlay.style.opacity = '1';
        
        setTimeout(() => {
            // Fade to black
            this.fadeOverlay.style.background = '#000';
            this.fadeOverlay.style.transition = 'opacity 1.5s ease';
            
            setTimeout(() => {
                // Cleanup
                if (this.renderer) this.renderer.dispose();
                this.container.remove();
                
                if (this.onComplete) this.onComplete();
            }, 1500);
        }, 300);
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
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        // Stop falling audio
        this.stopFallingAudio(0.3);
        
        // Stop fall music
        this.stopFallMusic(0.5);
        
        // Quick fade to black
        this.fadeOverlay.style.transition = 'opacity 0.5s ease';
        this.fadeOverlay.style.opacity = '1';
        
        setTimeout(() => {
            if (this.renderer) this.renderer.dispose();
            this.container.remove();
            
            if (this.onComplete) this.onComplete();
        }, 500);
    }
}
