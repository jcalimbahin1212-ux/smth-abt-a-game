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
        this.dialogueShown = false;
        
        // Jump/Dream sequence state
        this.jumpAvailable = true; // Always available on rooftop
        this.playerAtEdge = false;
        this.jumpDecisionMade = false;
        this.talkedToLuis = false;
        
        // Fallen Dream route state
        this.notYetClicked = false;
        this.fallenDreamTriggered = false;
        this.staticOverlay = null;
    }
    
    setupEnvironment() {
        // Eerie evening sky - before the Light touches down
        this.scene.fog = new THREE.FogExp2(0x1a1830, 0.015);
        this.scene.background = new THREE.Color(0x0a0820);
    }
    
    setupLighting() {
        // Brighter ambient for better navigation
        const ambientLight = new THREE.AmbientLight(0x3a3a55, 0.6);
        this.scene.add(ambientLight);
        
        // Moonlight from above - brighter
        const moonLight = new THREE.DirectionalLight(0x6688cc, 0.8);
        moonLight.position.set(-10, 20, -10);
        moonLight.castShadow = true;
        this.scene.add(moonLight);
        
        // City glow from below - more visible
        const cityGlow = new THREE.HemisphereLight(0x665544, 0x223355, 0.4);
        this.scene.add(cityGlow);
        
        // Extra fill light for visibility
        const fillLight = new THREE.PointLight(0x556688, 0.5, 30);
        fillLight.position.set(0, 10, 0);
        this.scene.add(fillLight);
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
            bodyColor: 0x5a6a7a,
            skinColor: 0xd4a574,
            hairColor: 0x2a1a0a,
            hairStyle: 'wavy', // Luis has wavy hair
            bodyType: 'slim',
            height: 1.6,
            glowColor: null // No glow yet - he hasn't been touched
        });
        
        this.luis.addToScene(this.scene);
        this.npcs.push(this.luis);
        
        // Create a visible body for Luis so player can see him
        this.luisBody = new THREE.Group();
        
        // Torso
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.6, 0.25),
            new THREE.MeshStandardMaterial({ color: 0x4a5a6a, roughness: 0.8 })
        );
        torso.position.y = 1.1;
        this.luisBody.add(torso);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
        );
        head.position.y = 1.55;
        this.luisBody.add(head);
        
        // Hair
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 })
        );
        hair.position.y = 1.6;
        hair.scale.set(1, 0.6, 1);
        this.luisBody.add(hair);
        
        // Arms
        const armGeom = new THREE.BoxGeometry(0.12, 0.4, 0.12);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x4a5a6a, roughness: 0.8 });
        
        const leftArm = new THREE.Mesh(armGeom, armMat);
        leftArm.position.set(-0.28, 1.0, 0);
        this.luisBody.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeom, armMat);
        rightArm.position.set(0.28, 1.0, 0);
        this.luisBody.add(rightArm);
        
        // Legs
        const legGeom = new THREE.BoxGeometry(0.14, 0.5, 0.14);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.8 });
        
        const leftLeg = new THREE.Mesh(legGeom, legMat);
        leftLeg.position.set(-0.1, 0.5, 0);
        this.luisBody.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeom, legMat);
        rightLeg.position.set(0.1, 0.5, 0);
        this.luisBody.add(rightLeg);
        
        this.luisBody.position.set(3, 0, -2);
        this.luisBody.rotation.y = Math.PI; // Face away, looking at sky
        this.scene.add(this.luisBody);
        
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
                    this.talkedToLuis = true;
                    this.enableJumpMechanic();
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
                // Block exit if jump is available (story requires jumping)
                if (this.jumpAvailable && !this.jumpDecisionMade) {
                    game.dialogueSystem.showDialogue({
                        speaker: 'ADRIAN',
                        text: "I can't go back. Not yet. The edge... I need to see it. I need to know what happens if I fall."
                    });
                    return;
                }
                
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
        
        // Luis interactable - so player can talk to him
        const luisInteract = new InteractableObject({
            name: 'Luis',
            description: 'Your brother, staring at the sky.',
            position: new THREE.Vector3(3, 0.8, -2),
            size: new THREE.Vector3(0.8, 1.8, 0.8),
            interactionType: 'talk',
            invisible: true,
            onInteract: (game) => {
                this.handleLuisDialogue(game);
            }
        });
        luisInteract.addToScene(this.scene);
        this.interactables.push(luisInteract);
        
        // Create jump edges on ALL sides of the roof
        this.createJumpEdges();
    }
    
    createJumpEdges() {
        // North edge (front) - at the very edge, thin hitbox
        this.createJumpEdge(
            new THREE.Vector3(0, 0.5, -8.5),
            new THREE.Vector3(16, 1.5, 1),
            'The city sprawls below, lights twinkling like fallen stars.'
        );
        
        // South edge (back) - at the very edge
        this.createJumpEdge(
            new THREE.Vector3(0, 0.5, 8.5),
            new THREE.Vector3(16, 1.5, 1),
            'The back alley looks so far down from here.'
        );
        
        // East edge (right) - at the very edge
        this.createJumpEdge(
            new THREE.Vector3(8.5, 0.5, 0),
            new THREE.Vector3(1, 1.5, 16),
            'The neighboring buildings seem so close, yet unreachable.'
        );
        
        // West edge (left) - at the very edge
        this.createJumpEdge(
            new THREE.Vector3(-8.5, 0.5, 0),
            new THREE.Vector3(1, 1.5, 16),
            'The street below is empty. No one would see.'
        );
    }
    
    createJumpEdge(position, size, description) {
        const edge = new InteractableObject({
            name: 'Roof Edge',
            description: 'The edge calls to you...',
            position: position,
            size: size,
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                if (this.fallenDreamTriggered) {
                    // Already triggered fallen dream route
                    game.dialogueSystem.showDialogue({
                        speaker: 'ADRIAN',
                        text: "...I can't move. Something is holding me here."
                    });
                    return;
                }
                
                if (!this.jumpDecisionMade) {
                    // Jump decision dialogue - always available
                    game.dialogueSystem.showDialogue({
                        speaker: 'ADRIAN',
                        text: "The edge... It's so high. In my dreams, I always fall. Maybe... maybe if I just let go...",
                        choices: [
                            {
                                text: "Let go... (Jump)",
                                action: () => {
                                    this.jumpDecisionMade = true;
                                    this.triggerJumpSequence(game);
                                }
                            },
                            {
                                text: "Not yet...",
                                action: () => {
                                    this.triggerNotYetSequence(game);
                                }
                            }
                        ]
                    });
                } else {
                    game.dialogueSystem.showDialogue({
                        speaker: 'ADRIAN',
                        text: description
                    });
                }
            }
        });
        edge.addToScene(this.scene);
        this.interactables.push(edge);
    }
    
    triggerNotYetSequence(game) {
        // First "Not Yet" - show light static effect
        this.notYetClicked = true;
        
        // Create static overlay
        this.showStaticEffect(0.2);
        
        // Show the "Are you sure?" dialogue in red after a moment
        setTimeout(() => {
            game.dialogueSystem.showDialogue({
                speaker: '???',
                speakerColor: '#ff3333',
                text: "Are you sure?",
                choices: [
                    {
                        text: "No...",
                        action: () => {
                            // Force jump
                            this.hideStaticEffect();
                            game.dialogueSystem.showDialogue({
                                speaker: 'ADRIAN',
                                text: "I... I have to. There's no other way.",
                                onComplete: () => {
                                    this.jumpDecisionMade = true;
                                    this.triggerJumpSequence(game);
                                }
                            });
                        }
                    },
                    {
                        text: "Yes.",
                        action: () => {
                            // Trigger Fallen Dream route
                            this.triggerFallenDreamSequence(game);
                        }
                    }
                ]
            });
        }, 500);
    }
    
    triggerFallenDreamSequence(game) {
        this.fallenDreamTriggered = true;
        
        // Intensify static and add blur
        this.showStaticEffect(0.5);
        this.showBlurEffect();
        
        // Play Untitled (Remastered) - falling music
        if (game.audioManager) {
            game.audioManager.playCustomMusic('untitled-remastered.mp3', { loop: true, volume: 0.7 });
        }
        
        // After 5 seconds, show the final dialogue
        setTimeout(() => {
            // Intensify effects even more
            this.showStaticEffect(0.7);
            
            game.dialogueSystem.showDialogue({
                speaker: '???',
                speakerColor: '#ff0000',
                text: "Why do you resist?",
                choices: [
                    {
                        text: "...",
                        action: () => {
                            // Close dialogue first
                            game.dialogueSystem.endDialogue();
                            
                            // Small delay to ensure dialogue is closed
                            setTimeout(() => {
                                // Trigger the kneeling cutscene
                                this.triggerKneelingCutscene(game);
                            }, 100);
                        }
                    }
                ]
            });
        }, 5000);
    }
    
    triggerKneelingCutscene(game) {
        console.log('Starting kneeling cutscene...');
        
        // Get reference to the camera (it's in sceneManager, not game directly)
        const camera = game.sceneManager ? game.sceneManager.camera : null;
        
        if (!camera) {
            console.error('No camera found for cutscene!');
            return;
        }
        
        console.log('Camera found:', camera);
        
        // FULLY disable player controls during cutscene
        this.cutsceneActive = true;
        
        try {
            if (game.playerController) {
                game.playerController.enabled = false;
                console.log('Player controller disabled');
            }
            
            // Disable pointer lock controls if they exist
            if (game.controls && typeof game.controls.unlock === 'function') {
                game.controls.unlock();
            }
            if (game.controls) {
                game.controls.enabled = false;
            }
            
            // Also try to exit pointer lock
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        } catch (e) {
            console.log('Error disabling controls:', e);
        }
        
        // Store original camera position
        this.originalCameraPos = camera.position.clone();
        this.originalCameraRot = camera.rotation.clone();
        console.log('Camera position stored');
        
        // Hide static effect temporarily for clearer 3D view
        this.hideStaticEffect();
        this.hideBlurEffect();
        
        // Reset subtitle flags
        this.shownSubtitle1 = false;
        this.shownSubtitle2 = false;
        this.shownSubtitle3 = false;
        this.shownSubtitle4 = false;
        this.shownSubtitle5 = false;
        this.shownSubtitle6 = false;
        this.shownSubtitle7 = false;
        this.cutsceneStaticShown = false;
        
        // Create Adrian's 3D model for the cutscene
        const adrianGroup = new THREE.Group();
        
        // Body (torso)
        const torsoGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.3);
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
        const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.7 });
        
        const torso = new THREE.Mesh(torsoGeometry, clothMaterial);
        torso.position.y = 1.2;
        adrianGroup.add(torso);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.7;
        head.scale.y = 1.1;
        adrianGroup.add(head);
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.16, 16, 16);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.75;
        hair.scale.set(1, 0.8, 1);
        adrianGroup.add(hair);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.12);
        const leftArm = new THREE.Mesh(armGeometry, clothMaterial);
        leftArm.position.set(-0.35, 1.1, 0);
        adrianGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, clothMaterial);
        rightArm.position.set(0.35, 1.1, 0);
        adrianGroup.add(rightArm);
        
        // Hands
        const handGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
        leftHand.position.set(-0.35, 0.8, 0);
        adrianGroup.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
        rightHand.position.set(0.35, 0.8, 0);
        adrianGroup.add(rightHand);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
        const leftLeg = new THREE.Mesh(legGeometry, clothMaterial);
        leftLeg.position.set(-0.15, 0.5, 0);
        adrianGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, clothMaterial);
        rightLeg.position.set(0.15, 0.5, 0);
        adrianGroup.add(rightLeg);
        
        // Position Adrian near the edge
        adrianGroup.position.set(0, 0, -7);
        adrianGroup.rotation.y = Math.PI; // Face away from edge initially
        this.scene.add(adrianGroup);
        
        console.log('Adrian model added to scene');
        
        // Store animation data
        const animData = { adrianGroup, head, leftArm, rightArm, leftHand, rightHand, torso, leftLeg, rightLeg };
        
        // Text overlay for subtitles
        const subtitleOverlay = document.createElement('div');
        subtitleOverlay.id = 'cutscene-subtitles';
        subtitleOverlay.style.cssText = `
            position: fixed;
            bottom: 15%;
            left: 50%;
            transform: translateX(-50%);
            color: #ff6666;
            font-family: 'Crimson Text', Georgia, serif;
            font-size: 1.5rem;
            text-align: center;
            max-width: 70%;
            opacity: 0;
            transition: opacity 0.5s ease;
            text-shadow: 0 0 20px rgba(255, 50, 50, 0.8), 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(subtitleOverlay);
        
        // Vignette overlay
        const vignetteOverlay = document.createElement('div');
        vignetteOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);
            pointer-events: none;
            z-index: 9998;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        document.body.appendChild(vignetteOverlay);
        setTimeout(() => vignetteOverlay.style.opacity = '1', 100);
        
        const showSubtitle = (text, duration = 2500) => {
            subtitleOverlay.textContent = text;
            subtitleOverlay.style.opacity = '1';
            setTimeout(() => {
                subtitleOverlay.style.opacity = '0';
            }, duration);
        };
        
        // Animation using timeline with setTimeout
        const startTime = Date.now();
        let animationInterval;
        
        const runAnimation = () => {
            const elapsed = Date.now() - startTime;
            
            // RENDER the scene each frame
            if (game.renderer && camera && this.scene) {
                game.renderer.render(this.scene, camera);
            }
            
            // Phase 1: Camera setup (0-2s)
            if (elapsed < 2000) {
                const progress = elapsed / 2000;
                const targetPos = new THREE.Vector3(3, 1.5, -5);
                camera.position.lerp(targetPos, 0.02);
                camera.lookAt(0, 1.2, -7);
                
                if (progress > 0.3 && !this.shownSubtitle1) {
                    this.shownSubtitle1 = true;
                    showSubtitle("You cannot run from yourself, Adrian.", 3000);
                }
            }
            // Phase 2: Stumble (2-4.5s)
            else if (elapsed < 4500) {
                const progress = (elapsed - 2000) / 2500;
                adrianGroup.rotation.z = Math.sin(elapsed * 0.01) * 0.1;
                adrianGroup.position.y = Math.sin(elapsed * 0.015) * 0.05;
                leftArm.rotation.x = -progress * 0.5;
                rightArm.rotation.x = -progress * 0.5;
                
                // Keep camera focused on Adrian
                camera.lookAt(0, 1.2, -7);
            }
            // Phase 3: Knees buckle (4.5-6.5s)
            else if (elapsed < 6500) {
                const progress = (elapsed - 4500) / 2000;
                adrianGroup.position.y = -progress * 0.3;
                leftLeg.rotation.z = progress * 0.2;
                rightLeg.rotation.z = -progress * 0.2;
                
                // Keep camera focused on Adrian
                camera.lookAt(0, 1.0, -7);
                
                if (progress > 0.5 && !this.shownSubtitle2) {
                    this.shownSubtitle2 = true;
                    showSubtitle("There it is. The weakness you tried to hide.", 2500);
                }
            }
            // Phase 4: Fall to knees (6.5-9s)
            else if (elapsed < 9000) {
                const progress = (elapsed - 6500) / 2500;
                adrianGroup.position.y = -0.3 - progress * 0.5;
                torso.rotation.x = progress * 0.3;
                head.rotation.x = progress * 0.2;
                
                const camTarget = new THREE.Vector3(2, 1.2, -6);
                camera.position.lerp(camTarget, 0.02);
                camera.lookAt(0, 0.8, -7);
            }
            // Phase 5: Grip head (9-12s)
            else if (elapsed < 12000) {
                const progress = (elapsed - 9000) / 3000;
                const handProgress = Math.min(progress * 1.5, 1);
                
                leftArm.rotation.x = -1.2 * handProgress;
                leftArm.rotation.z = 0.5 * handProgress;
                leftHand.position.set(-0.35 + handProgress * 0.2, 0.8 + handProgress * 0.6, handProgress * 0.1);
                
                rightArm.rotation.x = -1.2 * handProgress;
                rightArm.rotation.z = -0.5 * handProgress;
                rightHand.position.set(0.35 - handProgress * 0.2, 0.8 + handProgress * 0.6, handProgress * 0.1);
                
                head.rotation.z = Math.sin(elapsed * 0.02) * 0.1;
                
                // Keep camera focused on Adrian
                camera.lookAt(0, 0.8, -7);
                
                if (progress > 0.3 && !this.shownSubtitle3) {
                    this.shownSubtitle3 = true;
                    showSubtitle("You thought you could silence me?", 3000);
                }
            }
            // Phase 6: Static intensify (12-15s)
            else if (elapsed < 15000) {
                const progress = (elapsed - 12000) / 3000;
                
                if (!this.cutsceneStaticShown) {
                    this.cutsceneStaticShown = true;
                    this.showStaticEffect(0.4);
                }
                
                adrianGroup.position.x = Math.sin(elapsed * 0.05) * 0.02;
                head.rotation.z = Math.sin(elapsed * 0.03) * 0.15;
                
                // Keep camera focused on Adrian
                camera.lookAt(0, 0.8, -7);
                
                if (progress > 0.4 && !this.shownSubtitle4) {
                    this.shownSubtitle4 = true;
                    showSubtitle("I am everything you buried. Everything you denied.", 3000);
                }
            }
            // Phase 7: Scream (15-18s)
            else if (elapsed < 18000) {
                const progress = (elapsed - 15000) / 3000;
                
                head.rotation.x = -0.3 - progress * 0.4;
                adrianGroup.position.x = Math.sin(elapsed * 0.08) * 0.03;
                adrianGroup.rotation.z = Math.sin(elapsed * 0.06) * 0.05;
                
                // Keep camera focused on Adrian
                camera.lookAt(0, 0.8, -7);
                
                if (progress > 0.3) {
                    this.showStaticEffect(0.5 + progress * 0.3);
                }
                
                if (progress > 0.3 && !this.shownSubtitle5) {
                    this.shownSubtitle5 = true;
                    showSubtitle("Scream all you want. No one is coming to save you.", 3000);
                }
            }
            // Phase 8: Collapse (18-21s)
            else if (elapsed < 21000) {
                const progress = (elapsed - 18000) / 3000;
                
                torso.rotation.x = 0.3 + progress * 0.6;
                head.rotation.x = progress * 0.5;
                leftArm.rotation.x = -1.2 + progress * 0.8;
                rightArm.rotation.x = -1.2 + progress * 0.8;
                
                // Keep camera focused on Adrian
                camera.lookAt(0, 0.6, -7);
                
                if (progress > 0.4 && !this.shownSubtitle6) {
                    this.shownSubtitle6 = true;
                    showSubtitle("You never left this place, Adrian. You never will.", 4000);
                }
            }
            // Phase 9: Fade out (21-23s)
            else if (elapsed < 23000) {
                const progress = (elapsed - 21000) / 2000;
                vignetteOverlay.style.background = `radial-gradient(ellipse at center, rgba(0,0,0,${progress}) 0%, rgba(0,0,0,1) 100%)`;
                
                // Keep camera focused
                camera.lookAt(0, 0.6, -7);
                
                if (progress > 0.5 && !this.shownSubtitle7) {
                    this.shownSubtitle7 = true;
                    showSubtitle("Welcome to this hellhole, Adrian.", 3000);
                }
            }
            // Animation complete
            else {
                clearInterval(animationInterval);
                
                // Cleanup
                this.scene.remove(adrianGroup);
                subtitleOverlay.remove();
                
                console.log('Cutscene complete, showing unlock screen');
                
                // Show route unlock screen
                this.showRouteUnlockScreen(game, vignetteOverlay);
            }
        };
        
        // Run animation at 60fps
        animationInterval = setInterval(runAnimation, 16);
        console.log('Animation interval started');
    }
    
    showRouteUnlockScreen(game, vignetteOverlay) {
        console.log('showRouteUnlockScreen called');
        
        // Create unlock screen overlay
        const unlockOverlay = document.createElement('div');
        unlockOverlay.id = 'route-unlock-screen';
        unlockOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 1);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        document.body.appendChild(unlockOverlay);
        
        setTimeout(() => unlockOverlay.style.opacity = '1', 100);
        
        // Route unlock text
        const unlockText = document.createElement('div');
        unlockText.style.cssText = `
            color: #cc0000;
            font-family: 'Crimson Text', Georgia, serif;
            font-size: 2.5rem;
            text-align: center;
            opacity: 0;
            transition: opacity 1s ease;
            text-shadow: 0 0 50px rgba(200, 0, 0, 1);
            margin-bottom: 40px;
        `;
        unlockText.textContent = '"FALLEN DREAM" ROUTE UNLOCKED';
        unlockOverlay.appendChild(unlockText);
        
        setTimeout(() => unlockText.style.opacity = '1', 500);
        
        // Create credits container
        const creditsContainer = document.createElement('div');
        creditsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 25px;
        `;
        unlockOverlay.appendChild(creditsContainer);
        console.log('Credits container created');
        
        // Credits data
        const credits = [
            { actor: 'Isaac', role: 'Luis' },
            { actor: 'Jacob', role: 'Tanner' },
            { actor: 'Gaven', role: 'The Narrator' }
        ];
        
        // Create credit elements (hidden initially)
        credits.forEach((credit, index) => {
            const creditDiv = document.createElement('div');
            creditDiv.style.cssText = `
                color: #888888;
                font-family: 'Crimson Text', Georgia, serif;
                font-size: 1.5rem;
                text-align: center;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 1s ease, transform 1s ease;
            `;
            creditDiv.innerHTML = `<span style="color: #ffffff; font-weight: bold;">${credit.actor}</span> <span style="color: #555555;">—</span> <span style="color: #cc6666; font-style: italic;">${credit.role}</span>`;
            creditsContainer.appendChild(creditDiv);
            
            // Animate each credit appearing
            setTimeout(() => {
                console.log('Showing credit:', credit.actor);
                creditDiv.style.opacity = '1';
                creditDiv.style.transform = 'translateY(0)';
            }, 2500 + (index * 2000)); // Start at 2.5s, each 2s apart
        });
        
        // Set game state for Fallen Dream route
        if (game.storyState) {
            game.storyState.fallenDreamRoute = true;
            game.storyState.isADream = true;
        }
        
        // Transition to convoy shelter (extended time for credits)
        // Credits timing: 2.5s + (2 * 2s) = 6.5s for last credit, plus 4s to read = 10.5s
        setTimeout(() => {
            console.log('Starting transition to convoy shelter');
            this.hideStaticEffect();
            
            // Stop the music
            if (game.audioManager) {
                game.audioManager.stopCustomMusic(1.5);
            }
            
            // Fade out
            unlockOverlay.style.opacity = '0';
            if (vignetteOverlay) vignetteOverlay.style.opacity = '0';
            
            setTimeout(() => {
                unlockOverlay.remove();
                if (vignetteOverlay) vignetteOverlay.remove();
                
                // Re-enable player controls
                if (game.playerController) {
                    game.playerController.enabled = true;
                }
                
                // Load convoy shelter
                game.sceneManager.loadScene('convoy_shelter');
            }, 1500);
        }, 12000); // Extended to 12 seconds for credits to show
    }
    
    showStaticEffect(intensity = 0.3) {
        // Remove existing static if present
        if (this.staticOverlay) {
            this.staticOverlay.remove();
            this.staticAnimationId = null;
        }
        
        this.staticOverlay = document.createElement('div');
        this.staticOverlay.id = 'static-overlay';
        this.staticOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            opacity: ${intensity};
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.05) 2px,
                rgba(255, 255, 255, 0.05) 4px
            );
            animation: staticNoise 0.15s steps(4) infinite;
        `;
        
        // Add keyframe animation if not exists
        if (!document.getElementById('static-keyframes')) {
            const style = document.createElement('style');
            style.id = 'static-keyframes';
            style.textContent = `
                @keyframes staticNoise {
                    0% { background-position: 0 0; filter: contrast(1); }
                    25% { background-position: 5px 5px; filter: contrast(1.1); }
                    50% { background-position: -5px 10px; filter: contrast(0.9); }
                    75% { background-position: 10px -5px; filter: contrast(1.05); }
                    100% { background-position: 0 0; filter: contrast(1); }
                }
                @keyframes staticFlicker {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Use CSS-based noise overlay instead of canvas for performance
        const noiseLayer = document.createElement('div');
        noiseLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: ${intensity * 0.4};
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)"/></svg>');
            background-size: 200px 200px;
            animation: staticFlicker 0.1s steps(2) infinite;
            mix-blend-mode: overlay;
        `;
        this.staticOverlay.appendChild(noiseLayer);
        
        document.body.appendChild(this.staticOverlay);
    }
    
    hideStaticEffect() {
        if (this.staticOverlay) {
            this.staticOverlay.style.transition = 'opacity 1s ease';
            this.staticOverlay.style.opacity = '0';
            setTimeout(() => {
                if (this.staticOverlay) {
                    this.staticOverlay.remove();
                    this.staticOverlay = null;
                }
            }, 1000);
        }
    }
    
    showBlurEffect() {
        // Apply blur to the game canvas
        const gameCanvas = document.querySelector('canvas');
        if (gameCanvas) {
            gameCanvas.style.transition = 'filter 2s ease';
            gameCanvas.style.filter = 'blur(3px)';
        }
    }
    
    hideBlurEffect() {
        const gameCanvas = document.querySelector('canvas');
        if (gameCanvas) {
            gameCanvas.style.transition = 'filter 1s ease';
            gameCanvas.style.filter = 'none';
        }
    }
    
    handleLuisDialogue(game) {
        const dialogue = this.luis.dialogueTree;
        if (dialogue && dialogue.greeting) {
            game.dialogueSystem.showDialogue({
                speaker: 'LUIS',
                text: dialogue.greeting.text,
                choices: dialogue.greeting.responses?.map(r => ({
                    text: r.text,
                    action: () => this.continueLuisDialogue(game, r.next)
                }))
            });
        }
    }
    
    continueLuisDialogue(game, nextKey) {
        if (!nextKey) {
            game.dialogueSystem.endDialogue();
            return;
        }
        
        const dialogue = this.luis.dialogueTree[nextKey];
        if (!dialogue) {
            game.dialogueSystem.endDialogue();
            return;
        }
        
        // Build the dialogue options
        const dialogueOptions = {
            speaker: 'LUIS',
            text: dialogue.text
        };
        
        // If there are responses, add them as choices
        if (dialogue.responses && dialogue.responses.length > 0) {
            dialogueOptions.choices = dialogue.responses.map(r => ({
                text: r.text,
                action: () => this.continueLuisDialogue(game, r.next)
            }));
        } else if (dialogue.effect) {
            // No more responses - this is the end of a dialogue branch
            // Show the text, then provide a continue button that triggers the effect and closes
            dialogueOptions.choices = [{
                text: "[Continue]",
                action: () => {
                    game.dialogueSystem.endDialogue();
                    // Run the effect after closing dialogue
                    setTimeout(() => {
                        dialogue.effect(game);
                    }, 100);
                }
            }];
        } else {
            // No responses and no effect - just show continue to close
            dialogueOptions.choices = [{
                text: "[Continue]",
                action: () => {
                    game.dialogueSystem.endDialogue();
                }
            }];
        }
        
        // Show the dialogue
        game.dialogueSystem.showDialogue(dialogueOptions);
    }
    
    triggerJumpSequence(game) {
        // Show emotional text sequence before the fall
        this.showJumpingTextSequence(game, () => {
            // After text sequence, play Prologue3Animation (The Fall)
            import('../ui/Prologue3Animation.js').then(module => {
                const Prologue3Animation = module.Prologue3Animation;
                const fallAnimation = new Prologue3Animation(game.audioManager, () => {
                    // After the fall, play wake-up animation
                    this.triggerWakeUpSequence(game);
                });
                fallAnimation.start();
            });
        });
    }
    
    showJumpingTextSequence(game, onComplete) {
        // Emotional/philosophical text that appears before jumping
        const jumpingTexts = [
            "Your life doesn't matter anymore.",
            "The light has taken all that was yours.",
            "It took away your family.",
            "Your friends.",
            "Your memories.",
            "Your purpose.",
            "And now, it waits for you below.",
            "Embrace it."
        ];
        
        // Create container for jumping text
        const textContainer = document.createElement('div');
        textContainer.id = 'jumping-text-container';
        textContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(textContainer);
        
        const textDisplay = document.createElement('div');
        textDisplay.style.cssText = `
            color: #ffffff;
            font-family: 'Crimson Text', Georgia, serif;
            font-size: 2.5rem;
            text-align: center;
            max-width: 80%;
            line-height: 1.6;
            opacity: 0;
            transition: opacity 0.8s ease-in-out;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        `;
        textContainer.appendChild(textDisplay);
        
        let currentIndex = 0;
        
        const showNextText = () => {
            if (currentIndex >= jumpingTexts.length) {
                // Fade out container
                textContainer.style.transition = 'opacity 1s ease-out';
                textContainer.style.opacity = '0';
                setTimeout(() => {
                    textContainer.remove();
                    onComplete();
                }, 1000);
                return;
            }
            
            // Fade out current
            textDisplay.style.opacity = '0';
            
            setTimeout(() => {
                textDisplay.textContent = jumpingTexts[currentIndex];
                textDisplay.style.opacity = '1';
                
                // Add subtle red tint for later messages
                if (currentIndex >= 4) {
                    textDisplay.style.color = '#ffdddd';
                    textDisplay.style.textShadow = '0 0 30px rgba(255, 100, 100, 0.7)';
                }
                
                currentIndex++;
                
                // Wait then show next
                setTimeout(showNextText, 2500);
            }, 800);
        };
        
        // Start sequence
        setTimeout(showNextText, 500);
    }
    
    triggerWakeUpSequence(game) {
        // First, play the falling animation (Prologue 3)
        import('../ui/Prologue3Animation.js').then(module => {
            const Prologue3Animation = module.Prologue3Animation;
            const fallAnimation = new Prologue3Animation(game.audioManager, () => {
                // After falling, play TannerWakeUpAnimation (wake up in Tanner's house)
                import('../ui/TannerWakeUpAnimation.js').then(wakeModule => {
                    const TannerWakeUpAnimation = wakeModule.TannerWakeUpAnimation;
                    const wakeUp = new TannerWakeUpAnimation(game.audioManager, () => {
                        // After waking up, load Tanner's house scene
                        game.sceneManager.loadScene('tanner_house');
                        
                        // Set game state
                        if (game.storyState) {
                            game.storyState.justWokeUpAtTanners = true;
                            game.storyState.hasHeadache = true;
                        }
                        
                        // Show headache reminder after a moment
                        setTimeout(() => {
                            if (game.dialogueSystem) {
                                game.dialogueSystem.showDialogue({
                                    speaker: 'Adrian',
                                    speakerColor: '#aaccff',
                                    text: "I should probably find Tanner... and maybe get some coffee for this headache.",
                                    choices: []
                                });
                            }
                        }, 2000);
                    });
                    wakeUp.start();
                });
            });
            fallAnimation.start();
        });
    }
    
    enableJumpMechanic() {
        this.jumpAvailable = true;
        // Show notification to guide player
        if (this.game.uiManager) {
            setTimeout(() => {
                this.game.uiManager.showNotification('Approach any edge of the roof...', 3000);
            }, 2000);
        }
    }
    
    triggerLightEvent(game) {
        if (this.lightEventTriggered) return;
        this.lightEventTriggered = true;
        this.lightDescendTimer = 0;
        
        // Start The Hum audio
        if (game.audioManager) {
            game.audioManager.startTheHum();
        }
        
        // Play loud static burst sound
        this.playLightEventStatic();
        
        // Create vivid light event effects
        this.createVividLightEffects();
        
        // Start glitching the UI bars
        this.startUIGlitch(game);
        
        // Make Luis static/glitchy
        this.makeLuisStatic();
        
        // Show the creepy prompt after a delay
        setTimeout(() => {
            this.showJumpPrompt();
        }, 3000);
    }
    
    createVividLightEffects() {
        // Create multiple overlay layers for vivid effect
        
        // 0. BRIGHT WHITE FLASH - Initial impact
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.id = 'flash-overlay';
        this.flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0);
            pointer-events: none;
            z-index: 510;
            transition: background 0.1s ease;
        `;
        document.body.appendChild(this.flashOverlay);
        
        // 1. Red tint overlay
        this.redOverlay = document.createElement('div');
        this.redOverlay.id = 'red-overlay';
        this.redOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(180, 30, 30, 0);
            pointer-events: none;
            z-index: 500;
            transition: background 3s ease;
            mix-blend-mode: multiply;
        `;
        document.body.appendChild(this.redOverlay);
        
        // 2. Haze/blur overlay
        this.hazeOverlay = document.createElement('div');
        this.hazeOverlay.id = 'haze-overlay';
        this.hazeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, transparent 0%, rgba(255,255,200,0.4) 100%);
            pointer-events: none;
            z-index: 501;
            opacity: 0;
            transition: opacity 2s ease;
            backdrop-filter: blur(0px);
        `;
        document.body.appendChild(this.hazeOverlay);
        
        // 3. Motion blur effect overlay
        this.motionBlurOverlay = document.createElement('div');
        this.motionBlurOverlay.id = 'motion-blur-overlay';
        this.motionBlurOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 502;
            opacity: 0;
            background: linear-gradient(90deg, 
                rgba(255,255,255,0.1) 0%, 
                transparent 20%, 
                transparent 80%, 
                rgba(255,255,255,0.1) 100%);
            animation: motionBlurPulse 0.1s infinite;
        `;
        document.body.appendChild(this.motionBlurOverlay);
        
        // 4. Vignette effect
        this.vignetteOverlay = document.createElement('div');
        this.vignetteOverlay.id = 'vignette-overlay';
        this.vignetteOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 499;
            opacity: 0;
            background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%);
            transition: opacity 2s ease;
        `;
        document.body.appendChild(this.vignetteOverlay);
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.id = 'light-event-styles';
        style.textContent = `
            @keyframes motionBlurPulse {
                0% { transform: translateX(-2px); opacity: 0.3; }
                50% { transform: translateX(2px); opacity: 0.5; }
                100% { transform: translateX(-2px); opacity: 0.3; }
            }
            @keyframes screenShake {
                0% { transform: translate(0, 0); }
                25% { transform: translate(-5px, 4px); }
                50% { transform: translate(5px, -4px); }
                75% { transform: translate(-4px, -5px); }
                100% { transform: translate(0, 0); }
            }
            @keyframes intenseShake {
                0% { transform: translate(0, 0) rotate(0deg); }
                10% { transform: translate(-8px, 6px) rotate(-0.5deg); }
                20% { transform: translate(8px, -6px) rotate(0.5deg); }
                30% { transform: translate(-6px, -8px) rotate(-0.3deg); }
                40% { transform: translate(6px, 8px) rotate(0.3deg); }
                50% { transform: translate(-8px, 4px) rotate(-0.5deg); }
                60% { transform: translate(8px, -4px) rotate(0.5deg); }
                70% { transform: translate(-4px, -6px) rotate(-0.3deg); }
                80% { transform: translate(4px, 6px) rotate(0.3deg); }
                90% { transform: translate(-6px, 2px) rotate(-0.2deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
            @keyframes flashPulse {
                0% { background: rgba(255, 255, 255, 0.9); }
                100% { background: rgba(255, 255, 255, 0); }
            }
        `;
        document.head.appendChild(style);
        
        // Get game container for shake
        const gameContainer = document.getElementById('game-container') || document.body;
        
        // IMMEDIATE BRIGHT FLASH when light hits
        this.flashOverlay.style.background = 'rgba(255, 255, 255, 1)';
        gameContainer.style.animation = 'intenseShake 0.15s ease-in-out';
        
        // Flash fades quickly
        setTimeout(() => {
            this.flashOverlay.style.transition = 'background 0.5s ease';
            this.flashOverlay.style.background = 'rgba(255, 255, 255, 0.7)';
        }, 100);
        
        setTimeout(() => {
            this.flashOverlay.style.background = 'rgba(255, 255, 255, 0.3)';
        }, 300);
        
        setTimeout(() => {
            this.flashOverlay.style.transition = 'background 1s ease';
            this.flashOverlay.style.background = 'rgba(255, 255, 255, 0)';
            this.hazeOverlay.style.opacity = '1';
            this.hazeOverlay.style.backdropFilter = 'blur(3px)';
        }, 600);
        
        setTimeout(() => {
            this.redOverlay.style.background = 'rgba(180, 30, 30, 0.2)';
            this.vignetteOverlay.style.opacity = '1';
            // Start continuous shake
            gameContainer.style.animation = 'screenShake 0.08s infinite';
        }, 1000);
        
        setTimeout(() => {
            this.motionBlurOverlay.style.opacity = '1';
        }, 1500);
        
        // Intensify over time
        setTimeout(() => {
            this.redOverlay.style.background = 'rgba(180, 30, 30, 0.35)';
            this.hazeOverlay.style.backdropFilter = 'blur(5px)';
            // Make shake more intense
            gameContainer.style.animation = 'intenseShake 0.12s infinite';
        }, 3000);
    }
    
    startUIGlitch(game) {
        // Glitch the UI bars by rapidly changing their values and adding visual noise
        this.glitchInterval = setInterval(() => {
            if (game.uiManager) {
                // Get the HUD elements and glitch them
                const hud = document.getElementById('player-hud');
                if (hud) {
                    // Random transform jitter
                    const jitterX = (Math.random() - 0.5) * 10;
                    const jitterY = (Math.random() - 0.5) * 5;
                    hud.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
                    
                    // Random color shifts
                    hud.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${0.5 + Math.random()})`;
                }
                
                // Glitch the bars themselves
                const bars = document.querySelectorAll('.status-bar-fill');
                bars.forEach(bar => {
                    bar.style.width = `${Math.random() * 100}%`;
                    bar.style.backgroundColor = Math.random() > 0.5 ? '#ff0000' : bar.dataset.originalColor || '#00ff00';
                });
            }
        }, 100);
        
        // Stop glitching after 10 seconds
        setTimeout(() => {
            if (this.glitchInterval) {
                clearInterval(this.glitchInterval);
                // Reset UI
                const hud = document.getElementById('player-hud');
                if (hud) {
                    hud.style.transform = '';
                    hud.style.filter = '';
                }
            }
        }, 10000);
    }
    
    makeLuisStatic() {
        // Make Luis's model glitch/static
        if (this.luisBody) {
            this.luisStaticInterval = setInterval(() => {
                // Random position jitter
                this.luisBody.position.x = 3 + (Math.random() - 0.5) * 0.3;
                this.luisBody.position.z = -2 + (Math.random() - 0.5) * 0.3;
                
                // Random scale distortion
                this.luisBody.scale.y = 1 + (Math.random() - 0.5) * 0.2;
                
                // Flicker visibility
                this.luisBody.visible = Math.random() > 0.1;
                
                // Change material colors randomly
                this.luisBody.children.forEach(child => {
                    if (child.material) {
                        child.material.emissive = new THREE.Color(
                            Math.random() * 0.5,
                            Math.random() * 0.5,
                            Math.random() * 0.5
                        );
                    }
                });
            }, 50);
        }
    }
    
    showJumpPrompt() {
        // Create the creepy "Go ahead. Jump." prompt
        this.jumpPrompt = document.createElement('div');
        this.jumpPrompt.id = 'jump-prompt';
        this.jumpPrompt.innerHTML = 'Go ahead. Jump.';
        this.jumpPrompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff0000;
            font-family: 'Courier New', monospace;
            font-size: 3em;
            font-weight: bold;
            text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000, 2px 2px 0 #000;
            z-index: 600;
            opacity: 0;
            transition: opacity 1s ease;
            letter-spacing: 5px;
            animation: jumpPromptGlitch 0.1s infinite;
        `;
        
        // Add glitch animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes jumpPromptGlitch {
                0% { transform: translate(-50%, -50%) skew(0deg); }
                20% { transform: translate(-52%, -50%) skew(2deg); }
                40% { transform: translate(-48%, -51%) skew(-1deg); }
                60% { transform: translate(-51%, -49%) skew(1deg); }
                80% { transform: translate(-49%, -50%) skew(-2deg); }
                100% { transform: translate(-50%, -50%) skew(0deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.jumpPrompt);
        
        // Fade in
        setTimeout(() => {
            this.jumpPrompt.style.opacity = '1';
        }, 100);
        
        // Pulse effect
        setInterval(() => {
            if (this.jumpPrompt) {
                this.jumpPrompt.style.opacity = 0.7 + Math.random() * 0.3;
            }
        }, 200);
    }
    
    update(deltaTime) {
        // Pulse the central glow
        if (this.centralGlow) {
            const basePulse = Math.sin(Date.now() * 0.003) * 0.3 + 1;
            
            // During light event, make it MUCH brighter
            if (this.lightEventTriggered) {
                const intensity = 2 + this.lightDescendTimer * 3; // Gets brighter over time
                this.centralGlow.scale.setScalar(basePulse * (1 + this.lightDescendTimer * 0.5));
                this.centralGlow.material.opacity = Math.min(1, 0.8 + this.lightDescendTimer * 0.1);
                this.outerGlowLight.intensity = intensity + Math.sin(Date.now() * 0.01) * 2;
                
                // Make the whole scene brighter/hazier
                if (this.lightDescendTimer < 3) {
                    const fogDensity = 0.015 + this.lightDescendTimer * 0.01;
                    this.scene.fog = new THREE.FogExp2(0x4a4830, fogDensity);
                }
            } else {
                this.centralGlow.scale.setScalar(basePulse);
                this.outerGlowLight.intensity = 2 + Math.sin(Date.now() * 0.002) * 0.5;
            }
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
            } else if (this.lightDescendTimer >= 4 && !this.dialogueShown) {
                // Transition - only show once
                this.dialogueShown = true;
                this.lightEventTriggered = false; // Prevent repeat
                
                // Play narrator voiceline with 250% volume and echo effect
                this.playNarratorVoiceline();
                
                // Show narrator text, then guide player to the edge
                this.game.dialogueSystem.showDialogue({
                    speaker: 'NARRATOR',
                    text: "The Light hit Luis, and in that moment, everything changed. What followed was chaos—the world fracturing, society crumbling, and Luis... Luis became something new.",
                    onComplete: () => {
                        // After narrator finishes, prompt player to approach edge
                        setTimeout(() => {
                            this.game.dialogueSystem.showDialogue({
                                speaker: 'ADRIAN',
                                text: "Luis... No... This can't be happening. I need to... I need to...",
                                onComplete: () => {
                                    // Enable jump mechanic and guide player
                                    this.enableJumpMechanic();
                                }
                            });
                        }, 1000);
                    }
                });
            }
        }
        
        // Subtle star twinkle
        if (this.stars) {
            this.stars.rotation.y += deltaTime * 0.001;
        }
        
        // Update NPCs
        this.npcs.forEach(npc => npc.update(deltaTime));
    }
    
    playNarratorVoiceline() {
        // Play voiceline with trimmed ending (remove last 300ms to cut mouse click)
        const audio = new Audio('/voicelines/narrator-light-hit-luis.mp3');
        audio.volume = 1.0;
        
        // When metadata loads, set up the trim
        audio.addEventListener('loadedmetadata', () => {
            const trimmedDuration = Math.max(0, audio.duration - 0.3); // Trim 300ms from end
            
            // Stop audio 300ms before the end
            const checkTime = () => {
                if (audio.currentTime >= trimmedDuration) {
                    audio.pause();
                    audio.currentTime = 0;
                } else if (!audio.paused) {
                    requestAnimationFrame(checkTime);
                }
            };
            
            audio.play().then(() => {
                console.log(`Narrator voiceline playing (trimmed from ${audio.duration.toFixed(2)}s to ${trimmedDuration.toFixed(2)}s)`);
                requestAnimationFrame(checkTime);
            }).catch(error => {
                console.error('Error playing narrator voiceline:', error);
            });
        });
        
        // Start loading the audio
        audio.load();
    }
    
    playLightEventStatic() {
        // Create audio context for static burst
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create white noise for static
        const bufferSize = audioContext.sampleRate * 2; // 2 seconds of static
        const noiseBuffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = noiseBuffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1);
            }
        }
        
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        // Simple gain envelope
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        // Connect directly
        noiseSource.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play
        noiseSource.start(0);
        noiseSource.stop(audioContext.currentTime + 2);
        
        console.log('Light event static playing');
    }
}
