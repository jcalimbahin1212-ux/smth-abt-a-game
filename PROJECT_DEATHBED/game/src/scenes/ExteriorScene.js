/**
 * PROJECT DEATHBED - Exterior Scene
 * Outside the convoy - The Light is visible in the sky, the world is fractured
 */

import * as THREE from 'three';
import { InteractableObject } from '../entities/InteractableObject.js';

export class ExteriorScene {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        
        this.setupEnvironment();
        this.setupLighting();
        this.createTerrain();
        this.createConvoyExterior();
        this.createLightFractures();
        this.createDebris();
        this.createInteractables();
        
        this.bounds = { minX: -15, maxX: 15, minZ: -15, maxZ: 15 };
    }
    
    setupEnvironment() {
        // Dark, cold exterior with visible Light fractures
        this.scene.fog = new THREE.FogExp2(0x0a0a15, 0.02);
        this.scene.background = new THREE.Color(0x050510);
    }
    
    setupLighting() {
        // Very dim ambient - night
        const ambientLight = new THREE.AmbientLight(0x0a0a15, 0.3);
        this.scene.add(ambientLight);
        
        // Light from the sky fractures
        const fractureLight = new THREE.DirectionalLight(0xeeeeff, 0.2);
        fractureLight.position.set(0, 30, 0);
        this.scene.add(fractureLight);
        
        // Warm light spilling from convoy
        const convoyGlow = new THREE.PointLight(0xffaa66, 0.8, 15, 2);
        convoyGlow.position.set(0, 1.5, 5);
        this.scene.add(convoyGlow);
        
        // Workshop light
        const workshopGlow = new THREE.PointLight(0xffcc88, 0.6, 10, 2);
        workshopGlow.position.set(-8, 1.5, 0);
        this.scene.add(workshopGlow);
    }
    
    createTerrain() {
        // Ground - cracked asphalt/dirt
        const groundGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
        
        // Slightly displace vertices for uneven ground
        const positions = groundGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = (Math.random() - 0.5) * 0.2;
        }
        groundGeometry.computeVertexNormals();
        
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a20,
            roughness: 0.95,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Cracks in the ground (decorative)
        for (let i = 0; i < 5; i++) {
            const crack = this.createCrack();
            crack.position.set(
                (Math.random() - 0.5) * 20,
                0.01,
                (Math.random() - 0.5) * 20
            );
            crack.rotation.y = Math.random() * Math.PI;
            this.scene.add(crack);
        }
        
        // Dead trees
        for (let i = 0; i < 8; i++) {
            const tree = this.createDeadTree();
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 18 + Math.random() * 8;
            tree.position.set(
                Math.cos(angle) * dist,
                0,
                Math.sin(angle) * dist
            );
            tree.rotation.y = Math.random() * Math.PI;
            this.scene.add(tree);
        }
    }
    
    createCrack() {
        const crackGroup = new THREE.Group();
        
        const crackGeom = new THREE.BufferGeometry();
        const points = [];
        let x = 0, z = 0;
        
        for (let i = 0; i < 10; i++) {
            points.push(new THREE.Vector3(x, 0.02, z));
            x += (Math.random() - 0.5) * 0.8;
            z += 0.5 + Math.random() * 0.3;
        }
        crackGeom.setFromPoints(points);
        
        const crack = new THREE.Line(
            crackGeom,
            new THREE.LineBasicMaterial({ color: 0x0a0a10 })
        );
        crackGroup.add(crack);
        
        return crackGroup;
    }
    
    createDeadTree() {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 2 + Math.random(), 6),
            new THREE.MeshStandardMaterial({ color: 0x2a2525, roughness: 0.95 })
        );
        trunk.position.y = 1;
        trunk.rotation.z = (Math.random() - 0.5) * 0.3;
        treeGroup.add(trunk);
        
        // Dead branches
        for (let i = 0; i < 3; i++) {
            const branch = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.04, 0.8 + Math.random() * 0.5, 4),
                new THREE.MeshStandardMaterial({ color: 0x252020 })
            );
            branch.position.set(0, 1.5 + i * 0.3, 0);
            branch.rotation.z = (Math.random() - 0.5) * Math.PI * 0.5 + Math.PI / 4;
            branch.rotation.y = Math.random() * Math.PI * 2;
            treeGroup.add(branch);
        }
        
        return treeGroup;
    }
    
    createConvoyExterior() {
        // Main shelter building exterior
        const shelterExterior = new THREE.Mesh(
            new THREE.BoxGeometry(8, 3, 10),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.8 })
        );
        shelterExterior.position.set(0, 1.5, 5);
        shelterExterior.castShadow = true;
        this.scene.add(shelterExterior);
        
        // Windows with light
        for (let i = 0; i < 3; i++) {
            const shelterWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(0.8, 0.6),
                new THREE.MeshBasicMaterial({
                    color: 0xffaa66,
                    transparent: true,
                    opacity: 0.6
                })
            );
            shelterWindow.position.set(-3 + i * 3, 2, 0.01);
            this.scene.add(shelterWindow);
        }
        
        // Workshop building
        const workshop = new THREE.Mesh(
            new THREE.BoxGeometry(6, 3.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x25252a, roughness: 0.8 })
        );
        workshop.position.set(-8, 1.75, 0);
        workshop.castShadow = true;
        this.scene.add(workshop);
        
        // Workshop window
        const workshopWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 1),
            new THREE.MeshBasicMaterial({
                color: 0xffcc88,
                transparent: true,
                opacity: 0.5
            })
        );
        workshopWindow.position.set(-4.99, 2, 0);
        workshopWindow.rotation.y = Math.PI / 2;
        this.scene.add(workshopWindow);
        
        // Vehicles (damaged/abandoned)
        this.createVehicle(new THREE.Vector3(8, 0, -3), 0.5);
        this.createVehicle(new THREE.Vector3(6, 0, -8), -0.3);
        this.createVehicle(new THREE.Vector3(-5, 0, -10), 1.2);
        
        // Fence/barrier
        for (let i = 0; i < 12; i++) {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 1.5, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x3a3a40 })
            );
            const angle = (i / 12) * Math.PI + Math.PI / 4;
            post.position.set(
                Math.cos(angle) * 12,
                0.75,
                Math.sin(angle) * 12 - 5
            );
            this.scene.add(post);
        }
    }
    
    createVehicle(position, rotation) {
        const vehicle = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.8, 4),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.7 })
        );
        body.position.y = 0.7;
        vehicle.add(body);
        
        // Roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.6, 2),
            new THREE.MeshStandardMaterial({ color: 0x353540 })
        );
        roof.position.set(0, 1.4, 0);
        vehicle.add(roof);
        
        // Wheels
        const wheelGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        
        [[-0.9, -1.3], [0.9, -1.3], [-0.9, 1.3], [0.9, 1.3]].forEach(([x, z]) => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.position.set(x, 0.3, z);
            wheel.rotation.z = Math.PI / 2;
            vehicle.add(wheel);
        });
        
        // Damage details
        const dent = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30 })
        );
        dent.position.set(0.8, 0.8, 1.8);
        dent.scale.set(1, 0.3, 1);
        vehicle.add(dent);
        
        vehicle.position.copy(position);
        vehicle.rotation.y = rotation;
        this.scene.add(vehicle);
        
        return vehicle;
    }
    
    createLightFractures() {
        // The Light visible in the sky - massive fractures
        this.lightGroup = new THREE.Group();
        
        // Central mass
        const centralGlow = new THREE.Mesh(
            new THREE.SphereGeometry(3, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xffffee,
                transparent: true,
                opacity: 0.3
            })
        );
        centralGlow.position.set(0, 40, -20);
        this.lightGroup.add(centralGlow);
        this.centralGlow = centralGlow;
        
        // Main light source
        const skyLight = new THREE.PointLight(0xeeeeff, 0.5, 100, 1);
        skyLight.position.set(0, 40, -20);
        this.lightGroup.add(skyLight);
        this.skyLight = skyLight;
        
        // Fracture lines across the sky
        this.skyFractures = [];
        
        for (let i = 0; i < 15; i++) {
            const fracture = this.createSkyFracture(0, 40, -20);
            this.skyFractures.push(fracture);
            this.lightGroup.add(fracture);
        }
        
        // Secondary fractures
        for (let i = 0; i < 5; i++) {
            const secondaryPos = new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                30 + Math.random() * 20,
                -30 + Math.random() * 20
            );
            
            const secondaryGlow = new THREE.Mesh(
                new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: 0xffffee,
                    transparent: true,
                    opacity: 0.2 + Math.random() * 0.2
                })
            );
            secondaryGlow.position.copy(secondaryPos);
            this.lightGroup.add(secondaryGlow);
        }
        
        this.scene.add(this.lightGroup);
    }
    
    createSkyFracture(x, y, z) {
        const fractureGroup = new THREE.Group();
        
        const length = 5 + Math.random() * 15;
        const angle = Math.random() * Math.PI * 2;
        const tilt = (Math.random() - 0.5) * Math.PI * 0.3;
        
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(
                Math.cos(angle) * length,
                Math.sin(tilt) * length * 0.3,
                Math.sin(angle) * length
            )
        ];
        
        // Add some randomness to the line
        const midPoint = new THREE.Vector3().lerpVectors(points[0], points[1], 0.5);
        midPoint.x += (Math.random() - 0.5) * 2;
        midPoint.y += (Math.random() - 0.5) * 2;
        midPoint.z += (Math.random() - 0.5) * 2;
        
        const curvePoints = [points[0], midPoint, points[1]];
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const curveGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(10));
        
        const fractureLine = new THREE.Line(
            curveGeom,
            new THREE.LineBasicMaterial({
                color: 0xffffcc,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.4
            })
        );
        fractureGroup.add(fractureLine);
        
        // Glow along the fracture
        const glowCount = 3;
        for (let i = 0; i < glowCount; i++) {
            const t = (i + 1) / (glowCount + 1);
            const pos = curve.getPoint(t);
            
            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffffee,
                    transparent: true,
                    opacity: 0.2
                })
            );
            glow.position.copy(pos);
            fractureGroup.add(glow);
        }
        
        fractureGroup.position.set(x, y, z);
        return fractureGroup;
    }
    
    createDebris() {
        // Scattered debris
        for (let i = 0; i < 30; i++) {
            const debris = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.1 + Math.random() * 0.3,
                    0.1 + Math.random() * 0.2,
                    0.1 + Math.random() * 0.3
                ),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(0, 0, 0.1 + Math.random() * 0.15),
                    roughness: 0.9
                })
            );
            debris.position.set(
                (Math.random() - 0.5) * 25,
                0.05 + Math.random() * 0.1,
                (Math.random() - 0.5) * 25
            );
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            this.scene.add(debris);
        }
        
        // Larger rubble pieces
        for (let i = 0; i < 10; i++) {
            const rubble = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.4, 0),
                new THREE.MeshStandardMaterial({
                    color: 0x2a2a30,
                    roughness: 0.95
                })
            );
            rubble.position.set(
                (Math.random() - 0.5) * 20,
                0.2,
                (Math.random() - 0.5) * 20
            );
            rubble.rotation.set(Math.random(), Math.random(), Math.random());
            this.scene.add(rubble);
        }
    }
    
    createInteractables() {
        // Shelter entrance
        const shelterDoor = new InteractableObject({
            name: 'Shelter Entrance',
            description: 'Enter the convoy shelter.',
            position: new THREE.Vector3(0, 1.5, 0),
            size: new THREE.Vector3(2, 3, 1),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Enter the shelter?",
                    choices: [
                        {
                            text: "Go inside",
                            action: () => {
                                game.sceneManager.loadScene('convoy_shelter');
                            }
                        },
                        { text: "Stay outside", action: () => {} }
                    ]
                });
            }
        });
        shelterDoor.addToScene(this.scene);
        this.interactables.push(shelterDoor);
        
        // Workshop entrance
        const workshopDoor = new InteractableObject({
            name: 'Workshop Entrance',
            description: "Enter Tanner's workshop.",
            position: new THREE.Vector3(-5, 1.5, 0),
            size: new THREE.Vector3(1, 3, 2),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Enter the workshop?",
                    choices: [
                        {
                            text: "Go inside",
                            action: () => {
                                game.sceneManager.loadScene('tanner_workshop');
                            }
                        },
                        { text: "Stay outside", action: () => {} }
                    ]
                });
            }
        });
        workshopDoor.addToScene(this.scene);
        this.interactables.push(workshopDoor);
        
        // Look at the sky
        const skyView = new InteractableObject({
            name: 'The Sky',
            description: 'Look up at the fractured sky.',
            position: new THREE.Vector3(0, 2, -10),
            size: new THREE.Vector3(10, 5, 3),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "The Light. It's always there now, spreading across the sky like cracks in glass. Some say it's beautiful. I think it's a wound that will never heal.",
                    responses: [
                        {
                            text: "Think about Luis",
                            next: null,
                            effect: () => {
                                game.dialogueSystem.showDialogue({
                                    speaker: 'ADRIAN',
                                    text: "It touched him. Changed him. But he's still in there. He has to be."
                                });
                            }
                        },
                        { text: "Look away", next: null }
                    ]
                });
            }
        });
        skyView.addToScene(this.scene);
        this.interactables.push(skyView);
        
        // Abandoned vehicle
        const vehicle = new InteractableObject({
            name: 'Abandoned Vehicle',
            description: 'A damaged car, long abandoned.',
            position: new THREE.Vector3(8, 0.5, -3),
            size: new THREE.Vector3(3, 2, 5),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Someone tried to flee. Most people did, at first. Before they realized there was nowhere to run from something that existed everywhere at once."
                });
            }
        });
        vehicle.addToScene(this.scene);
        this.interactables.push(vehicle);
    }
    
    update(deltaTime) {
        // Pulse the central sky glow
        if (this.centralGlow) {
            const pulse = Math.sin(Date.now() * 0.001) * 0.2 + 1;
            this.centralGlow.scale.setScalar(pulse);
        }
        
        // Flicker sky light
        if (this.skyLight) {
            this.skyLight.intensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.1;
        }
        
        // Animate sky fractures
        this.skyFractures.forEach((fracture, i) => {
            fracture.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = 0.3 + Math.sin(Date.now() * 0.003 + i) * 0.2;
                }
            });
        });
    }
    
    onEnter() {
        // Set player as outside - lucidity will increase!
        if (this.game.gameState) {
            this.game.gameState.setOutside(true);
        }
        
        // Show warning notification
        if (this.game.uiManager) {
            if (!this.game.gameState.isVestEquipped()) {
                this.game.uiManager.showNotification('⚠ The Light is dangerous here! Wear a vest or get inside quickly!', 'warning', 5000);
            } else {
                this.game.uiManager.showNotification('Your vest protects you from The Light\'s influence.', 'info', 3000);
            }
        }
        
        // Add atmospheric particles when entering the scene
        if (this.game.particleSystem) {
            this.game.particleSystem.createDustParticles(this.scene, {
                count: 400,
                range: { x: 30, y: 5, z: 30 },
                color: 0x5a5a6a,
                size: 0.025
            });
            
            // Add eerie firefly-like particles
            this.game.particleSystem.createFireflies(this.scene, {
                count: 20,
                range: { x: 25, y: 4, z: 25 },
                color: 0xaaddff
            });
        }
    }
    
    onExit() {
        // Set player as inside when leaving exterior
        if (this.game.gameState) {
            this.game.gameState.setOutside(false);
        }
    }
}
