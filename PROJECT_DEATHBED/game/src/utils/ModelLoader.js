/**
 * PROJECT DEATHBED - Model Loader
 * Utility for loading and managing 3D models (GLTF, FBX, OBJ)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
    constructor() {
        // Initialize loaders
        this.gltfLoader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();
        this.objLoader = new OBJLoader();
        
        // Setup DRACO decoder for compressed GLTF files
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Cache for loaded models
        this.modelCache = new Map();
        
        // Loading manager for tracking progress
        this.loadingManager = new THREE.LoadingManager();
        this.loadingManager.onProgress = (url, loaded, total) => {
            console.log(`Loading: ${url} (${loaded}/${total})`);
        };
    }
    
    /**
     * Load a GLTF/GLB model
     * @param {string} path - Path to the model file
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} - Returns { scene, animations, mixer }
     */
    async loadGLTF(path, options = {}) {
        const cacheKey = `gltf:${path}`;
        
        // Check cache first
        if (this.modelCache.has(cacheKey) && !options.noCache) {
            const cached = this.modelCache.get(cacheKey);
            return this.cloneModel(cached);
        }
        
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    const result = {
                        scene: gltf.scene,
                        animations: gltf.animations,
                        mixer: null
                    };
                    
                    // Apply default settings
                    this.applyModelSettings(result.scene, options);
                    
                    // Create animation mixer if animations exist
                    if (gltf.animations.length > 0) {
                        result.mixer = new THREE.AnimationMixer(result.scene);
                        result.actions = {};
                        
                        gltf.animations.forEach((clip) => {
                            result.actions[clip.name] = result.mixer.clipAction(clip);
                        });
                    }
                    
                    // Cache the result
                    this.modelCache.set(cacheKey, result);
                    
                    console.log(`Loaded GLTF model: ${path}`, {
                        animations: gltf.animations.map(a => a.name)
                    });
                    
                    resolve(result);
                },
                (progress) => {
                    if (options.onProgress) {
                        options.onProgress(progress.loaded / progress.total);
                    }
                },
                (error) => {
                    console.error(`Failed to load GLTF model: ${path}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load an FBX model
     * @param {string} path - Path to the model file
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} - Returns { scene, animations, mixer }
     */
    async loadFBX(path, options = {}) {
        const cacheKey = `fbx:${path}`;
        
        if (this.modelCache.has(cacheKey) && !options.noCache) {
            const cached = this.modelCache.get(cacheKey);
            return this.cloneModel(cached);
        }
        
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                path,
                (fbx) => {
                    const result = {
                        scene: fbx,
                        animations: fbx.animations,
                        mixer: null
                    };
                    
                    this.applyModelSettings(result.scene, options);
                    
                    if (fbx.animations.length > 0) {
                        result.mixer = new THREE.AnimationMixer(fbx);
                        result.actions = {};
                        
                        fbx.animations.forEach((clip) => {
                            result.actions[clip.name] = result.mixer.clipAction(clip);
                        });
                    }
                    
                    this.modelCache.set(cacheKey, result);
                    
                    console.log(`Loaded FBX model: ${path}`, {
                        animations: fbx.animations.map(a => a.name)
                    });
                    
                    resolve(result);
                },
                (progress) => {
                    if (options.onProgress) {
                        options.onProgress(progress.loaded / progress.total);
                    }
                },
                (error) => {
                    console.error(`Failed to load FBX model: ${path}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load an OBJ model
     * @param {string} path - Path to the model file
     * @param {Object} options - Loading options
     * @returns {Promise<THREE.Group>}
     */
    async loadOBJ(path, options = {}) {
        const cacheKey = `obj:${path}`;
        
        if (this.modelCache.has(cacheKey) && !options.noCache) {
            return this.modelCache.get(cacheKey).clone();
        }
        
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                path,
                (obj) => {
                    this.applyModelSettings(obj, options);
                    this.modelCache.set(cacheKey, obj);
                    
                    console.log(`Loaded OBJ model: ${path}`);
                    resolve(obj.clone());
                },
                (progress) => {
                    if (options.onProgress) {
                        options.onProgress(progress.loaded / progress.total);
                    }
                },
                (error) => {
                    console.error(`Failed to load OBJ model: ${path}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Auto-detect format and load model
     * @param {string} path - Path to the model file
     * @param {Object} options - Loading options
     */
    async loadModel(path, options = {}) {
        const extension = path.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'gltf':
            case 'glb':
                return this.loadGLTF(path, options);
            case 'fbx':
                return this.loadFBX(path, options);
            case 'obj':
                return this.loadOBJ(path, options);
            default:
                throw new Error(`Unsupported model format: ${extension}`);
        }
    }
    
    /**
     * Apply common settings to loaded models
     */
    applyModelSettings(object, options) {
        // Scale
        if (options.scale) {
            if (typeof options.scale === 'number') {
                object.scale.setScalar(options.scale);
            } else {
                object.scale.set(options.scale.x, options.scale.y, options.scale.z);
            }
        }
        
        // Position
        if (options.position) {
            object.position.set(options.position.x, options.position.y, options.position.z);
        }
        
        // Rotation
        if (options.rotation) {
            object.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
        }
        
        // Enable shadows
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = options.castShadow !== false;
                child.receiveShadow = options.receiveShadow !== false;
                
                // Fix materials
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.side = THREE.DoubleSide;
                        });
                    } else {
                        child.material.side = THREE.DoubleSide;
                    }
                }
            }
        });
    }
    
    /**
     * Clone a cached model with new animation mixer
     */
    cloneModel(cached) {
        const cloned = {
            scene: cached.scene.clone(),
            animations: cached.animations,
            mixer: null,
            actions: {}
        };
        
        if (cached.animations && cached.animations.length > 0) {
            cloned.mixer = new THREE.AnimationMixer(cloned.scene);
            cached.animations.forEach((clip) => {
                cloned.actions[clip.name] = cloned.mixer.clipAction(clip);
            });
        }
        
        return cloned;
    }
    
    /**
     * Preload multiple models
     * @param {Array<{path: string, options?: Object}>} models
     */
    async preloadModels(models) {
        const promises = models.map(({ path, options }) => 
            this.loadModel(path, options).catch(err => {
                console.warn(`Failed to preload: ${path}`, err);
                return null;
            })
        );
        
        return Promise.all(promises);
    }
    
    /**
     * Clear the model cache
     */
    clearCache() {
        this.modelCache.clear();
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.modelCache.size,
            keys: Array.from(this.modelCache.keys())
        };
    }
}

// Singleton instance
export const modelLoader = new ModelLoader();
