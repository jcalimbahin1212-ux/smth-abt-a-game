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
    
    // The HTML main-menu is hidden by the Game's loading screen
    // The Game handles its own menu system, so we can hide the HTML menu
    const htmlMainMenu = document.getElementById('main-menu');
    if (htmlMainMenu) {
        htmlMainMenu.style.display = 'none';
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        game.handleResize();
    });
});
