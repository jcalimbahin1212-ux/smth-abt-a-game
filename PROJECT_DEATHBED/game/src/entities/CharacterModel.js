/**
 * PROJECT DEATHBED - Improved Character Model
 * Realistic human proportions with hands, detailed body, and varied hair styles
 */

import * as THREE from 'three';

export class CharacterModel {
    constructor(options = {}) {
        this.group = new THREE.Group();
        
        // Character customization options
        this.skinColor = options.skinColor || 0xc4a484;
        this.hairColor = options.hairColor || 0x2a1a0a;
        this.shirtColor = options.shirtColor || 0x3a5f7d;
        this.pantsColor = options.pantsColor || 0x2d2d2d;
        this.shoeColor = options.shoeColor || 0x1a1a1a;
        this.hairStyle = options.hairStyle || 'short'; // 'short', 'medium', 'long', 'wavy', 'spiky', 'slickedBack', 'bald'
        this.height = options.height || 1.8;
        this.bodyType = options.bodyType || 'average'; // 'slim', 'average', 'athletic', 'heavy'
        this.gender = options.gender || 'male';
        this.isGlowing = options.isGlowing || false;
        this.glowColor = options.glowColor || 0xd4b247;
        this.glowIntensity = options.glowIntensity || 0.4;
        
        // Body part references for animation
        this.head = null;
        this.neck = null;
        this.torso = null;
        this.leftArm = null;
        this.rightArm = null;
        this.leftHand = null;
        this.rightHand = null;
        this.leftLeg = null;
        this.rightLeg = null;
        this.body = null; // Main body reference for highlighting
        
        // Animation state
        this.breathingPhase = Math.random() * Math.PI * 2;
        
        this.createModel();
    }
    
    createModel() {
        const scale = this.height / 1.8;
        
        // Calculate body proportions based on body type
        let torsoWidth, torsoDepth, shoulderWidth, hipWidth, armThickness, legThickness;
        
        switch (this.bodyType) {
            case 'slim':
                torsoWidth = 0.32;
                torsoDepth = 0.18;
                shoulderWidth = 0.38;
                hipWidth = 0.28;
                armThickness = 0.035;
                legThickness = 0.055;
                break;
            case 'athletic':
                torsoWidth = 0.42;
                torsoDepth = 0.24;
                shoulderWidth = 0.5;
                hipWidth = 0.34;
                armThickness = 0.05;
                legThickness = 0.075;
                break;
            case 'heavy':
                torsoWidth = 0.48;
                torsoDepth = 0.32;
                shoulderWidth = 0.52;
                hipWidth = 0.44;
                armThickness = 0.055;
                legThickness = 0.085;
                break;
            default: // average
                torsoWidth = 0.38;
                torsoDepth = 0.22;
                shoulderWidth = 0.44;
                hipWidth = 0.32;
                armThickness = 0.042;
                legThickness = 0.065;
        }
        
        // Materials
        const skinMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor,
            roughness: 0.7,
            metalness: 0.0
        });
        
        const hairMaterial = new THREE.MeshStandardMaterial({ 
            color: this.hairColor,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const shirtMaterial = new THREE.MeshStandardMaterial({ 
            color: this.shirtColor,
            roughness: 0.75,
            metalness: 0.0
        });
        
        const pantsMaterial = new THREE.MeshStandardMaterial({ 
            color: this.pantsColor,
            roughness: 0.8,
            metalness: 0.0
        });
        
        const shoeMaterial = new THREE.MeshStandardMaterial({ 
            color: this.shoeColor,
            roughness: 0.6,
            metalness: 0.1
        });
        
        // Apply glow if enabled
        if (this.isGlowing) {
            skinMaterial.emissive = new THREE.Color(this.glowColor);
            skinMaterial.emissiveIntensity = this.glowIntensity * 0.3;
            shirtMaterial.emissive = new THREE.Color(this.glowColor);
            shirtMaterial.emissiveIntensity = this.glowIntensity;
        }
        
        // === TORSO ===
        this.createTorso(scale, torsoWidth, torsoDepth, shoulderWidth, shirtMaterial, pantsMaterial);
        
        // === NECK ===
        this.createNeck(scale, skinMaterial);
        
        // === HEAD ===
        this.createHead(scale, skinMaterial, hairMaterial);
        
        // === ARMS ===
        this.createArms(scale, shoulderWidth, armThickness, skinMaterial, shirtMaterial);
        
        // === LEGS ===
        this.createLegs(scale, hipWidth, legThickness, pantsMaterial, shoeMaterial, skinMaterial);
    }
    
    createTorso(scale, torsoWidth, torsoDepth, shoulderWidth, shirtMaterial, pantsMaterial) {
        const torsoGroup = new THREE.Group();
        
        // Upper chest - broader at shoulders
        const chestShape = new THREE.Shape();
        const chestWidth = shoulderWidth * scale;
        const chestDepth = torsoDepth * scale;
        
        // Create a more realistic chest using multiple segments
        const upperChestGeo = new THREE.BoxGeometry(
            shoulderWidth * scale, 
            0.22 * scale, 
            torsoDepth * scale
        );
        // Round the edges slightly
        const upperChest = new THREE.Mesh(upperChestGeo, shirtMaterial);
        upperChest.position.y = 1.32 * scale;
        upperChest.castShadow = true;
        torsoGroup.add(upperChest);
        
        // Mid chest
        const midChestGeo = new THREE.BoxGeometry(
            (shoulderWidth * 0.95) * scale,
            0.15 * scale,
            (torsoDepth * 0.95) * scale
        );
        const midChest = new THREE.Mesh(midChestGeo, shirtMaterial);
        midChest.position.y = 1.15 * scale;
        midChest.castShadow = true;
        torsoGroup.add(midChest);
        
        // Abdomen - narrower
        const abdomenGeo = new THREE.BoxGeometry(
            torsoWidth * scale,
            0.18 * scale,
            (torsoDepth * 0.9) * scale
        );
        const abdomen = new THREE.Mesh(abdomenGeo, shirtMaterial);
        abdomen.position.y = 0.98 * scale;
        abdomen.castShadow = true;
        torsoGroup.add(abdomen);
        
        // Waist
        const waistGeo = new THREE.BoxGeometry(
            (torsoWidth * 0.9) * scale,
            0.12 * scale,
            (torsoDepth * 0.85) * scale
        );
        const waist = new THREE.Mesh(waistGeo, shirtMaterial);
        waist.position.y = 0.84 * scale;
        waist.castShadow = true;
        torsoGroup.add(waist);
        
        // Hips/Pelvis
        const hipsGeo = new THREE.BoxGeometry(
            (torsoWidth * 0.95) * scale,
            0.15 * scale,
            (torsoDepth * 0.9) * scale
        );
        const hips = new THREE.Mesh(hipsGeo, pantsMaterial);
        hips.position.y = 0.72 * scale;
        hips.castShadow = true;
        torsoGroup.add(hips);
        
        // Shoulder joints (rounded)
        const shoulderGeo = new THREE.SphereGeometry(0.065 * scale, 12, 12);
        
        const leftShoulder = new THREE.Mesh(shoulderGeo, shirtMaterial);
        leftShoulder.position.set(-(shoulderWidth/2) * scale, 1.38 * scale, 0);
        leftShoulder.castShadow = true;
        torsoGroup.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeo, shirtMaterial);
        rightShoulder.position.set((shoulderWidth/2) * scale, 1.38 * scale, 0);
        rightShoulder.castShadow = true;
        torsoGroup.add(rightShoulder);
        
        this.torso = torsoGroup;
        this.body = upperChest; // Reference for highlighting
        this.group.add(torsoGroup);
    }
    
    createNeck(scale, skinMaterial) {
        const neckGeo = new THREE.CylinderGeometry(
            0.055 * scale, 
            0.065 * scale, 
            0.1 * scale, 
            12
        );
        const neck = new THREE.Mesh(neckGeo, skinMaterial);
        neck.position.y = 1.48 * scale;
        neck.castShadow = true;
        this.neck = neck;
        this.group.add(neck);
    }
    
    createHead(scale, skinMaterial, hairMaterial) {
        const headGroup = new THREE.Group();
        
        // Main head shape - slightly elongated sphere
        const headGeo = new THREE.SphereGeometry(0.11 * scale, 24, 24);
        const headMesh = new THREE.Mesh(headGeo, skinMaterial);
        headMesh.scale.set(1, 1.1, 0.95);
        headMesh.position.y = 1.62 * scale;
        headMesh.castShadow = true;
        headGroup.add(headMesh);
        
        // Jaw/chin area - gives more realistic face shape
        const jawGeo = new THREE.SphereGeometry(0.08 * scale, 12, 12);
        const jaw = new THREE.Mesh(jawGeo, skinMaterial);
        jaw.scale.set(0.9, 0.6, 0.8);
        jaw.position.set(0, 1.54 * scale, 0.03 * scale);
        headGroup.add(jaw);
        
        // === FACIAL FEATURES ===
        
        // Eye sockets (slight indentation)
        const eyeSocketGeo = new THREE.SphereGeometry(0.022 * scale, 8, 8);
        const eyeSocketMat = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.9
        });
        
        // Left eye
        const leftEyeSocket = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
        leftEyeSocket.position.set(-0.038 * scale, 1.64 * scale, 0.085 * scale);
        headGroup.add(leftEyeSocket);
        
        // Right eye
        const rightEyeSocket = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
        rightEyeSocket.position.set(0.038 * scale, 1.64 * scale, 0.085 * scale);
        headGroup.add(rightEyeSocket);
        
        // Eyeballs
        const eyeGeo = new THREE.SphereGeometry(0.018 * scale, 12, 12);
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ 
            color: 0xf5f5f5,
            roughness: 0.3
        });
        
        const leftEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
        leftEyeWhite.position.set(-0.038 * scale, 1.64 * scale, 0.09 * scale);
        headGroup.add(leftEyeWhite);
        
        const rightEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
        rightEyeWhite.position.set(0.038 * scale, 1.64 * scale, 0.09 * scale);
        headGroup.add(rightEyeWhite);
        
        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.008 * scale, 8, 8);
        const pupilMat = new THREE.MeshStandardMaterial({ 
            color: 0x2a1a0a,
            roughness: 0.5
        });
        
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.038 * scale, 1.64 * scale, 0.105 * scale);
        headGroup.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.038 * scale, 1.64 * scale, 0.105 * scale);
        headGroup.add(rightPupil);
        
        // Eyebrows
        const eyebrowGeo = new THREE.BoxGeometry(0.04 * scale, 0.008 * scale, 0.015 * scale);
        const eyebrowMat = new THREE.MeshStandardMaterial({ 
            color: this.hairColor,
            roughness: 0.9
        });
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
        leftEyebrow.position.set(-0.038 * scale, 1.68 * scale, 0.09 * scale);
        leftEyebrow.rotation.z = 0.15;
        headGroup.add(leftEyebrow);
        
        const rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
        rightEyebrow.position.set(0.038 * scale, 1.68 * scale, 0.09 * scale);
        rightEyebrow.rotation.z = -0.15;
        headGroup.add(rightEyebrow);
        
        // Nose - more detailed
        const noseGroup = new THREE.Group();
        
        // Nose bridge
        const noseBridgeGeo = new THREE.BoxGeometry(0.018 * scale, 0.04 * scale, 0.025 * scale);
        const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMaterial);
        noseBridge.position.set(0, 1.62 * scale, 0.1 * scale);
        noseGroup.add(noseBridge);
        
        // Nose tip
        const noseTipGeo = new THREE.SphereGeometry(0.015 * scale, 8, 8);
        const noseTip = new THREE.Mesh(noseTipGeo, skinMaterial);
        noseTip.scale.set(1.2, 0.8, 1);
        noseTip.position.set(0, 1.58 * scale, 0.115 * scale);
        noseGroup.add(noseTip);
        
        // Nostrils
        const nostrilGeo = new THREE.SphereGeometry(0.006 * scale, 6, 6);
        const nostrilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        
        const leftNostril = new THREE.Mesh(nostrilGeo, nostrilMat);
        leftNostril.position.set(-0.01 * scale, 1.565 * scale, 0.11 * scale);
        noseGroup.add(leftNostril);
        
        const rightNostril = new THREE.Mesh(nostrilGeo, nostrilMat);
        rightNostril.position.set(0.01 * scale, 1.565 * scale, 0.11 * scale);
        noseGroup.add(rightNostril);
        
        headGroup.add(noseGroup);
        
        // Mouth
        const mouthGeo = new THREE.BoxGeometry(0.04 * scale, 0.012 * scale, 0.008 * scale);
        const mouthMat = new THREE.MeshStandardMaterial({ 
            color: 0x8b5a5a,
            roughness: 0.6
        });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 1.52 * scale, 0.095 * scale);
        headGroup.add(mouth);
        
        // Ears
        const earGeo = new THREE.SphereGeometry(0.025 * scale, 8, 8);
        
        const leftEar = new THREE.Mesh(earGeo, skinMaterial);
        leftEar.scale.set(0.4, 1, 0.6);
        leftEar.position.set(-0.11 * scale, 1.62 * scale, 0);
        headGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeo, skinMaterial);
        rightEar.scale.set(0.4, 1, 0.6);
        rightEar.position.set(0.11 * scale, 1.62 * scale, 0);
        headGroup.add(rightEar);
        
        // === HAIR ===
        this.createHairStyle(headGroup, scale, hairMaterial);
        
        this.head = headGroup;
        this.group.add(headGroup);
    }
    
    createHairStyle(headGroup, scale, hairMaterial) {
        switch (this.hairStyle) {
            case 'short':
                this.createShortHair(headGroup, scale, hairMaterial);
                break;
            case 'medium':
                this.createMediumHair(headGroup, scale, hairMaterial);
                break;
            case 'long':
                this.createLongHair(headGroup, scale, hairMaterial);
                break;
            case 'wavy':
                this.createWavyHair(headGroup, scale, hairMaterial);
                break;
            case 'spiky':
                this.createSpikyHair(headGroup, scale, hairMaterial);
                break;
            case 'slickedBack':
                this.createSlickedBackHair(headGroup, scale, hairMaterial);
                break;
            case 'bald':
                // No hair
                break;
            default:
                this.createShortHair(headGroup, scale, hairMaterial);
        }
    }
    
    createShortHair(headGroup, scale, hairMaterial) {
        // Top hair - layered cap
        const topGeo = new THREE.SphereGeometry(0.115 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const topHair = new THREE.Mesh(topGeo, hairMaterial);
        topHair.position.y = 1.66 * scale;
        topHair.castShadow = true;
        headGroup.add(topHair);
        
        // Sides - textured look with small segments
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const sideGeo = new THREE.BoxGeometry(0.025 * scale, 0.06 * scale, 0.02 * scale);
            const sideHair = new THREE.Mesh(sideGeo, hairMaterial);
            sideHair.position.set(
                Math.cos(angle) * 0.1 * scale,
                1.66 * scale,
                Math.sin(angle) * 0.09 * scale
            );
            sideHair.rotation.y = angle;
            headGroup.add(sideHair);
        }
        
        // Back hair
        const backGeo = new THREE.BoxGeometry(0.18 * scale, 0.08 * scale, 0.03 * scale);
        const backHair = new THREE.Mesh(backGeo, hairMaterial);
        backHair.position.set(0, 1.62 * scale, -0.09 * scale);
        headGroup.add(backHair);
    }
    
    createMediumHair(headGroup, scale, hairMaterial) {
        // Top
        const topGeo = new THREE.SphereGeometry(0.12 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const topHair = new THREE.Mesh(topGeo, hairMaterial);
        topHair.position.y = 1.67 * scale;
        headGroup.add(topHair);
        
        // Side hair - longer
        const sideGeo = new THREE.BoxGeometry(0.03 * scale, 0.15 * scale, 0.08 * scale);
        
        const leftSide = new THREE.Mesh(sideGeo, hairMaterial);
        leftSide.position.set(-0.095 * scale, 1.58 * scale, 0.02 * scale);
        headGroup.add(leftSide);
        
        const rightSide = new THREE.Mesh(sideGeo, hairMaterial);
        rightSide.position.set(0.095 * scale, 1.58 * scale, 0.02 * scale);
        headGroup.add(rightSide);
        
        // Back - medium length
        const backGeo = new THREE.BoxGeometry(0.2 * scale, 0.18 * scale, 0.04 * scale);
        const backHair = new THREE.Mesh(backGeo, hairMaterial);
        backHair.position.set(0, 1.55 * scale, -0.08 * scale);
        headGroup.add(backHair);
        
        // Fringe
        const fringeGeo = new THREE.BoxGeometry(0.16 * scale, 0.04 * scale, 0.03 * scale);
        const fringe = new THREE.Mesh(fringeGeo, hairMaterial);
        fringe.position.set(0, 1.72 * scale, 0.08 * scale);
        fringe.rotation.x = 0.3;
        headGroup.add(fringe);
    }
    
    createLongHair(headGroup, scale, hairMaterial) {
        // Top
        const topGeo = new THREE.SphereGeometry(0.125 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const topHair = new THREE.Mesh(topGeo, hairMaterial);
        topHair.position.y = 1.68 * scale;
        headGroup.add(topHair);
        
        // Long side strands
        const strandGeo = new THREE.BoxGeometry(0.04 * scale, 0.4 * scale, 0.06 * scale);
        
        const leftStrand = new THREE.Mesh(strandGeo, hairMaterial);
        leftStrand.position.set(-0.1 * scale, 1.42 * scale, 0.02 * scale);
        headGroup.add(leftStrand);
        
        const rightStrand = new THREE.Mesh(strandGeo, hairMaterial);
        rightStrand.position.set(0.1 * scale, 1.42 * scale, 0.02 * scale);
        headGroup.add(rightStrand);
        
        // Long back
        const backGeo = new THREE.BoxGeometry(0.22 * scale, 0.45 * scale, 0.05 * scale);
        const backHair = new THREE.Mesh(backGeo, hairMaterial);
        backHair.position.set(0, 1.4 * scale, -0.08 * scale);
        headGroup.add(backHair);
        
        // Additional back layers
        const backLayer2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.18 * scale, 0.35 * scale, 0.03 * scale),
            hairMaterial
        );
        backLayer2.position.set(0, 1.45 * scale, -0.1 * scale);
        headGroup.add(backLayer2);
    }
    
    createWavyHair(headGroup, scale, hairMaterial) {
        // Top base
        const topGeo = new THREE.SphereGeometry(0.12 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const topHair = new THREE.Mesh(topGeo, hairMaterial);
        topHair.position.y = 1.68 * scale;
        headGroup.add(topHair);
        
        // Wavy strands around the head
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const isBack = angle > Math.PI * 0.3 && angle < Math.PI * 1.7;
            const length = isBack ? 0.25 : 0.15;
            
            const strandGeo = new THREE.CylinderGeometry(
                0.015 * scale, 
                0.012 * scale, 
                length * scale, 
                6
            );
            const strand = new THREE.Mesh(strandGeo, hairMaterial);
            
            const x = Math.cos(angle) * 0.1 * scale;
            const z = Math.sin(angle) * 0.09 * scale;
            const waveOffset = Math.sin(i * 0.8) * 0.02 * scale;
            
            strand.position.set(x + waveOffset, 1.58 * scale - (length/2) * scale, z);
            strand.rotation.z = Math.cos(angle) * 0.3;
            strand.rotation.x = -Math.sin(angle) * 0.3;
            
            headGroup.add(strand);
        }
    }
    
    createSpikyHair(headGroup, scale, hairMaterial) {
        // Base
        const baseGeo = new THREE.SphereGeometry(0.11 * scale, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const baseHair = new THREE.Mesh(baseGeo, hairMaterial);
        baseHair.position.y = 1.66 * scale;
        headGroup.add(baseHair);
        
        // Spikes
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const heightVar = Math.random() * 0.03 + 0.06;
            
            const spikeGeo = new THREE.ConeGeometry(0.015 * scale, heightVar * scale, 4);
            const spike = new THREE.Mesh(spikeGeo, hairMaterial);
            
            const radius = 0.08 + Math.random() * 0.02;
            spike.position.set(
                Math.cos(angle) * radius * scale,
                1.74 * scale + Math.random() * 0.02 * scale,
                Math.sin(angle) * (radius * 0.85) * scale
            );
            
            // Point outward and up
            spike.rotation.x = -Math.sin(angle) * 0.6;
            spike.rotation.z = Math.cos(angle) * 0.6;
            
            headGroup.add(spike);
        }
        
        // Central spikes pointing up
        for (let i = 0; i < 5; i++) {
            const spikeGeo = new THREE.ConeGeometry(0.012 * scale, 0.1 * scale, 4);
            const spike = new THREE.Mesh(spikeGeo, hairMaterial);
            spike.position.set(
                (Math.random() - 0.5) * 0.06 * scale,
                1.78 * scale,
                (Math.random() - 0.5) * 0.04 * scale
            );
            spike.rotation.x = (Math.random() - 0.5) * 0.4;
            spike.rotation.z = (Math.random() - 0.5) * 0.4;
            headGroup.add(spike);
        }
    }
    
    createSlickedBackHair(headGroup, scale, hairMaterial) {
        // Slicked back top
        const topGeo = new THREE.SphereGeometry(0.115 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45);
        const topHair = new THREE.Mesh(topGeo, hairMaterial);
        topHair.position.y = 1.67 * scale;
        topHair.position.z = -0.02 * scale;
        headGroup.add(topHair);
        
        // Smooth sides
        const sideGeo = new THREE.BoxGeometry(0.02 * scale, 0.1 * scale, 0.12 * scale);
        
        const leftSide = new THREE.Mesh(sideGeo, hairMaterial);
        leftSide.position.set(-0.1 * scale, 1.62 * scale, -0.02 * scale);
        headGroup.add(leftSide);
        
        const rightSide = new THREE.Mesh(sideGeo, hairMaterial);
        rightSide.position.set(0.1 * scale, 1.62 * scale, -0.02 * scale);
        headGroup.add(rightSide);
        
        // Back
        const backGeo = new THREE.BoxGeometry(0.2 * scale, 0.15 * scale, 0.04 * scale);
        const backHair = new THREE.Mesh(backGeo, hairMaterial);
        backHair.position.set(0, 1.58 * scale, -0.1 * scale);
        headGroup.add(backHair);
    }
    
    createArms(scale, shoulderWidth, armThickness, skinMaterial, shirtMaterial) {
        // === LEFT ARM ===
        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-(shoulderWidth/2 + 0.04) * scale, 1.35 * scale, 0);
        
        // Upper arm (with sleeve)
        const upperArmGeo = new THREE.CylinderGeometry(
            (armThickness + 0.01) * scale,
            armThickness * scale,
            0.28 * scale,
            10
        );
        const leftUpperArm = new THREE.Mesh(upperArmGeo, shirtMaterial);
        leftUpperArm.position.y = -0.14 * scale;
        leftUpperArm.castShadow = true;
        leftArmGroup.add(leftUpperArm);
        
        // Elbow joint
        const elbowGeo = new THREE.SphereGeometry(armThickness * scale, 8, 8);
        const leftElbow = new THREE.Mesh(elbowGeo, skinMaterial);
        leftElbow.position.y = -0.28 * scale;
        leftArmGroup.add(leftElbow);
        
        // Forearm
        const forearmGeo = new THREE.CylinderGeometry(
            armThickness * scale,
            (armThickness * 0.85) * scale,
            0.26 * scale,
            10
        );
        const leftForearm = new THREE.Mesh(forearmGeo, skinMaterial);
        leftForearm.position.y = -0.43 * scale;
        leftForearm.castShadow = true;
        leftArmGroup.add(leftForearm);
        
        // Wrist
        const wristGeo = new THREE.SphereGeometry((armThickness * 0.7) * scale, 6, 6);
        const leftWrist = new THREE.Mesh(wristGeo, skinMaterial);
        leftWrist.position.y = -0.56 * scale;
        leftArmGroup.add(leftWrist);
        
        // Hand
        const leftHandGroup = this.createHand(scale, skinMaterial);
        leftHandGroup.position.y = -0.62 * scale;
        leftArmGroup.add(leftHandGroup);
        this.leftHand = leftHandGroup;
        
        this.leftArm = leftArmGroup;
        this.group.add(leftArmGroup);
        
        // === RIGHT ARM ===
        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set((shoulderWidth/2 + 0.04) * scale, 1.35 * scale, 0);
        
        const rightUpperArm = new THREE.Mesh(upperArmGeo.clone(), shirtMaterial);
        rightUpperArm.position.y = -0.14 * scale;
        rightUpperArm.castShadow = true;
        rightArmGroup.add(rightUpperArm);
        
        const rightElbow = new THREE.Mesh(elbowGeo.clone(), skinMaterial);
        rightElbow.position.y = -0.28 * scale;
        rightArmGroup.add(rightElbow);
        
        const rightForearm = new THREE.Mesh(forearmGeo.clone(), skinMaterial);
        rightForearm.position.y = -0.43 * scale;
        rightForearm.castShadow = true;
        rightArmGroup.add(rightForearm);
        
        const rightWrist = new THREE.Mesh(wristGeo.clone(), skinMaterial);
        rightWrist.position.y = -0.56 * scale;
        rightArmGroup.add(rightWrist);
        
        const rightHandGroup = this.createHand(scale, skinMaterial);
        rightHandGroup.position.y = -0.62 * scale;
        rightArmGroup.add(rightHandGroup);
        this.rightHand = rightHandGroup;
        
        this.rightArm = rightArmGroup;
        this.group.add(rightArmGroup);
    }
    
    createHand(scale, skinMaterial) {
        const handGroup = new THREE.Group();
        
        // Palm
        const palmGeo = new THREE.BoxGeometry(0.055 * scale, 0.07 * scale, 0.025 * scale);
        const palm = new THREE.Mesh(palmGeo, skinMaterial);
        palm.castShadow = true;
        handGroup.add(palm);
        
        // Fingers
        const fingerPositions = [
            { x: -0.018, length: 0.045, radius: 0.007 },  // Index
            { x: -0.006, length: 0.05, radius: 0.007 },   // Middle
            { x: 0.006, length: 0.045, radius: 0.007 },   // Ring
            { x: 0.018, length: 0.038, radius: 0.006 }    // Pinky
        ];
        
        fingerPositions.forEach(finger => {
            // Finger base
            const fingerGeo = new THREE.CylinderGeometry(
                finger.radius * scale,
                (finger.radius * 0.9) * scale,
                finger.length * scale,
                6
            );
            const fingerMesh = new THREE.Mesh(fingerGeo, skinMaterial);
            fingerMesh.position.set(
                finger.x * scale,
                -(0.035 + finger.length/2) * scale,
                0
            );
            handGroup.add(fingerMesh);
            
            // Fingertip
            const tipGeo = new THREE.SphereGeometry((finger.radius * 0.85) * scale, 6, 6);
            const tip = new THREE.Mesh(tipGeo, skinMaterial);
            tip.position.set(
                finger.x * scale,
                -(0.035 + finger.length) * scale,
                0
            );
            handGroup.add(tip);
        });
        
        // Thumb
        const thumbGroup = new THREE.Group();
        
        // Thumb base
        const thumbBaseGeo = new THREE.CylinderGeometry(0.009 * scale, 0.008 * scale, 0.025 * scale, 6);
        const thumbBase = new THREE.Mesh(thumbBaseGeo, skinMaterial);
        thumbBase.position.y = -0.012 * scale;
        thumbGroup.add(thumbBase);
        
        // Thumb tip
        const thumbTipGeo = new THREE.CylinderGeometry(0.008 * scale, 0.006 * scale, 0.022 * scale, 6);
        const thumbTip = new THREE.Mesh(thumbTipGeo, skinMaterial);
        thumbTip.position.y = -0.035 * scale;
        thumbGroup.add(thumbTip);
        
        // Thumb nail area
        const thumbNailGeo = new THREE.SphereGeometry(0.006 * scale, 6, 6);
        const thumbNail = new THREE.Mesh(thumbNailGeo, skinMaterial);
        thumbNail.position.y = -0.048 * scale;
        thumbGroup.add(thumbNail);
        
        thumbGroup.position.set(-0.032 * scale, -0.01 * scale, 0.008 * scale);
        thumbGroup.rotation.z = Math.PI / 4;
        thumbGroup.rotation.x = -0.2;
        handGroup.add(thumbGroup);
        
        return handGroup;
    }
    
    createLegs(scale, hipWidth, legThickness, pantsMaterial, shoeMaterial, skinMaterial) {
        // === LEFT LEG ===
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-(hipWidth/2 - 0.04) * scale, 0.65 * scale, 0);
        
        // Thigh
        const thighGeo = new THREE.CylinderGeometry(
            legThickness * scale,
            (legThickness * 0.9) * scale,
            0.42 * scale,
            10
        );
        const leftThigh = new THREE.Mesh(thighGeo, pantsMaterial);
        leftThigh.position.y = -0.21 * scale;
        leftThigh.castShadow = true;
        leftLegGroup.add(leftThigh);
        
        // Knee
        const kneeGeo = new THREE.SphereGeometry((legThickness * 0.85) * scale, 8, 8);
        const leftKnee = new THREE.Mesh(kneeGeo, pantsMaterial);
        leftKnee.position.y = -0.42 * scale;
        leftLegGroup.add(leftKnee);
        
        // Shin/calf
        const shinGeo = new THREE.CylinderGeometry(
            (legThickness * 0.85) * scale,
            (legThickness * 0.65) * scale,
            0.4 * scale,
            10
        );
        const leftShin = new THREE.Mesh(shinGeo, pantsMaterial);
        leftShin.position.y = -0.62 * scale;
        leftShin.castShadow = true;
        leftLegGroup.add(leftShin);
        
        // Ankle
        const ankleGeo = new THREE.SphereGeometry((legThickness * 0.5) * scale, 6, 6);
        const leftAnkle = new THREE.Mesh(ankleGeo, skinMaterial);
        leftAnkle.position.y = -0.82 * scale;
        leftLegGroup.add(leftAnkle);
        
        // Foot/shoe
        const footGroup = this.createFoot(scale, shoeMaterial);
        footGroup.position.y = -0.88 * scale;
        leftLegGroup.add(footGroup);
        
        this.leftLeg = leftLegGroup;
        this.group.add(leftLegGroup);
        
        // === RIGHT LEG ===
        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set((hipWidth/2 - 0.04) * scale, 0.65 * scale, 0);
        
        const rightThigh = new THREE.Mesh(thighGeo.clone(), pantsMaterial);
        rightThigh.position.y = -0.21 * scale;
        rightThigh.castShadow = true;
        rightLegGroup.add(rightThigh);
        
        const rightKnee = new THREE.Mesh(kneeGeo.clone(), pantsMaterial);
        rightKnee.position.y = -0.42 * scale;
        rightLegGroup.add(rightKnee);
        
        const rightShin = new THREE.Mesh(shinGeo.clone(), pantsMaterial);
        rightShin.position.y = -0.62 * scale;
        rightShin.castShadow = true;
        rightLegGroup.add(rightShin);
        
        const rightAnkle = new THREE.Mesh(ankleGeo.clone(), skinMaterial);
        rightAnkle.position.y = -0.82 * scale;
        rightLegGroup.add(rightAnkle);
        
        const rightFootGroup = this.createFoot(scale, shoeMaterial);
        rightFootGroup.position.y = -0.88 * scale;
        rightLegGroup.add(rightFootGroup);
        
        this.rightLeg = rightLegGroup;
        this.group.add(rightLegGroup);
    }
    
    createFoot(scale, shoeMaterial) {
        const footGroup = new THREE.Group();
        
        // Main shoe body
        const shoeGeo = new THREE.BoxGeometry(0.08 * scale, 0.05 * scale, 0.16 * scale);
        const shoe = new THREE.Mesh(shoeGeo, shoeMaterial);
        shoe.position.z = 0.025 * scale;
        shoe.castShadow = true;
        footGroup.add(shoe);
        
        // Toe cap (rounded front)
        const toeGeo = new THREE.SphereGeometry(0.035 * scale, 8, 8);
        const toe = new THREE.Mesh(toeGeo, shoeMaterial);
        toe.scale.set(1.1, 0.7, 1.2);
        toe.position.set(0, -0.005 * scale, 0.09 * scale);
        footGroup.add(toe);
        
        // Heel
        const heelGeo = new THREE.BoxGeometry(0.06 * scale, 0.02 * scale, 0.04 * scale);
        const heel = new THREE.Mesh(heelGeo, shoeMaterial);
        heel.position.set(0, -0.025 * scale, -0.05 * scale);
        footGroup.add(heel);
        
        // Sole
        const soleGeo = new THREE.BoxGeometry(0.075 * scale, 0.015 * scale, 0.15 * scale);
        const soleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const sole = new THREE.Mesh(soleGeo, soleMat);
        sole.position.set(0, -0.03 * scale, 0.02 * scale);
        footGroup.add(sole);
        
        return footGroup;
    }
    
    // === ANIMATION METHODS ===
    
    setArmRotation(arm, x, y, z) {
        if (arm === 'left' && this.leftArm) {
            this.leftArm.rotation.set(x, y, z);
        } else if (arm === 'right' && this.rightArm) {
            this.rightArm.rotation.set(x, y, z);
        }
    }
    
    setLegRotation(leg, x, y, z) {
        if (leg === 'left' && this.leftLeg) {
            this.leftLeg.rotation.set(x, y, z);
        } else if (leg === 'right' && this.rightLeg) {
            this.rightLeg.rotation.set(x, y, z);
        }
    }
    
    setHeadRotation(x, y, z) {
        if (this.head) {
            this.head.rotation.set(x, y, z);
        }
    }
    
    animateWalk(time, speed = 1) {
        const swing = Math.sin(time * speed * 8) * 0.35;
        
        // Arms swing opposite to legs
        this.setArmRotation('left', swing, 0, 0);
        this.setArmRotation('right', -swing, 0, 0);
        
        // Legs
        this.setLegRotation('left', -swing * 0.7, 0, 0);
        this.setLegRotation('right', swing * 0.7, 0, 0);
        
        // Subtle torso sway
        if (this.torso) {
            this.torso.rotation.y = Math.sin(time * speed * 8) * 0.03;
        }
    }
    
    animateIdle(time) {
        // Subtle breathing
        const breathe = Math.sin(time * 1.5 + this.breathingPhase) * 0.015;
        if (this.torso) {
            this.torso.scale.y = 1 + breathe;
            this.torso.scale.x = 1 - breathe * 0.3;
        }
        
        // Very slight arm sway
        const sway = Math.sin(time * 0.8) * 0.02;
        this.setArmRotation('left', sway, 0, 0);
        this.setArmRotation('right', -sway, 0, 0);
    }
    
    animateReachOut(arm, progress) {
        // Smooth reach animation
        const eased = 1 - Math.pow(1 - progress, 3);
        const targetX = -Math.PI * 0.45; // Arm forward
        const targetZ = arm === 'left' ? 0.2 : -0.2; // Slight outward
        
        this.setArmRotation(arm, eased * targetX, 0, eased * targetZ);
    }
    
    animateKneel(progress) {
        const eased = 1 - Math.pow(1 - progress, 2);
        
        // Bend knees
        this.setLegRotation('left', eased * Math.PI * 0.4, 0, 0);
        this.setLegRotation('right', eased * Math.PI * 0.4, 0, 0);
        
        // Lower body
        this.group.position.y = -eased * 0.4;
        
        // Lean forward slightly
        if (this.torso) {
            this.torso.rotation.x = eased * 0.15;
        }
    }
    
    animateGripHead(progress) {
        const eased = 1 - Math.pow(1 - progress, 2);
        
        // Raise arms to grip head
        this.setArmRotation('left', -eased * Math.PI * 0.55, 0, eased * 0.6);
        this.setArmRotation('right', -eased * Math.PI * 0.55, 0, -eased * 0.6);
        
        // Tilt head down
        this.setHeadRotation(eased * 0.3, 0, 0);
    }
    
    // Utility
    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }
    
    setRotation(y) {
        this.group.rotation.y = y;
    }
    
    addToScene(scene) {
        scene.add(this.group);
    }
    
    removeFromScene(scene) {
        scene.remove(this.group);
    }
    
    highlight(enabled) {
        if (this.body && this.body.material) {
            if (enabled) {
                this.body.material.emissive = new THREE.Color(0x3a3a2a);
                this.body.material.emissiveIntensity = 0.3;
            } else if (!this.isGlowing) {
                this.body.material.emissive = new THREE.Color(0x000000);
                this.body.material.emissiveIntensity = 0;
            }
        }
    }
}
