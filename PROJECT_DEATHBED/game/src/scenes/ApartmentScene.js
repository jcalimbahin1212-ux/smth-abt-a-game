/**
 * PROJECT DEATHBED - Apartment Scene (Prologue)
 * The brothers' apartment before the mutation - warm, cozy, normal life
 */

import * as THREE from 'three';
import { InteractableObject } from '../entities/InteractableObject.js';
import { textureGenerator } from '../utils/TextureGenerator.js';

export class ApartmentScene {
    constructor(game) {
        console.log('=== ApartmentScene constructor START ===');
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        
        try {
            console.log('Getting textures...');
            // Get textures
            this.woodTexture = textureGenerator.getTexture('wood', { color: { r: 130, g: 90, b: 55 } });
            this.fabricTexture = textureGenerator.getTexture('fabric', { color: { r: 100, g: 95, b: 85 } });
            
            console.log('Setting up environment...');
            // Build the scene
            this.setupEnvironment();
            console.log('Setting up lighting...');
            this.setupLighting();
            console.log('Creating geometry...');
            this.createApartmentGeometry();
            console.log('Creating furniture...');
            this.createFurniture();
            console.log('Creating interactables...');
            this.createInteractables();
            console.log('Creating atmospheric effects...');
            this.createAtmosphericEffects();
            
            console.log('ApartmentScene fully constructed, children:', this.scene.children.length);
        } catch (error) {
            console.error('ApartmentScene constructor error:', error);
            console.error('Stack trace:', error.stack);
        }
        
        console.log('=== ApartmentScene constructor END, scene valid:', !!this.scene, 'children:', this.scene?.children?.length);
        // Scene-specific bounds
        this.bounds = { minX: -6, maxX: 6, minZ: -5, maxZ: 5 };
    }
    
    setupEnvironment() {
        // Warmer, lighter, more inviting atmosphere
        this.scene.fog = new THREE.FogExp2(0x2a2530, 0.015);
        this.scene.background = new THREE.Color(0x1a1825);
    }
    
    setupLighting() {
        // Warmer, brighter ambient light
        const ambientLight = new THREE.AmbientLight(0x4a4050, 0.8);
        this.scene.add(ambientLight);
        
        // Main living room lamp - warm orange
        const lampLight = new THREE.PointLight(0xffbb77, 2.0, 18, 1.6);
        lampLight.position.set(-2, 2, 0);
        lampLight.castShadow = true;
        this.scene.add(lampLight);
        this.lampLight = lampLight;
        
        // Secondary lamp for better coverage
        const lamp2 = new THREE.PointLight(0xffaa66, 1.2, 10, 2);
        lamp2.position.set(2, 1.8, 2);
        this.scene.add(lamp2);
        
        // Kitchen light
        const kitchenLight = new THREE.PointLight(0xffffee, 1.4, 12, 2);
        kitchenLight.position.set(4, 2.5, -2);
        this.scene.add(kitchenLight);
        
        // Window - evening blue light from outside
        const windowLight = new THREE.RectAreaLight(0x6688cc, 1.0, 3, 2);
        windowLight.position.set(-6, 2, 0);
        windowLight.lookAt(0, 1.5, 0);
        this.scene.add(windowLight);
        
        // TV glow (subtle, blueish)
        const tvGlow = new THREE.PointLight(0x7799ff, 0.6, 6, 2);
        tvGlow.position.set(0, 1.2, -4);
        this.scene.add(tvGlow);
        
        // Hemisphere light for overall fill
        const hemiLight = new THREE.HemisphereLight(0x6a6a8a, 0x3a3040, 0.5);
        this.scene.add(hemiLight);
    }
    
    createApartmentGeometry() {
        // Floor - wooden floor with texture
        const floorGeometry = new THREE.PlaneGeometry(14, 12);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            map: this.woodTexture,
            roughness: 0.75,
            metalness: 0.05
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls - warmer cream/off-white
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4548,
            roughness: 0.85,
            metalness: 0.0
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 4),
            wallMaterial
        );
        backWall.position.set(0, 2, -6);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Left wall with window
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 4),
            wallMaterial
        );
        leftWall.position.set(-7, 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        
        // Window frame
        const windowFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2.2, 3.2),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40 })
        );
        windowFrame.position.set(-6.9, 2, 0);
        this.scene.add(windowFrame);
        
        // Window glass - shows evening sky (brighter)
        const windowGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 2),
            new THREE.MeshStandardMaterial({
                color: 0x3355bb,
                emissive: 0x223366,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.75
            })
        );
        windowGlass.position.set(-6.85, 2, 0);
        windowGlass.rotation.y = Math.PI / 2;
        this.scene.add(windowGlass);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 4),
            wallMaterial
        );
        rightWall.position.set(7, 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
        
        // Front wall with door
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 4),
            wallMaterial
        );
        frontWall.position.set(0, 2, 6);
        frontWall.rotation.y = Math.PI;
        this.scene.add(frontWall);
        
        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 12),
            new THREE.MeshStandardMaterial({
                color: 0x3a3840,
                roughness: 0.9
            })
        );
        ceiling.position.set(0, 4, 0);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
    }
    
    createFurniture() {
        // Couch
        const couchGroup = new THREE.Group();
        
        const couchBase = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 1),
            new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.9 })
        );
        couchBase.position.y = 0.3;
        couchGroup.add(couchBase);
        
        const couchBack = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.6, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.9 })
        );
        couchBack.position.set(0, 0.6, -0.4);
        couchGroup.add(couchBack);
        
        // Cushions
        const cushion1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.4, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.95 })
        );
        cushion1.position.set(-0.7, 0.6, -0.3);
        cushion1.rotation.x = -0.2;
        couchGroup.add(cushion1);
        
        couchGroup.position.set(0, 0, -3);
        couchGroup.castShadow = true;
        this.scene.add(couchGroup);
        
        // Coffee table
        const coffeeTable = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.4, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.7 })
        );
        coffeeTable.position.set(0, 0.2, -1.5);
        coffeeTable.castShadow = true;
        this.scene.add(coffeeTable);
        
        // TV stand
        const tvStand = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.5, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.6 })
        );
        tvStand.position.set(0, 0.25, -5);
        this.scene.add(tvStand);
        
        // TV
        const tv = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.7, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                emissive: 0x334466,
                emissiveIntensity: 0.2
            })
        );
        tv.position.set(0, 0.9, -5);
        this.scene.add(tv);
        
        // Floor lamp
        const lampPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30 })
        );
        lampPole.position.set(-2, 0.9, 0);
        this.scene.add(lampPole);
        
        const lampShade = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 0.3, 8, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0xaa9977,
                side: THREE.DoubleSide,
                emissive: 0xffaa66,
                emissiveIntensity: 0.3
            })
        );
        lampShade.position.set(-2, 1.9, 0);
        this.scene.add(lampShade);
        
        // Kitchen counter
        const counter = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.9, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.6 })
        );
        counter.position.set(4, 0.45, -3);
        counter.castShadow = true;
        this.scene.add(counter);
        
        // Dining table
        const diningTable = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.05, 1),
            new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
        );
        diningTable.position.set(4, 0.75, 0);
        this.scene.add(diningTable);
        
        // Table legs
        const legGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
        [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(4 + x, 0.375, z);
            this.scene.add(leg);
        });
        
        // Guitar on stand
        this.createGuitar(new THREE.Vector3(-4, 0, 2));
        
        // Bookshelf
        this.createBookshelf(new THREE.Vector3(5, 0, 3));
    }
    
    createGuitar(position) {
        const guitarGroup = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.6 })
        );
        body.scale.set(1, 0.3, 1.3);
        body.position.y = 0.8;
        guitarGroup.add(body);
        
        // Neck
        const neck = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.6, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a })
        );
        neck.position.set(0, 1.3, 0);
        guitarGroup.add(neck);
        
        // Sound hole
        const hole = new THREE.Mesh(
            new THREE.CircleGeometry(0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        hole.position.set(0, 0.8, 0.14);
        guitarGroup.add(hole);
        
        // Stand
        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.5, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30 })
        );
        stand.position.y = 0.25;
        guitarGroup.add(stand);
        
        guitarGroup.position.copy(position);
        guitarGroup.rotation.y = 0.3;
        this.scene.add(guitarGroup);
    }
    
    createBookshelf(position) {
        const shelfGroup = new THREE.Group();
        
        // Frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 })
        );
        frame.position.y = 1;
        shelfGroup.add(frame);
        
        // Books
        const bookColors = [0x8a3030, 0x305080, 0x308050, 0x806030, 0x503080];
        for (let shelf = 0; shelf < 3; shelf++) {
            for (let i = 0; i < 4; i++) {
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08 + Math.random() * 0.05, 0.25, 0.2),
                    new THREE.MeshStandardMaterial({
                        color: bookColors[Math.floor(Math.random() * bookColors.length)],
                        roughness: 0.9
                    })
                );
                book.position.set(-0.3 + i * 0.18, 0.4 + shelf * 0.6, 0);
                shelfGroup.add(book);
            }
        }
        
        shelfGroup.position.copy(position);
        this.scene.add(shelfGroup);
    }
    
    createInteractables() {
        // Guitar
        const guitar = new InteractableObject({
            name: "Luis's Guitar",
            description: "An old acoustic guitar. Luis taught himself to play.",
            position: new THREE.Vector3(-4, 0.8, 2),
            size: new THREE.Vector3(0.5, 0.8, 0.4),
            color: 0x8a5a2a,
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Luis has been practicing that dinosaur song again. The kids at school are going to love it.",
                    responses: [
                        { text: "Check on dinner", next: null }
                    ]
                });
            }
        });
        guitar.addToScene(this.scene);
        this.interactables.push(guitar);
        
        // Window
        const apartmentWindow = new InteractableObject({
            name: 'Window',
            description: 'Evening view of the city.',
            position: new THREE.Vector3(-6, 2, 0),
            size: new THREE.Vector3(0.5, 2, 3),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Nice evening. The sunset looks... wait. What's that in the sky?",
                    responses: [
                        { 
                            text: "Look closer",
                            next: null,
                            effect: (game) => {
                                game.dialogueSystem.showDialogue({
                                    speaker: 'ADRIAN',
                                    text: "There's something glowing up there. A crack in the sky? That's... beautiful. I should tell Luis."
                                });
                            }
                        }
                    ]
                });
            }
        });
        apartmentWindow.addToScene(this.scene);
        this.interactables.push(apartmentWindow);
        
        // Kitchen counter
        const kitchen = new InteractableObject({
            name: 'Kitchen Counter',
            description: 'Dinner is almost ready.',
            position: new THREE.Vector3(4, 0.7, -3),
            size: new THREE.Vector3(3, 0.5, 0.8),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Mom's recipe. Luis always says I make it better than she did, but I think he's just being kind."
                });
            }
        });
        kitchen.addToScene(this.scene);
        this.interactables.push(kitchen);
        
        // Door to roof
        const roofDoor = new InteractableObject({
            name: 'Door to Roof',
            description: 'Leads to the building rooftop.',
            position: new THREE.Vector3(6, 1.5, 0),
            size: new THREE.Vector3(0.3, 2.5, 1),
            color: 0x3a3a40,
            interactionType: 'use',
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Go to the rooftop?",
                    choices: [
                        {
                            text: "Go to roof",
                            action: () => {
                                game.sceneManager.loadScene('rooftop');
                            }
                        },
                        { text: "Stay here", action: () => {} }
                    ]
                });
            }
        });
        roofDoor.addToScene(this.scene);
        this.interactables.push(roofDoor);
    }
    
    createAtmosphericEffects() {
        // Dust particles in lamplight
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = -2 + (Math.random() - 0.5) * 3;
            positions[i + 1] = Math.random() * 3;
            positions[i + 2] = (Math.random() - 0.5) * 3;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffddaa,
            size: 0.015,
            transparent: true,
            opacity: 0.3
        });
        
        this.dustParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.dustParticles);
    }
    
    update(deltaTime) {
        // Subtle lamp flicker
        if (this.lampLight) {
            this.lampLight.intensity = 1.2 + Math.sin(Date.now() * 0.005) * 0.05;
        }
        
        // Animate dust
        if (this.dustParticles) {
            const positions = this.dustParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.0003;
            }
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }
    }
}
