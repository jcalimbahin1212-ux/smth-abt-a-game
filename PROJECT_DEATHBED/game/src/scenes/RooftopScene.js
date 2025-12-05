/**
 * PROJECT DEATHBED - Rooftop Scene (Prologue - The Moment)
 * Where Luis is touched by the Light and everything changes
 */

import * as THREE from 'three';
import { NPCEntity } from '../entities/NPCEntity.js';
import { InteractableObject } from '../entities/InteractableObject.js';

export class RooftopScene {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        
        this.setupEnvironment();
        this.setupLighting();
        this.createRooftopGeometry();
        this.createAtmosphere();
        this.createLightPhenomenon();
        this.createLuis();
        this.createInteractables();
        
        this.bounds = { minX: -8, maxX: 8, minZ: -8, maxZ: 8 };
        
        // Story state
        this.lightEventTriggered = false;
        this.lightDescendTimer = 0;
    }
    
    setupEnvironment() {
        // Eerie evening sky - before the Light touches down
        this.scene.fog = new THREE.FogExp2(0x1a1830, 0.015);
        this.scene.background = new THREE.Color(0x0a0820);
    }
    
    setupLighting() {
        // Dim ambient - dusk
        const ambientLight = new THREE.AmbientLight(0x151525, 0.3);
        this.scene.add(ambientLight);
        
        // Moonlight from above
        const moonLight = new THREE.DirectionalLight(0x4455aa, 0.4);
        moonLight.position.set(-10, 20, -10);
        moonLight.castShadow = true;
        this.scene.add(moonLight);
        
        // City glow from below
        const cityGlow = new THREE.HemisphereLight(0x443322, 0x112244, 0.2);
        this.scene.add(cityGlow);
    }
    
    createRooftopGeometry() {
        // Rooftop floor
        const floorGeometry = new THREE.PlaneGeometry(18, 18);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a30,
            roughness: 0.95,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Low walls around the edge
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.9
        });
        
        // Perimeter walls
        const walls = [
            { pos: [0, 0.5, -9], size: [18, 1, 0.3] },
            { pos: [0, 0.5, 9], size: [18, 1, 0.3] },
            { pos: [-9, 0.5, 0], size: [0.3, 1, 18] },
            { pos: [9, 0.5, 0], size: [0.3, 1, 18] }
        ];
        
        walls.forEach(w => {
            const wall = new THREE.Mesh(
                new THREE.BoxGeometry(...w.size),
                wallMaterial
            );
            wall.position.set(...w.pos);
            wall.castShadow = true;
            this.scene.add(wall);
        });
        
        // Stairwell entrance
        const stairwell = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2.5, 3),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.8 })
        );
        stairwell.position.set(-6, 1.25, 6);
        stairwell.castShadow = true;
        this.scene.add(stairwell);
        
        // Door in stairwell
        const door = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 2),
            new THREE.MeshStandardMaterial({ color: 0x4a4a50 })
        );
        door.position.set(-4.49, 1, 6);
        door.rotation.y = Math.PI / 2;
        this.scene.add(door);
        
        // HVAC units
        for (let i = 0; i < 3; i++) {
            const hvac = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1, 1.5),
                new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7, metalness: 0.3 })
            );
            hvac.position.set(5, 0.5, -5 + i * 2.5);
            hvac.castShadow = true;
            this.scene.add(hvac);
        }
        
        // Water tower in distance (decorative)
        const waterTower = new THREE.Group();
        const tank = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 1.5, 12),
            new THREE.MeshStandardMaterial({ color: 0x4a4a50, roughness: 0.7 })
        );
        tank.position.y = 2.5;
        waterTower.add(tank);
        
        // Legs
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6),
                new THREE.MeshStandardMaterial({ color: 0x3a3a40 })
            );
            leg.position.set(Math.cos(angle) * 0.5, 0.9, Math.sin(angle) * 0.5);
            waterTower.add(leg);
        }
        
        waterTower.position.set(-3, 0, -6);
        this.scene.add(waterTower);
    }
    
    createAtmosphere() {
        // Stars in the sky
        const starCount = 200;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            const height = 20 + Math.random() * 30;
            const radius = 30 + Math.random() * 50;
            
            starPositions[i] = Math.cos(angle) * radius;
            starPositions[i + 1] = height;
            starPositions[i + 2] = Math.sin(angle) * radius;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.15,
            transparent: true,
            opacity: 0.7
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
        
        // City skyline silhouettes
        for (let i = 0; i < 15; i++) {
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(2 + Math.random() * 3, 5 + Math.random() * 15, 2 + Math.random() * 3),
                new THREE.MeshBasicMaterial({ color: 0x0a0a15 })
            );
            const angle = ((i / 15) * Math.PI * 2) + Math.random() * 0.3;
            const dist = 25 + Math.random() * 15;
            building.position.set(
                Math.cos(angle) * dist,
                building.geometry.parameters.height / 2 - 5,
                Math.sin(angle) * dist
            );
            this.scene.add(building);
            
            // Random windows
            const windowCount = Math.floor(Math.random() * 5) + 3;
            for (let j = 0; j < windowCount; j++) {
                const windowLight = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3, 0.3),
                    new THREE.MeshBasicMaterial({ color: 0xffeeaa })
                );
                windowLight.position.copy(building.position);
                windowLight.position.x += (Math.random() - 0.5) * 1.5;
                windowLight.position.y += (Math.random() - 0.5) * building.geometry.parameters.height * 0.8;
                windowLight.position.z += (Math.random() - 0.5) * 1.5;
                windowLight.lookAt(0, windowLight.position.y, 0);
                this.scene.add(windowLight);
            }
        }
    }
    
    createLightPhenomenon() {
        // The Light - visible in the sky as a growing crack
        this.lightGroup = new THREE.Group();
        
        // Central glow
        const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffee,
            transparent: true,
            opacity: 0.8
        });
        this.centralGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.centralGlow.position.set(0, 25, 0);
        this.lightGroup.add(this.centralGlow);
        
        // Fracture lines
        const fractureCount = 8;
        this.fractures = [];
        
        for (let i = 0; i < fractureCount; i++) {
            const angle = (i / fractureCount) * Math.PI * 2;
            const length = 3 + Math.random() * 5;
            
            const fractureGeom = new THREE.BufferGeometry();
            const points = [
                new THREE.Vector3(0, 25, 0),
                new THREE.Vector3(
                    Math.cos(angle) * length,
                    25 + (Math.random() - 0.5) * 2,
                    Math.sin(angle) * length
                )
            ];
            fractureGeom.setFromPoints(points);
            
            const fracture = new THREE.Line(
                fractureGeom,
                new THREE.LineBasicMaterial({
                    color: 0xffffcc,
                    transparent: true,
                    opacity: 0.6
                })
            );
            this.fractures.push(fracture);
            this.lightGroup.add(fracture);
        }
        
        // Outer glow
        const outerGlow = new THREE.PointLight(0xffffee, 2, 50, 1);
        outerGlow.position.set(0, 25, 0);
        this.lightGroup.add(outerGlow);
        this.outerGlowLight = outerGlow;
        
        this.scene.add(this.lightGroup);
        
        // The descending tendril (for when the event triggers)
        this.tendril = new THREE.Group();
        
        const tendrilGeom = new THREE.CylinderGeometry(0.1, 0.3, 20, 8);
        const tendrilMat = new THREE.MeshBasicMaterial({
            color: 0xffffee,
            transparent: true,
            opacity: 0.0
        });
        this.tendrilMesh = new THREE.Mesh(tendrilGeom, tendrilMat);
        this.tendrilMesh.position.y = 15;
        this.tendril.add(this.tendrilMesh);
        
        // Tendril glow
        this.tendrilGlow = new THREE.PointLight(0xffffee, 0, 15, 2);
        this.tendrilGlow.position.set(0, 5, 0);
        this.tendril.add(this.tendrilGlow);
        
        this.tendril.position.set(3, 0, -2);
        this.scene.add(this.tendril);
    }
    
    createLuis() {
        // Luis is on the rooftop, watching the sky
        this.luis = new NPCEntity({
            name: 'Luis',
            position: new THREE.Vector3(3, 0, -2),
            color: 0x5a6a7a,
            height: 1.6,
            glowColor: null // No glow yet - he hasn't been touched
        });
        
        this.luis.addToScene(this.scene);
        this.npcs.push(this.luis);
        
        this.luis.setDialogue({
            greeting: {
                text: "Adrian! Come look at this! There's something in the sky... it's beautiful.",
                responses: [
                    { text: "What is it?", next: 'watching' },
                    { text: "We should go inside.", next: 'warning' }
                ]
            },
            watching: {
                text: "I don't know. It looks like... like the sky is cracking open. Light is spilling through. I've never seen anything like it.",
                responses: [
                    { text: "It's getting brighter.", next: 'brighter' },
                    { text: "Luis, let's go inside.", next: 'warning' }
                ]
            },
            warning: {
                text: "Just a moment more. I can't stop looking at it. It feels... warm? Like it's calling to me.",
                responses: [
                    { text: "Luis, please...", next: 'plea' },
                    { text: "What do you mean, calling?", next: 'calling' }
                ]
            },
            brighter: {
                text: "Yeah... it's growing. Adrian, can you hear that? It's humming. Like a song I almost remember.",
                responses: [
                    { text: "I don't hear anything.", next: 'calling' },
                    { text: "We need to leave NOW.", next: 'too_late' }
                ]
            },
            calling: {
                text: "It's like... it knows me. It sees me. I should be afraid, but I'm not. I feel... peaceful.",
                responses: [
                    { text: "LUIS, MOVE!", next: 'too_late' }
                ]
            },
            plea: {
                text: "Adrian, it's okay. Whatever this is... it's meant for me. I can feel it. It won't hurt me.",
                responses: [
                    { text: "Luis, no!", next: 'too_late' }
                ]
            },
            too_late: {
                text: "It's... it's coming down. It's reaching for—",
                effect: (game) => {
                    this.triggerLightEvent(game);
                }
            }
        });
    }
    
    createInteractables() {
        // Door back to apartment
        const door = new InteractableObject({
            name: 'Stairwell Door',
            description: 'Back to the apartment.',
            position: new THREE.Vector3(-4.5, 1, 6),
            size: new THREE.Vector3(0.5, 2, 1),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Return to the apartment?",
                    choices: [
                        {
                            text: "Go back",
                            action: () => {
                                game.sceneManager.loadScene('apartment');
                            }
                        },
                        { text: "Stay on roof", action: () => {} }
                    ]
                });
            }
        });
        door.addToScene(this.scene);
        this.interactables.push(door);
        
        // Edge of roof - looking at city
        const roofEdge = new InteractableObject({
            name: 'Roof Edge',
            description: 'View of the city below.',
            position: new THREE.Vector3(0, 0.5, -8),
            size: new THREE.Vector3(5, 1, 0.5),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "The city looks so peaceful from up here. People going about their evenings, unaware of what's happening in the sky above them."
                });
            }
        });
        roofEdge.addToScene(this.scene);
        this.interactables.push(roofEdge);
    }
    
    triggerLightEvent(game) {
        if (this.lightEventTriggered) return;
        this.lightEventTriggered = true;
        this.lightDescendTimer = 0;
        
        // Start The Hum audio
        if (game.audioManager) {
            game.audioManager.startTheHum();
        }
    }
    
    update(deltaTime) {
        // Pulse the central glow
        if (this.centralGlow) {
            const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 1;
            this.centralGlow.scale.setScalar(pulse);
            this.outerGlowLight.intensity = 2 + Math.sin(Date.now() * 0.002) * 0.5;
        }
        
        // Animate fractures
        this.fractures.forEach((fracture, i) => {
            fracture.material.opacity = 0.4 + Math.sin(Date.now() * 0.004 + i) * 0.3;
        });
        
        // Light descent animation
        if (this.lightEventTriggered) {
            this.lightDescendTimer += deltaTime;
            
            // Animate tendril descending
            const progress = Math.min(this.lightDescendTimer / 3, 1); // 3 seconds to descend
            
            this.tendrilMesh.material.opacity = progress;
            this.tendrilGlow.intensity = progress * 5;
            
            // Move tendril down
            this.tendrilMesh.position.y = 15 - progress * 14;
            this.tendrilGlow.position.y = 5 - progress * 4;
            
            // Flash effect
            if (progress >= 1 && this.lightDescendTimer < 3.5) {
                // Hold for dramatic effect
            } else if (this.lightDescendTimer >= 3.5 && this.lightDescendTimer < 4) {
                // Flash!
                this.outerGlowLight.intensity = 20;
                this.tendrilGlow.intensity = 30;
                this.scene.background = new THREE.Color(0xffffee);
            } else if (this.lightDescendTimer >= 4) {
                // Transition to convoy scene
                this.game.dialogueSystem.showDialogue({
                    speaker: 'NARRATOR',
                    text: "The Light touched Luis, and in that moment, everything changed. What followed was chaos—the world fracturing, society crumbling, and Luis... Luis became something new.",
                    choices: [
                        {
                            text: "Three months later...",
                            action: () => {
                                this.game.sceneManager.loadScene('convoy_shelter');
                            }
                        }
                    ]
                });
                this.lightEventTriggered = false; // Prevent repeat
            }
        }
        
        // Subtle star twinkle
        if (this.stars) {
            this.stars.rotation.y += deltaTime * 0.001;
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
    }
}
