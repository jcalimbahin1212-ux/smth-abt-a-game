/**
 * PROJECT DEATHBED - Street Scene
 * The street outside the apartment building - after waking from the fall dream
 * Luis is here with his vest, and friends are nearby
 */

import * as THREE from 'three';
import { InteractableObject } from '../entities/InteractableObject.js';
import { NPCEntity } from '../entities/NPCEntity.js';

export class StreetScene {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        
        // Story state
        this.metLuis = false;
        this.talkedToMae = false;
        this.talkedToRhea = false;
        
        this.setupEnvironment();
        this.setupLighting();
        this.createStreetGeometry();
        this.createBuildings();
        this.createStreetFurniture();
        this.createNPCs();
        this.createInteractables();
        
        this.bounds = { minX: -15, maxX: 15, minZ: -20, maxZ: 10 };
    }
    
    setupEnvironment() {
        // Morning after the strange night - slightly overcast
        this.scene.fog = new THREE.FogExp2(0x8090a0, 0.015);
        this.scene.background = new THREE.Color(0x607080);
    }
    
    setupLighting() {
        // Soft morning ambient
        const ambientLight = new THREE.AmbientLight(0x8899aa, 0.6);
        this.scene.add(ambientLight);
        
        // Morning sun (slightly cloudy)
        const sunLight = new THREE.DirectionalLight(0xffeedd, 0.8);
        sunLight.position.set(10, 20, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Fill light from sky
        const hemiLight = new THREE.HemisphereLight(0x8899bb, 0x444455, 0.4);
        this.scene.add(hemiLight);
    }
    
    createStreetGeometry() {
        // Main street (asphalt)
        const streetGeometry = new THREE.PlaneGeometry(10, 50);
        const streetMaterial = new THREE.MeshStandardMaterial({
            color: 0x333338,
            roughness: 0.9,
            metalness: 0.0
        });
        const street = new THREE.Mesh(streetGeometry, streetMaterial);
        street.rotation.x = -Math.PI / 2;
        street.position.set(0, 0, -5);
        street.receiveShadow = true;
        this.scene.add(street);
        
        // Road markings
        for (let i = -20; i < 20; i += 4) {
            const marking = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 2),
                new THREE.MeshStandardMaterial({ color: 0xffffee })
            );
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(0, 0.01, i);
            this.scene.add(marking);
        }
        
        // Sidewalk (left side - apartment side)
        const sidewalkLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 50),
            new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.85 })
        );
        sidewalkLeft.rotation.x = -Math.PI / 2;
        sidewalkLeft.position.set(-7.5, 0.05, -5);
        sidewalkLeft.receiveShadow = true;
        this.scene.add(sidewalkLeft);
        
        // Sidewalk (right side)
        const sidewalkRight = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 50),
            new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.85 })
        );
        sidewalkRight.rotation.x = -Math.PI / 2;
        sidewalkRight.position.set(7.5, 0.05, -5);
        sidewalkRight.receiveShadow = true;
        this.scene.add(sidewalkRight);
        
        // Curbs
        const curbGeometry = new THREE.BoxGeometry(0.3, 0.15, 50);
        const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x666670 });
        
        const leftCurb = new THREE.Mesh(curbGeometry, curbMaterial);
        leftCurb.position.set(-5.15, 0.075, -5);
        this.scene.add(leftCurb);
        
        const rightCurb = new THREE.Mesh(curbGeometry, curbMaterial);
        rightCurb.position.set(5.15, 0.075, -5);
        this.scene.add(rightCurb);
    }
    
    createBuildings() {
        // === THE BROTHERS' APARTMENT BUILDING ===
        const apartmentBuilding = new THREE.Group();
        
        // Main building
        const mainBuilding = new THREE.Mesh(
            new THREE.BoxGeometry(8, 15, 10),
            new THREE.MeshStandardMaterial({ color: 0x6a6060, roughness: 0.8 })
        );
        mainBuilding.position.y = 7.5;
        mainBuilding.castShadow = true;
        apartmentBuilding.add(mainBuilding);
        
        // Windows
        for (let floor = 0; floor < 4; floor++) {
            for (let w = 0; w < 3; w++) {
                const windowMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.2, 1.5),
                    new THREE.MeshStandardMaterial({
                        color: 0x4477aa,
                        emissive: floor === 2 ? 0x223344 : 0x000000, // Their apartment glows
                        emissiveIntensity: 0.2,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                windowMesh.position.set(-2.5 + w * 2.5, 3 + floor * 3, 5.01);
                apartmentBuilding.add(windowMesh);
            }
        }
        
        // Entrance door
        const entranceDoor = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.5, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x4a3a2a })
        );
        entranceDoor.position.set(0, 1.25, 5.01);
        apartmentBuilding.add(entranceDoor);
        
        // Entrance awning
        const awning = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a })
        );
        awning.position.set(0, 2.8, 5.5);
        apartmentBuilding.add(awning);
        
        apartmentBuilding.position.set(-8, 0, 2);
        this.scene.add(apartmentBuilding);
        
        // === OTHER BUILDINGS ON THE STREET ===
        
        // Building across the street (café)
        const cafe = new THREE.Group();
        const cafeBuilding = new THREE.Mesh(
            new THREE.BoxGeometry(10, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x7a5a4a, roughness: 0.8 })
        );
        cafeBuilding.position.y = 4;
        cafeBuilding.castShadow = true;
        cafe.add(cafeBuilding);
        
        // Café sign
        const cafeSign = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.8, 0.1),
            new THREE.MeshStandardMaterial({ 
                color: 0x8a6a5a, 
                emissive: 0x442211,
                emissiveIntensity: 0.3
            })
        );
        cafeSign.position.set(0, 5.5, 4.01);
        cafe.add(cafeSign);
        
        // Large café windows
        const cafeWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 2.5),
            new THREE.MeshStandardMaterial({
                color: 0x446688,
                transparent: true,
                opacity: 0.6
            })
        );
        cafeWindow.position.set(0, 2.5, 4.01);
        cafe.add(cafeWindow);
        
        cafe.position.set(8, 0, 0);
        this.scene.add(cafe);
        
        // More buildings in the distance
        for (let i = 0; i < 6; i++) {
            const height = 10 + Math.random() * 20;
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(6 + Math.random() * 4, height, 8),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.1, 0.35 + Math.random() * 0.1),
                    roughness: 0.8
                })
            );
            building.position.set(
                (i % 2 === 0 ? -12 : 12) + (Math.random() - 0.5) * 3,
                height / 2,
                -15 - i * 8
            );
            building.castShadow = true;
            this.scene.add(building);
        }
    }
    
    createStreetFurniture() {
        // Street lamps
        for (let i = -15; i < 10; i += 10) {
            const lamp = this.createStreetLamp();
            lamp.position.set(-5.5, 0, i);
            this.scene.add(lamp);
            
            const lamp2 = this.createStreetLamp();
            lamp2.position.set(5.5, 0, i);
            this.scene.add(lamp2);
        }
        
        // Benches
        const bench1 = this.createBench();
        bench1.position.set(-6.5, 0, -2);
        this.scene.add(bench1);
        
        const bench2 = this.createBench();
        bench2.position.set(6.5, 0, -8);
        bench2.rotation.y = Math.PI;
        this.scene.add(bench2);
        
        // Trash cans
        const trashCan1 = this.createTrashCan();
        trashCan1.position.set(-5.5, 0, 3);
        this.scene.add(trashCan1);
        
        // Parked cars
        this.createParkedCar(new THREE.Vector3(-3, 0, -10), 0);
        this.createParkedCar(new THREE.Vector3(3, 0, -6), Math.PI);
        this.createParkedCar(new THREE.Vector3(-3, 0, 5), 0);
        
        // Trees
        for (let i = -2; i < 3; i++) {
            const tree = this.createTree();
            tree.position.set(-9.5, 0, -5 + i * 7);
            this.scene.add(tree);
        }
    }
    
    createStreetLamp() {
        const lamp = new THREE.Group();
        
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.08, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, metalness: 0.5 })
        );
        pole.position.y = 2;
        lamp.add(pole);
        
        const arm = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.05, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x3a3a40, metalness: 0.5 })
        );
        arm.position.set(0.35, 4, 0);
        lamp.add(arm);
        
        const light = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.2),
            new THREE.MeshStandardMaterial({ 
                color: 0xffffee,
                emissive: 0xffffaa,
                emissiveIntensity: 0.1 // Dim during day
            })
        );
        light.position.set(0.7, 3.9, 0);
        lamp.add(light);
        
        return lamp;
    }
    
    createBench() {
        const bench = new THREE.Group();
        
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.08, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.8 })
        );
        seat.position.y = 0.45;
        bench.add(seat);
        
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.5, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.8 })
        );
        back.position.set(0, 0.7, -0.18);
        back.rotation.x = 0.1;
        bench.add(back);
        
        // Legs
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a40 });
        const legGeom = new THREE.BoxGeometry(0.05, 0.45, 0.3);
        
        [[-0.6, 0], [0.6, 0]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeom, legMaterial);
            leg.position.set(x, 0.225, z);
            bench.add(leg);
        });
        
        return bench;
    }
    
    createTrashCan() {
        const can = new THREE.Group();
        
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.2, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.7 })
        );
        body.position.y = 0.4;
        can.add(body);
        
        return can;
    }
    
    createParkedCar(position, rotation) {
        const car = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.6, 4),
            new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.3, 0.4),
                roughness: 0.5,
                metalness: 0.3
            })
        );
        body.position.y = 0.5;
        car.add(body);
        
        // Roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.5, 2),
            new THREE.MeshStandardMaterial({ 
                color: body.material.color,
                roughness: 0.5,
                metalness: 0.3
            })
        );
        roof.position.set(0, 1, 0.3);
        car.add(roof);
        
        // Windows
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x335566,
            transparent: true,
            opacity: 0.7
        });
        
        const frontWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 0.4),
            windowMat
        );
        frontWindow.position.set(0, 0.95, 1.35);
        frontWindow.rotation.x = -0.3;
        car.add(frontWindow);
        
        // Wheels
        const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        
        [[-0.85, -1.2], [0.85, -1.2], [-0.85, 1.2], [0.85, 1.2]].forEach(([x, z]) => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.position.set(x, 0.25, z);
            wheel.rotation.z = Math.PI / 2;
            car.add(wheel);
        });
        
        car.position.copy(position);
        car.rotation.y = rotation;
        this.scene.add(car);
        
        return car;
    }
    
    createTree() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 })
        );
        trunk.position.y = 1;
        tree.add(trunk);
        
        // Foliage
        const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.9 })
        );
        foliage.position.y = 3;
        foliage.scale.set(1, 1.2, 1);
        tree.add(foliage);
        
        return tree;
    }
    
    createNPCs() {
        // === LUIS (near the apartment entrance, wearing vest) ===
        this.luis = new NPCEntity({
            name: 'Luis',
            position: new THREE.Vector3(-6, 0, 5),
            color: 0x5a6a7a,
            height: 1.6,
            glowColor: 0xffffee // Slight glow from the Light
        });
        this.luis.addToScene(this.scene);
        this.npcs.push(this.luis);
        
        // Create vest visual on Luis
        const vest = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.5, 0.25),
            new THREE.MeshStandardMaterial({ 
                color: 0x4a5a3a, // Olive/green vest
                roughness: 0.8
            })
        );
        vest.position.set(-6, 1.1, 5);
        this.scene.add(vest);
        
        this.luis.setDialogue({
            greeting: {
                text: "There you are! Feeling better after some fresh air? Mae and Rhea are here - they wanted to check on us after that light thing last night.",
                responses: [
                    { text: "What light thing?", next: 'light_explain' },
                    { text: "Nice vest. I thought you lost it.", next: 'vest' },
                    { text: "Where are they?", next: 'friends_location' }
                ]
            },
            light_explain: {
                text: "You don't remember? That crack in the sky? It touched me... and then you passed out. I was so scared, Adrian. But now... now I feel different. Stronger.",
                responses: [
                    { text: "Are you okay?", next: 'feeling' },
                    { text: "Let's talk to our friends.", next: 'friends_location' }
                ]
            },
            vest: {
                text: "I know, right? It just... appeared. On my chair. It was mom's gift. Maybe she's watching over us. It feels special now, like it protects me.",
                responses: [
                    { text: "That's comforting.", next: 'friends_location' },
                    { text: "Strange things are happening.", next: 'strange' }
                ]
            },
            feeling: {
                text: "More than okay. I can't explain it, but I feel like I can help people now. Like I'm supposed to. Does that sound crazy?",
                responses: [
                    { text: "A little, but I believe you.", next: 'thanks' },
                    { text: "Let's see our friends.", next: 'friends_location' }
                ]
            },
            strange: {
                text: "Yeah... the world feels different today. Brighter somehow, but also heavier. Like something big is about to happen.",
                responses: [
                    { text: "Let's talk to Mae and Rhea.", next: 'friends_location' }
                ]
            },
            thanks: {
                text: "Thanks, Adrian. That means everything. Now go say hi to Mae and Rhea - they were really worried.",
                responses: [
                    { text: "Where are they?", next: 'friends_location' }
                ]
            },
            friends_location: {
                text: "Mae's over by the bench near the café. Rhea's checking out that weird spot in the sky - you can see it from down the street. They'll want to hear that you're okay.",
                effect: (game) => {
                    this.metLuis = true;
                    if (game.uiManager) {
                        game.uiManager.showNotification('Find Mae by the bench and Rhea down the street', 3000);
                    }
                }
            }
        });
        
        // === MAE (by the bench near the café) ===
        this.mae = new NPCEntity({
            name: 'Mae',
            position: new THREE.Vector3(6.5, 0, -7),
            color: 0x7a5a4a,
            height: 1.65
        });
        this.mae.addToScene(this.scene);
        this.npcs.push(this.mae);
        
        this.mae.setDialogue({
            greeting: {
                text: "Adrian! Dios mío, you're awake! We saw the light hit Luis and then you just... collapsed. We thought we'd lost both of you.",
                responses: [
                    { text: "I'm fine. Had weird dreams though.", next: 'dreams' },
                    { text: "How's Luis?", next: 'luis_condition' }
                ]
            },
            dreams: {
                text: "Dreams? About what? You were muttering about falling... Look, the whole city's been weird since last night. News says it happened everywhere. People... changed.",
                responses: [
                    { text: "Changed how?", next: 'changes' },
                    { text: "Is everyone okay?", next: 'everyone' }
                ]
            },
            luis_condition: {
                text: "He seems... good. Too good, maybe? He's been smiling all morning, talking about helping people. Did that light do something to him?",
                responses: [
                    { text: "I think so.", next: 'light_effect' },
                    { text: "He's always been optimistic.", next: 'optimistic' }
                ]
            },
            changes: {
                text: "Some people got powers. Real powers. Rhea saw someone float in the air. Others... they got worse. Aggressive. Wrong. The news is calling them 'Touched'.",
                responses: [
                    { text: "Luis was touched by it.", next: 'light_effect' },
                    { text: "What should we do?", next: 'plan' }
                ]
            },
            everyone: {
                text: "As far as I know. Rhea's been watching the sky - she's fascinated by it. I'm just glad you two are still... you.",
                responses: [
                    { text: "What's the plan?", next: 'plan' }
                ]
            },
            light_effect: {
                text: "I saw the light touch him. It was terrifying but beautiful. And now he's got this glow about him, like he's special. Maybe he is.",
                responses: [
                    { text: "What do we do now?", next: 'plan' }
                ]
            },
            optimistic: {
                text: "This is different, man. He's got this... energy. Like he's connected to something bigger. I've known Luis since we were kids - this isn't normal optimism.",
                responses: [
                    { text: "We'll figure it out together.", next: 'plan' }
                ]
            },
            plan: {
                text: "For now? Stick together. The news says more lights might appear. Maybe some safe zones. We should stay close to Luis - if he really has powers, we might need them.",
                effect: (game) => {
                    this.talkedToMae = true;
                    this.checkProgress(game);
                }
            }
        });
        
        // === RHEA (down the street, watching the sky) ===
        this.rhea = new NPCEntity({
            name: 'Rhea',
            position: new THREE.Vector3(-3, 0, -15),
            color: 0x6a5a6a,
            height: 1.65
        });
        this.rhea.addToScene(this.scene);
        this.npcs.push(this.rhea);
        
        this.rhea.setDialogue({
            greeting: {
                text: "Adrian! Look at it - it's still there. The crack. It's the most incredible thing I've ever seen. And terrifying.",
                responses: [
                    { text: "What is it?", next: 'what_is_it' },
                    { text: "We should stay away from it.", next: 'stay_away' }
                ]
            },
            what_is_it: {
                text: "I've been reading everything I can find. They're calling it 'The Light' - a tear in reality. It appeared all over the world at exactly the same moment. Some say it's divine. Others say it's the end.",
                responses: [
                    { text: "It touched Luis.", next: 'touched' },
                    { text: "What do you think?", next: 'opinion' }
                ]
            },
            stay_away: {
                text: "Probably smart. But look - it's beautiful. Like a wound in the sky that bleeds starlight. I can't stop watching it.",
                responses: [
                    { text: "It touched Luis.", next: 'touched' },
                    { text: "We need to stay safe.", next: 'safe' }
                ]
            },
            touched: {
                text: "I know. I saw it happen. One moment he was staring at the sky, the next... light was pouring into him. And then you collapsed. Are you okay?",
                responses: [
                    { text: "I had strange dreams.", next: 'dreams' },
                    { text: "I'm fine. Luis seems different.", next: 'luis_different' }
                ]
            },
            opinion: {
                text: "Honestly? I think it's a doorway. Not divine, not destruction - just... something else. Something that's always been there, finally breaking through.",
                responses: [
                    { text: "That's a terrifying thought.", next: 'terrifying' }
                ]
            },
            safe: {
                text: "You're right. But safety might be harder to find now. The world changed last night, Adrian. Nothing will ever be the same.",
                responses: [
                    { text: "We have each other.", next: 'together' }
                ]
            },
            dreams: {
                text: "What kind of dreams? Some of the Touched report visions - seeing things that haven't happened yet, or places that don't exist. Did you see anything?",
                responses: [
                    { text: "I was falling. From a rooftop.", next: 'falling' },
                    { text: "Nothing I want to remember.", next: 'together' }
                ]
            },
            luis_different: {
                text: "He radiates something now. Warmth? Hope? It's strange, but when I'm near him, I feel... safe. Like he could protect us from anything.",
                responses: [
                    { text: "Maybe he can.", next: 'together' }
                ]
            },
            terrifying: {
                text: "Yes. And thrilling. Whatever's on the other side - we're going to meet it. Ready or not.",
                responses: [
                    { text: "We'll face it together.", next: 'together' }
                ]
            },
            falling: {
                text: "Falling... That's one of the common visions. People who dream of falling often feel like they're losing control. But sometimes falling is just letting go of what was holding you back.",
                responses: [
                    { text: "That's... surprisingly comforting.", next: 'together' }
                ]
            },
            together: {
                text: "Together. I like that. Whatever comes next - we face it as friends. Mae, Luis, you, me. We'll figure this out.",
                effect: (game) => {
                    this.talkedToRhea = true;
                    this.checkProgress(game);
                }
            }
        });
    }
    
    createInteractables() {
        // Apartment entrance (go back inside)
        const entrance = new InteractableObject({
            name: 'Apartment Building',
            description: 'Your apartment building.',
            position: new THREE.Vector3(-8, 1.5, 7),
            size: new THREE.Vector3(2, 3, 1),
            interactionType: 'use',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'SYSTEM',
                    text: "Return to the apartment?",
                    choices: [
                        {
                            text: "Go inside",
                            action: () => {
                                game.sceneManager.loadScene('apartment');
                            }
                        },
                        { text: "Stay outside", action: () => {} }
                    ]
                });
            }
        });
        entrance.addToScene(this.scene);
        this.interactables.push(entrance);
        
        // Luis interactable
        const luisInteract = new InteractableObject({
            name: 'Luis',
            description: 'Your brother, wearing his favorite vest.',
            position: new THREE.Vector3(-6, 0.8, 5),
            size: new THREE.Vector3(0.6, 1.6, 0.6),
            interactionType: 'talk',
            invisible: true,
            onInteract: (game) => {
                this.handleNPCDialogue(game, this.luis);
            }
        });
        luisInteract.addToScene(this.scene);
        this.interactables.push(luisInteract);
        
        // Mae interactable
        const maeInteract = new InteractableObject({
            name: 'Mae',
            description: 'Your friend Mae.',
            position: new THREE.Vector3(6.5, 0.8, -7),
            size: new THREE.Vector3(0.6, 1.7, 0.6),
            interactionType: 'talk',
            invisible: true,
            onInteract: (game) => {
                this.handleNPCDialogue(game, this.mae);
            }
        });
        maeInteract.addToScene(this.scene);
        this.interactables.push(maeInteract);
        
        // Rhea interactable
        const rheaInteract = new InteractableObject({
            name: 'Rhea',
            description: 'Your friend Rhea.',
            position: new THREE.Vector3(-3, 0.8, -15),
            size: new THREE.Vector3(0.6, 1.7, 0.6),
            interactionType: 'talk',
            invisible: true,
            onInteract: (game) => {
                this.handleNPCDialogue(game, this.rhea);
            }
        });
        rheaInteract.addToScene(this.scene);
        this.interactables.push(rheaInteract);
        
        // The sky crack (visible from street)
        const skyCrack = new InteractableObject({
            name: 'The Light in the Sky',
            description: 'A crack in the sky, glowing softly.',
            position: new THREE.Vector3(0, 5, -18),
            size: new THREE.Vector3(10, 10, 5),
            interactionType: 'examine',
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'ADRIAN',
                    text: "It's still there. The crack in the sky. Even in daylight, it glows. Like a scar that won't heal. It touched Luis... and now he's changed. What does it want from us?"
                });
            }
        });
        skyCrack.addToScene(this.scene);
        this.interactables.push(skyCrack);
    }
    
    handleNPCDialogue(game, npc) {
        const dialogue = npc.dialogueTree;
        if (dialogue && dialogue.greeting) {
            game.dialogueSystem.showDialogue({
                speaker: npc.name.toUpperCase(),
                text: dialogue.greeting.text,
                choices: dialogue.greeting.responses?.map(r => ({
                    text: r.text,
                    action: () => this.continueDialogue(game, npc, r.next)
                }))
            });
        }
    }
    
    continueDialogue(game, npc, nextKey) {
        if (!nextKey) return;
        
        const dialogue = npc.dialogueTree[nextKey];
        if (!dialogue) return;
        
        // Execute effect if present
        if (dialogue.effect) {
            dialogue.effect(game);
        }
        
        // Show next dialogue
        game.dialogueSystem.showDialogue({
            speaker: npc.name.toUpperCase(),
            text: dialogue.text,
            choices: dialogue.responses?.map(r => ({
                text: r.text,
                action: () => this.continueDialogue(game, npc, r.next)
            }))
        });
    }
    
    checkProgress(game) {
        if (this.talkedToMae && this.talkedToRhea) {
            // Both friends talked to - story progression
            setTimeout(() => {
                game.dialogueSystem.showDialogue({
                    speaker: 'NARRATOR',
                    text: "Adrian and his friends gathered together, uncertain of what the future held. The Light had changed Luis - and perhaps it would change them all. For now, they had each other. That would have to be enough.",
                    choices: [
                        {
                            text: "The Prologue ends...",
                            action: () => {
                                // Progress to main game
                                if (game.storyState) {
                                    game.storyState.prologueComplete = true;
                                }
                                game.sceneManager.loadScene('convoy_shelter');
                            }
                        }
                    ]
                });
            }, 1000);
        }
    }
    
    update(deltaTime) {
        // Update NPCs
        this.npcs.forEach(npc => {
            if (npc.update) npc.update(deltaTime);
        });
    }
    
    onEnter() {
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Talk to Luis and your friends', 3000);
        }
    }
}
