/**
 * PROJECT DEATHBED - NPC Entity
 * Non-player characters with dialogue and visual representation
 */

import * as THREE from 'three';

export class NPCEntity {
    constructor(options) {
        this.name = options.name || 'NPC';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || 0;
        this.bodyColor = options.bodyColor || 0x5a5a65;
        this.isGlowing = options.isGlowing || false;
        this.glowColor = options.glowColor || 0xc9a227;
        this.glowIntensity = options.glowIntensity || 0.3;
        this.dialogues = options.dialogues || [];
        this.currentDialogueIndex = 0;
        this.interactionRadius = options.interactionRadius || 3;
        this.isInteractable = true;
        
        // Animation state
        this.breathingPhase = Math.random() * Math.PI * 2;
        
        // Create the NPC model
        this.createModel();
    }
    
    createModel() {
        this.group = new THREE.Group();
        
        // For Luis lying down, we create a simplified figure
        if (this.name === 'Luis') {
            this.createLyingFigure();
        } else {
            this.createStandingFigure();
        }
        
        this.group.position.copy(this.position);
        this.group.rotation.y = this.rotation;
        
        // Store reference for interaction
        this.group.userData.npc = this;
    }
    
    createLyingFigure() {
        // Body (lying down)
        const bodyGeometry = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            roughness: 0.8
        });
        
        if (this.isGlowing) {
            bodyMaterial.emissive = new THREE.Color(this.glowColor);
            bodyMaterial.emissiveIntensity = this.glowIntensity;
        }
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2; // Lying down
        body.position.y = 0.15;
        this.group.add(body);
        this.body = body;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a, // Skin tone
            roughness: 0.9
        });
        
        if (this.isGlowing) {
            headMaterial.emissive = new THREE.Color(this.glowColor);
            headMaterial.emissiveIntensity = this.glowIntensity * 0.5;
        }
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.45, 0.2, 0);
        this.group.add(head);
        this.head = head;
        
        // Blanket covering
        const blanketGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.4);
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.95
        });
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
        blanket.position.set(-0.1, 0.22, 0);
        this.group.add(blanket);
        
        // Subtle glow effect for Luis
        if (this.isGlowing) {
            // Vein-like glow lines
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: this.glowColor,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            
            // Create subtle vein lines on arms
            const veinGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.15, 4);
            const vein1 = new THREE.Mesh(veinGeometry, glowMaterial);
            vein1.position.set(0.2, 0.15, 0.12);
            vein1.rotation.z = Math.PI / 2;
            this.group.add(vein1);
            this.veins = [vein1];
        }
    }
    
    createStandingFigure() {
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.5, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.bodyColor,
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        this.group.add(body);
        this.body = body;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.9
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        this.group.add(head);
        this.head = head;
        
        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.08, 0.35, 4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.9
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1, 0.3, 0);
        this.group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.1, 0.3, 0);
        this.group.add(rightLeg);
    }
    
    addToScene(scene) {
        scene.add(this.group);
    }
    
    removeFromScene(scene) {
        scene.remove(this.group);
    }
    
    update(deltaTime) {
        // Subtle breathing animation
        this.breathingPhase += deltaTime * 1.5;
        
        if (this.body) {
            const breathScale = 1 + Math.sin(this.breathingPhase) * 0.02;
            if (this.name === 'Luis') {
                this.body.scale.y = breathScale;
            } else {
                this.body.scale.x = breathScale;
                this.body.scale.z = breathScale;
            }
        }
        
        // Pulse glow for touched characters
        if (this.isGlowing && this.body.material.emissiveIntensity !== undefined) {
            const pulseIntensity = this.glowIntensity * (0.8 + Math.sin(this.breathingPhase * 0.5) * 0.3);
            this.body.material.emissiveIntensity = pulseIntensity;
            
            if (this.head && this.head.material.emissiveIntensity !== undefined) {
                this.head.material.emissiveIntensity = pulseIntensity * 0.5;
            }
            
            // Pulse veins
            if (this.veins) {
                this.veins.forEach(vein => {
                    vein.material.opacity = 0.3 + Math.sin(this.breathingPhase * 2) * 0.2;
                });
            }
        }
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
    
    getDialogue(id) {
        if (id) {
            return this.dialogues.find(d => d.id === id);
        }
        return this.dialogues[0];
    }
    
    interact(game) {
        const dialogue = this.getDialogue();
        if (dialogue) {
            game.dialogueSystem.startDialogue(this, dialogue);
        }
    }
    
    highlight(enabled) {
        // Subtle highlight effect
        if (this.body) {
            if (enabled) {
                this.body.material.emissive = new THREE.Color(0x2a2a1a);
            } else if (!this.isGlowing) {
                this.body.material.emissive = new THREE.Color(0x000000);
            }
        }
    }
}
