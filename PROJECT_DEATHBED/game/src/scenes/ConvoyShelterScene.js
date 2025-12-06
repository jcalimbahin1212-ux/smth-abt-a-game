/**
 * PROJECT DEATHBED - Convoy Shelter Scene
 * The main interior scene - a converted vehicle/shelter where Luis rests
 * Lighter blue atmosphere with warm amber accents from candles
 */

import * as THREE from 'three';
import { LightEntity } from '../entities/LightEntity.js';
import { NPCEntity } from '../entities/NPCEntity.js';
import { InteractableObject } from '../entities/InteractableObject.js';
import { textureGenerator } from '../utils/TextureGenerator.js';

export class ConvoyShelterScene {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        this.lightEntity = null;
        
        // Get textures
        this.woodTexture = textureGenerator.getTexture('wood', { color: { r: 100, g: 70, b: 45 } });
        this.metalTexture = textureGenerator.getTexture('metal', { color: { r: 90, g: 95, b: 100 } });
        this.fabricTexture = textureGenerator.getTexture('fabric', { color: { r: 85, g: 75, b: 65 } });
        this.concreteTexture = textureGenerator.getTexture('concrete', { color: { r: 100, g: 100, b: 105 } });
        
        // Build the scene
        this.setupEnvironment();
        this.setupLighting();
        this.createShelterGeometry();
        this.createFurniture();
        this.createInteractables();
        this.createNPCs();
        this.createAtmosphericEffects();
    }
    
    setupEnvironment() {
        // Lighter blue fog for softer atmosphere
        this.scene.fog = new THREE.FogExp2(0x151525, 0.04);
        this.scene.background = new THREE.Color(0x12121f);
    }
    
    setupLighting() {
        // Brighter ambient light - softer blue tint (increased from 0.5)
        const ambientLight = new THREE.AmbientLight(0x3a3a5a, 0.7);
        this.scene.add(ambientLight);
        
        // Main candle light (warm amber) - creates the focal point (increased)
        const candleLight1 = new THREE.PointLight(0xffbb55, 2.2, 12, 1.6);
        candleLight1.position.set(2, 1.2, 0);
        candleLight1.castShadow = true;
        candleLight1.shadow.mapSize.width = 512;
        candleLight1.shadow.mapSize.height = 512;
        this.scene.add(candleLight1);
        this.candleLight1 = candleLight1;
        
        // Secondary candle - brighter (increased)
        const candleLight2 = new THREE.PointLight(0xffbb55, 1.4, 8, 2);
        candleLight2.position.set(-3, 0.8, -2);
        this.scene.add(candleLight2);
        this.candleLight2 = candleLight2;
        
        // Additional candle near Luis
        const candleLight3 = new THREE.PointLight(0xffaa44, 1.0, 5, 2);
        candleLight3.position.set(-1, 0.6, 1);
        this.scene.add(candleLight3);
        
        // Softer blue rim light from covered window (increased)
        const windowLight = new THREE.RectAreaLight(0x6a8aba, 1.0, 2, 1.5);
        windowLight.position.set(5, 2, 0);
        windowLight.lookAt(0, 1.5, 0);
        this.scene.add(windowLight);
        
        // Luis's warm glow (he's touched by the Light) - increased
        const luisGlow = new THREE.PointLight(0xd4b247, 0.7, 5, 2);
        luisGlow.position.set(-2, 0.8, 2);
        this.scene.add(luisGlow);
        this.luisGlow = luisGlow;
        
        // Additional fill light - increased
        const fillLight = new THREE.HemisphereLight(0x5a6a8a, 0x3a3040, 0.5);
        this.scene.add(fillLight);
    }
    
    createShelterGeometry() {
        // Floor - worn wood texture
        const floorGeometry = new THREE.PlaneGeometry(12, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a55,
            map: this.woodTexture,
            roughness: 0.85,
            metalness: 0.05
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls - lighter metal panels
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a35,
            map: this.metalTexture,
            roughness: 0.75,
            metalness: 0.25
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 4),
            wallMaterial
        );
        backWall.position.set(0, 2, -5);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 4),
            wallMaterial.clone()
        );
        leftWall.position.set(-6, 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // Right wall with covered window
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 4),
            wallMaterial.clone()
        );
        rightWall.position.set(6, 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
        
        // Covered window on right wall (thin fabric letting blue light through)
        const windowCover = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0x3a4a5a,
                roughness: 0.7,
                transparent: true,
                opacity: 0.8,
                emissive: 0x1a2a4a,
                emissiveIntensity: 0.3
            })
        );
        windowCover.position.set(5.9, 2, 0);
        windowCover.rotation.y = -Math.PI / 2;
        this.scene.add(windowCover);
        
        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 10),
            new THREE.MeshStandardMaterial({
                color: 0x151520,
                roughness: 0.95
            })
        );
        ceiling.position.set(0, 4, 0);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
    }
    
    createFurniture() {
        // Luis's cot/bed
        const cotGroup = new THREE.Group();
        
        // Cot frame
        const cotFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.3, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.8 })
        );
        cotFrame.position.y = 0.25;
        cotFrame.castShadow = true;
        cotGroup.add(cotFrame);
        
        // Mattress
        const mattress = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.15, 0.7),
            new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.9 })
        );
        mattress.position.y = 0.45;
        cotGroup.add(mattress);
        
        // Blanket
        const blanket = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.05, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.95 })
        );
        blanket.position.y = 0.55;
        blanket.position.x = -0.2;
        cotGroup.add(blanket);
        
        // Pillow
        const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.1, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.9 })
        );
        pillow.position.set(0.8, 0.55, 0);
        cotGroup.add(pillow);
        
        cotGroup.position.set(-2, 0, 2);
        cotGroup.rotation.y = Math.PI / 6;
        this.scene.add(cotGroup);
        
        // Small table with medical supplies
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.85 })
        );
        table.position.set(0, 0.3, 2);
        table.castShadow = true;
        this.scene.add(table);
        
        // Chair for Adrian
        const chairGroup = new THREE.Group();
        
        const chairSeat = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.05, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 0.9 })
        );
        chairSeat.position.y = 0.45;
        chairGroup.add(chairSeat);
        
        const chairBack = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.6, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 0.9 })
        );
        chairBack.position.set(0, 0.75, -0.22);
        chairGroup.add(chairBack);
        
        // Chair legs
        const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.45);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3530 });
        
        const positions = [
            [-0.2, 0.22, 0.2],
            [0.2, 0.22, 0.2],
            [-0.2, 0.22, -0.2],
            [0.2, 0.22, -0.2]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(...pos);
            chairGroup.add(leg);
        });
        
        chairGroup.position.set(-0.5, 0, 1);
        chairGroup.rotation.y = -Math.PI / 4;
        this.scene.add(chairGroup);
        
        // Candle holder on table
        const candleHolder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.05, 8),
            new THREE.MeshStandardMaterial({ color: 0x8a7a6a, metalness: 0.5 })
        );
        candleHolder.position.set(2, 1.025, 0);
        this.scene.add(candleHolder);
        
        // Candle
        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
            new THREE.MeshStandardMaterial({ color: 0xf0e8d0, emissive: 0xffaa44, emissiveIntensity: 0.2 })
        );
        candle.position.set(2, 1.125, 0);
        this.scene.add(candle);
        
        // Candle holder stand
        const candleStand = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 1, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.85 })
        );
        candleStand.position.set(2, 0.5, 0);
        candleStand.castShadow = true;
        this.scene.add(candleStand);
        
        // Storage crates
        const crateGeom = new THREE.BoxGeometry(0.6, 0.5, 0.6);
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x4a4035, roughness: 0.9 });
        
        const crate1 = new THREE.Mesh(crateGeom, crateMat);
        crate1.position.set(4, 0.25, -3);
        crate1.castShadow = true;
        this.scene.add(crate1);
        
        const crate2 = new THREE.Mesh(crateGeom, crateMat);
        crate2.position.set(4.5, 0.25, -2.5);
        crate2.rotation.y = 0.3;
        crate2.castShadow = true;
        this.scene.add(crate2);
        
        const crate3 = new THREE.Mesh(crateGeom, crateMat);
        crate3.position.set(4.2, 0.75, -2.8);
        crate3.rotation.y = -0.2;
        crate3.castShadow = true;
        this.scene.add(crate3);
        
        // Scene bounds
        this.bounds = { minX: -5, maxX: 5, minZ: -4, maxZ: 4 };
    }
    
    createInteractables() {
        // Door to exterior
        const exteriorDoor = new InteractableObject({
            name: 'Exit Door',
            description: 'Door leading outside.',
            position: new THREE.Vector3(0, 1.5, -4.5),
            size: new THREE.Vector3(1.5, 2.5, 0.5),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Go outside?",
                    choices: [
                        {
                            text: "Go outside",
                            action: () => {
                                game.sceneManager.loadScene('exterior');
                            }
                        },
                        { text: "Stay inside", action: () => {} }
                    ]
                });
            }
        });
        exteriorDoor.addToScene(this.scene);
        this.interactables.push(exteriorDoor);
        
        // Door to workshop
        const workshopDoor = new InteractableObject({
            name: 'Workshop Door',
            description: "Door to Tanner's workshop.",
            position: new THREE.Vector3(-5.5, 1.5, 0),
            size: new THREE.Vector3(0.5, 2.5, 1),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Visit Tanner's workshop?",
                    choices: [
                        {
                            text: "Go to workshop",
                            action: () => {
                                game.sceneManager.loadScene('tanner_workshop');
                            }
                        },
                        { text: "Stay here", action: () => {} }
                    ]
                });
            }
        });
        workshopDoor.addToScene(this.scene);
        this.interactables.push(workshopDoor);
        
        // Medical supplies on the table
        const medicalSupplies = new InteractableObject({
            name: 'Medical Supplies',
            description: 'Bandages, painkillers, cooling cloths. Not much left.',
            position: new THREE.Vector3(0, 0.7, 2),
            size: new THREE.Vector3(0.3, 0.2, 0.3),
            color: 0x8a9a8a,
            interactionType: 'examine',
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Running low on supplies. I need to ration carefully.",
                    choices: [
                        { text: "Check inventory", action: () => {} },
                        { text: "Leave it", action: () => {} }
                    ]
                });
            }
        });
        medicalSupplies.addToScene(this.scene);
        this.interactables.push(medicalSupplies);
        
        // Adrian's journal
        const journal = new InteractableObject({
            name: "Adrian's Journal",
            description: 'A worn notebook filled with observations and symptoms.',
            position: new THREE.Vector3(0.3, 0.65, 1.8),
            size: new THREE.Vector3(0.15, 0.03, 0.2),
            color: 0x6a5a4a,
            interactionType: 'examine',
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'JOURNAL ENTRY',
                    text: "Day 47. Luis remembered Mom's birthday today. I didn't prompt him. He just said, 'She would have been 63.' Then he went back to staring at the wall."
                });
            }
        });
        journal.addToScene(this.scene);
        this.interactables.push(journal);
        
        // Water container
        const waterContainer = new InteractableObject({
            name: 'Water Container',
            description: 'Purified water. Essential for Luis.',
            position: new THREE.Vector3(-0.2, 0.65, 2.2),
            size: new THREE.Vector3(0.1, 0.15, 0.1),
            color: 0x4a6a8a,
            interactionType: 'use',
            onInteract: (game) => {
                if (game.gameState.hasItem('water')) {
                    game.dialogueSystem.showDialogue({
                        speaker: 'ADRIAN',
                        text: "I should give this to Luis. Small sips.",
                        choices: [
                            { 
                                text: "Give water to Luis", 
                                action: () => {
                                    game.gameState.useItem('water');
                                    game.gameState.modifyStability(5);
                                    game.dialogueSystem.showDialogue({
                                        speaker: 'ADRIAN',
                                        text: "There you go. Small sips."
                                    });
                                }
                            },
                            { text: "Not now", action: () => {} }
                        ]
                    });
                }
            }
        });
        waterContainer.addToScene(this.scene);
        this.interactables.push(waterContainer);
        
        // Supply Crate (near the stacked crates) - Contains radiation vest
        const supplyCrate = new InteractableObject({
            name: 'Supply Crate',
            description: 'Scavenged supplies and protective gear.',
            position: new THREE.Vector3(4.2, 0.5, -2.8),
            size: new THREE.Vector3(0.8, 0.6, 0.8),
            color: 0x5a5045,
            interactionType: 'use',
            onInteract: (game) => {
                const hasVest = game.gameState.hasItem('radiationVest');
                const isWearingVest = game.gameState.isVestEquipped();
                
                // Build choices dynamically
                const choices = [];
                
                if (hasVest && !isWearingVest) {
                    choices.push({
                        text: "🦺 Equip Radiation Vest",
                        action: () => {
                            if (game.gameState.equipVest()) {
                                game.dialogueSystem.showDialogue({
                                    speaker: 'ADRIAN',
                                    text: "The vest feels heavy, but it should protect me from The Light's influence for a while."
                                });
                                game.uiManager.showNotification('Radiation vest equipped!', 'info', 3000);
                            }
                        }
                    });
                }
                
                if (isWearingVest) {
                    const durability = game.gameState.getVestDurabilityPercent();
                    choices.push({
                        text: `🦺 Unequip Vest (${Math.round(durability)}% durability)`,
                        action: () => {
                            game.gameState.unequipVest();
                            game.dialogueSystem.showDialogue({
                                speaker: 'ADRIAN',
                                text: "I put the vest back in the crate. Better to save it for when I really need it."
                            });
                            game.uiManager.showNotification('Radiation vest stored.', 'info', 2000);
                        }
                    });
                }
                
                choices.push({
                    text: "Check supplies",
                    action: () => {
                        const waterCount = game.gameState.inventory.water || 0;
                        const medCount = game.gameState.inventory.medication || 0;
                        const vestText = hasVest ? "1 radiation vest" : (isWearingVest ? "Vest currently worn" : "No spare vests");
                        
                        game.dialogueSystem.showDialogue({
                            speaker: 'INVENTORY',
                            text: `Supplies remaining:\n• Water: ${waterCount} units\n• Medication: ${medCount} doses\n• ${vestText}`
                        });
                    }
                });
                
                choices.push({ text: "Leave it", action: () => {} });
                
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: isWearingVest 
                        ? "The supply crate. Your vest is currently equipped."
                        : hasVest 
                            ? "The supply crate. A radiation vest sits inside - essential for going outside."
                            : "The supply crate. Almost empty now.",
                    choices: choices
                });
            }
        });
        supplyCrate.addToScene(this.scene);
        this.interactables.push(supplyCrate);
        
        // Covered window
        const windowInteract = new InteractableObject({
            name: 'Covered Window',
            description: 'Heavy cloth blocks most of the light from outside.',
            position: new THREE.Vector3(5.5, 2, 0),
            size: new THREE.Vector3(0.5, 1.5, 2),
            color: 0x3a4a5a,
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "The Light is more active today. I can see it pulsing through the fabric. Better not look directly."
                });
            }
        });
        windowInteract.addToScene(this.scene);
        this.interactables.push(windowInteract);
    }
    
    createNPCs() {
        // Luis - lying on the cot
        const luis = new NPCEntity({
            name: 'Luis',
            position: new THREE.Vector3(-2, 0.6, 2),
            rotation: Math.PI / 6,
            bodyColor: 0x5a5a65,
            isGlowing: true,
            glowColor: 0xc9a227,
            glowIntensity: 0.3,
            dialogues: [
                {
                    id: 'morning_check',
                    speaker: 'LUIS',
                    text: "Still here.",
                    responses: [
                        {
                            text: "How are you feeling?",
                            next: 'feeling_response'
                        },
                        {
                            text: "That's all I need to hear.",
                            next: null,
                            effect: (game) => {
                                game.gameState.modifyLucidity(2);
                            }
                        }
                    ]
                },
                {
                    id: 'feeling_response',
                    speaker: 'LUIS',
                    text: "Warm. Always warm now. But... today is clearer. I can see you properly.",
                    responses: [
                        {
                            text: "That's good. That's really good.",
                            next: 'good_day',
                            effect: (game) => {
                                game.gameState.modifyShapeIntegrity(3);
                            }
                        },
                        {
                            text: "Do you remember yesterday?",
                            next: 'memory_check'
                        }
                    ]
                },
                {
                    id: 'good_day',
                    speaker: 'LUIS',
                    text: "Adrian... I dreamed about the school. The kids' recital. Remember?",
                    responses: [
                        {
                            text: "You made them sing that terrible dinosaur song.",
                            next: 'dinosaur_memory',
                            effect: (game) => {
                                game.gameState.addMemoryAnchor({
                                    id: 'school_recital',
                                    name: 'School Recital',
                                    description: 'Luis teaching children to sing'
                                });
                            }
                        }
                    ]
                },
                {
                    id: 'dinosaur_memory',
                    speaker: 'LUIS',
                    text: "(laughing weakly) They loved that song. They were seven. They loved everything.",
                    responses: [
                        {
                            text: "I wonder if any of them made it.",
                            next: 'somber_end'
                        }
                    ]
                },
                {
                    id: 'somber_end',
                    speaker: 'LUIS',
                    text: "...",
                    responses: [
                        {
                            text: "(Sit with him in silence)",
                            next: null,
                            effect: (game) => {
                                game.gameState.modifyLucidity(5);
                            }
                        }
                    ]
                },
                {
                    id: 'memory_check',
                    speaker: 'LUIS',
                    text: "Yesterday... there was singing. Was that real? Or was that the Light again?",
                    responses: [
                        {
                            text: "That was real. That was you.",
                            next: null,
                            effect: (game) => {
                                game.gameState.modifyShapeIntegrity(2);
                            }
                        }
                    ]
                }
            ]
        });
        luis.addToScene(this.scene);
        this.npcs.push(luis);
    }
    
    createAtmosphericEffects() {
        // Use the game's particle system for enhanced dust particles
        if (this.game.particleSystem) {
            this.game.particleSystem.createDustParticles(this.scene, {
                count: 300,
                range: { x: 12, y: 4, z: 10 },
                color: 0x8a8a8a,
                size: 0.015
            });
            
            // Add rising light particles around Luis
            this.game.particleSystem.createRisingLightParticles(this.scene, {
                count: 25,
                position: new THREE.Vector3(-2, 0.5, 2),
                color: 0xc9a227,
                spread: 0.8
            });
            
            // Add glow particles around candle
            this.game.particleSystem.createGlowParticles(this.scene, {
                count: 20,
                position: new THREE.Vector3(2, 1.2, 0),
                color: 0xffaa44,
                radius: 0.3,
                intensity: 0.5
            });
        }
        
        // Light fractures visible through window (subtle)
        this.createLightFractures();
    }
    
    createLightFractures() {
        // Subtle glow effect outside window suggesting the Light
        const fractureGroup = new THREE.Group();
        
        // Create ethereal light strands
        const strandMaterial = new THREE.MeshBasicMaterial({
            color: 0xc9a227,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        
        for (let i = 0; i < 5; i++) {
            const strand = new THREE.Mesh(
                new THREE.PlaneGeometry(0.05, 2),
                strandMaterial
            );
            strand.position.set(
                6.5,
                1.5 + Math.random(),
                (Math.random() - 0.5) * 2
            );
            strand.rotation.z = (Math.random() - 0.5) * 0.5;
            strand.rotation.y = -Math.PI / 2;
            fractureGroup.add(strand);
        }
        
        this.lightFractures = fractureGroup;
        this.scene.add(fractureGroup);
    }
    
    update(deltaTime) {
        // Flicker candle lights
        if (this.candleLight1) {
            this.candleLight1.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.2 
                + Math.random() * 0.1;
        }
        if (this.candleLight2) {
            this.candleLight2.intensity = 0.8 + Math.sin(Date.now() * 0.008) * 0.15 
                + Math.random() * 0.05;
        }
        
        // Pulse Luis's glow based on his condition
        if (this.luisGlow && this.game.gameState) {
            const shapeIntegrity = this.game.gameState.luisCondition.shapeIntegrity;
            // Lower integrity = stronger, more erratic glow
            const baseIntensity = 0.3 + (100 - shapeIntegrity) * 0.005;
            this.luisGlow.intensity = baseIntensity + Math.sin(Date.now() * 0.003) * 0.1;
        }
        
        // Animate light fractures
        if (this.lightFractures) {
            this.lightFractures.children.forEach((strand, i) => {
                strand.material.opacity = 0.1 + Math.sin(Date.now() * 0.002 + i) * 0.08;
                strand.position.y = 1.5 + Math.sin(Date.now() * 0.001 + i * 0.5) * 0.3;
            });
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
    }
}
