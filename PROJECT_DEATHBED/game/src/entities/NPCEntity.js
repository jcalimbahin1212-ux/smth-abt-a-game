/**
 * PROJECT DEATHBED - NPC Entity
 * Enhanced non-player characters with detailed models, textures, and visual effects
 */

import * as THREE from 'three';
import { textureGenerator } from '../utils/TextureGenerator.js';

export class NPCEntity {
    constructor(options) {
        this.name = options.name || 'NPC';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || 0;
        this.bodyColor = options.bodyColor || 0x6a6a75; // Slightly lighter
        this.skinColor = options.skinColor || 0xdac4a4; // Warmer, lighter skin
        this.hairColor = options.hairColor || 0x3a2a18;
        this.isGlowing = options.isGlowing || false;
        this.glowColor = options.glowColor || 0xd4b247; // Warmer amber
        this.glowIntensity = options.glowIntensity || 0.4;
        this.dialogues = options.dialogues || [];
        this.currentDialogueIndex = 0;
        this.interactionRadius = options.interactionRadius || 3;
        this.isInteractable = true;
        this.height = options.height || 1.75;
        
        // Animation state
        this.breathingPhase = Math.random() * Math.PI * 2;
        this.blinkTimer = 0;
        this.isBlinking = false;
        
        // Get textures
        this.skinTexture = textureGenerator.getTexture('skin', { 
            color: { r: 218, g: 196, b: 164 } 
        });
        this.fabricTexture = textureGenerator.getTexture('fabric', {
            color: { r: 90, g: 90, b: 100 }
        });
        
        // Create the NPC model
        this.createModel();
    }
    
    createModel() {
        this.group = new THREE.Group();
        
        // For Luis lying down, we create a detailed lying figure
        if (this.name === 'Luis') {
            this.createDetailedLyingFigure();
        } else {
            this.createDetailedStandingFigure();
        }
        
        this.group.position.copy(this.position);
        this.group.rotation.y = this.rotation;
        
        // Store reference for interaction
        this.group.userData.npc = this;
    }
    
    createDetailedLyingFigure() {
        // === TORSO ===
        const torsoGeometry = new THREE.BoxGeometry(0.35, 0.18, 0.55);
        torsoGeometry.translate(0, 0, 0); // Center properly
        
        const torsoMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            map: this.fabricTexture,
            roughness: 0.75,
            metalness: 0.02
        });
        
        if (this.isGlowing) {
            torsoMaterial.emissive = new THREE.Color(this.glowColor);
            torsoMaterial.emissiveIntensity = this.glowIntensity;
        }
        
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 0.12, 0);
        torso.castShadow = true;
        this.group.add(torso);
        this.body = torso;
        
        // === HEAD ===
        const headGroup = new THREE.Group();
        
        // Skull shape
        const headGeometry = new THREE.SphereGeometry(0.11, 24, 24);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.skinColor,
            roughness: 0.7,
            metalness: 0.0
        });
        
        if (this.isGlowing) {
            headMaterial.emissive = new THREE.Color(this.glowColor);
            headMaterial.emissiveIntensity = this.glowIntensity * 0.3;
        }
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(1, 1.1, 1);
        headGroup.add(head);
        this.head = head;
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.115, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: this.hairColor,
            roughness: 0.9
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.02;
        hair.rotation.x = -0.2;
        headGroup.add(hair);
        
        // Eyes (closed - Luis is resting)
        const eyeGeometry = new THREE.SphereGeometry(0.015, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.035, 0.02, 0.09);
        leftEye.scale.set(2, 0.3, 1);
        headGroup.add(leftEye);
        this.leftEye = leftEye;
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.035, 0.02, 0.09);
        rightEye.scale.set(2, 0.3, 1);
        headGroup.add(rightEye);
        this.rightEye = rightEye;
        
        // Nose
        const noseGeometry = new THREE.ConeGeometry(0.015, 0.03, 8);
        const noseMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0, 0.1);
        nose.rotation.x = Math.PI / 2;
        headGroup.add(nose);
        
        // Mouth line
        const mouthGeometry = new THREE.BoxGeometry(0.04, 0.003, 0.005);
        const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5a5a });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.04, 0.095);
        headGroup.add(mouth);
        
        // Ears
        const earGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const earMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.11, 0, 0);
        leftEar.scale.set(0.4, 1, 0.7);
        headGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.11, 0, 0);
        rightEar.scale.set(0.4, 1, 0.7);
        headGroup.add(rightEar);
        
        headGroup.position.set(0.35, 0.15, 0);
        headGroup.rotation.z = -0.1; // Slight head tilt
        this.group.add(headGroup);
        this.headGroup = headGroup;
        
        // === ARMS ===
        const armGeometry = new THREE.CapsuleGeometry(0.04, 0.25, 8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            roughness: 0.85
        });
        
        // Left arm (resting on chest)
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.1, 0.18, -0.15);
        leftArm.rotation.set(0, 0, Math.PI / 3);
        leftArm.castShadow = true;
        this.group.add(leftArm);
        
        // Right arm (by side)
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.15, 0.08, 0.2);
        rightArm.rotation.z = Math.PI / 2;
        rightArm.castShadow = true;
        this.group.add(rightArm);
        
        // Hands
        const handGeometry = new THREE.SphereGeometry(0.035, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(0.22, 0.22, -0.1);
        leftHand.scale.set(1, 0.6, 0.8);
        this.group.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(-0.28, 0.08, 0.2);
        rightHand.scale.set(1, 0.6, 0.8);
        this.group.add(rightHand);
        
        // === LEGS ===
        const legGeometry = new THREE.CapsuleGeometry(0.055, 0.4, 8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a45,
            roughness: 0.85
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.35, 0.08, -0.1);
        leftLeg.rotation.z = Math.PI / 2;
        leftLeg.castShadow = true;
        this.group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.35, 0.08, 0.1);
        rightLeg.rotation.z = Math.PI / 2;
        rightLeg.castShadow = true;
        this.group.add(rightLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(0.1, 0.04, 0.06);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.8 });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.6, 0.05, -0.1);
        this.group.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(-0.6, 0.05, 0.1);
        this.group.add(rightFoot);
        
        // === BLANKET ===
        const blanketGeometry = new THREE.BoxGeometry(0.6, 0.06, 0.5);
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.95
        });
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        blanket.position.set(-0.1, 0.2, 0);
        blanket.castShadow = true;
        this.group.add(blanket);
        
        // === PILLOW ===
        const pillowGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.25);
        const pillowMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a8a7a,
            roughness: 0.9
        });
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        pillow.position.set(0.42, 0.05, 0);
        this.group.add(pillow);
        
        // === GLOW EFFECTS for Luis ===
        if (this.isGlowing) {
            this.createGlowEffects();
        }
    }
    
    createGlowEffects() {
        // Glowing vein lines
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.glowColor,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.veins = [];
        
        // Arm veins
        const veinGeometry = new THREE.CylinderGeometry(0.004, 0.004, 0.15, 6);
        
        const veinPositions = [
            { pos: [0.0, 0.15, -0.15], rot: [0, 0, Math.PI / 4] },
            { pos: [-0.2, 0.1, 0.15], rot: [0, 0, Math.PI / 2.5] },
            { pos: [0.1, 0.13, 0.08], rot: [0, Math.PI / 4, Math.PI / 3] }
        ];
        
        veinPositions.forEach(v => {
            const vein = new THREE.Mesh(veinGeometry, glowMaterial.clone());
            vein.position.set(...v.pos);
            vein.rotation.set(...v.rot);
            this.group.add(vein);
            this.veins.push(vein);
        });
        
        // Subtle body glow aura
        const auraGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: this.glowColor,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.position.set(0, 0.15, 0);
        aura.scale.set(1.5, 0.5, 1);
        this.group.add(aura);
        this.aura = aura;
        
        // Point light from Luis
        const luisLight = new THREE.PointLight(this.glowColor, 0.5, 3, 2);
        luisLight.position.set(0, 0.3, 0);
        this.group.add(luisLight);
        this.luisLight = luisLight;
    }
    
    createDetailedStandingFigure() {
        const scale = this.height / 1.75;
        
        // === TORSO ===
        const torsoGeometry = new THREE.CapsuleGeometry(0.18 * scale, 0.35 * scale, 8, 16);
        const torsoMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            roughness: 0.8,
            metalness: 0.05
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 1.0 * scale;
        torso.castShadow = true;
        this.group.add(torso);
        this.body = torso;
        
        // Shoulders
        const shoulderGeometry = new THREE.SphereGeometry(0.08 * scale, 12, 12);
        const shoulderMaterial = new THREE.MeshStandardMaterial({ color: this.bodyColor, roughness: 0.8 });
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.22 * scale, 1.2 * scale, 0);
        this.group.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.22 * scale, 1.2 * scale, 0);
        this.group.add(rightShoulder);
        
        // === HEAD ===
        const headGroup = new THREE.Group();
        
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.1 * scale, 12);
        const neckMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = -0.12 * scale;
        headGroup.add(neck);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.12 * scale, 24, 24);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.skinColor,
            roughness: 0.65,
            metalness: 0.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(1, 1.15, 1);
        headGroup.add(head);
        this.head = head;
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.125 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: this.hairColor,
            roughness: 0.9
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.02 * scale;
        headGroup.add(hair);
        
        // Face features
        // Eyes
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.018 * scale, 12, 12);
        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.04 * scale, 0.02 * scale, 0.1 * scale);
        headGroup.add(leftEyeWhite);
        
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.04 * scale, 0.02 * scale, 0.1 * scale);
        headGroup.add(rightEyeWhite);
        
        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.008 * scale, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.2 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.04 * scale, 0.02 * scale, 0.115 * scale);
        headGroup.add(leftPupil);
        this.leftPupil = leftPupil;
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.04 * scale, 0.02 * scale, 0.115 * scale);
        headGroup.add(rightPupil);
        this.rightPupil = rightPupil;
        
        // Eyebrows
        const eyebrowGeometry = new THREE.BoxGeometry(0.03 * scale, 0.006 * scale, 0.008 * scale);
        const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: this.hairColor });
        
        const leftBrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftBrow.position.set(-0.04 * scale, 0.05 * scale, 0.1 * scale);
        leftBrow.rotation.z = 0.1;
        headGroup.add(leftBrow);
        
        const rightBrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightBrow.position.set(0.04 * scale, 0.05 * scale, 0.1 * scale);
        rightBrow.rotation.z = -0.1;
        headGroup.add(rightBrow);
        
        // Nose
        const noseGeometry = new THREE.ConeGeometry(0.015 * scale, 0.035 * scale, 8);
        const noseMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, -0.01 * scale, 0.11 * scale);
        nose.rotation.x = Math.PI / 2;
        headGroup.add(nose);
        
        // Mouth
        const mouthGeometry = new THREE.BoxGeometry(0.035 * scale, 0.008 * scale, 0.005 * scale);
        const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x9a6a6a });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.045 * scale, 0.1 * scale);
        headGroup.add(mouth);
        
        // Ears
        const earGeometry = new THREE.SphereGeometry(0.025 * scale, 8, 8);
        const earMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.115 * scale, 0, 0);
        leftEar.scale.set(0.4, 1, 0.7);
        headGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.115 * scale, 0, 0);
        rightEar.scale.set(0.4, 1, 0.7);
        headGroup.add(rightEar);
        
        headGroup.position.y = 1.5 * scale;
        this.group.add(headGroup);
        this.headGroup = headGroup;
        
        // === ARMS ===
        const armGeometry = new THREE.CapsuleGeometry(0.045 * scale, 0.25 * scale, 8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: this.bodyColor, roughness: 0.8 });
        
        // Upper arms
        const leftUpperArm = new THREE.Mesh(armGeometry, armMaterial);
        leftUpperArm.position.set(-0.28 * scale, 1.0 * scale, 0);
        leftUpperArm.rotation.z = 0.15;
        leftUpperArm.castShadow = true;
        this.group.add(leftUpperArm);
        
        const rightUpperArm = new THREE.Mesh(armGeometry, armMaterial);
        rightUpperArm.position.set(0.28 * scale, 1.0 * scale, 0);
        rightUpperArm.rotation.z = -0.15;
        rightUpperArm.castShadow = true;
        this.group.add(rightUpperArm);
        
        // Forearms
        const forearmGeometry = new THREE.CapsuleGeometry(0.035 * scale, 0.2 * scale, 8, 8);
        
        const leftForearm = new THREE.Mesh(forearmGeometry, armMaterial);
        leftForearm.position.set(-0.32 * scale, 0.7 * scale, 0);
        leftForearm.castShadow = true;
        this.group.add(leftForearm);
        
        const rightForearm = new THREE.Mesh(forearmGeometry, armMaterial);
        rightForearm.position.set(0.32 * scale, 0.7 * scale, 0);
        rightForearm.castShadow = true;
        this.group.add(rightForearm);
        
        // Hands
        const handGeometry = new THREE.SphereGeometry(0.04 * scale, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: this.skinColor, roughness: 0.7 });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.32 * scale, 0.5 * scale, 0);
        leftHand.scale.set(0.8, 1, 0.6);
        this.group.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.32 * scale, 0.5 * scale, 0);
        rightHand.scale.set(0.8, 1, 0.6);
        this.group.add(rightHand);
        
        // === LEGS ===
        const legGeometry = new THREE.CapsuleGeometry(0.065 * scale, 0.35 * scale, 8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a45,
            roughness: 0.85
        });
        
        // Upper legs
        const leftUpperLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftUpperLeg.position.set(-0.1 * scale, 0.55 * scale, 0);
        leftUpperLeg.castShadow = true;
        this.group.add(leftUpperLeg);
        
        const rightUpperLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightUpperLeg.position.set(0.1 * scale, 0.55 * scale, 0);
        rightUpperLeg.castShadow = true;
        this.group.add(rightUpperLeg);
        
        // Lower legs
        const lowerLegGeometry = new THREE.CapsuleGeometry(0.05 * scale, 0.3 * scale, 8, 8);
        
        const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        leftLowerLeg.position.set(-0.1 * scale, 0.2 * scale, 0);
        leftLowerLeg.castShadow = true;
        this.group.add(leftLowerLeg);
        
        const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        rightLowerLeg.position.set(0.1 * scale, 0.2 * scale, 0);
        rightLowerLeg.castShadow = true;
        this.group.add(rightLowerLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(0.08 * scale, 0.04 * scale, 0.15 * scale);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.8 });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.1 * scale, 0.02 * scale, 0.03 * scale);
        this.group.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.1 * scale, 0.02 * scale, 0.03 * scale);
        this.group.add(rightFoot);
    }
    
    addToScene(scene) {
        scene.add(this.group);
    }
    
    removeFromScene(scene) {
        scene.remove(this.group);
    }
    
    update(deltaTime) {
        // Subtle breathing animation
        this.breathingPhase += deltaTime * 1.2;
        
        if (this.body) {
            const breathScale = 1 + Math.sin(this.breathingPhase) * 0.015;
            if (this.name === 'Luis') {
                this.body.scale.y = breathScale;
            } else {
                this.body.scale.x = breathScale;
                this.body.scale.z = breathScale;
            }
        }
        
        // Head subtle movement
        if (this.headGroup && this.name !== 'Luis') {
            this.headGroup.rotation.y = Math.sin(this.breathingPhase * 0.3) * 0.05;
        }
        
        // Blink animation for standing NPCs
        if (this.leftPupil && this.rightPupil) {
            this.blinkTimer += deltaTime;
            if (this.blinkTimer > 3 + Math.random() * 2) {
                this.isBlinking = true;
                this.blinkTimer = 0;
            }
            if (this.isBlinking) {
                this.leftPupil.scale.y = 0.1;
                this.rightPupil.scale.y = 0.1;
                setTimeout(() => {
                    if (this.leftPupil && this.rightPupil) {
                        this.leftPupil.scale.y = 1;
                        this.rightPupil.scale.y = 1;
                        this.isBlinking = false;
                    }
                }, 150);
            }
        }
        
        // Pulse glow for touched characters
        if (this.isGlowing) {
            const pulseIntensity = this.glowIntensity * (0.7 + Math.sin(this.breathingPhase * 0.8) * 0.4);
            
            if (this.body && this.body.material.emissiveIntensity !== undefined) {
                this.body.material.emissiveIntensity = pulseIntensity;
            }
            
            if (this.head && this.head.material.emissiveIntensity !== undefined) {
                this.head.material.emissiveIntensity = pulseIntensity * 0.4;
            }
            
            // Pulse veins
            if (this.veins) {
                this.veins.forEach((vein, i) => {
                    vein.material.opacity = 0.4 + Math.sin(this.breathingPhase * 2 + i * 0.5) * 0.3;
                });
            }
            
            // Pulse aura
            if (this.aura) {
                this.aura.material.opacity = 0.05 + Math.sin(this.breathingPhase * 0.5) * 0.04;
            }
            
            // Pulse light
            if (this.luisLight) {
                this.luisLight.intensity = 0.3 + Math.sin(this.breathingPhase * 0.7) * 0.2;
            }
        }
    }
    
    setDialogue(dialogueTree) {
        this.dialogueTree = dialogueTree;
    }
    
    getDialogue(id) {
        if (this.dialogueTree) {
            return id ? this.dialogueTree[id] : this.dialogueTree.greeting;
        }
        if (id) {
            return this.dialogues.find(d => d.id === id);
        }
        return this.dialogues[0];
    }
    
    getPosition() {
        return this.group.position;
    }
    
    distanceTo(point) {
        return this.group.position.distanceTo(point);
    }
    
    isInRange(point) {
        return this.distanceTo(point) <= this.interactionRadius;
    }
    
    interact(game) {
        const dialogue = this.getDialogue();
        if (dialogue) {
            game.dialogueSystem.startDialogue(this, dialogue);
        }
    }
    
    highlight(enabled) {
        if (this.body && this.body.material) {
            if (enabled) {
                this.body.material.emissive = new THREE.Color(0x3a3a2a);
            } else if (!this.isGlowing) {
                this.body.material.emissive = new THREE.Color(0x000000);
            }
        }
    }
}
