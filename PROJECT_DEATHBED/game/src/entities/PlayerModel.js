/**
 * PROJECT DEATHBED - Player Model
 * Adrian's visible body model for mirror reflections and third-person views
 */

import * as THREE from 'three';
import { CharacterModel } from './CharacterModel.js';

export class PlayerModel {
    constructor(game, options = {}) {
        this.game = game;
        
        // Create Adrian's character model
        this.characterModel = new CharacterModel({
            skinColor: options.skinColor || 0xc4a484,
            hairColor: options.hairColor || 0x2a1a0a,
            shirtColor: options.shirtColor || 0x2d4a5e, // Dark blue shirt
            pantsColor: options.pantsColor || 0x1a1a1a, // Black pants
            hairStyle: options.hairStyle || 'short', // Adrian has short hair
            height: options.height || 1.75,
            bodyType: options.bodyType || 'average'
        });
        
        this.group = this.characterModel.group;
        this.group.visible = false; // Hidden by default (first person)
        
        // For mirror rendering
        this.mirrorVisible = true;
        
        // Animation state
        this.isMoving = false;
        this.lastPosition = new THREE.Vector3();
    }
    
    update(deltaTime, camera) {
        if (!camera) return;
        
        // Position the model at camera position (feet level)
        const cameraPos = camera.position.clone();
        this.group.position.set(cameraPos.x, 0, cameraPos.z);
        
        // Face the same direction as camera
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        this.group.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Check if player is moving
        const currentPos = new THREE.Vector3(cameraPos.x, 0, cameraPos.z);
        const distance = currentPos.distanceTo(this.lastPosition);
        this.isMoving = distance > 0.01;
        this.lastPosition.copy(currentPos);
        
        // Animate based on movement
        const time = performance.now() / 1000;
        if (this.isMoving) {
            this.characterModel.animateWalk(time);
        } else {
            this.characterModel.animateIdle(time);
        }
    }
    
    setVisible(visible) {
        this.group.visible = visible;
    }
    
    setMirrorVisible(visible) {
        this.mirrorVisible = visible;
    }
    
    addToScene(scene) {
        scene.add(this.group);
    }
    
    removeFromScene(scene) {
        scene.remove(this.group);
    }
}
