/**
 * PROJECT DEATHBED - Tanner's Workshop Scene
 * A warm, cluttered workspace where Tanner tinkers and provides refuge
 */

import * as THREE from 'three';
import { NPCEntity } from '../entities/NPCEntity.js';
import { InteractableObject } from '../entities/InteractableObject.js';

export class TannerWorkshopScene {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        
        this.setupEnvironment();
        this.setupLighting();
        this.createWorkshopGeometry();
        this.createWorkbenches();
        this.createClutter();
        this.createTanner();
        this.createInteractables();
        
        this.bounds = { minX: -5, maxX: 5, minZ: -6, maxZ: 6 };
    }
    
    setupEnvironment() {
        // Warmer than the shelter, but still dark outside
        this.scene.fog = new THREE.FogExp2(0x1a1510, 0.025);
        this.scene.background = new THREE.Color(0x0d0a08);
    }
    
    setupLighting() {
        // Warm ambient
        const ambientLight = new THREE.AmbientLight(0x1a1510, 0.4);
        this.scene.add(ambientLight);
        
        // Main work light - hanging bulb
        const workLight = new THREE.PointLight(0xffcc88, 1.5, 10, 2);
        workLight.position.set(0, 2.5, -2);
        workLight.castShadow = true;
        this.scene.add(workLight);
        this.workLight = workLight;
        
        // Secondary work area
        const secondLight = new THREE.PointLight(0xffaa66, 0.8, 8, 2);
        secondLight.position.set(-3, 2, 2);
        this.scene.add(secondLight);
        
        // Small forge/heat source glow
        const forgeLight = new THREE.PointLight(0xff6633, 1.2, 5, 2);
        forgeLight.position.set(4, 0.8, -3);
        this.scene.add(forgeLight);
        this.forgeLight = forgeLight;
        
        // Window light (blue, cold outside)
        const windowLight = new THREE.RectAreaLight(0x3344aa, 0.3, 2, 1.5);
        windowLight.position.set(-5.5, 2, 0);
        windowLight.lookAt(0, 2, 0);
        this.scene.add(windowLight);
    }
    
    createWorkshopGeometry() {
        // Concrete floor
        const floorGeometry = new THREE.PlaneGeometry(12, 14);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3530,
            roughness: 0.95,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2520,
            roughness: 0.9
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 4),
            wallMaterial
        );
        backWall.position.set(0, 2, -7);
        this.scene.add(backWall);
        
        // Side walls
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 4),
            wallMaterial
        );
        leftWall.position.set(-6, 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 4),
            wallMaterial
        );
        rightWall.position.set(6, 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
        
        // Front wall with garage door
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 4),
            wallMaterial
        );
        frontWall.position.set(0, 2, 7);
        frontWall.rotation.y = Math.PI;
        this.scene.add(frontWall);
        
        // Garage door (metal, closed)
        const garageDoor = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 3),
            new THREE.MeshStandardMaterial({
                color: 0x4a4a4a,
                roughness: 0.6,
                metalness: 0.4
            })
        );
        garageDoor.position.set(0, 1.5, 6.95);
        garageDoor.rotation.y = Math.PI;
        this.scene.add(garageDoor);
        
        // Ceiling with exposed beams
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 14),
            new THREE.MeshStandardMaterial({ color: 0x1a1815, roughness: 0.95 })
        );
        ceiling.position.set(0, 4, 0);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
        
        // Ceiling beams
        for (let z = -6; z <= 6; z += 3) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(12, 0.15, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x3a2a1a })
            );
            beam.position.set(0, 3.9, z);
            this.scene.add(beam);
        }
        
        // Hanging work light
        const lightCord = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        lightCord.position.set(0, 3.25, -2);
        this.scene.add(lightCord);
        
        const lightShade = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 0.2, 8, 1, true),
            new THREE.MeshStandardMaterial({
                color: 0x2a2a30,
                side: THREE.DoubleSide
            })
        );
        lightShade.position.set(0, 2.6, -2);
        lightShade.rotation.x = Math.PI;
        this.scene.add(lightShade);
        
        // Window
        const windowFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.6, 2.1),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40 })
        );
        windowFrame.position.set(-5.9, 2, 0);
        this.scene.add(windowFrame);
        
        const windowGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0x1a2233,
                emissive: 0x112244,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.8
            })
        );
        windowGlass.position.set(-5.85, 2, 0);
        windowGlass.rotation.y = Math.PI / 2;
        this.scene.add(windowGlass);
    }
    
    createWorkbenches() {
        // Main workbench
        const mainBench = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.1, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
        );
        mainBench.position.set(0, 1, -5);
        mainBench.castShadow = true;
        this.scene.add(mainBench);
        
        // Bench legs
        const legGeom = new THREE.BoxGeometry(0.1, 1, 0.1);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a40 });
        [[-1.9, -0.55], [1.9, -0.55], [-1.9, 0.55], [1.9, 0.55]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(x, 0.5, -5 + z);
            this.scene.add(leg);
        });
        
        // Pegboard behind main bench
        const pegboard = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 2),
            new THREE.MeshStandardMaterial({ color: 0x4a4a40, roughness: 0.95 })
        );
        pegboard.position.set(0, 2.5, -6.9);
        this.scene.add(pegboard);
        
        // Tool shapes on pegboard
        this.createToolSilhouettes(0, 2.5, -6.85);
        
        // Secondary workbench (left side)
        const sideBench = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.1, 3),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
        );
        sideBench.position.set(-4.5, 0.9, 2);
        this.scene.add(sideBench);
        
        // Forge area
        const forgeBase = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.8, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7 })
        );
        forgeBase.position.set(4, 0.4, -3);
        this.scene.add(forgeBase);
        
        // Forge interior glow
        const forgeInterior = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.3, 1.2),
            new THREE.MeshStandardMaterial({
                color: 0xff4422,
                emissive: 0xff4422,
                emissiveIntensity: 0.5
            })
        );
        forgeInterior.position.set(4, 0.8, -3);
        this.scene.add(forgeInterior);
        
        // Anvil
        const anvil = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.4, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5, metalness: 0.7 })
        );
        anvil.position.set(3, 0.4, -1.5);
        this.scene.add(anvil);
        
        // Storage shelves (right wall)
        for (let i = 0; i < 3; i++) {
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.05, 2),
                new THREE.MeshStandardMaterial({ color: 0x4a3a2a })
            );
            shelf.position.set(5.7, 1 + i * 0.8, 3);
            this.scene.add(shelf);
            
            // Items on shelves
            for (let j = 0; j < 3; j++) {
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.25, 0.3),
                    new THREE.MeshStandardMaterial({
                        color: [0x6a5a4a, 0x4a5a6a, 0x5a6a4a][Math.floor(Math.random() * 3)]
                    })
                );
                box.position.set(5.7, 1.15 + i * 0.8, 2.3 + j * 0.6);
                this.scene.add(box);
            }
        }
    }
    
    createToolSilhouettes(x, y, z) {
        // Wrench
        const wrench = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.4, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x6a6a70, metalness: 0.5 })
        );
        wrench.position.set(x - 0.8, y, z);
        wrench.rotation.z = 0.2;
        this.scene.add(wrench);
        
        // Hammer
        const hammerHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.5, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x6a4a2a })
        );
        hammerHandle.position.set(x, y - 0.1, z);
        this.scene.add(hammerHandle);
        
        const hammerHead = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.08, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x5a5a60, metalness: 0.6 })
        );
        hammerHead.position.set(x, y + 0.2, z);
        this.scene.add(hammerHead);
        
        // Pliers
        const pliers = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.35, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x6a6a70, metalness: 0.5 })
        );
        pliers.position.set(x + 0.5, y, z);
        this.scene.add(pliers);
        
        // Screwdrivers
        for (let i = 0; i < 3; i++) {
            const driver = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8),
                new THREE.MeshStandardMaterial({ color: 0x4a4a50 })
            );
            driver.position.set(x + 1 + i * 0.12, y, z);
            this.scene.add(driver);
            
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.025, 0.12, 8),
                new THREE.MeshStandardMaterial({
                    color: [0xaa3333, 0x33aa33, 0x3333aa][i]
                })
            );
            handle.position.set(x + 1 + i * 0.12, y - 0.2, z);
            this.scene.add(handle);
        }
    }
    
    createClutter() {
        // Random parts and pieces on main bench
        for (let i = 0; i < 8; i++) {
            const part = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.05 + Math.random() * 0.1,
                    0.03 + Math.random() * 0.05,
                    0.05 + Math.random() * 0.1
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x5a5a60,
                    metalness: 0.4 + Math.random() * 0.4
                })
            );
            part.position.set(
                -1.5 + Math.random() * 3,
                1.08,
                -4.8 + Math.random() * 0.5
            );
            part.rotation.y = Math.random() * Math.PI;
            this.scene.add(part);
        }
        
        // Oil can
        const oilCan = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, metalness: 0.6 })
        );
        oilCan.position.set(-1, 1.15, -5.2);
        this.scene.add(oilCan);
        
        // Rags
        const rag = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x8a6a5a })
        );
        rag.position.set(1.5, 1.06, -4.7);
        rag.rotation.y = 0.5;
        this.scene.add(rag);
        
        // Coffee mug
        const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.035, 0.1, 12),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40 })
        );
        mug.position.set(-4.5, 0.95, 1);
        this.scene.add(mug);
        
        // Radio
        const radio = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30 })
        );
        radio.position.set(-4.5, 0.97, 3);
        this.scene.add(radio);
        
        // Barrel
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 1, 16),
            new THREE.MeshStandardMaterial({ color: 0x4a4a50, roughness: 0.7 })
        );
        barrel.position.set(4.5, 0.5, 3);
        this.scene.add(barrel);
        
        // Crates
        const crate1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a })
        );
        crate1.position.set(-4, 0.3, -3);
        this.scene.add(crate1);
        
        const crate2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.5, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x4a5a4a })
        );
        crate2.position.set(-3.5, 0.8, -3.2);
        crate2.rotation.y = 0.3;
        this.scene.add(crate2);
    }
    
    createTanner() {
        // Tanner at the main workbench
        this.tanner = new NPCEntity({
            name: 'Tanner',
            position: new THREE.Vector3(0.5, 0, -4),
            color: 0x7a6a5a, // Warm brown work clothes
            height: 1.8,
            glowColor: null
        });
        
        this.tanner.addToScene(this.scene);
        this.npcs.push(this.tanner);
        
        this.tanner.setDialogue({
            greeting: {
                text: "Hey, you must be Adrian. Luis mentioned you'd come by. Have a seat, there's coffee somewhere in this mess.",
                responses: [
                    { text: "How is Luis?", next: 'luis_condition' },
                    { text: "What are you working on?", next: 'work' },
                    { text: "Thanks for taking us in.", next: 'thanks' }
                ]
            },
            luis_condition: {
                text: "He's... stable, I think. The glow comes and goes. Sometimes he talks about seeing things—places, people, all at once. I don't pretend to understand it.",
                responses: [
                    { text: "Is he dangerous?", next: 'dangerous' },
                    { text: "Can we help him?", next: 'help' },
                    { text: "Thank you for watching him.", next: 'thanks' }
                ]
            },
            dangerous: {
                text: "Maybe. But he's also your brother, and he's trying. I've seen the Light take people completely—they stop being human. Luis is still Luis, still fighting to be himself. That counts for something.",
                responses: [
                    { text: "That means a lot.", next: 'thanks' },
                    { text: "I worry about him.", next: 'worry' }
                ]
            },
            help: {
                text: "I've been tinkering with some devices—trying to dampen the Light's influence. Nothing works well yet, but your brother is patient. We'll figure something out.",
                responses: [
                    { text: "Can I see what you're working on?", next: 'work' },
                    { text: "I hope so.", next: 'hope' }
                ]
            },
            work: {
                text: "This? It's a crude Faraday cage, modified for whatever frequency the Light operates on. Theory is it might give Luis some relief, help him stay... grounded. Still experimental.",
                responses: [
                    { text: "That's incredible.", next: 'thanks' },
                    { text: "I hope it helps.", next: 'hope' }
                ]
            },
            thanks: {
                text: "Don't mention it. We've all lost people to the Light. If there's a chance to save even one... well, that's worth the sleepless nights.",
                responses: [
                    { text: "You're a good person, Tanner.", next: 'humble' },
                    { text: "I should check on Luis.", next: 'leave' }
                ]
            },
            worry: {
                text: "I know. I worry too. But worrying doesn't fix anything—action does. So I build, I tinker, I try. And you? You stay by his side. That's the best medicine there is.",
                responses: [
                    { text: "You're right.", next: 'humble' },
                    { text: "I should go back to him.", next: 'leave' }
                ]
            },
            hope: {
                text: "Hope is all we have left. That, and stubbornness. Lucky for us, I've got plenty of both. Now go on, your brother probably misses you.",
                responses: [
                    { text: "Thank you, Tanner.", next: 'leave' }
                ]
            },
            humble: {
                text: "Good? Nah, just stubborn. And maybe a little foolish. But the world needs fools right now—people willing to believe things can get better.",
                responses: [
                    { text: "I'll remember that.", next: 'leave' }
                ]
            },
            leave: {
                text: "Take care of yourself out there. And if Luis needs anything, you know where to find me."
            }
        });
    }
    
    createInteractables() {
        // Main workbench
        const workbench = new InteractableObject({
            name: 'Workbench',
            description: "Tanner's main work area.",
            position: new THREE.Vector3(0, 1, -5),
            size: new THREE.Vector3(4, 0.5, 1.5),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Scattered parts, half-finished devices. Tanner's been busy. I see what might be the dampener he mentioned—a mesh cage with wires running to a small generator."
                });
            }
        });
        workbench.addToScene(this.scene);
        this.interactables.push(workbench);
        
        // Forge
        const forge = new InteractableObject({
            name: 'Forge',
            description: 'A small forge for metalworking.',
            position: new THREE.Vector3(4, 0.6, -3),
            size: new THREE.Vector3(1.5, 1, 1.5),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "Still warm. Tanner must have been working late. The heat feels good after the cold outside."
                });
            }
        });
        forge.addToScene(this.scene);
        this.interactables.push(forge);
        
        // Exit door
        const exit = new InteractableObject({
            name: 'Workshop Door',
            description: 'Exit to the exterior.',
            position: new THREE.Vector3(0, 1.5, 6.5),
            size: new THREE.Vector3(3, 3, 0.5),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Leave the workshop?",
                    choices: [
                        {
                            text: "Go outside",
                            action: () => {
                                game.sceneManager.loadScene('exterior');
                            }
                        },
                        { text: "Stay", action: () => {} }
                    ]
                });
            }
        });
        exit.addToScene(this.scene);
        this.interactables.push(exit);
        
        // Door to shelter
        const shelterDoor = new InteractableObject({
            name: 'Door to Shelter',
            description: 'Return to the convoy shelter.',
            position: new THREE.Vector3(-5.5, 1.5, -4),
            size: new THREE.Vector3(0.5, 2.5, 1),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Return to the shelter?",
                    choices: [
                        {
                            text: "Go to shelter",
                            action: () => {
                                game.sceneManager.loadScene('convoy_shelter');
                            }
                        },
                        { text: "Stay here", action: () => {} }
                    ]
                });
            }
        });
        shelterDoor.addToScene(this.scene);
        this.interactables.push(shelterDoor);
    }
    
    update(deltaTime) {
        // Flicker the work light slightly
        if (this.workLight) {
            this.workLight.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.05;
        }
        
        // Forge glow pulsing
        if (this.forgeLight) {
            this.forgeLight.intensity = 1.2 + Math.sin(Date.now() * 0.003) * 0.3;
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
    }
}
