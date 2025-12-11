/**
 * PROJECT DEATHBED - Male Character Model
 * Uses Mixamo base model with tactical/toony styling
 * Baseline for Adrian, Tanner, and other male NPCs
 */

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Character outfit presets
const CHARACTER_STYLES = {
    // Adrian - Main character, tactical casual
    adrian: {
        skinColor: 0xdac4a4,
        primaryColor: 0x2a3a4a,      // Dark tactical blue-gray jacket
        secondaryColor: 0x3a3a3a,    // Dark pants
        accentColor: 0x5a7a5a,       // Olive green accents
        hairColor: 0x2a1a0a,
        outlineColor: 0x1a1a2a,
        outlineWidth: 0.015
    },
    // Tanner - Mechanic/Workshop owner, rugged workwear
    tanner: {
        skinColor: 0xc8a888,
        primaryColor: 0x4a3a2a,      // Brown work jacket
        secondaryColor: 0x3a3a40,    // Dark work pants
        accentColor: 0x6a5a4a,       // Tan utility pockets
        hairColor: 0x5a4030,
        outlineColor: 0x2a2018,
        outlineWidth: 0.012
    },
    // Generic tactical
    tactical: {
        skinColor: 0xd0b090,
        primaryColor: 0x3a4a3a,      // Military olive
        secondaryColor: 0x2a2a30,    // Dark tactical pants
        accentColor: 0x5a6a5a,       // Lighter olive
        hairColor: 0x3a2a1a,
        outlineColor: 0x1a2a1a,
        outlineWidth: 0.012
    },
    // Civilian casual
    civilian: {
        skinColor: 0xdac4a4,
        primaryColor: 0x4a5a6a,      // Casual blue shirt
        secondaryColor: 0x4a4a50,    // Jeans
        accentColor: 0x6a6a70,       // Belt/details
        hairColor: 0x3a2a18,
        outlineColor: 0x2a2a3a,
        outlineWidth: 0.01
    }
};

export class MaleCharacterModel {
    constructor(options = {}) {
        this.name = options.name || 'character';
        this.style = options.style || 'tactical';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || 0;
        this.scale = options.scale || 0.01; // FBX models need scaling
        
        // Get style preset or use custom colors
        const preset = CHARACTER_STYLES[this.style] || CHARACTER_STYLES.tactical;
        this.skinColor = options.skinColor || preset.skinColor;
        this.primaryColor = options.primaryColor || preset.primaryColor;
        this.secondaryColor = options.secondaryColor || preset.secondaryColor;
        this.accentColor = options.accentColor || preset.accentColor;
        this.hairColor = options.hairColor || preset.hairColor;
        this.outlineColor = options.outlineColor || preset.outlineColor;
        this.outlineWidth = options.outlineWidth || preset.outlineWidth;
        
        // Model state
        this.group = new THREE.Group();
        this.model = null;
        this.mixer = null;
        this.animations = {};
        this.currentAction = null;
        this.isLoaded = false;
        
        // Callbacks
        this.onLoad = options.onLoad || null;
        this.onError = options.onError || null;
        
        // Load the base model
        this.loadModel();
    }
    
    loadModel() {
        const loader = new FBXLoader();
        const modelPath = '/models/characters/male_base.fbx';
        
        console.log(`[MaleCharacterModel] Loading model from: ${modelPath}`);
        
        loader.load(
            modelPath,
            (fbx) => {
                this.model = fbx;
                
                console.log(`[MaleCharacterModel] Model loaded successfully!`, fbx);
                
                // Scale the model (Mixamo models are typically in cm)
                this.model.scale.setScalar(this.scale);
                
                // Apply tactical/toony materials
                this.applyTacticalStyle();
                
                // Add toon outline effect
                this.addToonOutline();
                
                // Setup animations if any
                if (fbx.animations && fbx.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    fbx.animations.forEach((clip) => {
                        this.animations[clip.name] = this.mixer.clipAction(clip);
                    });
                }
                
                // Enable shadows
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.group.add(this.model);
                this.isLoaded = true;
                
                console.log(`[MaleCharacterModel] ${this.name} loaded with ${this.style} style`);
                
                if (this.onLoad) {
                    this.onLoad(this);
                }
            },
            (progress) => {
                const percent = progress.total > 0 
                    ? (progress.loaded / progress.total * 100).toFixed(0) 
                    : '...';
                console.log(`[MaleCharacterModel] Loading ${this.name}: ${percent}%`);
            },
            (error) => {
                console.error(`[MaleCharacterModel] Failed to load model:`, error);
                if (this.onError) {
                    this.onError(error);
                }
            }
        );
        
        // Set position and rotation
        this.group.position.copy(this.position);
        this.group.rotation.y = this.rotation;
    }
    
    /**
     * Apply tactical/toony cell-shaded materials to the model
     */
    applyTacticalStyle() {
        if (!this.model) return;
        
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                const originalMaterial = child.material;
                const meshName = child.name.toLowerCase();
                
                // Determine which color to use based on mesh name
                let baseColor = this.primaryColor;
                let roughness = 0.7;
                
                // Skin detection
                if (meshName.includes('head') || meshName.includes('face') || 
                    meshName.includes('hand') || meshName.includes('arm') ||
                    meshName.includes('skin') || meshName.includes('body')) {
                    baseColor = this.skinColor;
                    roughness = 0.5;
                }
                // Hair detection
                else if (meshName.includes('hair') || meshName.includes('scalp')) {
                    baseColor = this.hairColor;
                    roughness = 0.9;
                }
                // Pants/lower body
                else if (meshName.includes('pant') || meshName.includes('leg') || 
                         meshName.includes('shoe') || meshName.includes('boot') ||
                         meshName.includes('lower')) {
                    baseColor = this.secondaryColor;
                    roughness = 0.8;
                }
                // Accessories/details
                else if (meshName.includes('belt') || meshName.includes('pocket') ||
                         meshName.includes('strap') || meshName.includes('vest') ||
                         meshName.includes('accessory')) {
                    baseColor = this.accentColor;
                    roughness = 0.75;
                }
                
                // Create toony material with stepped shading
                const toonMaterial = new THREE.MeshToonMaterial({
                    color: baseColor,
                    gradientMap: this.createToonGradient(),
                });
                
                // For more detail, use standard material with toon-like settings
                const tacticalMaterial = new THREE.MeshStandardMaterial({
                    color: baseColor,
                    roughness: roughness,
                    metalness: 0.0,
                    flatShading: false, // Smooth shading for toon look
                    // Add subtle rim lighting effect via emissive
                });
                
                // Use toon material for the stylized look
                child.material = toonMaterial;
                
                // Store original for potential switching
                child.userData.originalMaterial = originalMaterial;
                child.userData.tacticalMaterial = tacticalMaterial;
            }
        });
    }
    
    /**
     * Create a stepped gradient texture for toon shading
     */
    createToonGradient() {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 1;
        
        const ctx = canvas.getContext('2d');
        
        // Create stepped gradient (3-tone cel shading)
        ctx.fillStyle = '#333333'; // Shadow
        ctx.fillRect(0, 0, 1, 1);
        
        ctx.fillStyle = '#888888'; // Mid-tone
        ctx.fillRect(1, 0, 1, 1);
        
        ctx.fillStyle = '#cccccc'; // Light
        ctx.fillRect(2, 0, 1, 1);
        
        ctx.fillStyle = '#ffffff'; // Highlight
        ctx.fillRect(3, 0, 1, 1);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        
        return texture;
    }
    
    /**
     * Add cartoon outline effect using inverted hull method
     */
    addToonOutline() {
        if (!this.model) return;
        
        this.model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                // Create outline mesh
                const outlineGeometry = child.geometry.clone();
                const outlineMaterial = new THREE.MeshBasicMaterial({
                    color: this.outlineColor,
                    side: THREE.BackSide, // Render back faces only
                });
                
                const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
                
                // Scale slightly larger for outline effect
                const outlineScale = 1 + this.outlineWidth;
                outlineMesh.scale.setScalar(outlineScale);
                
                // Copy transforms
                outlineMesh.position.copy(child.position);
                outlineMesh.rotation.copy(child.rotation);
                outlineMesh.quaternion.copy(child.quaternion);
                
                // Add as sibling
                if (child.parent) {
                    outlineMesh.name = child.name + '_outline';
                    child.parent.add(outlineMesh);
                }
                
                // Store reference
                child.userData.outline = outlineMesh;
            }
        });
    }
    
    /**
     * Play an animation by name
     */
    playAnimation(name, options = {}) {
        const { 
            loop = true, 
            fadeIn = 0.3, 
            fadeOut = 0.3,
            timeScale = 1.0 
        } = options;
        
        const action = this.animations[name];
        if (!action) {
            console.warn(`[MaleCharacterModel] Animation '${name}' not found`);
            return false;
        }
        
        // Fade out current animation
        if (this.currentAction && this.currentAction !== action) {
            this.currentAction.fadeOut(fadeOut);
        }
        
        // Configure and play new animation
        action.reset();
        action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
        action.clampWhenFinished = !loop;
        action.timeScale = timeScale;
        action.fadeIn(fadeIn);
        action.play();
        
        this.currentAction = action;
        return true;
    }
    
    /**
     * Create an idle breathing animation (procedural)
     */
    animateIdle(deltaTime) {
        if (!this.isLoaded) return;
        
        // If we have a mixer with animations, update it
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Add subtle procedural breathing if no animations
        if (!this.currentAction && this.model) {
            const breathAmount = Math.sin(Date.now() * 0.002) * 0.002;
            this.model.scale.y = this.scale * (1 + breathAmount);
        }
    }
    
    /**
     * Update the character
     */
    update(deltaTime) {
        this.animateIdle(deltaTime);
    }
    
    /**
     * Set character style dynamically
     */
    setStyle(styleName) {
        const preset = CHARACTER_STYLES[styleName];
        if (!preset) {
            console.warn(`[MaleCharacterModel] Unknown style: ${styleName}`);
            return;
        }
        
        this.style = styleName;
        this.skinColor = preset.skinColor;
        this.primaryColor = preset.primaryColor;
        this.secondaryColor = preset.secondaryColor;
        this.accentColor = preset.accentColor;
        this.hairColor = preset.hairColor;
        this.outlineColor = preset.outlineColor;
        
        // Re-apply styling
        this.applyTacticalStyle();
    }
    
    /**
     * Highlight the character (for interaction)
     */
    highlight(enabled) {
        if (!this.model) return;
        
        this.model.traverse((child) => {
            if (child.isMesh && child.material && child.material.emissive) {
                if (enabled) {
                    child.material.emissive = new THREE.Color(0x333333);
                    child.material.emissiveIntensity = 0.3;
                } else {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            }
        });
    }
    
    /**
     * Add to a Three.js scene
     */
    addToScene(scene) {
        scene.add(this.group);
    }
    
    /**
     * Remove from scene
     */
    removeFromScene(scene) {
        scene.remove(this.group);
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        if (this.model) {
            this.model.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}

// Export character styles for external use
export { CHARACTER_STYLES };
