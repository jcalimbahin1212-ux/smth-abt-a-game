/**
 * PROJECT DEATHBED - Interaction System
 * Handles player interactions with objects and NPCs
 */

import * as THREE from 'three';

export class InteractionSystem {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.interactionDistance = 3;
        this.currentTarget = null;
        
        // UI elements
        this.interactionPrompt = document.getElementById('interaction-prompt');
        
        // Listen for interaction key
        document.addEventListener('game-keydown', (e) => {
            if (e.detail.code === 'KeyE') {
                this.performInteraction();
            }
        });
    }
    
    update() {
        if (!this.game.sceneManager.currentScene) return;
        if (this.game.dialogueSystem.isActive) {
            this.hidePrompt();
            return;
        }
        
        // Cast ray from camera center
        const camera = this.game.sceneManager.camera;
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        
        // Get all interactables and NPCs
        const interactables = this.game.sceneManager.getInteractables();
        const npcs = this.game.sceneManager.getNPCs();
        
        // Find closest interactable in range and in view
        let closestTarget = null;
        let closestDistance = Infinity;
        
        // Check interactable objects
        interactables.forEach(obj => {
            if (obj.isInRange(camera.position)) {
                // Use recursive intersect to catch all children including invisible hitboxes
                const intersects = this.raycaster.intersectObject(obj.mesh, true);
                if (intersects.length > 0 && intersects[0].distance < closestDistance) {
                    closestDistance = intersects[0].distance;
                    closestTarget = obj;
                }
            }
        });
        
        // Check NPCs
        npcs.forEach(npc => {
            if (npc.isInRange(camera.position)) {
                const intersects = this.raycaster.intersectObject(npc.group, true);
                if (intersects.length > 0 && intersects[0].distance < closestDistance) {
                    closestDistance = intersects[0].distance;
                    closestTarget = npc;
                }
            }
        });
        
        // Update highlight and prompt
        if (closestTarget !== this.currentTarget) {
            // Unhighlight previous target
            if (this.currentTarget && this.currentTarget.highlight) {
                this.currentTarget.highlight(false);
            }
            
            // Highlight new target
            if (closestTarget && closestTarget.highlight) {
                closestTarget.highlight(true);
            }
            
            this.currentTarget = closestTarget;
        }
        
        // Update UI prompt
        if (this.currentTarget) {
            this.showPrompt(this.currentTarget);
        } else {
            this.hidePrompt();
        }
    }
    
    showPrompt(target) {
        if (this.interactionPrompt) {
            let promptText = '[E] ';
            
            if (target.interactionType) {
                switch (target.interactionType) {
                    case 'examine':
                        promptText += 'Examine ';
                        break;
                    case 'use':
                        promptText += 'Use ';
                        break;
                    case 'pickup':
                        promptText += 'Take ';
                        break;
                    default:
                        promptText += 'Interact with ';
                }
            } else {
                promptText += 'Talk to ';
            }
            
            promptText += target.name;
            
            this.interactionPrompt.textContent = promptText;
            this.interactionPrompt.classList.add('visible');
        }
    }
    
    hidePrompt() {
        if (this.interactionPrompt) {
            this.interactionPrompt.classList.remove('visible');
        }
    }
    
    performInteraction() {
        if (this.currentTarget && !this.game.dialogueSystem.isActive) {
            this.currentTarget.interact(this.game);
            
            // Play interaction sound
            this.game.audioManager.playSound('interact');
        }
    }
}
