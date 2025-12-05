/**
 * PROJECT DEATHBED - Particle System
 * Beautiful particle effects for atmosphere and visual feedback
 */

import * as THREE from 'three';

export class ParticleSystem {
    constructor() {
        this.particleSystems = [];
        this.dustParticles = null;
        this.glowParticles = null;
    }
    
    /**
     * Create ambient dust particles floating in the air
     */
    createDustParticles(scene, options = {}) {
        const count = options.count || 500;
        const range = options.range || { x: 15, y: 4, z: 15 };
        const color = options.color || 0xaaaaaa;
        const size = options.size || 0.02;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const opacities = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * range.x;
            positions[i3 + 1] = Math.random() * range.y;
            positions[i3 + 2] = (Math.random() - 0.5) * range.z;
            
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
            
            sizes[i] = size * (0.5 + Math.random() * 0.5);
            opacities[i] = 0.3 + Math.random() * 0.4;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        
        this.dustParticles = new THREE.Points(geometry, material);
        this.dustParticles.userData.range = range;
        this.dustParticles.userData.type = 'dust';
        scene.add(this.dustParticles);
        this.particleSystems.push(this.dustParticles);
        
        return this.dustParticles;
    }
    
    /**
     * Create magical glow particles around an object or position
     */
    createGlowParticles(scene, options = {}) {
        const count = options.count || 50;
        const position = options.position || new THREE.Vector3(0, 0, 0);
        const color = options.color || 0xc9a227;
        const radius = options.radius || 1;
        const intensity = options.intensity || 1;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const radii = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = radius * (0.3 + Math.random() * 0.7);
            
            positions[i3] = position.x + r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = position.y + r * Math.cos(phi);
            positions[i3 + 2] = position.z + r * Math.sin(phi) * Math.sin(theta);
            
            phases[i] = Math.random() * Math.PI * 2;
            radii[i] = r;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('radius', new THREE.BufferAttribute(radii, 1));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.08 * intensity,
            transparent: true,
            opacity: 0.6 * intensity,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.type = 'glow';
        particles.userData.center = position.clone();
        particles.userData.baseRadius = radius;
        particles.userData.time = 0;
        
        scene.add(particles);
        this.particleSystems.push(particles);
        
        return particles;
    }
    
    /**
     * Create rising light particles for Luis's glow effect
     */
    createRisingLightParticles(scene, options = {}) {
        const count = options.count || 30;
        const position = options.position || new THREE.Vector3(0, 0, 0);
        const color = options.color || 0xc9a227;
        const spread = options.spread || 0.5;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const lifetimes = new Float32Array(count);
        const maxLifetimes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * spread;
            positions[i3 + 1] = position.y + Math.random() * 0.3;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * spread;
            
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = 0.05 + Math.random() * 0.05;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            lifetimes[i] = Math.random() * 2;
            maxLifetimes[i] = 2 + Math.random() * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        geometry.setAttribute('maxLifetime', new THREE.BufferAttribute(maxLifetimes, 1));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.06,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.type = 'rising';
        particles.userData.basePosition = position.clone();
        particles.userData.spread = spread;
        
        scene.add(particles);
        this.particleSystems.push(particles);
        
        return particles;
    }
    
    /**
     * Create spark burst effect
     */
    createSparkBurst(scene, position, options = {}) {
        const count = options.count || 20;
        const color = options.color || 0xffaa44;
        const speed = options.speed || 2;
        const lifetime = options.lifetime || 0.5;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = speed * Math.cos(phi);
            velocities[i3 + 2] = speed * Math.sin(phi) * Math.sin(theta);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.05,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.type = 'burst';
        particles.userData.lifetime = 0;
        particles.userData.maxLifetime = lifetime;
        
        scene.add(particles);
        this.particleSystems.push(particles);
        
        return particles;
    }
    
    /**
     * Create firefly-like wandering particles
     */
    createFireflies(scene, options = {}) {
        const count = options.count || 15;
        const range = options.range || { x: 10, y: 3, z: 10 };
        const color = options.color || 0xaaffaa;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const brightnesses = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * range.x;
            positions[i3 + 1] = 0.5 + Math.random() * range.y;
            positions[i3 + 2] = (Math.random() - 0.5) * range.z;
            
            phases[i3] = Math.random() * Math.PI * 2;
            phases[i3 + 1] = Math.random() * Math.PI * 2;
            phases[i3 + 2] = Math.random() * Math.PI * 2;
            
            speeds[i] = 0.3 + Math.random() * 0.4;
            brightnesses[i] = Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 3));
        geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        geometry.setAttribute('brightness', new THREE.BufferAttribute(brightnesses, 1));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.08,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.type = 'fireflies';
        particles.userData.range = range;
        particles.userData.time = 0;
        
        scene.add(particles);
        this.particleSystems.push(particles);
        
        return particles;
    }
    
    /**
     * Update all particle systems
     */
    update(deltaTime) {
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const particles = this.particleSystems[i];
            
            switch (particles.userData.type) {
                case 'dust':
                    this.updateDustParticles(particles, deltaTime);
                    break;
                case 'glow':
                    this.updateGlowParticles(particles, deltaTime);
                    break;
                case 'rising':
                    this.updateRisingParticles(particles, deltaTime);
                    break;
                case 'burst':
                    if (this.updateBurstParticles(particles, deltaTime)) {
                        // Remove burst particles when done
                        particles.geometry.dispose();
                        particles.material.dispose();
                        particles.parent?.remove(particles);
                        this.particleSystems.splice(i, 1);
                    }
                    break;
                case 'fireflies':
                    this.updateFireflies(particles, deltaTime);
                    break;
            }
        }
    }
    
    updateDustParticles(particles, deltaTime) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        const range = particles.userData.range;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply velocity
            positions[i] += velocities[i] * deltaTime * 10;
            positions[i + 1] += velocities[i + 1] * deltaTime * 10;
            positions[i + 2] += velocities[i + 2] * deltaTime * 10;
            
            // Add slight drift
            velocities[i] += (Math.random() - 0.5) * 0.001;
            velocities[i + 1] += (Math.random() - 0.5) * 0.0005;
            velocities[i + 2] += (Math.random() - 0.5) * 0.001;
            
            // Clamp velocities
            velocities[i] = THREE.MathUtils.clamp(velocities[i], -0.02, 0.02);
            velocities[i + 1] = THREE.MathUtils.clamp(velocities[i + 1], -0.01, 0.01);
            velocities[i + 2] = THREE.MathUtils.clamp(velocities[i + 2], -0.02, 0.02);
            
            // Wrap around boundaries
            if (positions[i] < -range.x / 2) positions[i] = range.x / 2;
            if (positions[i] > range.x / 2) positions[i] = -range.x / 2;
            if (positions[i + 1] < 0) positions[i + 1] = range.y;
            if (positions[i + 1] > range.y) positions[i + 1] = 0;
            if (positions[i + 2] < -range.z / 2) positions[i + 2] = range.z / 2;
            if (positions[i + 2] > range.z / 2) positions[i + 2] = -range.z / 2;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    updateGlowParticles(particles, deltaTime) {
        const positions = particles.geometry.attributes.position.array;
        const phases = particles.geometry.attributes.phase.array;
        const radii = particles.geometry.attributes.radius.array;
        const center = particles.userData.center;
        
        particles.userData.time += deltaTime;
        const time = particles.userData.time;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            const phase = phases[i];
            const r = radii[i];
            
            const theta = phase + time * (0.3 + Math.sin(phase) * 0.2);
            const phi = phase * 0.5 + time * 0.2;
            
            positions[i3] = center.x + r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = center.y + r * Math.cos(phi) + Math.sin(time + phase) * 0.1;
            positions[i3 + 2] = center.z + r * Math.sin(phi) * Math.sin(theta);
        }
        
        // Pulse opacity
        particles.material.opacity = 0.4 + Math.sin(time * 2) * 0.2;
        particles.material.size = 0.06 + Math.sin(time * 1.5) * 0.02;
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    updateRisingParticles(particles, deltaTime) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        const lifetimes = particles.geometry.attributes.lifetime.array;
        const maxLifetimes = particles.geometry.attributes.maxLifetime.array;
        const basePos = particles.userData.basePosition;
        const spread = particles.userData.spread;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            
            // Update lifetime
            lifetimes[i] += deltaTime;
            
            // Reset if lifetime exceeded
            if (lifetimes[i] > maxLifetimes[i]) {
                positions[i3] = basePos.x + (Math.random() - 0.5) * spread;
                positions[i3 + 1] = basePos.y + Math.random() * 0.3;
                positions[i3 + 2] = basePos.z + (Math.random() - 0.5) * spread;
                lifetimes[i] = 0;
                velocities[i3 + 1] = 0.05 + Math.random() * 0.05;
            } else {
                // Apply velocity
                positions[i3] += velocities[i3] * deltaTime;
                positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
                positions[i3 + 2] += velocities[i3 + 2] * deltaTime;
                
                // Add sway
                positions[i3] += Math.sin(lifetimes[i] * 3 + i) * 0.002;
            }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    updateBurstParticles(particles, deltaTime) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;
        
        particles.userData.lifetime += deltaTime;
        const progress = particles.userData.lifetime / particles.userData.maxLifetime;
        
        if (progress >= 1) {
            return true; // Signal to remove
        }
        
        // Apply velocity and gravity
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i] * deltaTime;
            positions[i + 1] += velocities[i + 1] * deltaTime;
            positions[i + 2] += velocities[i + 2] * deltaTime;
            
            // Apply gravity
            velocities[i + 1] -= 5 * deltaTime;
            
            // Slow down
            velocities[i] *= 0.98;
            velocities[i + 2] *= 0.98;
        }
        
        // Fade out
        particles.material.opacity = 1 - progress;
        particles.material.size = 0.05 * (1 - progress * 0.5);
        
        particles.geometry.attributes.position.needsUpdate = true;
        return false;
    }
    
    updateFireflies(particles, deltaTime) {
        const positions = particles.geometry.attributes.position.array;
        const phases = particles.geometry.attributes.phase.array;
        const speeds = particles.geometry.attributes.speed.array;
        const brightnesses = particles.geometry.attributes.brightness.array;
        const range = particles.userData.range;
        
        particles.userData.time += deltaTime;
        const time = particles.userData.time;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            const speed = speeds[i];
            
            // Wandering movement
            positions[i3] += Math.sin(time * speed + phases[i3]) * 0.01;
            positions[i3 + 1] += Math.cos(time * speed * 0.7 + phases[i3 + 1]) * 0.005;
            positions[i3 + 2] += Math.sin(time * speed * 0.8 + phases[i3 + 2]) * 0.01;
            
            // Keep in bounds
            positions[i3] = THREE.MathUtils.clamp(positions[i3], -range.x / 2, range.x / 2);
            positions[i3 + 1] = THREE.MathUtils.clamp(positions[i3 + 1], 0.3, range.y);
            positions[i3 + 2] = THREE.MathUtils.clamp(positions[i3 + 2], -range.z / 2, range.z / 2);
            
            // Update brightness for blinking effect
            brightnesses[i] = 0.3 + Math.sin(time * 2 + phases[i3]) * 0.5;
        }
        
        // Average brightness for material opacity
        let avgBrightness = 0;
        for (let i = 0; i < brightnesses.length; i++) {
            avgBrightness += brightnesses[i];
        }
        particles.material.opacity = avgBrightness / brightnesses.length;
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Remove a specific particle system from the scene
     */
    removeParticles(particles) {
        const index = this.particleSystems.indexOf(particles);
        if (index > -1) {
            particles.geometry.dispose();
            particles.material.dispose();
            particles.parent?.remove(particles);
            this.particleSystems.splice(index, 1);
        }
    }
    
    /**
     * Clear all particle systems
     */
    clearAll() {
        for (const particles of this.particleSystems) {
            particles.geometry.dispose();
            particles.material.dispose();
            particles.parent?.remove(particles);
        }
        this.particleSystems = [];
        this.dustParticles = null;
        this.glowParticles = null;
    }
}
