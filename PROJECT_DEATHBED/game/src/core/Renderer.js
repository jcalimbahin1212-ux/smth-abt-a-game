/**
 * PROJECT DEATHBED - Renderer
 * Handles WebGL rendering with the dark blue color scheme (lightened)
 */

import * as THREE from 'three';

export class Renderer {
    constructor() {
        // Create the WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        // Configure renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Lighter dark blue color scheme
        this.renderer.setClearColor(0x12121f, 1);
        
        // Enable shadows for atmospheric lighting
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Tone mapping for cinematic look
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        
        // Output encoding
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Add to DOM
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
        
        this.domElement = this.renderer.domElement;
    }
    
    render(scene, camera) {
        if (scene && camera) {
            this.renderer.render(scene, camera);
        } else if (!this._loggedNull) {
            console.warn('Renderer: scene or camera is null', { scene: !!scene, camera: !!camera });
            this._loggedNull = true;
        }
    }
    
    handleResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    get width() {
        return window.innerWidth;
    }
    
    get height() {
        return window.innerHeight;
    }
}
