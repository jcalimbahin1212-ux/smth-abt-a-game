/**
 * PROJECT DEATHBED - Player Controller
 * First-person camera controls with smooth movement aligned to POV
 */

import * as THREE from 'three';

export class PlayerController {
    constructor(camera, inputManager, scene) {
        this.camera = camera;
        this.inputManager = inputManager;
        this.scene = scene;
        
        // Movement settings
        this.moveSpeed = 4;
        this.lookSensitivity = 0.002;
        
        // Camera rotation
        this.pitch = 0;
        this.yaw = 0;
        
        // Movement state
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Collision boundaries (set per scene)
        this.bounds = {
            minX: -5.5,
            maxX: 5.5,
            minZ: -4.5,
            maxZ: 4.5
        };
        
        // Collision
        this.playerRadius = 0.3;
        this.playerHeight = 1.7;
        
        // Raycaster for collision detection
        this.raycaster = new THREE.Raycaster();
        
        // Euler for rotation
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // For getting camera forward/right vectors
        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
    }
    
    update(deltaTime) {
        // Debug: Log input state occasionally
        if (!this._lastDebug || Date.now() - this._lastDebug > 2000) {
            const w = this.inputManager.isKeyPressed('KeyW');
            const a = this.inputManager.isKeyPressed('KeyA');
            const s = this.inputManager.isKeyPressed('KeyS');
            const d = this.inputManager.isKeyPressed('KeyD');
            if (w || a || s || d) {
                console.log('Movement keys:', { w, a, s, d }, 'Pointer locked:', this.inputManager.isPointerLocked);
                this._lastDebug = Date.now();
            }
        }
        
        // Handle mouse look (only when pointer is locked)
        const mouseMovement = this.inputManager.getMouseMovement();
        
        if (this.inputManager.isPointerLocked && (mouseMovement.x !== 0 || mouseMovement.y !== 0)) {
            this.yaw -= mouseMovement.x * this.lookSensitivity;
            this.pitch -= mouseMovement.y * this.lookSensitivity;
            
            // Clamp pitch
            this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
            
            // Apply rotation
            this.euler.set(this.pitch, this.yaw, 0);
            this.camera.quaternion.setFromEuler(this.euler);
        }
        
        // Allow arrow keys for looking around without pointer lock
        if (this.inputManager.isKeyPressed('ArrowLeft')) {
            this.yaw += 2 * deltaTime;
            this.euler.set(this.pitch, this.yaw, 0);
            this.camera.quaternion.setFromEuler(this.euler);
        }
        if (this.inputManager.isKeyPressed('ArrowRight')) {
            this.yaw -= 2 * deltaTime;
            this.euler.set(this.pitch, this.yaw, 0);
            this.camera.quaternion.setFromEuler(this.euler);
        }
        
        // Get camera's forward and right vectors (ignore pitch for movement)
        // Forward is where the camera is looking on the XZ plane
        this.forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.right.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        
        // Handle movement input
        const moveVector = new THREE.Vector3(0, 0, 0);
        
        if (this.inputManager.isKeyPressed('KeyW')) {
            moveVector.add(this.forward);
        }
        if (this.inputManager.isKeyPressed('KeyS')) {
            moveVector.sub(this.forward);
        }
        if (this.inputManager.isKeyPressed('KeyA')) {
            moveVector.sub(this.right);
        }
        if (this.inputManager.isKeyPressed('KeyD')) {
            moveVector.add(this.right);
        }
        
        // Normalize and apply movement
        if (moveVector.length() > 0) {
            moveVector.normalize();
            
            // Calculate new position
            const newPosition = this.camera.position.clone();
            newPosition.x += moveVector.x * this.moveSpeed * deltaTime;
            newPosition.z += moveVector.z * this.moveSpeed * deltaTime;
            
            // Apply boundary collision
            newPosition.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, newPosition.x));
            newPosition.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, newPosition.z));
            
            // Apply position
            this.camera.position.copy(newPosition);
        }
    }
    
    setBounds(boundsOrMinX, maxX, minZ, maxZ) {
        // Handle both object and individual parameter formats
        if (typeof boundsOrMinX === 'object') {
            this.bounds.minX = boundsOrMinX.minX ?? this.bounds.minX;
            this.bounds.maxX = boundsOrMinX.maxX ?? this.bounds.maxX;
            this.bounds.minZ = boundsOrMinX.minZ ?? this.bounds.minZ;
            this.bounds.maxZ = boundsOrMinX.maxZ ?? this.bounds.maxZ;
        } else {
            this.bounds.minX = boundsOrMinX;
            this.bounds.maxX = maxX;
            this.bounds.minZ = minZ;
            this.bounds.maxZ = maxZ;
        }
    }
    
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    setRotation(yaw, pitch) {
        this.yaw = yaw;
        this.pitch = pitch;
        this.euler.set(this.pitch, this.yaw, 0);
        this.camera.quaternion.setFromEuler(this.euler);
    }
}
