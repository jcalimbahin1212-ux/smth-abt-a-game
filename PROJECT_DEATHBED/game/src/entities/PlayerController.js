/**
 * PROJECT DEATHBED - Player Controller
 * First-person camera controls with smooth movement aligned to POV
 * Features realistic head bob, breathing sway, and smooth camera effects
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
        this.baseHeight = 1.7; // Store base camera height
        
        // === HEAD BOB SETTINGS ===
        this.headBobEnabled = true;
        this.headBobTimer = 0;
        this.headBobFrequency = 8; // How fast the bob cycles (higher = faster)
        this.headBobAmplitudeY = 0.035; // Vertical bob amount
        this.headBobAmplitudeX = 0.015; // Horizontal sway amount
        this.headBobSmoothing = 0.1; // Smooth transitions
        this.currentBobOffset = new THREE.Vector2(0, 0);
        this.targetBobOffset = new THREE.Vector2(0, 0);
        this.isMoving = false;
        this.wasMoving = false;
        
        // === BREATHING SWAY (idle) ===
        this.breathingTimer = 0;
        this.breathingFrequency = 0.8; // Slow, natural breathing
        this.breathingAmplitudeY = 0.008; // Very subtle vertical
        this.breathingAmplitudeRoll = 0.002; // Tiny roll sway
        
        // === CAMERA SMOOTHING ===
        this.cameraTilt = 0; // For slight tilt when strafing
        this.targetCameraTilt = 0;
        this.tiltSmoothing = 0.08;
        
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
        let strafeDirection = 0; // For camera tilt
        
        if (this.inputManager.isKeyPressed('KeyW')) {
            moveVector.add(this.forward);
        }
        if (this.inputManager.isKeyPressed('KeyS')) {
            moveVector.sub(this.forward);
        }
        if (this.inputManager.isKeyPressed('KeyA')) {
            moveVector.sub(this.right);
            strafeDirection = 1; // Tilting right when moving left
        }
        if (this.inputManager.isKeyPressed('KeyD')) {
            moveVector.add(this.right);
            strafeDirection = -1; // Tilting left when moving right
        }
        
        // Track movement state
        this.wasMoving = this.isMoving;
        this.isMoving = moveVector.length() > 0;
        
        // Normalize and apply movement
        if (this.isMoving) {
            moveVector.normalize();
            
            // Calculate new position
            const newPosition = this.camera.position.clone();
            newPosition.x += moveVector.x * this.moveSpeed * deltaTime;
            newPosition.z += moveVector.z * this.moveSpeed * deltaTime;
            
            // Apply boundary collision
            newPosition.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, newPosition.x));
            newPosition.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, newPosition.z));
            
            // Apply position (without Y - we handle that separately for head bob)
            this.camera.position.x = newPosition.x;
            this.camera.position.z = newPosition.z;
        }
        
        // === HEAD BOB & BREATHING EFFECTS ===
        this.updateHeadBob(deltaTime, strafeDirection);
    }
    
    updateHeadBob(deltaTime, strafeDirection) {
        if (!this.headBobEnabled) {
            this.camera.position.y = this.baseHeight;
            return;
        }
        
        // Update strafe tilt
        this.targetCameraTilt = strafeDirection * 0.015; // Subtle lean
        this.cameraTilt += (this.targetCameraTilt - this.cameraTilt) * this.tiltSmoothing;
        
        if (this.isMoving) {
            // Walking head bob
            this.headBobTimer += deltaTime * this.headBobFrequency;
            
            // Natural walking pattern - vertical bob with slight horizontal sway
            // Using sine for vertical (two bounces per step cycle)
            // Using cosine for horizontal (one sway per step cycle)
            this.targetBobOffset.y = Math.sin(this.headBobTimer * 2) * this.headBobAmplitudeY;
            this.targetBobOffset.x = Math.cos(this.headBobTimer) * this.headBobAmplitudeX;
            
        } else {
            // Idle - subtle breathing sway
            this.breathingTimer += deltaTime * this.breathingFrequency;
            
            // Very gentle breathing motion
            this.targetBobOffset.y = Math.sin(this.breathingTimer * Math.PI * 2) * this.breathingAmplitudeY;
            this.targetBobOffset.x = Math.cos(this.breathingTimer * Math.PI) * 0.003;
            
            // Slowly decay head bob timer when stopped for smooth transition
            this.headBobTimer *= 0.95;
        }
        
        // Smooth interpolation to target
        this.currentBobOffset.x += (this.targetBobOffset.x - this.currentBobOffset.x) * this.headBobSmoothing;
        this.currentBobOffset.y += (this.targetBobOffset.y - this.currentBobOffset.y) * this.headBobSmoothing;
        
        // Apply vertical bob to camera height
        this.camera.position.y = this.baseHeight + this.currentBobOffset.y;
        
        // Apply horizontal sway and tilt to camera rotation
        // We need to include the bob sway in the euler rotation
        const rollFromBob = this.currentBobOffset.x * 0.5; // Subtle roll from horizontal sway
        const totalRoll = this.cameraTilt + rollFromBob;
        
        this.euler.set(this.pitch, this.yaw, totalRoll);
        this.camera.quaternion.setFromEuler(this.euler);
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
