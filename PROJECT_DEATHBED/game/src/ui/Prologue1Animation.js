/**
 * PROJECT DEATHBED - Prologue 1: "What Once Was"
 * An animated memory of Luis and Adrian before the Light
 * Shows them as brothers playing together, then the flash occurs
 */

import * as THREE from 'three';

export class Prologue1Animation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 45000; // 45 seconds
        this.animationFrame = null;
        
        // Three.js scene for 3D animation
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Characters
        this.luis = null;
        this.adrian = null;
        
        // Animation phases
        this.phases = [
            { start: 0, end: 3, type: 'fade_in' },
            { start: 3, end: 8, type: 'title', text: 'Six months ago...' },
            { start: 8, end: 12, type: 'scene_intro' },
            { start: 12, end: 18, type: 'brothers_playing' },
            { start: 18, end: 24, type: 'dialogue', speaker: 'Luis', text: '"Race you to the old oak tree!"' },
            { start: 24, end: 30, type: 'brothers_running' },
            { start: 30, end: 36, type: 'dialogue', speaker: 'Adrian', text: '"You always win, you know that?"' },
            { start: 36, end: 40, type: 'happy_moment' },
            { start: 40, end: 42, type: 'flash_warning' },
            { start: 42, end: 44, type: 'the_light' },
            { start: 44, end: 45, type: 'fade_out' }
        ];
        
        this.currentPhase = null;
        this.lastPhase = null;
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'prologue1-animation';
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
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Beautiful blue sky
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 1, 0);
        
        // Create the idyllic outdoor scene
        this.createOutdoorScene();
        
        // Create Luis and Adrian models
        this.createLuisModel();
        this.createAdrianModel();
        
        // Add lighting
        this.createLighting();
        
        // Text overlay container
        this.textOverlay = document.createElement('div');
        this.textOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            z-index: 10;
            font-family: 'Georgia', serif;
        `;
        this.container.appendChild(this.textOverlay);
        
        // Flash overlay (for the Light)
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            opacity: 0;
            pointer-events: none;
            z-index: 20;
        `;
        this.container.appendChild(this.flashOverlay);
        
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
        
        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.innerHTML = 'skip →';
        this.skipButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: rgba(255, 255, 255, 0.6);
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
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
        
        document.body.appendChild(this.container);
        
        // Show skip button after 3 seconds
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 3000);
        
        // Keyboard skip
        this.keyHandler = (e) => {
            if (e.code === 'Escape') {
                this.skip();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }
    
    createOutdoorScene() {
        // Ground - green grass
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d8c40,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add grass patches
        for (let i = 0; i < 200; i++) {
            const grassBladeGeometry = new THREE.ConeGeometry(0.02, 0.15, 4);
            const grassMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.3, 0.6, 0.3 + Math.random() * 0.2)
            });
            const grass = new THREE.Mesh(grassBladeGeometry, grassMaterial);
            grass.position.set(
                (Math.random() - 0.5) * 30,
                0.075,
                (Math.random() - 0.5) * 30
            );
            this.scene.add(grass);
        }
        
        // Old oak tree
        this.createTree(8, 0, -5, 3);
        
        // More trees in background
        this.createTree(-15, 0, -10, 2);
        this.createTree(12, 0, -15, 2.5);
        this.createTree(-8, 0, -20, 2);
        
        // Flowers scattered
        for (let i = 0; i < 50; i++) {
            this.createFlower(
                (Math.random() - 0.5) * 25,
                0,
                (Math.random() - 0.5) * 25
            );
        }
        
        // Clouds
        for (let i = 0; i < 8; i++) {
            this.createCloud(
                (Math.random() - 0.5) * 80,
                15 + Math.random() * 10,
                -30 - Math.random() * 30
            );
        }
        
        // Sun
        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF80
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(20, 25, -40);
        this.scene.add(this.sun);
    }
    
    createTree(x, y, z, scale = 1) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2 * scale, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = scale;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Foliage (multiple spheres)
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
        
        const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 16, 16), foliageMaterial);
        foliage1.position.set(0, 2.5 * scale, 0);
        foliage1.castShadow = true;
        treeGroup.add(foliage1);
        
        const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 16, 16), foliageMaterial);
        foliage2.position.set(0.6 * scale, 3 * scale, 0.3 * scale);
        treeGroup.add(foliage2);
        
        const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(0.8 * scale, 16, 16), foliageMaterial);
        foliage3.position.set(-0.5 * scale, 2.8 * scale, -0.4 * scale);
        treeGroup.add(foliage3);
        
        treeGroup.position.set(x, y, z);
        this.scene.add(treeGroup);
    }
    
    createFlower(x, y, z) {
        const flowerGroup = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.075;
        flowerGroup.add(stem);
        
        // Petals
        const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6bff];
        const petalColor = colors[Math.floor(Math.random() * colors.length)];
        const petalGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });
        
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(Math.cos(angle) * 0.03, 0.15, Math.sin(angle) * 0.03);
            flowerGroup.add(petal);
        }
        
        // Center
        const centerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.15;
        flowerGroup.add(center);
        
        flowerGroup.position.set(x, y, z);
        this.scene.add(flowerGroup);
    }
    
    createCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        const cloudMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        
        // Multiple spheres for fluffy cloud
        for (let i = 0; i < 5; i++) {
            const size = 1 + Math.random() * 2;
            const cloudPart = new THREE.Mesh(
                new THREE.SphereGeometry(size, 16, 16),
                cloudMaterial
            );
            cloudPart.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 2
            );
            cloudGroup.add(cloudPart);
        }
        
        cloudGroup.position.set(x, y, z);
        this.scene.add(cloudGroup);
        
        return cloudGroup;
    }
    
    createLighting() {
        // Bright sunlight
        const sunLight = new THREE.DirectionalLight(0xffffd0, 1.5);
        sunLight.position.set(20, 30, -20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.camera.left = -30;
        sunLight.shadow.camera.right = 30;
        sunLight.shadow.camera.top = 30;
        sunLight.shadow.camera.bottom = -30;
        this.scene.add(sunLight);
        this.sunLight = sunLight;
        
        // Sky ambient light
        const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.6);
        this.scene.add(ambientLight);
        
        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3d8c40, 0.4);
        this.scene.add(hemiLight);
    }
    
    createLuisModel() {
        this.luis = new THREE.Group();
        
        // Luis is younger here, healthy, wearing casual clothes
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.5, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db }); // Blue shirt
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.85;
        body.castShadow = true;
        this.luis.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.35;
        head.scale.set(1, 1.1, 1);
        head.castShadow = true;
        this.luis.add(head);
        this.luisHead = head;
        
        // Hair - youthful, full
        const hairGeometry = new THREE.SphereGeometry(0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.38;
        hair.rotation.x = -0.15;
        this.luis.add(hair);
        
        // Eyes - bright and alive
        const eyeGeometry = new THREE.SphereGeometry(0.025, 16, 16);
        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });
        
        // Left eye
        const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.05, 1.37, 0.12);
        leftEyeWhite.scale.set(1, 1, 0.5);
        this.luis.add(leftEyeWhite);
        
        const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyePupilMaterial);
        leftPupil.position.set(-0.05, 1.37, 0.14);
        this.luis.add(leftPupil);
        
        // Right eye
        const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.05, 1.37, 0.12);
        rightEyeWhite.scale.set(1, 1, 0.5);
        this.luis.add(rightEyeWhite);
        
        const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyePupilMaterial);
        rightPupil.position.set(0.05, 1.37, 0.14);
        this.luis.add(rightPupil);
        
        // Smile
        const smileGeometry = new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI);
        const smileMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5a5a });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.28, 0.12);
        smile.rotation.x = Math.PI;
        this.luis.add(smile);
        
        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.05, 0.3, 4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.3, 0.9, 0);
        leftArm.rotation.z = 0.3;
        this.luis.add(leftArm);
        this.luisLeftArm = leftArm;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.3, 0.9, 0);
        rightArm.rotation.z = -0.3;
        this.luis.add(rightArm);
        this.luisRightArm = rightArm;
        
        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.07, 0.4, 4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 }); // Dark jeans
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1, 0.35, 0);
        this.luis.add(leftLeg);
        this.luisLeftLeg = leftLeg;
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.1, 0.35, 0);
        this.luis.add(rightLeg);
        this.luisRightLeg = rightLeg;
        
        this.luis.position.set(-2, 0, 2);
        this.scene.add(this.luis);
    }
    
    createAdrianModel() {
        this.adrian = new THREE.Group();
        
        // Adrian (the player character) - slightly taller, protective older brother vibe
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.22, 0.55, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x27ae60 }); // Green shirt
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        this.adrian.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.16, 32, 32);
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.45;
        head.scale.set(1, 1.1, 1);
        head.castShadow = true;
        this.adrian.add(head);
        this.adrianHead = head;
        
        // Hair - darker, slightly messy
        const hairGeometry = new THREE.SphereGeometry(0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x1a0a00 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.49;
        hair.rotation.x = -0.1;
        this.adrian.add(hair);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.025, 16, 16);
        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1a08 });
        
        const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.055, 1.47, 0.13);
        leftEyeWhite.scale.set(1, 1, 0.5);
        this.adrian.add(leftEyeWhite);
        
        const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), eyePupilMaterial);
        leftPupil.position.set(-0.055, 1.47, 0.15);
        this.adrian.add(leftPupil);
        
        const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.055, 1.47, 0.13);
        rightEyeWhite.scale.set(1, 1, 0.5);
        this.adrian.add(rightEyeWhite);
        
        const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), eyePupilMaterial);
        rightPupil.position.set(0.055, 1.47, 0.15);
        this.adrian.add(rightPupil);
        
        // Slight smile
        const smileGeometry = new THREE.TorusGeometry(0.035, 0.007, 8, 16, Math.PI * 0.8);
        const smileMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5a5a });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.37, 0.13);
        smile.rotation.x = Math.PI;
        this.adrian.add(smile);
        
        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.055, 0.35, 4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xdac4a4 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.32, 0.95, 0);
        leftArm.rotation.z = 0.3;
        this.adrian.add(leftArm);
        this.adrianLeftArm = leftArm;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.32, 0.95, 0);
        rightArm.rotation.z = -0.3;
        this.adrian.add(rightArm);
        this.adrianRightArm = rightArm;
        
        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.08, 0.45, 4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e }); // Dark pants
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.12, 0.38, 0);
        this.adrian.add(leftLeg);
        this.adrianLeftLeg = leftLeg;
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.12, 0.38, 0);
        this.adrian.add(rightLeg);
        this.adrianRightLeg = rightLeg;
        
        this.adrian.position.set(2, 0, 2);
        this.scene.add(this.adrian);
    }
    
    addStyles() {
        if (document.getElementById('prologue1-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'prologue1-styles';
        style.textContent = `
            @keyframes prologueFadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes prologuePulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            .prologue-title {
                font-size: 3em;
                color: #fff;
                text-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
                letter-spacing: 0.2em;
                animation: prologueFadeIn 2s ease forwards;
            }
            
            .prologue-dialogue {
                font-size: 2em;
                color: #fff;
                font-style: italic;
                text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
                animation: prologueFadeIn 1s ease forwards;
                max-width: 80%;
                text-align: center;
            }
            
            .prologue-speaker {
                font-size: 1.2em;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 10px;
                letter-spacing: 0.3em;
                text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);
    }
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Find current phase
        const phase = this.phases.find(p => elapsed >= p.start && elapsed < p.end);
        
        if (phase && phase !== this.lastPhase) {
            this.lastPhase = phase;
            this.executePhase(phase, elapsed);
        }
        
        // Update animations
        this.updateCharacterAnimations(elapsed, phase);
        this.updateCameraAnimation(elapsed, phase);
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Check completion
        if (elapsed >= this.duration / 1000) {
            this.complete();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    executePhase(phase, time) {
        // Clear text overlay
        if (phase.type !== 'dialogue') {
            this.textOverlay.innerHTML = '';
        }
        
        switch (phase.type) {
            case 'title':
                this.textOverlay.innerHTML = `<div class="prologue-title">${phase.text}</div>`;
                break;
                
            case 'dialogue':
                this.textOverlay.innerHTML = `
                    <div class="prologue-speaker">${phase.speaker}</div>
                    <div class="prologue-dialogue">${phase.text}</div>
                `;
                break;
                
            case 'flash_warning':
                // Subtle flash warning
                this.flashOverlay.style.transition = 'opacity 0.5s ease';
                this.flashOverlay.style.opacity = '0.3';
                setTimeout(() => {
                    this.flashOverlay.style.opacity = '0';
                }, 500);
                break;
                
            case 'the_light':
                // THE FLASH - intense white
                this.flashOverlay.style.transition = 'opacity 0.3s ease';
                this.flashOverlay.style.opacity = '1';
                
                // Change sky color
                this.scene.background = new THREE.Color(0xffffff);
                break;
                
            case 'fade_out':
                this.fadeOverlay.style.transition = 'opacity 1s ease';
                this.fadeOverlay.style.opacity = '1';
                break;
        }
    }
    
    updateCharacterAnimations(time, phase) {
        if (!this.luis || !this.adrian) return;
        
        const phaseType = phase ? phase.type : 'scene_intro';
        
        // Running animation during certain phases
        if (phaseType === 'brothers_running' || phaseType === 'brothers_playing') {
            const runSpeed = 8;
            const bobAmount = 0.1;
            
            // Luis running toward the tree
            this.luis.position.x += 0.03;
            this.luis.position.y = Math.abs(Math.sin(time * runSpeed)) * bobAmount;
            
            // Leg animation
            this.luisLeftLeg.rotation.x = Math.sin(time * runSpeed) * 0.5;
            this.luisRightLeg.rotation.x = -Math.sin(time * runSpeed) * 0.5;
            
            // Arm swing
            this.luisLeftArm.rotation.x = -Math.sin(time * runSpeed) * 0.4;
            this.luisRightArm.rotation.x = Math.sin(time * runSpeed) * 0.4;
            
            // Adrian chasing
            this.adrian.position.x += 0.025;
            this.adrian.position.y = Math.abs(Math.sin(time * runSpeed + 0.5)) * bobAmount;
            
            this.adrianLeftLeg.rotation.x = Math.sin(time * runSpeed + 0.5) * 0.5;
            this.adrianRightLeg.rotation.x = -Math.sin(time * runSpeed + 0.5) * 0.5;
            
            this.adrianLeftArm.rotation.x = -Math.sin(time * runSpeed + 0.5) * 0.4;
            this.adrianRightArm.rotation.x = Math.sin(time * runSpeed + 0.5) * 0.4;
        } else if (phaseType === 'happy_moment') {
            // Standing together, gentle sway
            this.luis.position.y = Math.sin(time * 2) * 0.02;
            this.adrian.position.y = Math.sin(time * 2 + 1) * 0.02;
            
            // Reset leg rotations
            this.luisLeftLeg.rotation.x = 0;
            this.luisRightLeg.rotation.x = 0;
            this.adrianLeftLeg.rotation.x = 0;
            this.adrianRightLeg.rotation.x = 0;
        } else {
            // Idle breathing
            this.luis.position.y = Math.sin(time * 1.5) * 0.01;
            this.adrian.position.y = Math.sin(time * 1.5 + 0.5) * 0.01;
        }
    }
    
    updateCameraAnimation(time, phase) {
        const phaseType = phase ? phase.type : 'scene_intro';
        
        if (phaseType === 'brothers_running') {
            // Camera follows the action
            this.camera.position.x = this.luis.position.x - 3;
            this.camera.lookAt(
                (this.luis.position.x + this.adrian.position.x) / 2,
                1,
                (this.luis.position.z + this.adrian.position.z) / 2
            );
        } else if (phaseType === 'happy_moment') {
            // Close up on both brothers
            this.camera.position.set(
                (this.luis.position.x + this.adrian.position.x) / 2,
                1.5,
                5
            );
            this.camera.lookAt(
                (this.luis.position.x + this.adrian.position.x) / 2,
                1.2,
                0
            );
        } else if (phaseType === 'the_light') {
            // Look up at the sky
            this.camera.lookAt(0, 20, -20);
        } else {
            // Gentle sway
            this.camera.position.x = Math.sin(time * 0.2) * 0.5;
            this.camera.position.y = 2 + Math.sin(time * 0.3) * 0.1;
        }
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
        this.fadeOverlay.style.transition = 'opacity 1s ease';
        this.fadeOverlay.style.opacity = '1';
        
        setTimeout(() => {
            // Clean up Three.js
            if (this.renderer) {
                this.renderer.dispose();
            }
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
            const styleEl = document.getElementById('prologue1-styles');
            if (styleEl) styleEl.remove();
            
            if (this.onComplete) this.onComplete();
        }, 1000);
    }
}
