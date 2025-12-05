/**
 * PROJECT DEATHBED - Light Entity
 * The sentient Light that haunts the sky - visual effects and behavior
 */

import * as THREE from 'three';

export class LightEntity {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.intensity = options.intensity || 0.5;
        this.color = options.color || 0xc9a227;
        this.isActive = false;
        this.activityLevel = 0; // 0-1
        
        // Create light components
        this.createFractures();
        this.createAmbientGlow();
        this.createTendrils();
    }
    
    createFractures() {
        this.fractureGroup = new THREE.Group();
        this.fractures = [];
        
        // Create multiple fracture lines
        for (let i = 0; i < 8; i++) {
            const fracture = this.createFractureLine();
            fracture.position.set(
                (Math.random() - 0.5) * 20,
                10 + Math.random() * 5,
                -15 + (Math.random() - 0.5) * 10
            );
            fracture.rotation.z = (Math.random() - 0.5) * 0.5;
            this.fractures.push(fracture);
            this.fractureGroup.add(fracture);
        }
        
        this.scene.add(this.fractureGroup);
    }
    
    createFractureLine() {
        const group = new THREE.Group();
        
        // Main fracture line
        const points = [];
        const segments = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i <= segments; i++) {
            points.push(new THREE.Vector3(
                (i / segments) * 4 + (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.3,
                0
            ));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const fractureMesh = new THREE.Mesh(geometry, material);
        group.add(fractureMesh);
        
        // Glow effect
        const glowGeometry = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glowMesh);
        
        // Store references for animation
        group.userData.mainMesh = fractureMesh;
        group.userData.glowMesh = glowMesh;
        group.userData.phase = Math.random() * Math.PI * 2;
        
        return group;
    }
    
    createAmbientGlow() {
        // Overall ambient light from the sky
        this.ambientGlow = new THREE.HemisphereLight(
            this.color, // Sky color
            0x1a1a2a,   // Ground color
            0.1
        );
        this.scene.add(this.ambientGlow);
    }
    
    createTendrils() {
        this.tendrilGroup = new THREE.Group();
        this.tendrils = [];
        
        // Create descending tendrils (initially inactive)
        for (let i = 0; i < 3; i++) {
            const tendril = this.createTendril();
            tendril.visible = false;
            this.tendrils.push(tendril);
            this.tendrilGroup.add(tendril);
        }
        
        this.scene.add(this.tendrilGroup);
    }
    
    createTendril() {
        const group = new THREE.Group();
        
        // Tendril made of particles
        const particleCount = 50;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = -i * 0.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            sizes[i] = 0.1 + Math.random() * 0.1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            color: this.color,
            size: 0.15,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const particles = new THREE.Points(geometry, material);
        group.add(particles);
        
        // Store for animation
        group.userData.particles = particles;
        group.userData.phase = 0;
        
        return group;
    }
    
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate fractures
        this.fractures.forEach((fracture, index) => {
            const phase = fracture.userData.phase;
            
            // Pulse opacity
            const mainMesh = fracture.userData.mainMesh;
            const glowMesh = fracture.userData.glowMesh;
            
            if (mainMesh && mainMesh.material) {
                mainMesh.material.opacity = 0.4 + Math.sin(time + phase) * 0.3 * this.activityLevel;
            }
            if (glowMesh && glowMesh.material) {
                glowMesh.material.opacity = 0.1 + Math.sin(time + phase) * 0.15 * this.activityLevel;
            }
            
            // Subtle movement
            fracture.position.x += Math.sin(time * 0.5 + phase) * 0.01;
            fracture.position.y += Math.cos(time * 0.3 + phase) * 0.005;
        });
        
        // Update ambient glow based on activity
        if (this.ambientGlow) {
            this.ambientGlow.intensity = 0.1 + this.activityLevel * 0.2;
        }
        
        // Animate active tendrils
        this.tendrils.forEach((tendril, index) => {
            if (tendril.visible) {
                tendril.userData.phase += deltaTime;
                
                const particles = tendril.userData.particles;
                if (particles) {
                    const positions = particles.geometry.attributes.position.array;
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i] += Math.sin(time * 2 + i) * 0.01;
                        positions[i + 2] += Math.cos(time * 2 + i) * 0.01;
                    }
                    
                    particles.geometry.attributes.position.needsUpdate = true;
                }
            }
        });
    }
    
    setActivityLevel(level) {
        this.activityLevel = Math.max(0, Math.min(1, level));
    }
    
    activateTendril(index, position) {
        if (index < this.tendrils.length) {
            const tendril = this.tendrils[index];
            tendril.visible = true;
            tendril.position.copy(position);
        }
    }
    
    deactivateTendril(index) {
        if (index < this.tendrils.length) {
            this.tendrils[index].visible = false;
        }
    }
    
    // Create a pulse effect (for Light communication attempts)
    pulse(intensity = 1, duration = 1) {
        const startIntensity = this.activityLevel;
        const peakIntensity = Math.min(1, startIntensity + intensity * 0.5);
        
        // Animate pulse
        const startTime = Date.now();
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = elapsed / duration;
            
            if (progress < 0.5) {
                // Rising
                this.activityLevel = startIntensity + (peakIntensity - startIntensity) * (progress * 2);
            } else if (progress < 1) {
                // Falling
                this.activityLevel = peakIntensity - (peakIntensity - startIntensity) * ((progress - 0.5) * 2);
            } else {
                this.activityLevel = startIntensity;
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}
