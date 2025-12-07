/**
 * PROJECT DEATHBED - Tanner House Scene
 * Tanner's shelter/house - where Adrian wakes up after jumping
 * Well-lit, safe, cozy atmosphere - a stark contrast to the dark outside world
 * Features: bedroom with alarm clock, living area, good lighting
 */

import * as THREE from 'three';
import { InteractableObject } from '../entities/InteractableObject.js';
import { NPCEntity } from '../entities/NPCEntity.js';
import { textureGenerator } from '../utils/TextureGenerator.js';

export class TannerHouseScene {
    constructor(game) {
        console.log('=== TannerHouseScene constructor START ===');
        this.game = game;
        this.scene = new THREE.Scene();
        this.interactables = [];
        this.npcs = [];
        this.alarmClock = null;
        
        // Check story state
        this.justWokeUp = game.storyState?.justWokeUpAtTanners || false;
        this.alarmClockRinging = game.storyState?.alarmClockRinging || false;
        
        try {
            // Get textures
            this.woodTexture = textureGenerator.getTexture('wood', { color: { r: 150, g: 110, b: 70 } });
            this.fabricTexture = textureGenerator.getTexture('fabric', { color: { r: 120, g: 115, b: 105 } });
            this.concreteTexture = textureGenerator.getTexture('concrete', { color: { r: 130, g: 130, b: 135 } });
            
            // Build the scene
            this.setupEnvironment();
            this.setupLighting();
            this.createHouseGeometry();
            this.createBedroom();
            this.createLivingArea();
            this.createKitchenette();
            this.createInteractables();
            this.createAtmosphericEffects();
            
            console.log('TannerHouseScene fully constructed, children:', this.scene.children.length);
        } catch (error) {
            console.error('TannerHouseScene constructor error:', error);
            console.error('Stack trace:', error.stack);
        }
        
        // Scene-specific bounds
        this.bounds = { minX: -8, maxX: 8, minZ: -6, maxZ: 6 };
    }
    
    setupEnvironment() {
        // Warm, inviting atmosphere - minimal fog, brighter background
        this.scene.fog = new THREE.FogExp2(0x352a25, 0.008);
        this.scene.background = new THREE.Color(0x2a2525);
    }
    
    setupLighting() {
        // Bright, warm ambient light - this is a SAFE space
        const ambientLight = new THREE.AmbientLight(0x6a5a50, 1.2);
        this.scene.add(ambientLight);
        
        // Main ceiling light - bright and warm (living area)
        const ceilingLight = new THREE.PointLight(0xffeedd, 3.0, 20, 1.2);
        ceilingLight.position.set(0, 3.5, 0);
        ceilingLight.castShadow = true;
        this.scene.add(ceilingLight);
        this.ceilingLight = ceilingLight;
        
        // Bedroom lamp - warm amber
        const bedroomLamp = new THREE.PointLight(0xffcc88, 2.5, 12, 1.5);
        bedroomLamp.position.set(-5, 2, 2);
        bedroomLamp.castShadow = true;
        this.scene.add(bedroomLamp);
        this.bedroomLamp = bedroomLamp;
        
        // Bedside lamp glow
        const bedsideLamp = new THREE.PointLight(0xffbb77, 1.5, 6, 2);
        bedsideLamp.position.set(-3.5, 1.2, 3);
        this.scene.add(bedsideLamp);
        
        // Kitchen area light
        const kitchenLight = new THREE.PointLight(0xffffee, 2.0, 10, 1.8);
        kitchenLight.position.set(5, 3, -2);
        this.scene.add(kitchenLight);
        
        // Window - warm daylight coming in (safe during day)
        const windowLight = new THREE.RectAreaLight(0xffeecc, 2.5, 3, 2);
        windowLight.position.set(-8, 2.5, 0);
        windowLight.lookAt(0, 1.5, 0);
        this.scene.add(windowLight);
        
        // Second window
        const windowLight2 = new THREE.RectAreaLight(0xffeecc, 2.0, 2.5, 1.8);
        windowLight2.position.set(0, 2.5, -6);
        windowLight2.lookAt(0, 1.5, 0);
        this.scene.add(windowLight2);
        
        // Warm hemisphere light for overall fill
        const hemiLight = new THREE.HemisphereLight(0x8a7a6a, 0x4a4035, 0.8);
        this.scene.add(hemiLight);
        
        // Subtle warm rim lights around the room
        const rimLight1 = new THREE.PointLight(0xffaa77, 0.8, 8, 2);
        rimLight1.position.set(6, 2.5, 4);
        this.scene.add(rimLight1);
        
        const rimLight2 = new THREE.PointLight(0xffaa77, 0.6, 6, 2);
        rimLight2.position.set(-6, 2.5, -3);
        this.scene.add(rimLight2);
    }
    
    createHouseGeometry() {
        // Floor - warm wooden floor
        const floorGeometry = new THREE.PlaneGeometry(18, 14);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a6a4a,
            map: this.woodTexture,
            roughness: 0.7,
            metalness: 0.05
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls - warm cream color
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a6a60,
            roughness: 0.85,
            metalness: 0.0
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(18, 5),
            wallMaterial
        );
        backWall.position.set(0, 2.5, -7);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 5),
            wallMaterial.clone()
        );
        leftWall.position.set(-9, 2.5, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 5),
            wallMaterial.clone()
        );
        rightWall.position.set(9, 2.5, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
        
        // Front wall with door opening
        const frontWallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 5),
            wallMaterial.clone()
        );
        frontWallLeft.position.set(-6, 2.5, 7);
        frontWallLeft.rotation.y = Math.PI;
        this.scene.add(frontWallLeft);
        
        const frontWallRight = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 5),
            wallMaterial.clone()
        );
        frontWallRight.position.set(6, 2.5, 7);
        frontWallRight.rotation.y = Math.PI;
        this.scene.add(frontWallRight);
        
        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(18, 14),
            new THREE.MeshStandardMaterial({
                color: 0x5a5550,
                roughness: 0.95
            })
        );
        ceiling.position.set(0, 5, 0);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
        
        // Window frames
        this.createWindow(-8.9, 2.5, 0, Math.PI / 2, 3, 2);
        this.createWindow(0, 2.5, -6.9, 0, 2.5, 1.8);
    }
    
    createWindow(x, y, z, rotationY, width, height) {
        // Window frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4035,
            roughness: 0.6
        });
        
        // Frame pieces
        const frameThickness = 0.08;
        const frameDepth = 0.15;
        
        const frameGroup = new THREE.Group();
        
        // Top frame
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.2, frameThickness, frameDepth),
            frameMaterial
        );
        topFrame.position.y = height / 2;
        frameGroup.add(topFrame);
        
        // Bottom frame
        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.2, frameThickness, frameDepth),
            frameMaterial
        );
        bottomFrame.position.y = -height / 2;
        frameGroup.add(bottomFrame);
        
        // Left frame
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth),
            frameMaterial
        );
        leftFrame.position.x = -width / 2;
        frameGroup.add(leftFrame);
        
        // Right frame
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth),
            frameMaterial
        );
        rightFrame.position.x = width / 2;
        frameGroup.add(rightFrame);
        
        // Window glass (warm daylight glow)
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0xffeedd,
            transparent: true,
            opacity: 0.4,
            emissive: 0xffeecc,
            emissiveIntensity: 0.3,
            roughness: 0.1
        });
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(width - 0.1, height - 0.1),
            glassMaterial
        );
        glass.position.z = -0.05;
        frameGroup.add(glass);
        
        frameGroup.position.set(x, y, z);
        frameGroup.rotation.y = rotationY;
        this.scene.add(frameGroup);
    }
    
    createBedroom() {
        // Bedroom is in the left area of the house
        const bedroomGroup = new THREE.Group();
        
        // Bed frame
        const bedFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 2),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.7,
                map: this.woodTexture
            })
        );
        bedFrame.position.set(-5, 0.2, 3);
        bedFrame.castShadow = true;
        this.scene.add(bedFrame);
        
        // Mattress
        const mattress = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.25, 1.8),
            new THREE.MeshStandardMaterial({ color: 0xeee8dc, roughness: 0.9 })
        );
        mattress.position.set(-5, 0.5, 3);
        this.scene.add(mattress);
        
        // Blanket (rumpled, just woke up)
        const blanket = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.1, 1.6),
            new THREE.MeshStandardMaterial({ 
                color: 0x5577aa, 
                roughness: 0.95 
            })
        );
        blanket.position.set(-5.2, 0.55, 3.3);
        blanket.rotation.z = 0.1; // Slightly askew
        this.scene.add(blanket);
        
        // Pillow
        const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.15, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 })
        );
        pillow.position.set(-5, 0.65, 4.2);
        this.scene.add(pillow);
        
        // Bedside table
        const bedsideTable = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.7,
                map: this.woodTexture
            })
        );
        bedsideTable.position.set(-3.3, 0.25, 3.5);
        bedsideTable.castShadow = true;
        this.scene.add(bedsideTable);
        
        // Alarm clock on bedside table
        this.createAlarmClock(-3.3, 0.6, 3.5);
        
        // Bedside lamp
        this.createBedsideLamp(-3.3, 0.5, 3.2);
        
        // Bedroom rug
        const rug = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 2),
            new THREE.MeshStandardMaterial({ 
                color: 0x8a6655, 
                roughness: 0.95 
            })
        );
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(-5, 0.01, 1.5);
        this.scene.add(rug);
        
        // Dresser
        const dresser = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.2, 0.6),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.7,
                map: this.woodTexture
            })
        );
        dresser.position.set(-7.5, 0.6, 1);
        dresser.castShadow = true;
        this.scene.add(dresser);
        
        // Dresser drawer handles
        for (let i = 0; i < 3; i++) {
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.04, 0.08),
                new THREE.MeshStandardMaterial({ 
                    color: 0x8a7a6a, 
                    metalness: 0.4,
                    roughness: 0.5
                })
            );
            handle.position.set(-7.5, 0.35 + i * 0.35, 1.35);
            this.scene.add(handle);
        }
    }
    
    createAlarmClock(x, y, z) {
        const clockGroup = new THREE.Group();
        
        // Clock body
        const clockBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.12, 0.1),
            new THREE.MeshStandardMaterial({ 
                color: 0x2a2a30, 
                roughness: 0.5,
                metalness: 0.3
            })
        );
        clockGroup.add(clockBody);
        
        // Clock face (LED display)
        const clockFace = new THREE.Mesh(
            new THREE.PlaneGeometry(0.15, 0.08),
            new THREE.MeshStandardMaterial({ 
                color: 0x44ff44,
                emissive: 0x22ff22,
                emissiveIntensity: 0.8
            })
        );
        clockFace.position.z = 0.051;
        clockGroup.add(clockFace);
        
        // Little buttons on top
        const button1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8),
            new THREE.MeshStandardMaterial({ color: 0xff4444 })
        );
        button1.position.set(-0.05, 0.07, 0);
        button1.rotation.x = Math.PI / 2;
        clockGroup.add(button1);
        
        const button2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8),
            new THREE.MeshStandardMaterial({ color: 0x4444ff })
        );
        button2.position.set(0.05, 0.07, 0);
        button2.rotation.x = Math.PI / 2;
        clockGroup.add(button2);
        
        clockGroup.position.set(x, y, z);
        this.scene.add(clockGroup);
        this.alarmClock = clockGroup;
    }
    
    createBedsideLamp(x, y, z) {
        const lampGroup = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 0.05, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0x4a4035, 
                roughness: 0.6 
            })
        );
        lampGroup.add(base);
        
        // Stem
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0x8a7a65, 
                metalness: 0.4 
            })
        );
        stem.position.y = 0.2;
        lampGroup.add(stem);
        
        // Lampshade
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.15, 0.18, 16, 1, true),
            new THREE.MeshStandardMaterial({ 
                color: 0xffeecc, 
                roughness: 0.9,
                transparent: true,
                opacity: 0.9,
                emissive: 0xffcc88,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
            })
        );
        shade.position.y = 0.45;
        lampGroup.add(shade);
        
        lampGroup.position.set(x, y, z);
        this.scene.add(lampGroup);
    }
    
    createLivingArea() {
        // Couch
        const couchGroup = new THREE.Group();
        
        // Couch base
        const couchBase = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 1),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5a4a, 
                roughness: 0.85,
                map: this.fabricTexture
            })
        );
        couchBase.position.y = 0.2;
        couchBase.castShadow = true;
        couchGroup.add(couchBase);
        
        // Couch back
        const couchBack = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.6, 0.2),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5a4a, 
                roughness: 0.85,
                map: this.fabricTexture
            })
        );
        couchBack.position.set(0, 0.5, -0.4);
        couchGroup.add(couchBack);
        
        // Couch cushions
        for (let i = -1; i <= 1; i++) {
            const cushion = new THREE.Mesh(
                new THREE.BoxGeometry(0.75, 0.15, 0.8),
                new THREE.MeshStandardMaterial({ 
                    color: 0x7a6a5a, 
                    roughness: 0.9 
                })
            );
            cushion.position.set(i * 0.8, 0.45, 0);
            couchGroup.add(cushion);
        }
        
        // Armrests
        const armrestL = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.5, 1),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
        );
        armrestL.position.set(-1.3, 0.35, 0);
        couchGroup.add(armrestL);
        
        const armrestR = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.5, 1),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
        );
        armrestR.position.set(1.3, 0.35, 0);
        couchGroup.add(armrestR);
        
        couchGroup.position.set(2, 0, -4);
        this.scene.add(couchGroup);
        
        // Coffee table
        const coffeeTable = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.1, 0.8),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.6,
                map: this.woodTexture
            })
        );
        coffeeTable.position.set(2, 0.45, -2.5);
        coffeeTable.castShadow = true;
        this.scene.add(coffeeTable);
        
        // Coffee table legs
        for (let x = -0.6; x <= 0.6; x += 1.2) {
            for (let z = -0.3; z <= 0.3; z += 0.6) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.4, 0.08),
                    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
                );
                leg.position.set(2 + x, 0.2, -2.5 + z);
                this.scene.add(leg);
            }
        }
        
        // Living room rug
        const livingRug = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 3),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5545, 
                roughness: 0.95 
            })
        );
        livingRug.rotation.x = -Math.PI / 2;
        livingRug.position.set(2, 0.01, -3);
        this.scene.add(livingRug);
        
        // Bookshelf
        this.createBookshelf(6, 0, -5);
        
        // Floor lamp
        this.createFloorLamp(5, 0, -2);
    }
    
    createBookshelf(x, y, z) {
        const shelfGroup = new THREE.Group();
        
        // Main frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.2, 0.4),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.7,
                map: this.woodTexture
            })
        );
        frame.position.y = 1.1;
        shelfGroup.add(frame);
        
        // Shelves
        for (let i = 0; i < 4; i++) {
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.03, 0.35),
                new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
            );
            shelf.position.set(0, 0.3 + i * 0.5, 0.03);
            shelfGroup.add(shelf);
        }
        
        // Books (random heights and colors)
        const bookColors = [0x8a3030, 0x305a8a, 0x4a7030, 0x7a5a2a, 0x5a4a7a];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 5; j++) {
                const bookHeight = 0.15 + Math.random() * 0.1;
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, bookHeight, 0.25),
                    new THREE.MeshStandardMaterial({ 
                        color: bookColors[Math.floor(Math.random() * bookColors.length)],
                        roughness: 0.9
                    })
                );
                book.position.set(-0.5 + j * 0.25, 0.35 + i * 0.5 + bookHeight / 2, 0);
                shelfGroup.add(book);
            }
        }
        
        shelfGroup.position.set(x, y, z);
        this.scene.add(shelfGroup);
    }
    
    createFloorLamp(x, y, z) {
        const lampGroup = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.6 })
        );
        lampGroup.add(base);
        
        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0x8a7a65, 
                metalness: 0.5 
            })
        );
        pole.position.y = 0.9;
        lampGroup.add(pole);
        
        // Shade
        const shade = new THREE.Mesh(
            new THREE.ConeGeometry(0.25, 0.35, 16, 1, true),
            new THREE.MeshStandardMaterial({ 
                color: 0xffeedd, 
                roughness: 0.9,
                transparent: true,
                opacity: 0.9,
                emissive: 0xffcc88,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
            })
        );
        shade.position.y = 1.85;
        shade.rotation.x = Math.PI;
        lampGroup.add(shade);
        
        lampGroup.position.set(x, y, z);
        this.scene.add(lampGroup);
    }
    
    createKitchenette() {
        // Small kitchen area on the right side
        
        // Counter
        const counter = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.9, 0.7),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a5550, 
                roughness: 0.6 
            })
        );
        counter.position.set(6, 0.45, 1);
        counter.castShadow = true;
        this.scene.add(counter);
        
        // Counter top
        const counterTop = new THREE.Mesh(
            new THREE.BoxGeometry(3.1, 0.05, 0.75),
            new THREE.MeshStandardMaterial({ 
                color: 0x8a8580, 
                roughness: 0.4 
            })
        );
        counterTop.position.set(6, 0.925, 1);
        this.scene.add(counterTop);
        
        // Sink
        const sink = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.15, 0.4),
            new THREE.MeshStandardMaterial({ 
                color: 0xaaaaaa, 
                metalness: 0.6,
                roughness: 0.3
            })
        );
        sink.position.set(6, 0.9, 1);
        this.scene.add(sink);
        
        // Faucet
        const faucet = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0xcccccc, 
                metalness: 0.8,
                roughness: 0.2
            })
        );
        faucet.position.set(6, 1.1, 1.2);
        this.scene.add(faucet);
        
        // Cabinet above
        const cabinet = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.8, 0.4),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.7,
                map: this.woodTexture
            })
        );
        cabinet.position.set(6, 2.5, 1.1);
        this.scene.add(cabinet);
        
        // Coffee maker
        const coffeeMaker = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.35, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5 })
        );
        coffeeMaker.position.set(7, 1.1, 1);
        this.scene.add(coffeeMaker);
        
        // Small table
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.05, 1),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.6,
                map: this.woodTexture
            })
        );
        table.position.set(4, 0.75, 3);
        this.scene.add(table);
        
        // Table legs
        for (let x = -0.4; x <= 0.4; x += 0.8) {
            for (let z = -0.4; z <= 0.4; z += 0.8) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8),
                    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
                );
                leg.position.set(4 + x, 0.375, 3 + z);
                this.scene.add(leg);
            }
        }
        
        // Chairs
        this.createChair(3.2, 0, 3);
        this.createChair(4.8, 0, 3, Math.PI);
    }
    
    createChair(x, y, z, rotationY = 0) {
        const chairGroup = new THREE.Group();
        
        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.05, 0.45),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
        );
        seat.position.y = 0.45;
        chairGroup.add(seat);
        
        // Back
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.5, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
        );
        back.position.set(0, 0.7, -0.2);
        chairGroup.add(back);
        
        // Legs
        for (let lx = -0.18; lx <= 0.18; lx += 0.36) {
            for (let lz = -0.18; lz <= 0.18; lz += 0.36) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8),
                    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
                );
                leg.position.set(lx, 0.225, lz);
                chairGroup.add(leg);
            }
        }
        
        chairGroup.position.set(x, y, z);
        chairGroup.rotation.y = rotationY;
        this.scene.add(chairGroup);
    }
    
    createInteractables() {
        // Exit door
        const exitDoor = new InteractableObject({
            name: 'Exit Door',
            description: 'The door leading outside. It\'s daylight - should be safe.',
            position: new THREE.Vector3(0, 1.5, 6.5),
            interactionRange: 2,
            onInteract: () => {
                return {
                    type: 'dialogue',
                    speaker: 'Adrian',
                    text: "It's bright outside. The Light shouldn't be active during the day...",
                    choices: [
                        { text: "Go outside", action: 'go_outside' },
                        { text: "Stay inside for now", action: 'stay' }
                    ]
                };
            }
        });
        this.interactables.push(exitDoor);
        this.scene.add(exitDoor.mesh);
        
        // Alarm clock interaction
        const alarmClockInteract = new InteractableObject({
            name: 'Alarm Clock',
            description: 'A digital alarm clock showing 7:00 AM',
            position: new THREE.Vector3(-3.3, 0.6, 3.5),
            interactionRange: 1.5,
            onInteract: () => {
                return {
                    type: 'dialogue',
                    speaker: 'Adrian',
                    text: "7 AM... Time to get up.",
                    choices: []
                };
            }
        });
        this.interactables.push(alarmClockInteract);
        this.scene.add(alarmClockInteract.mesh);
        
        // Coffee maker
        const coffeeMaker = new InteractableObject({
            name: 'Coffee Maker',
            description: 'Tanner\'s coffee maker. Smells like fresh brew.',
            position: new THREE.Vector3(7, 1.1, 1),
            interactionRange: 1.5,
            onInteract: () => {
                return {
                    type: 'dialogue',
                    speaker: 'Adrian',
                    text: "Coffee... That might help with this headache.",
                    choices: []
                };
            }
        });
        this.interactables.push(coffeeMaker);
        this.scene.add(coffeeMaker.mesh);
        
        // Bookshelf
        const bookshelf = new InteractableObject({
            name: 'Bookshelf',
            description: 'Tanner\'s collection of survival guides and old novels.',
            position: new THREE.Vector3(6, 1, -5),
            interactionRange: 2,
            onInteract: () => {
                return {
                    type: 'dialogue',
                    speaker: 'Adrian',
                    text: "Tanner always liked to be prepared. These survival books have come in handy.",
                    choices: []
                };
            }
        });
        this.interactables.push(bookshelf);
        this.scene.add(bookshelf.mesh);
        
        // Window
        const window1 = new InteractableObject({
            name: 'Window',
            description: 'A window overlooking the outside. Warm daylight streams through.',
            position: new THREE.Vector3(-8, 2, 0),
            interactionRange: 2,
            onInteract: () => {
                return {
                    type: 'dialogue',
                    speaker: 'Adrian',
                    text: "The sun is up. It's safe to go out during the day... The Light only comes at night.",
                    choices: []
                };
            }
        });
        this.interactables.push(window1);
        this.scene.add(window1.mesh);
    }
    
    createAtmosphericEffects() {
        // Dust particles in sunbeams
        const dustCount = 200;
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustCount * 3);
        
        for (let i = 0; i < dustCount; i++) {
            dustPositions[i * 3] = (Math.random() - 0.5) * 16;
            dustPositions[i * 3 + 1] = Math.random() * 4;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            color: 0xffeedd,
            size: 0.03,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });
        
        this.dustParticles = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(this.dustParticles);
        
        // Store original positions for animation
        this.dustOriginalPositions = dustPositions.slice();
    }
    
    update(deltaTime) {
        // Animate dust particles
        if (this.dustParticles) {
            const positions = this.dustParticles.geometry.attributes.position.array;
            const time = Date.now() * 0.0005;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Gentle floating motion
                positions[i] = this.dustOriginalPositions[i] + Math.sin(time + i) * 0.02;
                positions[i + 1] = this.dustOriginalPositions[i + 1] + Math.sin(time * 0.7 + i) * 0.015;
                positions[i + 2] = this.dustOriginalPositions[i + 2] + Math.cos(time * 0.5 + i) * 0.02;
            }
            
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Subtle light flickering (very minimal for a safe, stable feeling)
        if (this.ceilingLight) {
            this.ceilingLight.intensity = 3.0 + Math.sin(Date.now() * 0.001) * 0.05;
        }
        
        if (this.bedroomLamp) {
            this.bedroomLamp.intensity = 2.5 + Math.sin(Date.now() * 0.0015) * 0.03;
        }
    }
    
    onEnter() {
        console.log('Entered Tanner\'s House');
        // Play ambient sounds if available
        if (this.game.audioManager) {
            // Could play calm ambient sounds here
        }
    }
    
    onExit() {
        console.log('Exiting Tanner\'s House');
    }
    
    getInteractables() {
        return this.interactables;
    }
    
    getNPCs() {
        return this.npcs;
    }
}
