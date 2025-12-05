/**
 * PROJECT DEATHBED - Interactable Object
 * Base class for objects the player can interact with
 */

import * as THREE from 'three';

export class InteractableObject {
    constructor(options) {
        this.name = options.name || 'Object';
        this.description = options.description || '';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.size = options.size || new THREE.Vector3(0.5, 0.5, 0.5);
        this.color = options.color || 0x888888;
        this.interactionType = options.interactionType || 'examine'; // examine, use, pickup
        this.onInteract = options.onInteract || (() => {});
        this.isInteractable = true;
        this.interactionRadius = options.interactionRadius || 2.5;
        this.invisible = options.invisible || false;
        
        // Create the visual mesh
        this.createMesh();
        
        // Highlight state
        this.isHighlighted = false;
        this.originalEmissive = 0x000000;
    }
    
    createMesh() {
        const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.1,
            transparent: this.invisible,
            opacity: this.invisible ? 0 : 1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = !this.invisible;
        this.mesh.receiveShadow = !this.invisible;
        
        // Store reference to this object on the mesh for raycasting
        this.mesh.userData.interactable = this;
    }
    
    addToScene(scene) {
        scene.add(this.mesh);
    }
    
    removeFromScene(scene) {
        scene.remove(this.mesh);
    }
    
    highlight(enabled) {
        if (this.invisible) return;
        
        this.isHighlighted = enabled;
        if (enabled) {
            this.mesh.material.emissive = new THREE.Color(0x3a3a2a);
            this.mesh.material.emissiveIntensity = 0.3;
        } else {
            this.mesh.material.emissive = new THREE.Color(0x000000);
            this.mesh.material.emissiveIntensity = 0;
        }
    }
    
    interact(game) {
        if (this.onInteract) {
            this.onInteract(game);
        }
    }
    
    getPosition() {
        return this.mesh.position;
    }
    
    distanceTo(point) {
        return this.mesh.position.distanceTo(point);
    }
    
    isInRange(point) {
        return this.distanceTo(point) <= this.interactionRadius;
    }
}
