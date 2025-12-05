/**
 * PROJECT DEATHBED - Scene Manager
 * Manages 3D scenes and camera with transitions
 */

import * as THREE from 'three';
import { PlayerController } from '../entities/PlayerController.js';
import { ConvoyShelterScene } from './ConvoyShelterScene.js';
import { ApartmentScene } from './ApartmentScene.js';
import { RooftopScene } from './RooftopScene.js';
import { TannerWorkshopScene } from './TannerWorkshopScene.js';
import { ExteriorScene } from './ExteriorScene.js';
import { LightEntity } from '../entities/LightEntity.js';

export class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.camera = null;
        this.playerController = null;
        this.scenes = {};
        this.transitioning = false;
        
        // Create the camera
        this.setupCamera();
        
        // Initialize available scenes
        this.initializeScenes();
        
        // Create transition overlay
        this.createTransitionOverlay();
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.7, 5); // Eye level
    }
    
    initializeScenes() {
        // Register all game scenes
        this.scenes = {
            'apartment': () => new ApartmentScene(this.game),
            'rooftop': () => new RooftopScene(this.game),
            'convoy_shelter': () => new ConvoyShelterScene(this.game),
            'tanner_workshop': () => new TannerWorkshopScene(this.game),
            'exterior': () => new ExteriorScene(this.game)
        };
    }
    
    createTransitionOverlay() {
        // Create a fade overlay for scene transitions
        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.id = 'fade-overlay';
        this.fadeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            opacity: 0;
            pointer-events: none;
            z-index: 999;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(this.fadeOverlay);
    }
    
    loadScene(sceneName, fadeTransition = true) {
        if (this.transitioning) return;
        
        if (fadeTransition && this.currentScene) {
            this.transitioning = true;
            
            // Fade out
            this.fadeOverlay.style.opacity = '1';
            
            setTimeout(() => {
                this.doLoadScene(sceneName);
                
                // Fade in
                setTimeout(() => {
                    this.fadeOverlay.style.opacity = '0';
                    this.transitioning = false;
                }, 100);
            }, 500);
        } else {
            this.doLoadScene(sceneName);
        }
    }
    
    doLoadScene(sceneName) {
        // Clean up current scene
        if (this.currentScene) {
            this.cleanupScene();
        }
        
        // Create new scene
        const SceneClass = this.scenes[sceneName];
        if (SceneClass) {
            const sceneInstance = SceneClass();
            this.currentScene = sceneInstance.scene;
            
            // Determine starting position based on scene
            const startPositions = {
                'apartment': new THREE.Vector3(0, 1.7, 3),
                'rooftop': new THREE.Vector3(-4, 1.7, 5),
                'convoy_shelter': new THREE.Vector3(0, 1.7, 5),
                'tanner_workshop': new THREE.Vector3(0, 1.7, 4),
                'exterior': new THREE.Vector3(0, 1.7, -5)
            };
            
            const startPos = startPositions[sceneName] || new THREE.Vector3(0, 1.7, 5);
            this.camera.position.copy(startPos);
            
            // Setup player controller
            this.playerController = new PlayerController(
                this.camera, 
                this.game.inputManager,
                this.currentScene
            );
            
            // Set scene-specific bounds
            if (sceneInstance.bounds) {
                this.playerController.setBounds(sceneInstance.bounds);
            }
            
            // Store scene data reference
            this.currentSceneData = sceneInstance;
            
            // Update game state
            this.game.gameState.currentScene = sceneName;
            
            console.log(`Loaded scene: ${sceneName}`);
        } else {
            console.error(`Scene not found: ${sceneName}`);
        }
    }
    
    cleanupScene() {
        if (this.currentScene) {
            // Dispose of geometries and materials
            this.currentScene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    }
    
    update(deltaTime) {
        // Update player controller
        if (this.playerController) {
            this.playerController.update(deltaTime);
        }
        
        // Update scene-specific logic
        if (this.currentSceneData && this.currentSceneData.update) {
            this.currentSceneData.update(deltaTime);
        }
    }
    
    handleResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }
    
    // Get interactable objects in the current scene
    getInteractables() {
        if (this.currentSceneData && this.currentSceneData.interactables) {
            return this.currentSceneData.interactables;
        }
        return [];
    }
    
    // Get NPCs in the current scene
    getNPCs() {
        if (this.currentSceneData && this.currentSceneData.npcs) {
            return this.currentSceneData.npcs;
        }
        return [];
    }
}
