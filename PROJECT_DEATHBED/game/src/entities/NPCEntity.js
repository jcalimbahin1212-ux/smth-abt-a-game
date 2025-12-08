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
        // === ENHANCED TORSO WITH CLOTHING DETAILS ===
        const torsoGeometry = new THREE.BoxGeometry(0.38, 0.20, 0.58);
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
        
        // Shirt collar detail
        const collarGeometry = new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI);
        const collarMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.8 });
        const collar = new THREE.Mesh(collarGeometry, collarMaterial);
        collar.position.set(0.19, 0.18, 0);
        collar.rotation.set(Math.PI / 2, 0, Math.PI / 2);
        this.group.add(collar);
        
        // === DETAILED HEAD ===
        const headGroup = new THREE.Group();
        
        // Skull shape - more refined
        const headGeometry = new THREE.SphereGeometry(0.115, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.skinColor,
            roughness: 0.6,
            metalness: 0.0
        });
        
        if (this.isGlowing) {
            headMaterial.emissive = new THREE.Color(this.glowColor);
            headMaterial.emissiveIntensity = this.glowIntensity * 0.3;
        }
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(1, 1.12, 0.95);
        headGroup.add(head);
        this.head = head;
        
        // === ENHANCED HAIR SYSTEM ===
        // Main hair volume
        const hairBaseGeometry = new THREE.SphereGeometry(0.12, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: this.hairColor,
            roughness: 0.95,
            metalness: 0.0
        });
        const hairBase = new THREE.Mesh(hairBaseGeometry, hairMaterial);
        hairBase.position.y = 0.025;
        hairBase.scale.set(1.02, 1, 1.02);
        headGroup.add(hairBase);
        
        // Hair strands for texture (multiple layers)
        const strandMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.hairColor).multiplyScalar(0.85),
            roughness: 0.9
        });
        
        // Front hair bangs
        const bangGeometry = new THREE.CapsuleGeometry(0.02, 0.06, 4, 8);
        for (let i = 0; i < 5; i++) {
            const bang = new THREE.Mesh(bangGeometry, strandMaterial);
            bang.position.set(-0.04 + i * 0.02, 0.06, 0.08);
            bang.rotation.set(0.4, 0, (i - 2) * 0.1);
            bang.scale.set(0.8, 1, 0.6);
            headGroup.add(bang);
        }
        
        // Side hair
        const sideHairGeometry = new THREE.CapsuleGeometry(0.025, 0.04, 4, 8);
        const leftSideHair = new THREE.Mesh(sideHairGeometry, strandMaterial);
        leftSideHair.position.set(-0.1, 0.02, 0.03);
        leftSideHair.rotation.z = 0.3;
        headGroup.add(leftSideHair);
        
        const rightSideHair = new THREE.Mesh(sideHairGeometry, strandMaterial);
        rightSideHair.position.set(0.1, 0.02, 0.03);
        rightSideHair.rotation.z = -0.3;
        headGroup.add(rightSideHair);
        
        // Hair tuft on top
        const tuftGeometry = new THREE.ConeGeometry(0.03, 0.05, 6);
        for (let i = 0; i < 3; i++) {
            const tuft = new THREE.Mesh(tuftGeometry, strandMaterial);
            tuft.position.set(-0.02 + i * 0.02, 0.12, -0.02 + i * 0.01);
            tuft.rotation.set(-0.2, i * 0.3, (i - 1) * 0.2);
            headGroup.add(tuft);
        }
        
        // === REFINED FACIAL FEATURES ===
        // Eyebrows
        const eyebrowGeometry = new THREE.BoxGeometry(0.035, 0.008, 0.01);
        const eyebrowMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.hairColor).multiplyScalar(0.9) 
        });
        
        const leftBrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftBrow.position.set(-0.035, 0.045, 0.095);
        leftBrow.rotation.z = 0.1;
        headGroup.add(leftBrow);
        
        const rightBrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightBrow.position.set(0.035, 0.045, 0.095);
        rightBrow.rotation.z = -0.1;
        headGroup.add(rightBrow);
        
        // Eye sockets (subtle depth)
        const socketGeometry = new THREE.SphereGeometry(0.022, 12, 12);
        const socketMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(0.85),
            roughness: 0.7 
        });
        
        const leftSocket = new THREE.Mesh(socketGeometry, socketMaterial);
        leftSocket.position.set(-0.035, 0.02, 0.085);
        leftSocket.scale.set(1, 0.7, 0.5);
        headGroup.add(leftSocket);
        
        const rightSocket = new THREE.Mesh(socketGeometry, socketMaterial);
        rightSocket.position.set(0.035, 0.02, 0.085);
        rightSocket.scale.set(1, 0.7, 0.5);
        headGroup.add(rightSocket);
        
        // Closed eyes (Luis is resting/unconscious)
        const eyelidGeometry = new THREE.SphereGeometry(0.018, 12, 12);
        const eyelidMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.6 
        });
        
        const leftEyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        leftEyelid.position.set(-0.035, 0.02, 0.092);
        leftEyelid.scale.set(1.2, 0.4, 0.6);
        headGroup.add(leftEyelid);
        this.leftEye = leftEyelid;
        
        const rightEyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        rightEyelid.position.set(0.035, 0.02, 0.092);
        rightEyelid.scale.set(1.2, 0.4, 0.6);
        headGroup.add(rightEyelid);
        this.rightEye = rightEyelid;
        
        // Eyelashes (subtle)
        const lashGeometry = new THREE.BoxGeometry(0.025, 0.003, 0.003);
        const lashMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1510 });
        
        const leftLash = new THREE.Mesh(lashGeometry, lashMaterial);
        leftLash.position.set(-0.035, 0.028, 0.1);
        headGroup.add(leftLash);
        
        const rightLash = new THREE.Mesh(lashGeometry, lashMaterial);
        rightLash.position.set(0.035, 0.028, 0.1);
        headGroup.add(rightLash);
        
        // Nose bridge
        const noseBridgeGeometry = new THREE.BoxGeometry(0.012, 0.025, 0.015);
        const noseMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.65 
        });
        const noseBridge = new THREE.Mesh(noseBridgeGeometry, noseMaterial);
        noseBridge.position.set(0, 0.01, 0.1);
        headGroup.add(noseBridge);
        
        // Nose tip
        const noseTipGeometry = new THREE.SphereGeometry(0.018, 12, 12);
        const noseTip = new THREE.Mesh(noseTipGeometry, noseMaterial);
        noseTip.position.set(0, -0.01, 0.105);
        noseTip.scale.set(0.9, 0.7, 0.8);
        headGroup.add(noseTip);
        
        // Nostrils
        const nostrilGeometry = new THREE.SphereGeometry(0.006, 6, 6);
        const nostrilMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(0.7) 
        });
        
        const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
        leftNostril.position.set(-0.008, -0.018, 0.1);
        headGroup.add(leftNostril);
        
        const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
        rightNostril.position.set(0.008, -0.018, 0.1);
        headGroup.add(rightNostril);
        
        // Lips
        const upperLipGeometry = new THREE.CapsuleGeometry(0.004, 0.025, 4, 8);
        const lipMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x9a6a6a, 
            roughness: 0.5 
        });
        const upperLip = new THREE.Mesh(upperLipGeometry, lipMaterial);
        upperLip.position.set(0, -0.038, 0.095);
        upperLip.rotation.z = Math.PI / 2;
        headGroup.add(upperLip);
        
        const lowerLipGeometry = new THREE.CapsuleGeometry(0.005, 0.022, 4, 8);
        const lowerLip = new THREE.Mesh(lowerLipGeometry, lipMaterial);
        lowerLip.position.set(0, -0.045, 0.092);
        lowerLip.rotation.z = Math.PI / 2;
        headGroup.add(lowerLip);
        
        // Cheekbones (subtle)
        const cheekGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const cheekMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(1.02),
            roughness: 0.6 
        });
        
        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        leftCheek.position.set(-0.06, -0.01, 0.07);
        leftCheek.scale.set(0.8, 0.5, 0.4);
        headGroup.add(leftCheek);
        
        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        rightCheek.position.set(0.06, -0.01, 0.07);
        rightCheek.scale.set(0.8, 0.5, 0.4);
        headGroup.add(rightCheek);
        
        // Chin
        const chinGeometry = new THREE.SphereGeometry(0.025, 12, 12);
        const chin = new THREE.Mesh(chinGeometry, headMaterial);
        chin.position.set(0, -0.07, 0.06);
        chin.scale.set(1, 0.7, 0.8);
        headGroup.add(chin);
        
        // Ears with detail
        const earOuterGeometry = new THREE.TorusGeometry(0.02, 0.008, 8, 12);
        const earMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.7 
        });
        
        const leftEarOuter = new THREE.Mesh(earOuterGeometry, earMaterial);
        leftEarOuter.position.set(-0.11, 0, 0);
        leftEarOuter.rotation.y = Math.PI / 2;
        headGroup.add(leftEarOuter);
        
        const leftEarInner = new THREE.Mesh(
            new THREE.SphereGeometry(0.012, 8, 8), 
            earMaterial
        );
        leftEarInner.position.set(-0.105, 0, 0);
        headGroup.add(leftEarInner);
        
        const rightEarOuter = new THREE.Mesh(earOuterGeometry, earMaterial);
        rightEarOuter.position.set(0.11, 0, 0);
        rightEarOuter.rotation.y = Math.PI / 2;
        headGroup.add(rightEarOuter);
        
        const rightEarInner = new THREE.Mesh(
            new THREE.SphereGeometry(0.012, 8, 8), 
            earMaterial
        );
        rightEarInner.position.set(0.105, 0, 0);
        headGroup.add(rightEarInner);
        
        headGroup.position.set(0.35, 0.15, 0);
        headGroup.rotation.z = -0.1; // Slight head tilt
        this.group.add(headGroup);
        this.headGroup = headGroup;
        
        // === ENHANCED ARMS WITH VISIBLE SKIN ===
        // Sleeve (upper arm)
        const sleeveGeometry = new THREE.CapsuleGeometry(0.045, 0.18, 8, 12);
        const sleeveMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            roughness: 0.8
        });
        
        // Left arm (resting on chest)
        const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        leftSleeve.position.set(0.08, 0.17, -0.14);
        leftSleeve.rotation.set(0, 0, Math.PI / 3);
        leftSleeve.castShadow = true;
        this.group.add(leftSleeve);
        
        // Left forearm (skin visible)
        const forearmGeometry = new THREE.CapsuleGeometry(0.032, 0.12, 8, 12);
        const skinArmMaterial = new THREE.MeshStandardMaterial({
            color: this.skinColor,
            roughness: 0.65
        });
        
        if (this.isGlowing) {
            skinArmMaterial.emissive = new THREE.Color(this.glowColor);
            skinArmMaterial.emissiveIntensity = this.glowIntensity * 0.2;
        }
        
        const leftForearm = new THREE.Mesh(forearmGeometry, skinArmMaterial);
        leftForearm.position.set(0.18, 0.22, -0.08);
        leftForearm.rotation.set(0, 0, Math.PI / 4);
        leftForearm.castShadow = true;
        this.group.add(leftForearm);
        
        // Right arm
        const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        rightSleeve.position.set(-0.12, 0.1, 0.18);
        rightSleeve.rotation.z = Math.PI / 2;
        rightSleeve.castShadow = true;
        this.group.add(rightSleeve);
        
        const rightForearm = new THREE.Mesh(forearmGeometry, skinArmMaterial);
        rightForearm.position.set(-0.24, 0.08, 0.2);
        rightForearm.rotation.z = Math.PI / 2;
        rightForearm.castShadow = true;
        this.group.add(rightForearm);
        
        // Enhanced hands with fingers
        const palmGeometry = new THREE.SphereGeometry(0.028, 12, 12);
        const handMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.6 
        });
        
        if (this.isGlowing) {
            handMaterial.emissive = new THREE.Color(this.glowColor);
            handMaterial.emissiveIntensity = this.glowIntensity * 0.15;
        }
        
        // Left hand with fingers
        const leftPalm = new THREE.Mesh(palmGeometry, handMaterial);
        leftPalm.position.set(0.25, 0.24, -0.05);
        leftPalm.scale.set(1, 0.5, 0.9);
        this.group.add(leftPalm);
        
        // Fingers for left hand
        const fingerGeometry = new THREE.CapsuleGeometry(0.006, 0.025, 4, 6);
        for (let i = 0; i < 4; i++) {
            const finger = new THREE.Mesh(fingerGeometry, handMaterial);
            finger.position.set(0.27, 0.245, -0.07 + i * 0.015);
            finger.rotation.set(0.1, 0, 0.2);
            this.group.add(finger);
        }
        
        // Thumb
        const thumbGeometry = new THREE.CapsuleGeometry(0.007, 0.02, 4, 6);
        const leftThumb = new THREE.Mesh(thumbGeometry, handMaterial);
        leftThumb.position.set(0.24, 0.25, -0.02);
        leftThumb.rotation.set(0, 0, -0.5);
        this.group.add(leftThumb);
        
        // Right hand
        const rightPalm = new THREE.Mesh(palmGeometry, handMaterial);
        rightPalm.position.set(-0.3, 0.08, 0.2);
        rightPalm.scale.set(1, 0.5, 0.9);
        this.group.add(rightPalm);
        
        // Fingers for right hand (relaxed, slightly curled)
        for (let i = 0; i < 4; i++) {
            const finger = new THREE.Mesh(fingerGeometry, handMaterial);
            finger.position.set(-0.32, 0.075, 0.17 + i * 0.015);
            finger.rotation.set(0.3, 0, 0);
            this.group.add(finger);
        }
        
        // Right thumb
        const rightThumb = new THREE.Mesh(thumbGeometry, handMaterial);
        rightThumb.position.set(-0.29, 0.09, 0.22);
        rightThumb.rotation.set(0, 0, 0.3);
        this.group.add(rightThumb);
        
        // === LEGS WITH PANTS DETAIL ===
        const legGeometry = new THREE.CapsuleGeometry(0.058, 0.42, 8, 12);
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a45,
            roughness: 0.85
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, pantsMaterial);
        leftLeg.position.set(-0.35, 0.08, -0.1);
        leftLeg.rotation.z = Math.PI / 2;
        leftLeg.castShadow = true;
        this.group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, pantsMaterial);
        rightLeg.position.set(-0.35, 0.08, 0.1);
        rightLeg.rotation.z = Math.PI / 2;
        rightLeg.castShadow = true;
        this.group.add(rightLeg);
        
        // Pants pocket detail
        const pocketGeometry = new THREE.BoxGeometry(0.06, 0.003, 0.05);
        const pocketMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a35 });
        
        const leftPocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
        leftPocket.position.set(-0.2, 0.12, -0.12);
        leftPocket.rotation.z = Math.PI / 2;
        this.group.add(leftPocket);
        
        const rightPocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
        rightPocket.position.set(-0.2, 0.12, 0.12);
        rightPocket.rotation.z = Math.PI / 2;
        this.group.add(rightPocket);
        
        // Feet with socks/shoes
        const footGeometry = new THREE.BoxGeometry(0.12, 0.045, 0.07);
        const footMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a30, 
            roughness: 0.8 
        });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.62, 0.05, -0.1);
        this.group.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(-0.62, 0.05, 0.1);
        this.group.add(rightFoot);
        
        // Sock detail
        const sockGeometry = new THREE.CylinderGeometry(0.04, 0.045, 0.04, 12);
        const sockMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a50 });
        
        const leftSock = new THREE.Mesh(sockGeometry, sockMaterial);
        leftSock.position.set(-0.58, 0.08, -0.1);
        leftSock.rotation.z = Math.PI / 2;
        this.group.add(leftSock);
        
        const rightSock = new THREE.Mesh(sockGeometry, sockMaterial);
        rightSock.position.set(-0.58, 0.08, 0.1);
        rightSock.rotation.z = Math.PI / 2;
        this.group.add(rightSock);
        
        // === COZY BLANKET WITH TEXTURE ===
        const blanketGeometry = new THREE.BoxGeometry(0.65, 0.07, 0.55);
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.95
        });
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        blanket.position.set(-0.12, 0.21, 0);
        blanket.castShadow = true;
        this.group.add(blanket);
        
        // Blanket fold details
        const foldGeometry = new THREE.CapsuleGeometry(0.015, 0.5, 4, 8);
        const foldMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a3a2a, 
            roughness: 0.9 
        });
        
        const fold1 = new THREE.Mesh(foldGeometry, foldMaterial);
        fold1.position.set(-0.1, 0.25, 0.15);
        fold1.rotation.z = Math.PI / 2;
        this.group.add(fold1);
        
        const fold2 = new THREE.Mesh(foldGeometry, foldMaterial);
        fold2.position.set(-0.15, 0.24, -0.1);
        fold2.rotation.z = Math.PI / 2;
        this.group.add(fold2);
        
        // === SOFT PILLOW ===
        const pillowGeometry = new THREE.BoxGeometry(0.22, 0.09, 0.28);
        const pillowMaterial = new THREE.MeshStandardMaterial({
            color: 0x9a9a8a,
            roughness: 0.9
        });
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        pillow.position.set(0.43, 0.055, 0);
        this.group.add(pillow);
        
        // Pillow indentation where head rests
        const pillowDent = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x8a8a7a, roughness: 0.9 })
        );
        pillowDent.position.set(0.4, 0.08, 0);
        pillowDent.scale.set(1.2, 0.3, 1.2);
        this.group.add(pillowDent);
        
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
        
        // === ENHANCED TORSO WITH CLOTHING DETAILS ===
        const torsoGeometry = new THREE.CapsuleGeometry(0.19 * scale, 0.38 * scale, 12, 20);
        const torsoMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            roughness: 0.75,
            metalness: 0.05
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 1.0 * scale;
        torso.castShadow = true;
        this.group.add(torso);
        this.body = torso;
        
        // Chest definition
        const chestGeometry = new THREE.SphereGeometry(0.12 * scale, 12, 12);
        const chestMaterial = new THREE.MeshStandardMaterial({ 
            color: this.bodyColor, 
            roughness: 0.8 
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(0, 1.1 * scale, 0.05 * scale);
        chest.scale.set(1.4, 0.8, 0.6);
        this.group.add(chest);
        
        // Collar/neckline
        const collarGeometry = new THREE.TorusGeometry(0.07 * scale, 0.015 * scale, 8, 16);
        const collarMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.bodyColor).multiplyScalar(0.85), 
            roughness: 0.8 
        });
        const collar = new THREE.Mesh(collarGeometry, collarMaterial);
        collar.position.set(0, 1.28 * scale, 0);
        collar.rotation.x = Math.PI / 2;
        this.group.add(collar);
        
        // Shoulders (enhanced)
        const shoulderGeometry = new THREE.SphereGeometry(0.09 * scale, 16, 16);
        const shoulderMaterial = new THREE.MeshStandardMaterial({ 
            color: this.bodyColor, 
            roughness: 0.75 
        });
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.24 * scale, 1.22 * scale, 0);
        leftShoulder.scale.set(1.1, 0.9, 0.9);
        this.group.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.24 * scale, 1.22 * scale, 0);
        rightShoulder.scale.set(1.1, 0.9, 0.9);
        this.group.add(rightShoulder);
        
        // === ENHANCED HEAD ===
        const headGroup = new THREE.Group();
        
        // Neck with Adam's apple
        const neckGeometry = new THREE.CylinderGeometry(0.055 * scale, 0.075 * scale, 0.12 * scale, 16);
        const neckMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.65 
        });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = -0.14 * scale;
        headGroup.add(neck);
        
        // Adam's apple (subtle)
        const adamsApple = new THREE.Mesh(
            new THREE.SphereGeometry(0.012 * scale, 8, 8),
            neckMaterial
        );
        adamsApple.position.set(0, -0.12 * scale, 0.05 * scale);
        headGroup.add(adamsApple);
        
        // Head (refined skull shape)
        const headGeometry = new THREE.SphereGeometry(0.125 * scale, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.skinColor,
            roughness: 0.6,
            metalness: 0.0
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.scale.set(0.95, 1.15, 0.95);
        headGroup.add(head);
        this.head = head;
        
        // === DETAILED HAIR SYSTEM ===
        // Main hair volume
        const hairBaseGeometry = new THREE.SphereGeometry(0.13 * scale, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: this.hairColor,
            roughness: 0.95
        });
        const hairBase = new THREE.Mesh(hairBaseGeometry, hairMaterial);
        hairBase.position.y = 0.03 * scale;
        hairBase.scale.set(1, 1, 1);
        headGroup.add(hairBase);
        
        // Hair strands for texture
        const strandMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.hairColor).multiplyScalar(0.85),
            roughness: 0.9
        });
        
        // Front bangs (varied sizes for natural look)
        const bangGeometry = new THREE.CapsuleGeometry(0.018 * scale, 0.055 * scale, 4, 8);
        for (let i = 0; i < 7; i++) {
            const bang = new THREE.Mesh(bangGeometry, i % 2 === 0 ? hairMaterial : strandMaterial);
            bang.position.set((-0.05 + i * 0.017) * scale, 0.08 * scale, 0.09 * scale);
            bang.rotation.set(0.35 + Math.random() * 0.1, 0, (i - 3) * 0.08);
            bang.scale.set(0.7 + Math.random() * 0.3, 0.8 + Math.random() * 0.4, 0.5);
            headGroup.add(bang);
        }
        
        // Side hair
        const sideHairGeometry = new THREE.CapsuleGeometry(0.022 * scale, 0.045 * scale, 4, 8);
        
        for (let i = 0; i < 3; i++) {
            const leftSide = new THREE.Mesh(sideHairGeometry, strandMaterial);
            leftSide.position.set(-0.11 * scale, (0.04 - i * 0.02) * scale, (0.04 - i * 0.02) * scale);
            leftSide.rotation.z = 0.3 + i * 0.1;
            headGroup.add(leftSide);
            
            const rightSide = new THREE.Mesh(sideHairGeometry, strandMaterial);
            rightSide.position.set(0.11 * scale, (0.04 - i * 0.02) * scale, (0.04 - i * 0.02) * scale);
            rightSide.rotation.z = -0.3 - i * 0.1;
            headGroup.add(rightSide);
        }
        
        // Back hair volume
        const backHairGeometry = new THREE.SphereGeometry(0.1 * scale, 12, 12, 0, Math.PI, Math.PI * 0.3, Math.PI * 0.5);
        const backHair = new THREE.Mesh(backHairGeometry, hairMaterial);
        backHair.position.set(0, 0.02 * scale, -0.06 * scale);
        backHair.rotation.y = Math.PI;
        headGroup.add(backHair);
        
        // === REFINED FACIAL FEATURES ===
        // Forehead (subtle brow ridge)
        const browRidgeGeometry = new THREE.BoxGeometry(0.09 * scale, 0.015 * scale, 0.03 * scale);
        const browRidge = new THREE.Mesh(browRidgeGeometry, headMaterial);
        browRidge.position.set(0, 0.055 * scale, 0.1 * scale);
        headGroup.add(browRidge);
        
        // Eyebrows
        const eyebrowGeometry = new THREE.BoxGeometry(0.035 * scale, 0.008 * scale, 0.012 * scale);
        const eyebrowMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.hairColor).multiplyScalar(0.9) 
        });
        
        const leftBrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftBrow.position.set(-0.04 * scale, 0.055 * scale, 0.105 * scale);
        leftBrow.rotation.z = 0.12;
        headGroup.add(leftBrow);
        
        const rightBrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightBrow.position.set(0.04 * scale, 0.055 * scale, 0.105 * scale);
        rightBrow.rotation.z = -0.12;
        headGroup.add(rightBrow);
        
        // Eye sockets
        const socketGeometry = new THREE.SphereGeometry(0.024 * scale, 12, 12);
        const socketMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(0.88),
            roughness: 0.7 
        });
        
        const leftSocket = new THREE.Mesh(socketGeometry, socketMaterial);
        leftSocket.position.set(-0.042 * scale, 0.025 * scale, 0.095 * scale);
        leftSocket.scale.set(1, 0.7, 0.5);
        headGroup.add(leftSocket);
        
        const rightSocket = new THREE.Mesh(socketGeometry, socketMaterial);
        rightSocket.position.set(0.042 * scale, 0.025 * scale, 0.095 * scale);
        rightSocket.scale.set(1, 0.7, 0.5);
        headGroup.add(rightSocket);
        
        // Eyes (whites)
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.019 * scale, 16, 16);
        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf8f8f8, 
            roughness: 0.2 
        });
        
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.042 * scale, 0.025 * scale, 0.105 * scale);
        headGroup.add(leftEyeWhite);
        
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.042 * scale, 0.025 * scale, 0.105 * scale);
        headGroup.add(rightEyeWhite);
        
        // Irises
        const irisGeometry = new THREE.SphereGeometry(0.012 * scale, 12, 12);
        const irisMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5a4a3a, 
            roughness: 0.3 
        });
        
        const leftIris = new THREE.Mesh(irisGeometry, irisMaterial);
        leftIris.position.set(-0.042 * scale, 0.025 * scale, 0.118 * scale);
        headGroup.add(leftIris);
        
        const rightIris = new THREE.Mesh(irisGeometry, irisMaterial);
        rightIris.position.set(0.042 * scale, 0.025 * scale, 0.118 * scale);
        headGroup.add(rightIris);
        
        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.006 * scale, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a0a0a, 
            roughness: 0.1 
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.042 * scale, 0.025 * scale, 0.125 * scale);
        headGroup.add(leftPupil);
        this.leftPupil = leftPupil;
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.042 * scale, 0.025 * scale, 0.125 * scale);
        headGroup.add(rightPupil);
        this.rightPupil = rightPupil;
        
        // Eye highlights
        const highlightGeometry = new THREE.SphereGeometry(0.003 * scale, 6, 6);
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        leftHighlight.position.set(-0.045 * scale, 0.028 * scale, 0.127 * scale);
        headGroup.add(leftHighlight);
        
        const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        rightHighlight.position.set(0.039 * scale, 0.028 * scale, 0.127 * scale);
        headGroup.add(rightHighlight);
        
        // Eyelids (upper)
        const eyelidGeometry = new THREE.SphereGeometry(0.02 * scale, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
        const eyelidMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.6 
        });
        
        const leftEyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        leftEyelid.position.set(-0.042 * scale, 0.032 * scale, 0.105 * scale);
        leftEyelid.rotation.x = 0.3;
        headGroup.add(leftEyelid);
        
        const rightEyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        rightEyelid.position.set(0.042 * scale, 0.032 * scale, 0.105 * scale);
        rightEyelid.rotation.x = 0.3;
        headGroup.add(rightEyelid);
        
        // Eyelashes
        const lashGeometry = new THREE.BoxGeometry(0.028 * scale, 0.003 * scale, 0.004 * scale);
        const lashMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1510 });
        
        const leftLash = new THREE.Mesh(lashGeometry, lashMaterial);
        leftLash.position.set(-0.042 * scale, 0.038 * scale, 0.115 * scale);
        headGroup.add(leftLash);
        
        const rightLash = new THREE.Mesh(lashGeometry, lashMaterial);
        rightLash.position.set(0.042 * scale, 0.038 * scale, 0.115 * scale);
        headGroup.add(rightLash);
        
        // Nose bridge
        const noseBridgeGeometry = new THREE.BoxGeometry(0.014 * scale, 0.035 * scale, 0.018 * scale);
        const noseMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.65 
        });
        const noseBridge = new THREE.Mesh(noseBridgeGeometry, noseMaterial);
        noseBridge.position.set(0, 0.005 * scale, 0.11 * scale);
        headGroup.add(noseBridge);
        
        // Nose tip
        const noseTipGeometry = new THREE.SphereGeometry(0.022 * scale, 12, 12);
        const noseTip = new THREE.Mesh(noseTipGeometry, noseMaterial);
        noseTip.position.set(0, -0.015 * scale, 0.115 * scale);
        noseTip.scale.set(0.85, 0.65, 0.75);
        headGroup.add(noseTip);
        
        // Nostrils
        const nostrilGeometry = new THREE.SphereGeometry(0.007 * scale, 6, 6);
        const nostrilMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(0.65) 
        });
        
        const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
        leftNostril.position.set(-0.01 * scale, -0.022 * scale, 0.108 * scale);
        headGroup.add(leftNostril);
        
        const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
        rightNostril.position.set(0.01 * scale, -0.022 * scale, 0.108 * scale);
        headGroup.add(rightNostril);
        
        // Nasolabial folds (subtle lines from nose to mouth)
        const foldGeometry = new THREE.CapsuleGeometry(0.003 * scale, 0.025 * scale, 4, 6);
        const foldMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(0.9) 
        });
        
        const leftFold = new THREE.Mesh(foldGeometry, foldMaterial);
        leftFold.position.set(-0.025 * scale, -0.035 * scale, 0.1 * scale);
        leftFold.rotation.z = 0.15;
        headGroup.add(leftFold);
        
        const rightFold = new THREE.Mesh(foldGeometry, foldMaterial);
        rightFold.position.set(0.025 * scale, -0.035 * scale, 0.1 * scale);
        rightFold.rotation.z = -0.15;
        headGroup.add(rightFold);
        
        // Upper lip
        const upperLipGeometry = new THREE.CapsuleGeometry(0.005 * scale, 0.028 * scale, 4, 8);
        const lipMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x9a6a6a, 
            roughness: 0.45 
        });
        const upperLip = new THREE.Mesh(upperLipGeometry, lipMaterial);
        upperLip.position.set(0, -0.048 * scale, 0.1 * scale);
        upperLip.rotation.z = Math.PI / 2;
        headGroup.add(upperLip);
        
        // Cupid's bow (upper lip detail)
        const cupidGeometry = new THREE.SphereGeometry(0.006 * scale, 8, 8);
        const cupidBow = new THREE.Mesh(cupidGeometry, lipMaterial);
        cupidBow.position.set(0, -0.044 * scale, 0.105 * scale);
        cupidBow.scale.set(1.5, 0.5, 0.6);
        headGroup.add(cupidBow);
        
        // Lower lip
        const lowerLipGeometry = new THREE.CapsuleGeometry(0.006 * scale, 0.025 * scale, 4, 8);
        const lowerLip = new THREE.Mesh(lowerLipGeometry, lipMaterial);
        lowerLip.position.set(0, -0.056 * scale, 0.097 * scale);
        lowerLip.rotation.z = Math.PI / 2;
        headGroup.add(lowerLip);
        
        // Cheekbones
        const cheekGeometry = new THREE.SphereGeometry(0.035 * scale, 12, 12);
        const cheekMaterial = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.skinColor).multiplyScalar(1.02),
            roughness: 0.55 
        });
        
        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        leftCheek.position.set(-0.07 * scale, 0 * scale, 0.075 * scale);
        leftCheek.scale.set(0.85, 0.55, 0.45);
        headGroup.add(leftCheek);
        
        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        rightCheek.position.set(0.07 * scale, 0 * scale, 0.075 * scale);
        rightCheek.scale.set(0.85, 0.55, 0.45);
        headGroup.add(rightCheek);
        
        // Chin
        const chinGeometry = new THREE.SphereGeometry(0.03 * scale, 12, 12);
        const chin = new THREE.Mesh(chinGeometry, headMaterial);
        chin.position.set(0, -0.085 * scale, 0.07 * scale);
        chin.scale.set(1, 0.75, 0.85);
        headGroup.add(chin);
        
        // Jaw line
        const jawGeometry = new THREE.CapsuleGeometry(0.012 * scale, 0.06 * scale, 4, 8);
        
        const leftJaw = new THREE.Mesh(jawGeometry, headMaterial);
        leftJaw.position.set(-0.08 * scale, -0.05 * scale, 0.03 * scale);
        leftJaw.rotation.set(0, 0.4, 0.6);
        headGroup.add(leftJaw);
        
        const rightJaw = new THREE.Mesh(jawGeometry, headMaterial);
        rightJaw.position.set(0.08 * scale, -0.05 * scale, 0.03 * scale);
        rightJaw.rotation.set(0, -0.4, -0.6);
        headGroup.add(rightJaw);
        
        // Ears with detail
        const earOuterGeometry = new THREE.TorusGeometry(0.022 * scale, 0.008 * scale, 8, 12);
        const earMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.65 
        });
        
        const leftEarOuter = new THREE.Mesh(earOuterGeometry, earMaterial);
        leftEarOuter.position.set(-0.115 * scale, 0.01 * scale, 0);
        leftEarOuter.rotation.y = Math.PI / 2;
        headGroup.add(leftEarOuter);
        
        const leftEarInner = new THREE.Mesh(
            new THREE.SphereGeometry(0.014 * scale, 8, 8), 
            earMaterial
        );
        leftEarInner.position.set(-0.11 * scale, 0.01 * scale, 0);
        headGroup.add(leftEarInner);
        
        // Earlobe
        const earlobeGeometry = new THREE.SphereGeometry(0.008 * scale, 6, 6);
        const leftEarlobe = new THREE.Mesh(earlobeGeometry, earMaterial);
        leftEarlobe.position.set(-0.115 * scale, -0.015 * scale, 0);
        headGroup.add(leftEarlobe);
        
        const rightEarOuter = new THREE.Mesh(earOuterGeometry, earMaterial);
        rightEarOuter.position.set(0.115 * scale, 0.01 * scale, 0);
        rightEarOuter.rotation.y = Math.PI / 2;
        headGroup.add(rightEarOuter);
        
        const rightEarInner = new THREE.Mesh(
            new THREE.SphereGeometry(0.014 * scale, 8, 8), 
            earMaterial
        );
        rightEarInner.position.set(0.11 * scale, 0.01 * scale, 0);
        headGroup.add(rightEarInner);
        
        const rightEarlobe = new THREE.Mesh(earlobeGeometry, earMaterial);
        rightEarlobe.position.set(0.115 * scale, -0.015 * scale, 0);
        headGroup.add(rightEarlobe);
        
        headGroup.position.y = 1.52 * scale;
        this.group.add(headGroup);
        this.headGroup = headGroup;
        
        // === ENHANCED ARMS ===
        // Upper arms (sleeves)
        const upperArmGeometry = new THREE.CapsuleGeometry(0.05 * scale, 0.22 * scale, 8, 12);
        const armMaterial = new THREE.MeshStandardMaterial({ 
            color: this.bodyColor, 
            roughness: 0.75 
        });
        
        const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        leftUpperArm.position.set(-0.3 * scale, 1.02 * scale, 0);
        leftUpperArm.rotation.z = 0.12;
        leftUpperArm.castShadow = true;
        this.group.add(leftUpperArm);
        
        const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        rightUpperArm.position.set(0.3 * scale, 1.02 * scale, 0);
        rightUpperArm.rotation.z = -0.12;
        rightUpperArm.castShadow = true;
        this.group.add(rightUpperArm);
        
        // Forearms (skin visible - rolled up sleeves look)
        const forearmGeometry = new THREE.CapsuleGeometry(0.038 * scale, 0.18 * scale, 8, 12);
        const skinMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.6 
        });
        
        const leftForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
        leftForearm.position.set(-0.34 * scale, 0.72 * scale, 0);
        leftForearm.rotation.z = 0.08;
        leftForearm.castShadow = true;
        this.group.add(leftForearm);
        
        const rightForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
        rightForearm.position.set(0.34 * scale, 0.72 * scale, 0);
        rightForearm.rotation.z = -0.08;
        rightForearm.castShadow = true;
        this.group.add(rightForearm);
        
        // Wrists
        const wristGeometry = new THREE.CylinderGeometry(0.028 * scale, 0.032 * scale, 0.04 * scale, 12);
        
        const leftWrist = new THREE.Mesh(wristGeometry, skinMaterial);
        leftWrist.position.set(-0.35 * scale, 0.58 * scale, 0);
        this.group.add(leftWrist);
        
        const rightWrist = new THREE.Mesh(wristGeometry, skinMaterial);
        rightWrist.position.set(0.35 * scale, 0.58 * scale, 0);
        this.group.add(rightWrist);
        
        // Enhanced hands with fingers
        const palmGeometry = new THREE.BoxGeometry(0.05 * scale, 0.07 * scale, 0.025 * scale);
        const handMaterial = new THREE.MeshStandardMaterial({ 
            color: this.skinColor, 
            roughness: 0.55 
        });
        
        const leftPalm = new THREE.Mesh(palmGeometry, handMaterial);
        leftPalm.position.set(-0.35 * scale, 0.51 * scale, 0);
        this.group.add(leftPalm);
        
        const rightPalm = new THREE.Mesh(palmGeometry, handMaterial);
        rightPalm.position.set(0.35 * scale, 0.51 * scale, 0);
        this.group.add(rightPalm);
        
        // Fingers
        const fingerGeometry = new THREE.CapsuleGeometry(0.007 * scale, 0.035 * scale, 4, 6);
        const fingerPositions = [-0.016, -0.005, 0.005, 0.016];
        
        fingerPositions.forEach((offset, i) => {
            const leftFinger = new THREE.Mesh(fingerGeometry, handMaterial);
            leftFinger.position.set((-0.35 + offset) * scale, 0.46 * scale, 0);
            this.group.add(leftFinger);
            
            const rightFinger = new THREE.Mesh(fingerGeometry, handMaterial);
            rightFinger.position.set((0.35 + offset) * scale, 0.46 * scale, 0);
            this.group.add(rightFinger);
        });
        
        // Thumbs
        const thumbGeometry = new THREE.CapsuleGeometry(0.008 * scale, 0.025 * scale, 4, 6);
        
        const leftThumb = new THREE.Mesh(thumbGeometry, handMaterial);
        leftThumb.position.set(-0.38 * scale, 0.52 * scale, 0.015 * scale);
        leftThumb.rotation.z = 0.5;
        this.group.add(leftThumb);
        
        const rightThumb = new THREE.Mesh(thumbGeometry, handMaterial);
        rightThumb.position.set(0.38 * scale, 0.52 * scale, 0.015 * scale);
        rightThumb.rotation.z = -0.5;
        this.group.add(rightThumb);
        
        // === ENHANCED LEGS WITH CLOTHING ===
        // Belt
        const beltGeometry = new THREE.TorusGeometry(0.14 * scale, 0.012 * scale, 8, 24);
        const beltMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2a2520, 
            roughness: 0.6,
            metalness: 0.2 
        });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.set(0, 0.78 * scale, 0);
        belt.rotation.x = Math.PI / 2;
        this.group.add(belt);
        
        // Belt buckle
        const buckleGeometry = new THREE.BoxGeometry(0.03 * scale, 0.025 * scale, 0.008 * scale);
        const buckleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8a8070, 
            roughness: 0.3,
            metalness: 0.6 
        });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 0.78 * scale, 0.14 * scale);
        this.group.add(buckle);
        
        // Upper legs (pants)
        const upperLegGeometry = new THREE.CapsuleGeometry(0.07 * scale, 0.32 * scale, 8, 12);
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a45,
            roughness: 0.85
        });
        
        const leftUpperLeg = new THREE.Mesh(upperLegGeometry, pantsMaterial);
        leftUpperLeg.position.set(-0.1 * scale, 0.54 * scale, 0);
        leftUpperLeg.castShadow = true;
        this.group.add(leftUpperLeg);
        
        const rightUpperLeg = new THREE.Mesh(upperLegGeometry, pantsMaterial);
        rightUpperLeg.position.set(0.1 * scale, 0.54 * scale, 0);
        rightUpperLeg.castShadow = true;
        this.group.add(rightUpperLeg);
        
        // Knee joints
        const kneeGeometry = new THREE.SphereGeometry(0.055 * scale, 12, 12);
        
        const leftKnee = new THREE.Mesh(kneeGeometry, pantsMaterial);
        leftKnee.position.set(-0.1 * scale, 0.35 * scale, 0.02 * scale);
        leftKnee.scale.set(1, 0.8, 1);
        this.group.add(leftKnee);
        
        const rightKnee = new THREE.Mesh(kneeGeometry, pantsMaterial);
        rightKnee.position.set(0.1 * scale, 0.35 * scale, 0.02 * scale);
        rightKnee.scale.set(1, 0.8, 1);
        this.group.add(rightKnee);
        
        // Lower legs
        const lowerLegGeometry = new THREE.CapsuleGeometry(0.052 * scale, 0.28 * scale, 8, 12);
        
        const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, pantsMaterial);
        leftLowerLeg.position.set(-0.1 * scale, 0.18 * scale, 0);
        leftLowerLeg.castShadow = true;
        this.group.add(leftLowerLeg);
        
        const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, pantsMaterial);
        rightLowerLeg.position.set(0.1 * scale, 0.18 * scale, 0);
        rightLowerLeg.castShadow = true;
        this.group.add(rightLowerLeg);
        
        // Ankles
        const ankleGeometry = new THREE.CylinderGeometry(0.035 * scale, 0.04 * scale, 0.04 * scale, 12);
        
        const leftAnkle = new THREE.Mesh(ankleGeometry, pantsMaterial);
        leftAnkle.position.set(-0.1 * scale, 0.05 * scale, 0);
        this.group.add(leftAnkle);
        
        const rightAnkle = new THREE.Mesh(ankleGeometry, pantsMaterial);
        rightAnkle.position.set(0.1 * scale, 0.05 * scale, 0);
        this.group.add(rightAnkle);
        
        // Shoes
        const shoeGeometry = new THREE.BoxGeometry(0.09 * scale, 0.045 * scale, 0.16 * scale);
        const shoeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x252525, 
            roughness: 0.75,
            metalness: 0.1 
        });
        
        const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        leftShoe.position.set(-0.1 * scale, 0.022 * scale, 0.035 * scale);
        this.group.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        rightShoe.position.set(0.1 * scale, 0.022 * scale, 0.035 * scale);
        this.group.add(rightShoe);
        
        // Shoe toe caps
        const toeCapGeometry = new THREE.SphereGeometry(0.04 * scale, 12, 12);
        
        const leftToeCap = new THREE.Mesh(toeCapGeometry, shoeMaterial);
        leftToeCap.position.set(-0.1 * scale, 0.025 * scale, 0.1 * scale);
        leftToeCap.scale.set(1, 0.5, 0.8);
        this.group.add(leftToeCap);
        
        const rightToeCap = new THREE.Mesh(toeCapGeometry, shoeMaterial);
        rightToeCap.position.set(0.1 * scale, 0.025 * scale, 0.1 * scale);
        rightToeCap.scale.set(1, 0.5, 0.8);
        this.group.add(rightToeCap);
        
        // Shoe soles
        const soleGeometry = new THREE.BoxGeometry(0.085 * scale, 0.01 * scale, 0.15 * scale);
        const soleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, 
            roughness: 0.9 
        });
        
        const leftSole = new THREE.Mesh(soleGeometry, soleMaterial);
        leftSole.position.set(-0.1 * scale, 0.005 * scale, 0.03 * scale);
        this.group.add(leftSole);
        
        const rightSole = new THREE.Mesh(soleGeometry, soleMaterial);
        rightSole.position.set(0.1 * scale, 0.005 * scale, 0.03 * scale);
        this.group.add(rightSole);
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
        // Check for custom onInteract handler first (like InteractableObject)
        if (this.onInteract) {
            this.onInteract(game);
            return;
        }
        
        // Fallback to default dialogue handling
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
