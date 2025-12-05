/**
 * PROJECT DEATHBED - Procedural Texture Generator
 * Creates canvas-based textures for materials without external assets
 */

import * as THREE from 'three';

export class TextureGenerator {
    constructor() {
        this.textureCache = new Map();
    }
    
    /**
     * Get or create a cached texture
     */
    getTexture(type, options = {}) {
        const key = `${type}_${JSON.stringify(options)}`;
        if (this.textureCache.has(key)) {
            return this.textureCache.get(key);
        }
        
        const texture = this.createTexture(type, options);
        this.textureCache.set(key, texture);
        return texture;
    }
    
    createTexture(type, options) {
        switch (type) {
            case 'wood':
                return this.createWoodTexture(options);
            case 'metal':
                return this.createMetalTexture(options);
            case 'fabric':
                return this.createFabricTexture(options);
            case 'concrete':
                return this.createConcreteTexture(options);
            case 'skin':
                return this.createSkinTexture(options);
            case 'rust':
                return this.createRustTexture(options);
            case 'dirt':
                return this.createDirtTexture(options);
            case 'paper':
                return this.createPaperTexture(options);
            case 'glass':
                return this.createGlassTexture(options);
            case 'leather':
                return this.createLeatherTexture(options);
            default:
                return this.createNoiseTexture(options);
        }
    }
    
    createWoodTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 139, g: 90, b: 43 };
        const grainIntensity = options.grainIntensity || 0.3;
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Wood grain lines
        ctx.strokeStyle = `rgba(${baseColor.r * 0.7}, ${baseColor.g * 0.7}, ${baseColor.b * 0.7}, ${grainIntensity})`;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < size; i += 3 + Math.random() * 5) {
            ctx.beginPath();
            ctx.moveTo(0, i + Math.sin(i * 0.1) * 3);
            
            for (let x = 0; x < size; x += 10) {
                ctx.lineTo(x, i + Math.sin((i + x) * 0.05) * 4 + (Math.random() - 0.5) * 2);
            }
            ctx.stroke();
        }
        
        // Knots
        const knotCount = options.knots || 2;
        for (let k = 0; k < knotCount; k++) {
            const kx = Math.random() * size;
            const ky = Math.random() * size;
            const kr = 5 + Math.random() * 10;
            
            const gradient = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
            gradient.addColorStop(0, `rgba(${baseColor.r * 0.4}, ${baseColor.g * 0.4}, ${baseColor.b * 0.4}, 0.8)`);
            gradient.addColorStop(0.5, `rgba(${baseColor.r * 0.6}, ${baseColor.g * 0.6}, ${baseColor.b * 0.6}, 0.5)`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(kx, ky, kr, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add noise for texture
        this.addNoise(ctx, size, 0.05);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createMetalTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 120, g: 120, b: 130 };
        const scratched = options.scratched || false;
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Brushed metal gradient
        const gradient = ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
        gradient.addColorStop(0.5, `rgb(${baseColor.r * 1.2}, ${baseColor.g * 1.2}, ${baseColor.b * 1.2})`);
        gradient.addColorStop(1, `rgb(${baseColor.r * 0.9}, ${baseColor.g * 0.9}, ${baseColor.b * 0.9})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Brushed lines
        ctx.strokeStyle = `rgba(255, 255, 255, 0.03)`;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < size; i += 2) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i + (Math.random() - 0.5) * 2);
            ctx.stroke();
        }
        
        // Scratches
        if (scratched) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            for (let s = 0; s < 10; s++) {
                ctx.beginPath();
                const sx = Math.random() * size;
                const sy = Math.random() * size;
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + (Math.random() - 0.5) * 50, sy + (Math.random() - 0.5) * 50);
                ctx.stroke();
            }
        }
        
        this.addNoise(ctx, size, 0.03);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createFabricTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 100, g: 90, b: 80 };
        const weaveSize = options.weaveSize || 4;
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Weave pattern
        for (let y = 0; y < size; y += weaveSize) {
            for (let x = 0; x < size; x += weaveSize) {
                const shade = ((x / weaveSize + y / weaveSize) % 2 === 0) ? 1.05 : 0.95;
                ctx.fillStyle = `rgb(${baseColor.r * shade}, ${baseColor.g * shade}, ${baseColor.b * shade})`;
                ctx.fillRect(x, y, weaveSize - 1, weaveSize - 1);
            }
        }
        
        // Thread lines
        ctx.strokeStyle = `rgba(${baseColor.r * 0.8}, ${baseColor.g * 0.8}, ${baseColor.b * 0.8}, 0.3)`;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < size; i += weaveSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }
        
        this.addNoise(ctx, size, 0.08);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createConcreteTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 140, g: 140, b: 145 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Aggregate/pebble spots
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 1 + Math.random() * 3;
            const shade = 0.8 + Math.random() * 0.4;
            
            ctx.fillStyle = `rgb(${baseColor.r * shade}, ${baseColor.g * shade}, ${baseColor.b * shade})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Cracks (optional)
        if (options.cracked) {
            ctx.strokeStyle = `rgba(${baseColor.r * 0.5}, ${baseColor.g * 0.5}, ${baseColor.b * 0.5}, 0.3)`;
            ctx.lineWidth = 1;
            
            for (let c = 0; c < 3; c++) {
                let cx = Math.random() * size;
                let cy = Math.random() * size;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                
                for (let seg = 0; seg < 10; seg++) {
                    cx += (Math.random() - 0.5) * 30;
                    cy += Math.random() * 20;
                    ctx.lineTo(cx, cy);
                }
                ctx.stroke();
            }
        }
        
        this.addNoise(ctx, size, 0.1);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createSkinTexture(options = {}) {
        const size = options.size || 128;
        const baseColor = options.color || { r: 210, g: 180, b: 160 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Smooth gradient base
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
        gradient.addColorStop(0, `rgb(${baseColor.r * 1.05}, ${baseColor.g * 1.05}, ${baseColor.b * 1.05})`);
        gradient.addColorStop(1, `rgb(${baseColor.r * 0.95}, ${baseColor.g * 0.95}, ${baseColor.b * 0.95})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Subtle pore texture
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const shade = 0.95 + Math.random() * 0.1;
            
            ctx.fillStyle = `rgba(${baseColor.r * shade}, ${baseColor.g * shade}, ${baseColor.b * shade}, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, 0.5 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.addNoise(ctx, size, 0.02);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createRustTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 139, g: 69, b: 19 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Multi-layer rust effect
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Rust patches
        for (let p = 0; p < 20; p++) {
            const px = Math.random() * size;
            const py = Math.random() * size;
            const pr = 10 + Math.random() * 30;
            
            const hueShift = Math.random() * 20 - 10;
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, pr);
            gradient.addColorStop(0, `rgb(${baseColor.r + hueShift}, ${baseColor.g * 0.6}, ${baseColor.b * 0.5})`);
            gradient.addColorStop(0.5, `rgb(${baseColor.r * 0.8 + hueShift}, ${baseColor.g * 0.5}, ${baseColor.b * 0.4})`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.addNoise(ctx, size, 0.15);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createDirtTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 80, g: 60, b: 40 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Dirt clumps and variation
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 1 + Math.random() * 5;
            const shade = 0.7 + Math.random() * 0.6;
            
            ctx.fillStyle = `rgb(${baseColor.r * shade}, ${baseColor.g * shade}, ${baseColor.b * shade})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.addNoise(ctx, size, 0.12);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createPaperTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 245, g: 235, b: 220 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Paper fiber texture
        ctx.strokeStyle = `rgba(${baseColor.r * 0.9}, ${baseColor.g * 0.9}, ${baseColor.b * 0.9}, 0.2)`;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10);
            ctx.stroke();
        }
        
        this.addNoise(ctx, size, 0.03);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createGlassTexture(options = {}) {
        const size = options.size || 128;
        const baseColor = options.color || { r: 200, g: 220, b: 255 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Gradient for reflection effect
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.1)`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.2)`);
        gradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.1)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Subtle reflections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, 0);
        ctx.lineTo(0, size * 0.3);
        ctx.stroke();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createLeatherTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 70, g: 40, b: 20 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Leather grain pattern
        for (let y = 0; y < size; y += 8) {
            for (let x = 0; x < size; x += 8) {
                const shade = 0.9 + Math.random() * 0.2;
                ctx.fillStyle = `rgb(${baseColor.r * shade}, ${baseColor.g * shade}, ${baseColor.b * shade})`;
                
                // Irregular cell shape
                ctx.beginPath();
                const cx = x + 4 + (Math.random() - 0.5) * 3;
                const cy = y + 4 + (Math.random() - 0.5) * 3;
                ctx.arc(cx, cy, 3 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        this.addNoise(ctx, size, 0.06);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createNoiseTexture(options = {}) {
        const size = options.size || 256;
        const baseColor = options.color || { r: 128, g: 128, b: 128 };
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);
        
        this.addNoise(ctx, size, options.intensity || 0.1);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    addNoise(ctx, size, intensity) {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 255 * intensity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Create a normal map from a texture for bump effects
     */
    createNormalMap(sourceTexture, strength = 1) {
        const image = sourceTexture.image;
        const size = image.width;
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        const normalData = ctx.createImageData(size, size);
        const nData = normalData.data;
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4;
                
                // Get heights from surrounding pixels
                const tl = this.getPixelHeight(data, x - 1, y - 1, size);
                const t = this.getPixelHeight(data, x, y - 1, size);
                const tr = this.getPixelHeight(data, x + 1, y - 1, size);
                const l = this.getPixelHeight(data, x - 1, y, size);
                const r = this.getPixelHeight(data, x + 1, y, size);
                const bl = this.getPixelHeight(data, x - 1, y + 1, size);
                const b = this.getPixelHeight(data, x, y + 1, size);
                const br = this.getPixelHeight(data, x + 1, y + 1, size);
                
                // Sobel filter for normal calculation
                const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
                const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);
                
                // Normalize
                const nx = -dx * strength;
                const ny = -dy * strength;
                const nz = 1;
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                
                nData[i] = ((nx / len) * 0.5 + 0.5) * 255;
                nData[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
                nData[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
                nData[i + 3] = 255;
            }
        }
        
        ctx.putImageData(normalData, 0, 0);
        
        const normalTexture = new THREE.CanvasTexture(canvas);
        normalTexture.wrapS = THREE.RepeatWrapping;
        normalTexture.wrapT = THREE.RepeatWrapping;
        return normalTexture;
    }
    
    getPixelHeight(data, x, y, size) {
        x = Math.max(0, Math.min(size - 1, x));
        y = Math.max(0, Math.min(size - 1, y));
        const i = (y * size + x) * 4;
        return (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
    }
}

// Singleton instance
export const textureGenerator = new TextureGenerator();
