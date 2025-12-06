/**
 * PROJECT DEATHBED - Core Game Class
 * Manages the game loop, scenes, and core systems
 * Enhanced with cinematic intro, save system, and linear progression
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
import { SaveManager } from './SaveManager.js';
import { IntroAnimation } from '../ui/IntroAnimation.js';
import { JournalAnimation } from '../ui/JournalAnimation.js';
import { CreditsAnimation } from '../ui/CreditsAnimation.js';
import { Prologue1Animation } from '../ui/Prologue1Animation.js';
import { Prologue2Animation } from '../ui/Prologue2Animation.js';

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
        this.saveManager = new SaveManager();
        
        // Initialize game systems
        this.sceneManager = new SceneManager(this);
        this.interactionSystem = new InteractionSystem(this);
        this.dialogueSystem = new DialogueSystem(this);
        
        // Bind the game loop
        this.update = this.update.bind(this);
        
        // Hide loading screen and start experience
        this.hideLoadingScreen();
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingProgress = document.getElementById('loading-progress');
        
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    // Auto-start the experience on first user interaction
                    this.waitForInteraction();
                }, 500);
            }
            loadingProgress.style.width = `${progress}%`;
        }, 200);
    }
    
    waitForInteraction() {
        // Create a click-to-start overlay
        this.startOverlay = document.createElement('div');
        this.startOverlay.id = 'start-overlay';
        this.startOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, #0d0d1a 0%, #000000 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2500;
            cursor: pointer;
            font-family: 'Georgia', serif;
        `;
        
        // Add animated particles to background
        this.createStartScreenParticles();
        
        // Animated title
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            text-align: center;
            animation: fadeInUp 2s ease forwards;
        `;
        
        titleContainer.innerHTML = `
            <h1 style="
                color: #c9a227;
                font-size: 4.5em;
                margin-bottom: 0.2em;
                text-shadow: 0 0 50px rgba(201, 162, 39, 0.8),
                             0 0 100px rgba(201, 162, 39, 0.4);
                letter-spacing: 0.15em;
                animation: titleGlow 3s ease-in-out infinite;
            ">PROJECT DEATHBED</h1>
            <p style="
                color: #6a7a8a;
                font-size: 1.3em;
                font-style: italic;
                margin-bottom: 3em;
                opacity: 0;
                animation: fadeIn 2s ease 1s forwards;
            ">A story of two brothers at the end of all things</p>
            <div style="
                color: #c9a227;
                font-size: 1.2em;
                opacity: 0;
                animation: pulse 2s ease-in-out infinite, fadeIn 2s ease 2s forwards;
                cursor: pointer;
            ">
                <span style="font-size: 2em;">▶</span><br>
                Click anywhere to begin
            </div>
        `;
        
        this.startOverlay.appendChild(titleContainer);
        
        // Add animation styles
        this.addAnimationStyles();
        
        document.body.appendChild(this.startOverlay);
        
        // Handle click to start
        const startHandler = () => {
            this.startOverlay.style.transition = 'opacity 1s ease';
            this.startOverlay.style.opacity = '0';
            
            setTimeout(() => {
                if (this.startOverlay.parentNode) {
                    this.startOverlay.parentNode.removeChild(this.startOverlay);
                }
                this.beginExperience();
            }, 1000);
        };
        
        this.startOverlay.addEventListener('click', startHandler, { once: true });
        document.addEventListener('keydown', startHandler, { once: true });
    }
    
    createStartScreenParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
        this.startOverlay.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        
        // Create floating particles
        const particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: -Math.random() * 0.8 - 0.2,
                opacity: Math.random() * 0.6 + 0.1,
                hue: Math.random() * 30 + 35 // Golden range
            });
        }
        
        const animate = () => {
            if (!this.startOverlay || !this.startOverlay.parentNode) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity += (Math.random() - 0.5) * 0.02;
                p.opacity = Math.max(0.1, Math.min(0.7, p.opacity));
                
                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                
                // Glow effect
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                gradient.addColorStop(0, `hsla(${p.hue}, 70%, 60%, ${p.opacity})`);
                gradient.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    addAnimationStyles() {
        if (document.getElementById('game-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'game-animation-styles';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes titleGlow {
                0%, 100% {
                    text-shadow: 0 0 50px rgba(201, 162, 39, 0.8),
                                 0 0 100px rgba(201, 162, 39, 0.4);
                }
                50% {
                    text-shadow: 0 0 80px rgba(201, 162, 39, 1),
                                 0 0 150px rgba(201, 162, 39, 0.6),
                                 0 0 200px rgba(201, 162, 39, 0.3);
                }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
            
            @keyframes borderGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(201, 162, 39, 0.3); }
                50% { box-shadow: 0 0 40px rgba(201, 162, 39, 0.6); }
            }
        `;
        document.head.appendChild(style);
    }
    
    beginExperience() {
        // Check for existing save
        if (this.saveManager.hasSaveData()) {
            this.showMainMenu();
        } else {
            // New player - auto-start intro
            this.saveManager.createNewSave(0);
            this.playIntroAnimation();
        }
    }
    
    showMainMenu() {
        this.mainMenu = document.createElement('div');
        this.mainMenu.id = 'main-menu';
        this.mainMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, #0d0d1a 0%, #000000 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Georgia', serif;
        `;
        
        // Add background particles
        this.createMenuParticles();
        
        // Title with enhanced effects
        const title = document.createElement('h1');
        title.textContent = 'PROJECT DEATHBED';
        title.style.cssText = `
            color: #c9a227;
            font-size: 4em;
            margin-bottom: 0.2em;
            text-shadow: 0 0 50px rgba(201, 162, 39, 0.8);
            letter-spacing: 0.15em;
            animation: titleGlow 3s ease-in-out infinite;
            position: relative;
            z-index: 1;
        `;
        this.mainMenu.appendChild(title);
        
        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.textContent = 'A story of two brothers at the end of all things';
        subtitle.style.cssText = `
            color: #6a7a8a;
            font-size: 1.2em;
            margin-bottom: 2em;
            font-style: italic;
            position: relative;
            z-index: 1;
        `;
        this.mainMenu.appendChild(subtitle);
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1em;
            align-items: center;
            position: relative;
            z-index: 1;
        `;
        
        // Continue button (if save exists and has progress)
        const currentSave = this.saveManager.load(0);
        if (currentSave && currentSave.stageIndex > 0) {
            const continueBtn = this.createMenuButton(
                '▶ CONTINUE',
                `Resume from ${this.getStageDisplayName(currentSave.currentStage)}`,
                true
            );
            continueBtn.onclick = () => this.continueGame();
            buttonContainer.appendChild(continueBtn);
        }
        
        // New Game button
        const newGameBtn = this.createMenuButton(
            '✦ NEW GAME',
            'Begin the journey from the start',
            !currentSave || currentSave.stageIndex === 0
        );
        newGameBtn.onclick = () => this.startNewGame();
        buttonContainer.appendChild(newGameBtn);
        
        // Replay Intro button
        const introBtn = this.createMenuButton(
            '🎬 WATCH INTRO',
            'Experience the cinematic opening',
            false
        );
        introBtn.onclick = () => this.playIntroAnimation();
        buttonContainer.appendChild(introBtn);
        
        // Test Credits button (TEMPORARY - remove later)
        const creditsBtn = this.createMenuButton(
            '🌙 ENDING CREDITS',
            'Preview the ending sequence',
            false
        );
        creditsBtn.onclick = () => this.playCreditsAnimation();
        buttonContainer.appendChild(creditsBtn);
        
        this.mainMenu.appendChild(buttonContainer);
        
        // Play time display
        if (currentSave && currentSave.playTime > 0) {
            const playTime = document.createElement('p');
            playTime.textContent = `Total Play Time: ${this.saveManager.getFormattedPlayTime()}`;
            playTime.style.cssText = `
                color: #4a5a6a;
                font-size: 0.9em;
                margin-top: 2em;
                position: relative;
                z-index: 1;
            `;
            this.mainMenu.appendChild(playTime);
        }
        
        // Instructions
        const instructions = document.createElement('p');
        instructions.innerHTML = 'WASD to move | Mouse to look | E to interact | ESC for menu';
        instructions.style.cssText = `
            color: #3a4a5a;
            font-size: 0.85em;
            margin-top: 2em;
            letter-spacing: 0.1em;
            position: relative;
            z-index: 1;
        `;
        this.mainMenu.appendChild(instructions);
        
        document.body.appendChild(this.mainMenu);
        
        // Start ambient music
        this.audioManager.playCustomMusic('intro-theme.mp3', {
            loop: true,
            volume: 0.4,
            fadeIn: 2.0
        });
    }
    
    createMenuButton(title, subtitle, isPrimary) {
        const btn = document.createElement('button');
        btn.innerHTML = `<strong>${title}</strong><br><small style="color: ${isPrimary ? '#e8d59a' : '#6a7a8a'}">${subtitle}</small>`;
        btn.style.cssText = `
            background: ${isPrimary 
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.3), rgba(201, 162, 39, 0.1))' 
                : 'rgba(60, 60, 80, 0.2)'};
            border: ${isPrimary ? '2px' : '1px'} solid ${isPrimary ? '#c9a227' : '#4a5a6a'};
            color: ${isPrimary ? '#c9a227' : '#8a9aaa'};
            padding: ${isPrimary ? '1.5em 3em' : '1em 2em'};
            font-size: ${isPrimary ? '1.3em' : '1.1em'};
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 350px;
            font-family: 'Georgia', serif;
            ${isPrimary ? 'animation: borderGlow 2s ease-in-out infinite;' : ''}
        `;
        
        btn.onmouseover = () => {
            btn.style.background = isPrimary 
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.5), rgba(201, 162, 39, 0.3))'
                : 'rgba(80, 80, 100, 0.3)';
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = `0 0 30px rgba(${isPrimary ? '201, 162, 39' : '100, 120, 140'}, 0.4)`;
        };
        
        btn.onmouseout = () => {
            btn.style.background = isPrimary 
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.3), rgba(201, 162, 39, 0.1))'
                : 'rgba(60, 60, 80, 0.2)';
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = isPrimary ? '0 0 20px rgba(201, 162, 39, 0.3)' : 'none';
        };
        
        return btn;
    }
    
    createMenuParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
        this.mainMenu.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2.5 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -Math.random() * 0.5 - 0.1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
        
        const animate = () => {
            if (!this.mainMenu || !this.mainMenu.parentNode) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                
                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
                gradient.addColorStop(0, `rgba(201, 162, 39, ${p.opacity})`);
                gradient.addColorStop(1, `rgba(201, 162, 39, 0)`);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    getStageDisplayName(stage) {
        const names = {
            'intro': 'Intro',
            'prologue_1': 'The Apartment',
            'prologue_2': "Adrian's Journal",
            'act1_shelter': 'The Shelter',
            'act1_workshop': "Tanner's Workshop",
            'act1_exterior': 'The Exterior'
        };
        return names[stage] || stage;
    }
    
    startNewGame() {
        // Create new save
        this.saveManager.createNewSave(0);
        
        // Hide menu
        if (this.mainMenu) {
            this.mainMenu.style.display = 'none';
        }
        
        // Stop menu music
        this.audioManager.stopCustomMusic(1.0);
        
        // Start with intro
        this.playIntroAnimation();
    }
    
    continueGame() {
        const save = this.saveManager.load(0);
        if (!save) return;
        
        // Hide menu
        if (this.mainMenu) {
            this.mainMenu.style.display = 'none';
        }
        
        // Stop menu music
        this.audioManager.stopCustomMusic(1.0);
        
        // Resume from saved stage
        this.resumeFromStage(save.currentStage);
    }
    
    resumeFromStage(stage) {
        switch (stage) {
            case 'intro':
                this.playIntroAnimation();
                break;
            case 'prologue_1':
                this.playPrologue1Animation();
                break;
            case 'prologue_2':
                this.playPrologue2Animation();
                break;
            case 'act1_apartment':
                this.playApartmentPrologue();
                break;
            case 'act1_shelter':
                this.startGameplay('convoy_shelter');
                break;
            case 'act1_workshop':
                this.startGameplay('tanner_workshop');
                break;
            case 'act1_exterior':
                this.startGameplay('exterior');
                break;
            default:
                this.startGameplay('convoy_shelter');
        }
    }
    
    playIntroAnimation() {
        // Hide menus
        if (this.mainMenu) this.mainMenu.style.display = 'none';
        if (this.startOverlay) this.startOverlay.style.display = 'none';
        
        // Stop any current music
        this.audioManager.stopCustomMusic(0.5);
        
        // Create and play intro
        this.introAnimation = new IntroAnimation(this.audioManager, () => {
            // Mark intro as seen
            this.saveManager.setStage('prologue_1');
            this.saveManager.save();
            
            // Proceed to Prologue 1 Animation (Memory of the brothers)
            this.playPrologue1Animation();
        });
        
        this.introAnimation.start();
    }
    
    playPrologue1Animation() {
        // Play the "What Once Was" animation - memory of Luis and Adrian before The Light
        this.prologue1Animation = new Prologue1Animation(this.audioManager, () => {
            // When Prologue 1 ends, play Prologue 2
            this.saveManager.setStage('prologue_2');
            this.saveManager.save();
            this.playPrologue2Animation();
        });
        
        this.prologue1Animation.start();
    }
    
    playPrologue2Animation() {
        // Play Adrian's Journal animation - documenting The Light
        this.prologue2Animation = new Prologue2Animation(this.audioManager, () => {
            // After Prologue 2, go to the apartment for interactive gameplay
            this.saveManager.setStage('act1_apartment');
            this.saveManager.save();
            this.playApartmentPrologue();
        });
        
        this.prologue2Animation.start();
    }
    
    playApartmentPrologue() {
        console.log('Starting apartment prologue...');
        // Hide menus
        if (this.mainMenu) this.mainMenu.style.display = 'none';
        if (this.startOverlay) this.startOverlay.style.display = 'none';
        
        // Start apartment scene as interactive prologue
        this.startGameplay('apartment', () => {
            // When apartment is complete, go to shelter
            this.saveManager.setStage('act1_shelter');
            this.saveManager.save();
            this.startGameplay('convoy_shelter');
        });
    }
    
    playPrologue1() {
        // Legacy method - redirects to new animation
        this.playPrologue1Animation();
    }
    
    playPrologue2() {
        // Play Adrian's Journal animation (legacy)
        this.journalAnimation = new JournalAnimation(this.audioManager, () => {
            // After journal, start Act 1
            this.saveManager.setStage('act1_shelter');
            this.saveManager.save();
            this.startGameplay('convoy_shelter');
        });
        
        this.journalAnimation.start();
    }
    
    playCreditsAnimation() {
        // Hide menus
        if (this.mainMenu) this.mainMenu.style.display = 'none';
        if (this.startOverlay) this.startOverlay.style.display = 'none';
        
        // Stop any current music
        this.audioManager.stopCustomMusic(0.5);
        
        // Create and play credits
        this.creditsAnimation = new CreditsAnimation(this.audioManager, () => {
            // Return to main menu when credits end
            this.showMainMenu();
        });
        
        this.creditsAnimation.start();
    }
    
    startGameplay(sceneName, onSceneComplete = null) {
        console.log('startGameplay called with:', sceneName);
        this.onSceneComplete = onSceneComplete;
        
        // Hide and remove any menus
        if (this.mainMenu) {
            this.mainMenu.style.display = 'none';
            if (this.mainMenu.parentNode) {
                this.mainMenu.parentNode.removeChild(this.mainMenu);
            }
            this.mainMenu = null;
        }
        if (this.startOverlay) {
            this.startOverlay.style.display = 'none';
        }
        
        if (this.isRunning) {
            console.log('Game already running, loading scene directly');
            this.sceneManager.loadScene(sceneName, false);
            return;
        }
        
        this.isRunning = true;
        console.log('Starting game loop...');
        
        // Lock pointer for first-person controls
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.dialogueSystem.isActive) {
                this.renderer.domElement.requestPointerLock();
            }
        });
        
        // Load the scene
        this.sceneManager.loadScene(sceneName, false);
        
        // Start ambient soundtrack
        this.audioManager.playAmbient('somber_ambient');
        
        // Start game loop
        this.update();
    }
    
    completeCurrentScene() {
        if (this.onSceneComplete) {
            this.onSceneComplete();
        } else {
            // Default progression
            const nextStage = this.saveManager.advanceStage();
            this.resumeFromStage(nextStage);
        }
    }
    
    update() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(this.update);
        
        try {
            this.deltaTime = this.clock.getDelta();
            
            // Update play time
            this.saveManager.updatePlayTime(this.deltaTime);
            
            // Update player lucidity (outside exposure system)
            const lucidityResult = this.gameState.updatePlayerLucidity(this.deltaTime);
            
            // Handle lucidity events
            if (lucidityResult.vestBroken) {
                this.uiManager.showNotification('Your radiation vest has broken!', 'warning', 4000);
            }
            
            if (lucidityResult.died) {
                this.triggerLucidityDeath();
                return;
            }
            
            // Update all systems
            this.inputManager.update();
            this.sceneManager.update(this.deltaTime);
            this.interactionSystem.update();
            this.dialogueSystem.update(this.deltaTime);
            this.particleSystem.update(this.deltaTime);
            this.uiManager.update(this.gameState);
            
            // Render
            this.renderer.render(this.sceneManager.currentScene, this.sceneManager.camera);
        } catch (error) {
            console.error('Game update error:', error);
        }
    }
    
    triggerLucidityDeath() {
        this.isRunning = false;
        
        // Create death screen
        const deathScreen = document.createElement('div');
        deathScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, #1a0000 0%, #000000 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            opacity: 0;
            transition: opacity 2s ease;
            font-family: 'Georgia', serif;
        `;
        
        deathScreen.innerHTML = `
            <div style="text-align: center; animation: fadeInUp 2s ease forwards;">
                <h1 style="
                    color: #ff4444;
                    font-size: 3.5em;
                    margin-bottom: 0.5em;
                    text-shadow: 0 0 50px rgba(255, 50, 50, 0.8);
                    letter-spacing: 0.2em;
                ">THE LIGHT CONSUMED YOU</h1>
                <p style="
                    color: #8a5a5a;
                    font-size: 1.3em;
                    font-style: italic;
                    margin-bottom: 2em;
                    opacity: 0;
                    animation: fadeIn 2s ease 1s forwards;
                ">You stayed outside too long without protection...</p>
                <p style="
                    color: #6a6a7a;
                    font-size: 1.1em;
                    margin-bottom: 1em;
                    opacity: 0;
                    animation: fadeIn 2s ease 2s forwards;
                ">Adrian's vision blurred as The Light's influence overtook his mind.<br>
                Luis would never see his brother again.</p>
                <button id="death-retry-btn" style="
                    background: rgba(100, 40, 40, 0.5);
                    border: 2px solid #ff4444;
                    color: #ff6b6b;
                    padding: 1em 2.5em;
                    font-size: 1.2em;
                    cursor: pointer;
                    font-family: 'Georgia', serif;
                    margin-top: 2em;
                    opacity: 0;
                    animation: fadeIn 2s ease 3s forwards;
                    transition: all 0.3s ease;
                ">Return to Shelter</button>
            </div>
        `;
        
        document.body.appendChild(deathScreen);
        
        // Fade in
        requestAnimationFrame(() => {
            deathScreen.style.opacity = '1';
        });
        
        // Handle retry
        setTimeout(() => {
            const retryBtn = document.getElementById('death-retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    // Reset player lucidity and return to shelter
                    this.gameState.playerCondition.lucidity = 0;
                    this.gameState.setOutside(false);
                    
                    // Fade out death screen
                    deathScreen.style.opacity = '0';
                    setTimeout(() => {
                        deathScreen.remove();
                        // Load shelter scene
                        this.sceneManager.loadScene('convoy_shelter');
                        this.isRunning = true;
                        this.clock.start();
                        this.update();
                    }, 1000);
                });
                
                retryBtn.addEventListener('mouseenter', () => {
                    retryBtn.style.background = 'rgba(150, 50, 50, 0.7)';
                    retryBtn.style.transform = 'scale(1.05)';
                });
                retryBtn.addEventListener('mouseleave', () => {
                    retryBtn.style.background = 'rgba(100, 40, 40, 0.5)';
                    retryBtn.style.transform = 'scale(1)';
                });
            }
        }, 3500);
    }
    
    handleResize() {
        this.renderer.handleResize();
        this.sceneManager.handleResize();
    }
    
    pause() {
        this.isRunning = false;
        this.saveManager.save();
    }
    
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.clock.start();
            this.update();
        }
    }
    
    // Show pause menu with save option
    showPauseMenu() {
        // Save on pause
        this.saveManager.save();
        // Pause menu implementation...
    }
}
