/**
 * PROJECT DEATHBED - Main Entry Point
 * A narrative-driven 3D game about love, loss, and a lonely sky
 */

import * as THREE from 'three';
import { Game } from './core/Game.js';
import { AudioManager } from './audio/AudioManager.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new Game();
    
    // Handle main menu
    const mainMenu = document.getElementById('main-menu');
    const startButton = document.getElementById('start-game');
    const controlsButton = document.getElementById('controls-btn');
    
    startButton.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        game.start();
    });
    
    controlsButton.addEventListener('click', () => {
        alert('Controls:\n\nWASD - Move\nMouse - Look Around\nE - Interact with objects\nSPACE - Continue dialogue\nESC - Pause');
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        game.handleResize();
    });
});
