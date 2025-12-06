/**
 * PROJECT DEATHBED - Prologue 2: "Adrian's Journal"
 * Adrian sits in a dimly lit room, writing about what happened after the Light
 * Documents the changes to Luis and the world
 */

import * as THREE from 'three';

export class Prologue2Animation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 45000; // 45 seconds - tighter pacing
        this.animationFrame = null;
        
        // Three.js scene
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Journal entries to display - tighter timing for better pacing
        this.journalEntries = [
            { time: 3, text: "Day 1 after the Light", style: 'header' },
            { time: 5, text: "The sky turned white. Just... white.", style: 'entry' },
            { time: 8, text: "When it faded, nothing was the same.", style: 'entry' },
            
            { time: 12, text: "Day 7", style: 'header' },
            { time: 14, text: "Luis started changing today.", style: 'entry' },
            { time: 17, text: "His skin... it's like looking at something not quite solid anymore.", style: 'entry' },
            
            { time: 21, text: "Day 23", style: 'header' },
            { time: 23, text: "The doctors call it 'Shape Dissolution'.", style: 'entry' },
            { time: 26, text: "They say his physical form is becoming unstable.", style: 'entry' },
            { time: 29, text: "I don't understand. He was fine before the Light.", style: 'entry' },
            
            { time: 33, text: "Day 47 - Today", style: 'header' },
            { time: 35, text: "We're heading to the shelter convoy tomorrow.", style: 'entry' },
            { time: 38, text: "I promised Luis I'd stay with him until the end.", style: 'entry' },
            { time: 41, text: "Whatever that means.", style: 'entry' }
        ];
        
        this.displayedEntries = new Set();
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'prologue2-animation';
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
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // Create scene - dim, somber room
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a12);
        
        // Camera looking at desk
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.8, 2.5);
        this.camera.lookAt(0, 1, 0);
        
        // Create the room scene
        this.createRoom();
        
        // Create Adrian sitting at desk
        this.createAdrianAtDesk();
        
        // Create the journal on desk
        this.createJournal();
        
        // Lighting
        this.createLighting();
        
        // Journal text overlay
        this.journalOverlay = document.createElement('div');
        this.journalOverlay.style.cssText = `
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            max-width: 700px;
            background: rgba(30, 25, 20, 0.95);
            border: 2px solid rgba(139, 119, 89, 0.5);
            border-radius: 5px;
            padding: 30px 40px;
            font-family: 'Georgia', serif;
            z-index: 10;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
        `;
        this.container.appendChild(this.journalOverlay);
        
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
            z-index: 30;
            transition: opacity 2s ease;
        `;
        this.container.appendChild(this.fadeOverlay);
        
        // Dust particles overlay
        this.createDustParticles();
        
        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.innerHTML = 'skip →';
        this.skipButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: transparent;
            border: 1px solid rgba(139, 119, 89, 0.4);
            color: rgba(139, 119, 89, 0.7);
            padding: 10px 20px;
            font-family: 'Georgia', serif;
            font-size: 14px;
            cursor: pointer;
            z-index: 100;
            opacity: 0;
            transition: all 0.5s ease;
        `;
        this.skipButton.onclick = () => this.skip();
        this.container.appendChild(this.skipButton);
        
        // Add styles
        this.addStyles();
        
        window.addEventListener('resize', () => this.onResize());
        document.body.appendChild(this.container);
        
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 3000);
        
        this.keyHandler = (e) => {
            if (e.code === 'Escape') this.skip();
        };
        document.addEventListener('keydown', this.keyHandler);
    }
    
    createRoom() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(8, 8);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2520,
            roughness: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Back wall
        const wallGeometry = new THREE.PlaneGeometry(8, 4);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1815,
            roughness: 0.95
        });
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, 2, -3);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Window (dim light coming through)
        const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a2030,
            transparent: true,
            opacity: 0.8
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(2, 2, -2.95);
        this.scene.add(windowMesh);
        
        // Window frame
        const frameGeometry = new THREE.BoxGeometry(1.6, 2.1, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3530 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(2, 2, -2.93);
        this.scene.add(frame);
        
        // Desk
        const deskTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.05, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
        );
        deskTop.position.set(0, 0.75, -0.5);
        deskTop.castShadow = true;
        deskTop.receiveShadow = true;
        this.scene.add(deskTop);
        
        // Desk legs
        const legGeometry = new THREE.BoxGeometry(0.05, 0.75, 0.05);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
        const positions = [[-0.7, 0.375, -0.35], [0.7, 0.375, -0.35], [-0.7, 0.375, -0.85], [0.7, 0.375, -0.85]];
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.scene.add(leg);
        });
        
        // Chair
        const chairSeat = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.05, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x3a2a20 })
        );
        chairSeat.position.set(0, 0.45, 0.3);
        this.scene.add(chairSeat);
        
        const chairBack = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.6, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x3a2a20 })
        );
        chairBack.position.set(0, 0.75, 0.55);
        this.scene.add(chairBack);
        
        // Candle on desk
        const candleGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.12, 8);
        const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f0e0 });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.set(-0.5, 0.84, -0.5);
        this.scene.add(candle);
        
        // Candle flame (emissive)
        const flameGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        this.flame = new THREE.Mesh(flameGeometry, flameMaterial);
        this.flame.position.set(-0.5, 0.92, -0.5);
        this.flame.scale.y = 1.5;
        this.scene.add(this.flame);
    }
    
    createAdrianAtDesk() {
        this.adrian = new THREE.Group();
        
        // Adrian sitting, hunched over desk writing
        // Torso (leaning forward)
        const torsoGeometry = new THREE.CapsuleGeometry(0.18, 0.4, 8, 16);
        const torsoMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3d2d }); // Dark green jacket
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 0.9, 0);
        torso.rotation.x = 0.4; // Leaning forward
        torso.castShadow = true;
        this.adrian.add(torso);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.14, 32, 32);
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.set(0, 1.2, -0.25);
        head.scale.set(1, 1.1, 1);
        head.rotation.x = 0.3; // Looking down at journal
        head.castShadow = true;
        this.adrian.add(head);
        this.adrianHead = head;
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x1a0a00 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.25, -0.22);
        hair.rotation.x = 0.2;
        this.adrian.add(hair);
        
        // Writing arm (right) extended to desk
        const armGeometry = new THREE.CapsuleGeometry(0.04, 0.35, 4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.2, 0.85, -0.3);
        rightArm.rotation.x = 1.2;
        rightArm.rotation.z = -0.2;
        this.adrian.add(rightArm);
        this.writingArm = rightArm;
        
        // Left arm resting on desk
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.2, 0.85, -0.25);
        leftArm.rotation.x = 1.0;
        leftArm.rotation.z = 0.2;
        this.adrian.add(leftArm);
        
        // Hand holding pen
        const handGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const hand = new THREE.Mesh(handGeometry, skinMaterial);
        hand.position.set(0.15, 0.78, -0.5);
        this.adrian.add(hand);
        
        // Pen
        const penGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 6);
        const penMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const pen = new THREE.Mesh(penGeometry, penMaterial);
        pen.position.set(0.15, 0.78, -0.52);
        pen.rotation.x = 0.8;
        pen.rotation.z = 0.3;
        this.adrian.add(pen);
        this.pen = pen;
        
        this.adrian.position.set(0, 0, 0.3);
        this.scene.add(this.adrian);
    }
    
    createJournal() {
        // Open journal on desk
        const journalGroup = new THREE.Group();
        
        // Left page
        const pageGeometry = new THREE.PlaneGeometry(0.25, 0.35);
        const pageMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f0e0,
            roughness: 0.9,
            side: THREE.DoubleSide
        });
        
        const leftPage = new THREE.Mesh(pageGeometry, pageMaterial);
        leftPage.position.set(-0.13, 0, 0);
        leftPage.rotation.x = -Math.PI / 2;
        journalGroup.add(leftPage);
        
        // Right page
        const rightPage = new THREE.Mesh(pageGeometry, pageMaterial);
        rightPage.position.set(0.13, 0, 0);
        rightPage.rotation.x = -Math.PI / 2;
        journalGroup.add(rightPage);
        
        // Spine
        const spineGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.35);
        const spineMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3020 });
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.rotation.x = -Math.PI / 2;
        journalGroup.add(spine);
        
        // Cover edges
        const coverGeometry = new THREE.BoxGeometry(0.26, 0.01, 0.36);
        const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2515 });
        
        const leftCover = new THREE.Mesh(coverGeometry, coverMaterial);
        leftCover.position.set(-0.14, -0.01, 0);
        journalGroup.add(leftCover);
        
        const rightCover = new THREE.Mesh(coverGeometry, coverMaterial);
        rightCover.position.set(0.14, -0.01, 0);
        journalGroup.add(rightCover);
        
        journalGroup.position.set(0, 0.78, -0.55);
        this.scene.add(journalGroup);
        this.journal = journalGroup;
    }
    
    createLighting() {
        // Candle light (warm, flickering)
        this.candleLight = new THREE.PointLight(0xffaa44, 1.5, 5);
        this.candleLight.position.set(-0.5, 1, -0.5);
        this.candleLight.castShadow = true;
        this.candleLight.shadow.mapSize.width = 512;
        this.candleLight.shadow.mapSize.height = 512;
        this.scene.add(this.candleLight);
        
        // Dim window light (cold blue moonlight)
        const windowLight = new THREE.SpotLight(0x4466aa, 0.3);
        windowLight.position.set(2, 3, -1);
        windowLight.target.position.set(0, 0, 0);
        this.scene.add(windowLight);
        this.scene.add(windowLight.target);
        
        // Very dim ambient
        const ambientLight = new THREE.AmbientLight(0x1a1520, 0.3);
        this.scene.add(ambientLight);
    }
    
    createDustParticles() {
        this.dustCanvas = document.createElement('canvas');
        this.dustCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        `;
        this.container.appendChild(this.dustCanvas);
        this.dustCtx = this.dustCanvas.getContext('2d');
        this.dustCanvas.width = window.innerWidth;
        this.dustCanvas.height = window.innerHeight;
        
        // Create dust particles
        this.dustParticles = [];
        for (let i = 0; i < 40; i++) {
            this.dustParticles.push({
                x: Math.random() * this.dustCanvas.width,
                y: Math.random() * this.dustCanvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: Math.random() * 0.2 + 0.1,
                opacity: Math.random() * 0.4 + 0.1
            });
        }
    }
    
    addStyles() {
        if (document.getElementById('prologue2-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'prologue2-styles';
        style.textContent = `
            @keyframes journalFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes writingCursor {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .journal-header {
                font-size: 1.4em;
                color: #8b7759;
                margin-bottom: 15px;
                font-weight: bold;
                border-bottom: 1px solid rgba(139, 119, 89, 0.3);
                padding-bottom: 8px;
                animation: journalFadeIn 1s ease forwards;
            }
            
            .journal-entry {
                font-size: 1.1em;
                color: #a69578;
                line-height: 1.8;
                font-style: italic;
                margin-bottom: 8px;
                animation: journalFadeIn 1s ease forwards;
            }
            
            .writing-cursor {
                display: inline-block;
                width: 2px;
                height: 1em;
                background: #8b7759;
                margin-left: 3px;
                animation: writingCursor 1s infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.dustCanvas) {
            this.dustCanvas.width = window.innerWidth;
            this.dustCanvas.height = window.innerHeight;
        }
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Fade in
        setTimeout(() => {
            this.fadeOverlay.style.opacity = '0';
        }, 100);
        
        this.animate();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        try {
            const elapsed = (Date.now() - this.startTime) / 1000;
            
            // Update journal entries
            this.updateJournalEntries(elapsed);
            
            // Animate scene
            this.updateAnimations(elapsed);
            
            // Update dust
            this.updateDust();
            
            // Render
            this.renderer.render(this.scene, this.camera);
            
            // Check completion
            if (elapsed >= this.duration / 1000) {
                this.complete();
                return;
            }
            
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } catch (error) {
            console.error('Prologue2Animation error:', error);
            // Continue animation despite error
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }
    
    updateJournalEntries(elapsed) {
        for (const entry of this.journalEntries) {
            if (elapsed >= entry.time && !this.displayedEntries.has(entry.time)) {
                this.displayedEntries.add(entry.time);
                this.addJournalEntry(entry.text, entry.style);
            }
        }
    }
    
    addJournalEntry(text, style) {
        // Remove writing cursor from previous entry
        const existingCursor = this.journalOverlay.querySelector('.writing-cursor');
        if (existingCursor) existingCursor.remove();
        
        const entry = document.createElement('div');
        entry.className = `journal-${style}`;
        entry.innerHTML = text + '<span class="writing-cursor"></span>';
        this.journalOverlay.appendChild(entry);
        
        // Scroll to bottom
        this.journalOverlay.scrollTop = this.journalOverlay.scrollHeight;
        
        // Limit visible entries - fade out old ones
        const children = Array.from(this.journalOverlay.children);
        if (children.length > 6) {
            const toRemove = children.slice(0, children.length - 6);
            toRemove.forEach(el => {
                if (!el.classList.contains('fading-out')) {
                    el.classList.add('fading-out');
                    el.style.opacity = '0';
                    el.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        if (el.parentNode) el.remove();
                    }, 500);
                }
            });
        }
    }
    
    updateAnimations(time) {
        // Candle flicker
        if (this.candleLight) {
            this.candleLight.intensity = 1.5 + Math.sin(time * 10) * 0.2 + Math.random() * 0.1;
        }
        
        // Flame flicker
        if (this.flame) {
            this.flame.scale.y = 1.5 + Math.sin(time * 15) * 0.2;
            this.flame.scale.x = 1 + Math.sin(time * 12) * 0.1;
        }
        
        // Writing arm subtle movement
        if (this.writingArm) {
            this.writingArm.rotation.z = -0.2 + Math.sin(time * 3) * 0.05;
        }
        
        // Pen movement
        if (this.pen) {
            this.pen.position.x = 0.15 + Math.sin(time * 4) * 0.02;
        }
        
        // Subtle breathing for Adrian
        if (this.adrian) {
            this.adrian.position.y = Math.sin(time * 1.5) * 0.005;
        }
        
        // Camera very subtle sway
        if (this.camera) {
            this.camera.position.x = Math.sin(time * 0.3) * 0.05;
            this.camera.position.y = 1.8 + Math.sin(time * 0.4) * 0.02;
        }
    }
    
    updateDust() {
        if (!this.dustCtx) return;
        
        const w = this.dustCanvas.width;
        const h = this.dustCanvas.height;
        
        this.dustCtx.clearRect(0, 0, w, h);
        
        this.dustParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.y > h) {
                p.y = 0;
                p.x = Math.random() * w;
            }
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            
            this.dustCtx.beginPath();
            this.dustCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.dustCtx.fillStyle = `rgba(180, 160, 130, ${p.opacity})`;
            this.dustCtx.fill();
        });
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.removeEventListener('keydown', this.keyHandler);
        
        // Fade out
        this.fadeOverlay.style.transition = 'opacity 1.5s ease';
        this.fadeOverlay.style.opacity = '1';
        
        setTimeout(() => {
            if (this.renderer) this.renderer.dispose();
            if (this.scene) {
                this.scene.traverse((object) => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(m => m.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }
            
            this.container.remove();
            const styleEl = document.getElementById('prologue2-styles');
            if (styleEl) styleEl.remove();
            
            if (this.onComplete) this.onComplete();
        }, 1500);
    }
}
