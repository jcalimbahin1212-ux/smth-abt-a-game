/**
 * PROJECT DEATHBED - Core Game Class
 * Manages the game loop, scenes, and core systems
 */

import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { InputManager } from './InputManager.js';
import { SceneManager } from '../scenes/SceneManager.js';
import { UIManager } from '../ui/UIManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { GameState } from './GameState.js';

export class Game {
    constructor() {
        this.isRunning = false;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        
        // Initialize core systems
        this.renderer = new Renderer();
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager();
        this.gameState = new GameState();
        this.particleSystem = new ParticleSystem();
        
        // Initialize game systems
        this.sceneManager = new SceneManager(this);
        this.interactionSystem = new InteractionSystem(this);
        this.dialogueSystem = new DialogueSystem(this);
        
        // Bind the game loop
        this.update = this.update.bind(this);
        
        // Create main menu
        this.createMainMenu();
        
        // Hide loading screen once ready
        this.hideLoadingScreen();
    }
    
    createMainMenu() {
        this.mainMenu = document.createElement('div');
        this.mainMenu.id = 'main-menu';
        this.mainMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a15 0%, #1a1a30 50%, #0a0a15 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Georgia', serif;
        `;
        
        // Title
        const title = document.createElement('h1');
        title.textContent = 'PROJECT DEATHBED';
        title.style.cssText = `
            color: #c9a227;
            font-size: 4em;
            margin-bottom: 0.2em;
            text-shadow: 0 0 30px rgba(201, 162, 39, 0.5);
            letter-spacing: 0.1em;
        `;
        this.mainMenu.appendChild(title);
        
        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.textContent = 'A story of two brothers at the end of all things';
        subtitle.style.cssText = `
            color: #6a7a8a;
            font-size: 1.2em;
            margin-bottom: 3em;
            font-style: italic;
        `;
        this.mainMenu.appendChild(subtitle);
        
        // Menu buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1em;
        `;
        
        // Scene options
        const scenes = [
            { id: 'apartment', name: 'Prologue: The Apartment', desc: 'Before the Light' },
            { id: 'rooftop', name: 'Prologue: The Rooftop', desc: 'When everything changed' },
            { id: 'convoy_shelter', name: 'Act I: The Shelter', desc: 'Three months later' },
            { id: 'tanner_workshop', name: "Act I: Tanner's Workshop", desc: 'A place of hope' },
            { id: 'exterior', name: 'Act I: The Exterior', desc: 'Under fractured skies' }
        ];
        
        scenes.forEach(scene => {
            const btn = document.createElement('button');
            btn.innerHTML = `<strong>${scene.name}</strong><br><small style="color:#6a7a8a">${scene.desc}</small>`;
            btn.style.cssText = `
                background: rgba(201, 162, 39, 0.1);
                border: 1px solid #c9a227;
                color: #c9a227;
                padding: 1em 2em;
                font-size: 1.1em;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 300px;
                font-family: 'Georgia', serif;
            `;
            btn.onmouseover = () => {
                btn.style.background = 'rgba(201, 162, 39, 0.3)';
                btn.style.transform = 'scale(1.05)';
            };
            btn.onmouseout = () => {
                btn.style.background = 'rgba(201, 162, 39, 0.1)';
                btn.style.transform = 'scale(1)';
            };
            btn.onclick = () => this.startGame(scene.id);
            buttonContainer.appendChild(btn);
        });
        
        this.mainMenu.appendChild(buttonContainer);
        
        // Instructions
        const instructions = document.createElement('p');
        instructions.innerHTML = 'WASD to move | Mouse to look | E to interact | ESC for menu';
        instructions.style.cssText = `
            color: #4a5a6a;
            font-size: 0.9em;
            margin-top: 3em;
            letter-spacing: 0.1em;
        `;
        this.mainMenu.appendChild(instructions);
        
        document.body.appendChild(this.mainMenu);
        
        // Play intro music on first user interaction (browsers require this)
        this.introMusicStarted = false;
        const startIntroMusic = () => {
            if (!this.introMusicStarted) {
                this.introMusicStarted = true;
                this.playIntroMusic();
            }
        };
        
        document.addEventListener('click', startIntroMusic, { once: true });
        document.addEventListener('keydown', startIntroMusic, { once: true });
    }
    
    playIntroMusic() {
        // Start intro music with fade-in, loop enabled
        this.audioManager.playCustomMusic('intro-theme.mp3', {
            loop: true,
            volume: 0.6,
            fadeIn: 2.0
        });
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingProgress = document.getElementById('loading-progress');
        
        // Simulate loading progress
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 500);
            }
            loadingProgress.style.width = `${progress}%`;
        }, 200);
    }
    
    startGame(sceneName) {
        // Hide main menu
        this.mainMenu.style.display = 'none';
        
        // Fade out intro music
        this.audioManager.stopCustomMusic(2.0);
        
        if (this.isRunning) {
            // Already running, just load the scene
            this.sceneManager.loadScene(sceneName, false);
            return;
        }
        
        this.isRunning = true;
        
        // Lock pointer for first-person controls
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.dialogueSystem.isActive) {
                this.renderer.domElement.requestPointerLock();
            }
        });
        
        // Load the selected scene
        this.sceneManager.loadScene(sceneName, false);
        
        // Start the ambient soundtrack
        this.audioManager.playAmbient('somber_ambient');
        
        // Start the game loop
        this.update();
    }
    
    start() {
        // Show main menu (don't auto-start anymore)
    }
    
    update() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(this.update);
        
        this.deltaTime = this.clock.getDelta();
        
        // Update all systems
        this.inputManager.update();
        this.sceneManager.update(this.deltaTime);
        this.interactionSystem.update();
        this.dialogueSystem.update(this.deltaTime);
        this.particleSystem.update(this.deltaTime);
        this.uiManager.update(this.gameState);
        
        // Render
        this.renderer.render(this.sceneManager.currentScene, this.sceneManager.camera);
    }
    
    handleResize() {
        this.renderer.handleResize();
        this.sceneManager.handleResize();
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.clock.start();
            this.update();
        }
    }
}
