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
import { FaceWashAnimation } from '../ui/FaceWashAnimation.js';

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
        
        // Quest state
        this.hasWashedFace = game.storyState?.hasWashedFace || false;
        this.needsMedicine = game.storyState?.needsMedicine || false;
        this.hasTalkedToTanner = game.storyState?.hasTalkedToTanner || false;
        this.hasMedicine = game.storyState?.hasMedicine || false;
        
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
            this.createBathroom();
            this.createInteractables();
            this.createAtmosphericEffects();
            
            console.log('TannerHouseScene fully constructed, children:', this.scene.children.length);
        } catch (error) {
            console.error('TannerHouseScene constructor error:', error);
            console.error('Stack trace:', error.stack);
        }
        
        // Scene-specific bounds - expanded for kitchen room and bathroom
        this.bounds = { minX: -8, maxX: 19, minZ: -11, maxZ: 6 };
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
        // === MAIN LIVING ROOM FLOOR ===
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
        
        // === KITCHEN ROOM FLOOR (tile texture) ===
        const kitchenFloorGeometry = new THREE.PlaneGeometry(10, 10);
        const kitchenFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.5,
            metalness: 0.1
        });
        const kitchenFloor = new THREE.Mesh(kitchenFloorGeometry, kitchenFloorMaterial);
        kitchenFloor.rotation.x = -Math.PI / 2;
        kitchenFloor.position.set(14, 0.01, 0);
        kitchenFloor.receiveShadow = true;
        this.scene.add(kitchenFloor);
        
        // Walls - warm cream color
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x7a6a60,
            roughness: 0.85,
            metalness: 0.0
        });
        
        // === MAIN ROOM WALLS ===
        // Back wall (main room) - split for bathroom doorway
        // Left section (before bathroom)
        const backWallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5),
            wallMaterial
        );
        backWallLeft.position.set(-6.5, 2.5, -7);
        backWallLeft.receiveShadow = true;
        this.scene.add(backWallLeft);
        
        // Right section (after bathroom doorway)
        const backWallRight = new THREE.Mesh(
            new THREE.PlaneGeometry(11, 5),
            wallMaterial.clone()
        );
        backWallRight.position.set(3.5, 2.5, -7);
        backWallRight.receiveShadow = true;
        this.scene.add(backWallRight);
        
        // Bathroom doorway frame in back wall
        const bathroomDoorFrameTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.2, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
        );
        bathroomDoorFrameTop.position.set(-1, 2.9, -7);
        this.scene.add(bathroomDoorFrameTop);
        
        const bathroomDoorFrameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2.8, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
        );
        bathroomDoorFrameLeft.position.set(-1.55, 1.4, -7);
        this.scene.add(bathroomDoorFrameLeft);
        
        const bathroomDoorFrameRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2.8, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
        );
        bathroomDoorFrameRight.position.set(-0.45, 1.4, -7);
        this.scene.add(bathroomDoorFrameRight);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 5),
            wallMaterial.clone()
        );
        leftWall.position.set(-9, 2.5, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // Front wall with door opening (main room)
        const frontWallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 5),
            wallMaterial.clone()
        );
        frontWallLeft.position.set(-6, 2.5, 7);
        frontWallLeft.rotation.y = Math.PI;
        this.scene.add(frontWallLeft);
        
        const frontWallCenter = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 5),
            wallMaterial.clone()
        );
        frontWallCenter.position.set(3, 2.5, 7);
        frontWallCenter.rotation.y = Math.PI;
        this.scene.add(frontWallCenter);
        
        // === DIVIDER WALL BETWEEN LIVING ROOM AND KITCHEN ===
        // Wall with doorway opening
        const dividerWallTop = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 5),
            wallMaterial.clone()
        );
        dividerWallTop.position.set(9, 2.5, -4.5);
        dividerWallTop.rotation.y = Math.PI / 2;
        this.scene.add(dividerWallTop);
        
        const dividerWallBottom = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 5),
            wallMaterial.clone()
        );
        dividerWallBottom.position.set(9, 2.5, 4.5);
        dividerWallBottom.rotation.y = Math.PI / 2;
        this.scene.add(dividerWallBottom);
        
        // Doorway frame (decorative arch between rooms)
        this.createDoorFrame(9, 0, 0, Math.PI / 2);
        
        // === KITCHEN ROOM WALLS ===
        // Kitchen back wall
        const kitchenBackWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            wallMaterial.clone()
        );
        kitchenBackWall.position.set(14, 2.5, -5);
        kitchenBackWall.receiveShadow = true;
        this.scene.add(kitchenBackWall);
        
        // Kitchen right wall
        const kitchenRightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            wallMaterial.clone()
        );
        kitchenRightWall.position.set(19, 2.5, 0);
        kitchenRightWall.rotation.y = -Math.PI / 2;
        kitchenRightWall.receiveShadow = true;
        this.scene.add(kitchenRightWall);
        
        // Kitchen front wall
        const kitchenFrontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            wallMaterial.clone()
        );
        kitchenFrontWall.position.set(14, 2.5, 5);
        kitchenFrontWall.rotation.y = Math.PI;
        this.scene.add(kitchenFrontWall);
        
        // === CEILINGS ===
        // Main room ceiling
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
        
        // Kitchen ceiling
        const kitchenCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x5a5550,
                roughness: 0.95
            })
        );
        kitchenCeiling.position.set(14, 5, 0);
        kitchenCeiling.rotation.x = Math.PI / 2;
        this.scene.add(kitchenCeiling);
        
        // Window frames
        this.createWindow(-8.9, 2.5, 0, Math.PI / 2, 3, 2);
        this.createWindow(0, 2.5, -6.9, 0, 2.5, 1.8);
        this.createWindow(18.9, 2.5, 0, -Math.PI / 2, 2.5, 1.8); // Kitchen window
    }
    
    createDoorFrame(x, y, z, rotationY) {
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.7,
            map: this.woodTexture
        });
        
        const frameGroup = new THREE.Group();
        
        // Determine if rotated 90 degrees (for side walls)
        const isRotated = Math.abs(rotationY) > 0.1;
        
        // Door posts - adjust geometry based on rotation
        // Width of post (facing player), depth (into wall)
        const postWidth = 0.2;
        const postDepth = 0.15;
        
        // Left post
        const leftPost = new THREE.Mesh(
            new THREE.BoxGeometry(postWidth, 3, postDepth),
            frameMaterial
        );
        leftPost.position.set(0, 1.5, -1.2);
        frameGroup.add(leftPost);
        
        // Right post
        const rightPost = new THREE.Mesh(
            new THREE.BoxGeometry(postWidth, 3, postDepth),
            frameMaterial
        );
        rightPost.position.set(0, 1.5, 1.2);
        frameGroup.add(rightPost);
        
        // Top beam
        const topBeam = new THREE.Mesh(
            new THREE.BoxGeometry(postWidth, 0.2, 2.6),
            frameMaterial
        );
        topBeam.position.set(0, 3.1, 0);
        frameGroup.add(topBeam);
        
        frameGroup.position.set(x, y, z);
        frameGroup.rotation.y = rotationY;
        this.scene.add(frameGroup);
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
        // === LIVING ROOM - Cozy area for relaxation ===
        
        // === MAIN COUCH (facing TV) ===
        const couchGroup = new THREE.Group();
        
        // Couch base - larger, more comfortable
        const couchBase = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.45, 1.1),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.85,
                map: this.fabricTexture
            })
        );
        couchBase.position.y = 0.225;
        couchBase.castShadow = true;
        couchGroup.add(couchBase);
        
        // Couch back - tall and comfortable
        const couchBack = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.7, 0.25),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.85,
                map: this.fabricTexture
            })
        );
        couchBack.position.set(0, 0.6, -0.45);
        couchGroup.add(couchBack);
        
        // Seat cushions (3 separate cushions)
        for (let i = -1; i <= 1; i++) {
            const cushion = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.18, 0.85),
                new THREE.MeshStandardMaterial({ 
                    color: 0x6a5a4a, 
                    roughness: 0.92 
                })
            );
            cushion.position.set(i * 0.95, 0.52, 0.05);
            couchGroup.add(cushion);
        }
        
        // Back cushions (matching seat cushions)
        for (let i = -1; i <= 1; i++) {
            const backCushion = new THREE.Mesh(
                new THREE.BoxGeometry(0.85, 0.5, 0.15),
                new THREE.MeshStandardMaterial({ 
                    color: 0x6a5a4a, 
                    roughness: 0.92 
                })
            );
            backCushion.position.set(i * 0.95, 0.7, -0.28);
            backCushion.rotation.x = -0.1; // Slightly angled for comfort
            couchGroup.add(backCushion);
        }
        
        // Armrests (rounded top)
        const armrestMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8 });
        
        const armrestL = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.55, 1.1),
            armrestMaterial
        );
        armrestL.position.set(-1.58, 0.4, 0);
        couchGroup.add(armrestL);
        
        const armrestR = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.55, 1.1),
            armrestMaterial
        );
        armrestR.position.set(1.58, 0.4, 0);
        couchGroup.add(armrestR);
        
        // Throw pillows for realism
        const pillowColors = [0x8a6655, 0x556688, 0x688855];
        const pillow1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.35, 0.1),
            new THREE.MeshStandardMaterial({ color: pillowColors[0], roughness: 0.95 })
        );
        pillow1.position.set(-1.1, 0.75, 0);
        pillow1.rotation.set(0.1, 0.2, 0.15);
        couchGroup.add(pillow1);
        
        const pillow2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.35, 0.1),
            new THREE.MeshStandardMaterial({ color: pillowColors[1], roughness: 0.95 })
        );
        pillow2.position.set(1.0, 0.75, 0.05);
        pillow2.rotation.set(-0.05, -0.15, -0.1);
        couchGroup.add(pillow2);
        
        couchGroup.position.set(0, 0, -5);
        this.scene.add(couchGroup);
        
        // === TV STAND ===
        const tvStand = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a3535, 
                roughness: 0.6,
                map: this.woodTexture
            })
        );
        tvStand.position.set(0, 0.25, -6.3);
        tvStand.castShadow = true;
        this.scene.add(tvStand);
        
        // TV Stand legs
        for (let x = -0.8; x <= 0.8; x += 1.6) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.08, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x2a2525, roughness: 0.7 })
            );
            leg.position.set(x, 0.04, -6.3);
            this.scene.add(leg);
        }
        
        // === TV ===
        const tvBody = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 1.1, 0.08),
            new THREE.MeshStandardMaterial({ 
                color: 0x1a1a1a, 
                roughness: 0.3,
                metalness: 0.2
            })
        );
        tvBody.position.set(0, 1.1, -6.45);
        tvBody.castShadow = true;
        this.scene.add(tvBody);
        
        // TV screen (dark, off)
        const tvScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.65, 0.95),
            new THREE.MeshStandardMaterial({ 
                color: 0x0a0a12, 
                roughness: 0.1,
                metalness: 0.8,
                emissive: 0x050510,
                emissiveIntensity: 0.1
            })
        );
        tvScreen.position.set(0, 1.1, -6.4);
        this.scene.add(tvScreen);
        
        // TV stand (base)
        const tvBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.05, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 })
        );
        tvBase.position.set(0, 0.52, -6.35);
        this.scene.add(tvBase);
        
        // === COFFEE TABLE (larger, in front of couch) ===
        const coffeeTable = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.08, 1),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.5,
                map: this.woodTexture
            })
        );
        coffeeTable.position.set(0, 0.42, -3.2);
        coffeeTable.castShadow = true;
        this.scene.add(coffeeTable);
        
        // Coffee table legs (4 corners)
        for (let x = -0.75; x <= 0.75; x += 1.5) {
            for (let z = -0.4; z <= 0.4; z += 0.8) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 0.38, 0.06),
                    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
                );
                leg.position.set(x, 0.19, -3.2 + z);
                this.scene.add(leg);
            }
        }
        
        // Coffee table lower shelf
        const coffeeTableShelf = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.03, 0.8),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.6,
                map: this.woodTexture
            })
        );
        coffeeTableShelf.position.set(0, 0.12, -3.2);
        this.scene.add(coffeeTableShelf);
        
        // === ITEMS ON COFFEE TABLE ===
        // Coffee mug (for drinking coffee!)
        this.createCoffeeMug(0.3, 0.46, -3.0);
        
        // Remote control
        const remote = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.025, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
        );
        remote.position.set(-0.3, 0.44, -3.1);
        remote.rotation.y = 0.3;
        this.scene.add(remote);
        
        // Magazine/book
        const magazine = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.015, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x8a6a5a, roughness: 0.9 })
        );
        magazine.position.set(0.5, 0.435, -3.4);
        magazine.rotation.y = -0.2;
        this.scene.add(magazine);
        
        // Coaster
        const coaster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16),
            new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.8 })
        );
        coaster.position.set(-0.5, 0.43, -3.0);
        this.scene.add(coaster);
        
        // === LIVING ROOM RUG (large, under coffee table) ===
        const livingRug = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 3.5),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a40, 
                roughness: 0.95 
            })
        );
        livingRug.rotation.x = -Math.PI / 2;
        livingRug.position.set(0, 0.01, -4);
        this.scene.add(livingRug);
        
        // Rug border/pattern (inner rectangle)
        const rugBorder = new THREE.Mesh(
            new THREE.PlaneGeometry(3.5, 3),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5545, 
                roughness: 0.95 
            })
        );
        rugBorder.rotation.x = -Math.PI / 2;
        rugBorder.position.set(0, 0.012, -4);
        this.scene.add(rugBorder);
        
        // === SIDE TABLE (next to couch) ===
        const sideTable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.6,
                map: this.woodTexture
            })
        );
        sideTable.position.set(-2.2, 0.25, -4.5);
        sideTable.castShadow = true;
        this.scene.add(sideTable);
        
        // Lamp on side table
        this.createTableLamp(-2.2, 0.5, -4.5);
        
        // === ARMCHAIR ===
        this.createArmchair(3, 0, -3.5, -0.4);
        
        // === BOOKSHELF ===
        this.createBookshelf(6, 0, -5);
        
        // === FLOOR LAMP ===
        this.createFloorLamp(5, 0, -2);
        
        // === WALL ART / PICTURE FRAMES ===
        this.createWallArt(-4, 2.2, -6.9, 0.8, 0.6);
        this.createWallArt(-2, 2.5, -6.9, 0.5, 0.7);
        
        // === POTTED PLANT ===
        this.createPottedPlant(-3.5, 0, -5.5);
    }
    
    createCoffeeMug(x, y, z) {
        const mugGroup = new THREE.Group();
        
        // Mug body
        const mugBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.035, 0.09, 12),
            new THREE.MeshStandardMaterial({ 
                color: 0xeeeeee, 
                roughness: 0.4 
            })
        );
        mugGroup.add(mugBody);
        
        // Coffee inside
        const coffee = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a2a1a, 
                roughness: 0.3 
            })
        );
        coffee.position.y = 0.03;
        mugGroup.add(coffee);
        
        // Handle
        const handleShape = new THREE.TorusGeometry(0.025, 0.008, 8, 12, Math.PI);
        const handle = new THREE.Mesh(
            handleShape,
            new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 })
        );
        handle.position.set(0.05, 0, 0);
        handle.rotation.z = Math.PI / 2;
        handle.rotation.y = Math.PI / 2;
        mugGroup.add(handle);
        
        mugGroup.position.set(x, y, z);
        this.scene.add(mugGroup);
        return mugGroup;
    }
    
    createTableLamp(x, y, z) {
        const lampGroup = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.03, 16),
            new THREE.MeshStandardMaterial({ color: 0x4a4035, roughness: 0.6 })
        );
        lampGroup.add(base);
        
        // Stem
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8),
            new THREE.MeshStandardMaterial({ color: 0x8a7a65, metalness: 0.4 })
        );
        stem.position.y = 0.14;
        lampGroup.add(stem);
        
        // Shade
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.1, 0.12, 16, 1, true),
            new THREE.MeshStandardMaterial({ 
                color: 0xffeedd, 
                roughness: 0.9,
                transparent: true,
                opacity: 0.9,
                emissive: 0xffcc88,
                emissiveIntensity: 0.4,
                side: THREE.DoubleSide
            })
        );
        shade.position.y = 0.32;
        lampGroup.add(shade);
        
        // Light source
        const lampLight = new THREE.PointLight(0xffddaa, 1.5, 5, 2);
        lampLight.position.y = 0.3;
        lampGroup.add(lampLight);
        
        lampGroup.position.set(x, y, z);
        this.scene.add(lampGroup);
    }
    
    createArmchair(x, y, z, rotationY = 0) {
        const chairGroup = new THREE.Group();
        
        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.15, 0.7),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5a4a, 
                roughness: 0.85,
                map: this.fabricTexture
            })
        );
        seat.position.y = 0.4;
        chairGroup.add(seat);
        
        // Back
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.12),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5a4a, 
                roughness: 0.85 
            })
        );
        back.position.set(0, 0.7, -0.32);
        chairGroup.add(back);
        
        // Arms
        const armL = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.4, 0.7),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
        );
        armL.position.set(-0.42, 0.5, 0);
        chairGroup.add(armL);
        
        const armR = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.4, 0.7),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
        );
        armR.position.set(0.42, 0.5, 0);
        chairGroup.add(armR);
        
        // Legs
        for (let lx = -0.3; lx <= 0.3; lx += 0.6) {
            for (let lz = -0.25; lz <= 0.25; lz += 0.5) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 0.28, 0.06),
                    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
                );
                leg.position.set(lx, 0.14, lz);
                chairGroup.add(leg);
            }
        }
        
        // Cushion
        const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.1, 0.55),
            new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.9 })
        );
        cushion.position.set(0, 0.52, 0.02);
        chairGroup.add(cushion);
        
        chairGroup.position.set(x, y, z);
        chairGroup.rotation.y = rotationY;
        this.scene.add(chairGroup);
    }
    
    createWallArt(x, y, z, width, height) {
        const frameGroup = new THREE.Group();
        
        // Frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.06, height + 0.06, 0.03),
            new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 })
        );
        frameGroup.add(frame);
        
        // Canvas/picture
        const canvas = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshStandardMaterial({ 
                color: 0x7a8a9a, 
                roughness: 0.95 
            })
        );
        canvas.position.z = 0.02;
        frameGroup.add(canvas);
        
        frameGroup.position.set(x, y, z);
        this.scene.add(frameGroup);
    }
    
    createPottedPlant(x, y, z) {
        const plantGroup = new THREE.Group();
        
        // Pot
        const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.12, 0.25, 12),
            new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.8 })
        );
        pot.position.y = 0.125;
        plantGroup.add(pot);
        
        // Soil
        const soil = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.13, 0.03, 12),
            new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.95 })
        );
        soil.position.y = 0.24;
        plantGroup.add(soil);
        
        // Leaves (simple representation)
        const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a7a4a, 
            roughness: 0.8 
        });
        
        for (let i = 0; i < 5; i++) {
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                leafMaterial
            );
            const angle = (i / 5) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * 0.08,
                0.4 + Math.random() * 0.1,
                Math.sin(angle) * 0.08
            );
            leaf.scale.set(1, 1.5, 0.5);
            plantGroup.add(leaf);
        }
        
        // Center leaves
        const centerLeaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.2, 8),
            leafMaterial
        );
        centerLeaf.position.y = 0.5;
        plantGroup.add(centerLeaf);
        
        plantGroup.position.set(x, y, z);
        this.scene.add(plantGroup);
    }
    
    createBookshelf(x, y, z) {
        
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
        // === KITCHEN ROOM (separate room through doorway) ===
        // Kitchen is now in its own room at x=14, z=0
        
        // Kitchen ceiling light
        const kitchenCeilingLight = new THREE.PointLight(0xffffee, 2.5, 15, 1.5);
        kitchenCeilingLight.position.set(14, 4.5, 0);
        kitchenCeilingLight.castShadow = true;
        this.scene.add(kitchenCeilingLight);
        
        // === MAIN COUNTER (along back wall) ===
        const mainCounter = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.9, 0.7),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a5550, 
                roughness: 0.6 
            })
        );
        mainCounter.position.set(14, 0.45, -4.3);
        mainCounter.castShadow = true;
        this.scene.add(mainCounter);
        
        // Counter top (granite look)
        const mainCounterTop = new THREE.Mesh(
            new THREE.BoxGeometry(6.1, 0.05, 0.75),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a3a40, 
                roughness: 0.3,
                metalness: 0.1
            })
        );
        mainCounterTop.position.set(14, 0.925, -4.3);
        this.scene.add(mainCounterTop);
        
        // === SINK ===
        const sink = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.15, 0.5),
            new THREE.MeshStandardMaterial({ 
                color: 0xaaaaaa, 
                metalness: 0.7,
                roughness: 0.2
            })
        );
        sink.position.set(13, 0.87, -4.3);
        this.scene.add(sink);
        
        // Faucet
        const faucetBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0xcccccc, 
                metalness: 0.9,
                roughness: 0.1
            })
        );
        faucetBase.position.set(13, 0.99, -4.1);
        this.scene.add(faucetBase);
        
        const faucetArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0xcccccc, 
                metalness: 0.9,
                roughness: 0.1
            })
        );
        faucetArm.position.set(13, 1.15, -4.1);
        this.scene.add(faucetArm);
        
        // Faucet spout
        const faucetSpout = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0xcccccc, 
                metalness: 0.9,
                roughness: 0.1
            })
        );
        faucetSpout.position.set(13, 1.25, -4.25);
        faucetSpout.rotation.x = Math.PI / 3;
        this.scene.add(faucetSpout);
        
        // === STOVE ===
        const stove = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.1, 0.6),
            new THREE.MeshStandardMaterial({ 
                color: 0x2a2a2a, 
                roughness: 0.4,
                metalness: 0.3
            })
        );
        stove.position.set(15.5, 0.95, -4.3);
        this.scene.add(stove);
        
        // Stove burners
        for (let bx = -0.2; bx <= 0.2; bx += 0.4) {
            for (let bz = -0.15; bz <= 0.15; bz += 0.3) {
                const burner = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x1a1a1a, 
                        roughness: 0.6
                    })
                );
                burner.position.set(15.5 + bx, 1.0, -4.3 + bz);
                this.scene.add(burner);
            }
        }
        
        // === CABINETS ABOVE ===
        for (let i = 0; i < 3; i++) {
            const cabinet = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1, 0.4),
                new THREE.MeshStandardMaterial({ 
                    color: 0x5a4a3a, 
                    roughness: 0.7,
                    map: this.woodTexture
                })
            );
            cabinet.position.set(12 + i * 2, 2.8, -4.6);
            cabinet.castShadow = true;
            this.scene.add(cabinet);
            
            // Cabinet handle
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.04, 0.06),
                new THREE.MeshStandardMaterial({ 
                    color: 0x8a8a8a, 
                    metalness: 0.6
                })
            );
            handle.position.set(12 + i * 2, 2.5, -4.35);
            this.scene.add(handle);
        }
        
        // === REFRIGERATOR ===
        const fridge = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 2.2, 0.8),
            new THREE.MeshStandardMaterial({ 
                color: 0xcccccc, 
                roughness: 0.3,
                metalness: 0.4
            })
        );
        fridge.position.set(18, 1.1, -3.5);
        fridge.castShadow = true;
        this.scene.add(fridge);
        
        // Fridge handle
        const fridgeHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.5, 0.05),
            new THREE.MeshStandardMaterial({ 
                color: 0x888888, 
                metalness: 0.7
            })
        );
        fridgeHandle.position.set(17.5, 1.3, -3.5);
        this.scene.add(fridgeHandle);
        
        // === COFFEE MAKER ===
        const coffeeMakerBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.25),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5 })
        );
        coffeeMakerBase.position.set(11.5, 0.98, -4.2);
        this.scene.add(coffeeMakerBase);
        
        const coffeeMakerBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.35, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5 })
        );
        coffeeMakerBody.position.set(11.5, 1.2, -4.25);
        this.scene.add(coffeeMakerBody);
        
        // Coffee pot
        const coffeePot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.06, 0.15, 8),
            new THREE.MeshStandardMaterial({ 
                color: 0x4a2a1a, 
                transparent: true,
                opacity: 0.7
            })
        );
        coffeePot.position.set(11.5, 1.03, -4.05);
        this.scene.add(coffeePot);
        
        // === KITCHEN ISLAND / DINING TABLE ===
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.08, 1.2),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a4a3a, 
                roughness: 0.6,
                map: this.woodTexture
            })
        );
        table.position.set(14, 0.85, 1);
        table.castShadow = true;
        this.scene.add(table);
        
        // Table legs
        for (let tx = -0.8; tx <= 0.8; tx += 1.6) {
            for (let tz = -0.5; tz <= 0.5; tz += 1.0) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8),
                    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
                );
                leg.position.set(14 + tx, 0.425, 1 + tz);
                this.scene.add(leg);
            }
        }
        
        // === CHAIRS AROUND TABLE ===
        this.createChair(12.8, 0, 1, Math.PI / 2);
        this.createChair(15.2, 0, 1, -Math.PI / 2);
        this.createChair(14, 0, 2.2, Math.PI);
        this.createChair(14, 0, -0.2, 0);
        
        // === SIDE COUNTER (along right wall) ===
        const sideCounter = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.9, 3),
            new THREE.MeshStandardMaterial({ 
                color: 0x5a5550, 
                roughness: 0.6 
            })
        );
        sideCounter.position.set(18.3, 0.45, 0);
        sideCounter.castShadow = true;
        this.scene.add(sideCounter);
        
        // Side counter top
        const sideCounterTop = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.05, 3.1),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a3a40, 
                roughness: 0.3,
                metalness: 0.1
            })
        );
        sideCounterTop.position.set(18.3, 0.925, 0);
        this.scene.add(sideCounterTop);
        
        // Microwave on side counter
        const microwave = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3, 0.35),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a3a3a, 
                roughness: 0.4,
                metalness: 0.2
            })
        );
        microwave.position.set(18.2, 1.1, 0.5);
        this.scene.add(microwave);
        
        // Microwave door (glass)
        const microwaveDoor = new THREE.Mesh(
            new THREE.PlaneGeometry(0.35, 0.22),
            new THREE.MeshStandardMaterial({ 
                color: 0x1a1a1a, 
                roughness: 0.1,
                metalness: 0.5
            })
        );
        microwaveDoor.position.set(17.94, 1.1, 0.5);
        microwaveDoor.rotation.y = -Math.PI / 2;
        this.scene.add(microwaveDoor);
        
        // Toaster on side counter
        const toaster = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.2, 0.15),
            new THREE.MeshStandardMaterial({ 
                color: 0xcccccc, 
                roughness: 0.3,
                metalness: 0.5
            })
        );
        toaster.position.set(18.2, 1.05, -0.5);
        this.scene.add(toaster);
        
        // === TRASH CAN ===
        const trashCan = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.18, 0.5, 12),
            new THREE.MeshStandardMaterial({ 
                color: 0x4a4a4a, 
                roughness: 0.6
            })
        );
        trashCan.position.set(10.5, 0.25, -3);
        this.scene.add(trashCan);
        
        // === KITCHEN RUG ===
        const kitchenRug = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 3),
            new THREE.MeshStandardMaterial({ 
                color: 0x6a5545, 
                roughness: 0.95 
            })
        );
        kitchenRug.rotation.x = -Math.PI / 2;
        kitchenRug.position.set(14, 0.01, -3);
        this.scene.add(kitchenRug);
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
    
    createBathroom() {
        // === BATHROOM ROOM (accessed through doorway in back wall at Z = -7) ===
        // Position: Extends from Z = -7 to Z = -11, X = -2.5 to X = 0.5
        // Doorway centered at X = -1, Z = -7
        
        const bathroomMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.3,
            metalness: 0.1
        });
        
        const tileMaterial = new THREE.MeshStandardMaterial({
            color: 0xd0d5d8,
            roughness: 0.2,
            metalness: 0.05
        });
        
        // Bathroom floor (tile pattern)
        const bathroomFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({
                color: 0xc5c5c5,
                roughness: 0.25,
                metalness: 0.1
            })
        );
        bathroomFloor.rotation.x = -Math.PI / 2;
        bathroomFloor.position.set(-1, 0.01, -9);
        bathroomFloor.receiveShadow = true;
        this.scene.add(bathroomFloor);
        
        // Tile grid pattern on floor
        for (let x = -2.75; x <= 0.75; x += 0.5) {
            for (let z = -10.75; z <= -7.25; z += 0.5) {
                const tile = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.48, 0.48),
                    new THREE.MeshStandardMaterial({
                        color: (Math.floor(x * 2) + Math.floor(z * 2)) % 2 === 0 ? 0xd8d8d8 : 0xc0c0c0,
                        roughness: 0.2
                    })
                );
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(x, 0.02, z);
                this.scene.add(tile);
            }
        }
        
        // Bathroom walls (using BoxGeometry for solid walls with collision feel)
        // Back wall
        const bathroomBackWall = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 0.15),
            bathroomMaterial
        );
        bathroomBackWall.position.set(-1, 2, -11);
        bathroomBackWall.castShadow = true;
        bathroomBackWall.receiveShadow = true;
        this.scene.add(bathroomBackWall);
        
        // Left wall
        const bathroomLeftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 4, 4),
            bathroomMaterial
        );
        bathroomLeftWall.position.set(-3, 2, -9);
        bathroomLeftWall.castShadow = true;
        this.scene.add(bathroomLeftWall);
        
        // Right wall
        const bathroomRightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 4, 4),
            bathroomMaterial
        );
        bathroomRightWall.position.set(1, 2, -9);
        bathroomRightWall.castShadow = true;
        this.scene.add(bathroomRightWall);
        
        // Ceiling
        const bathroomCeiling = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9 })
        );
        bathroomCeiling.rotation.x = Math.PI / 2;
        bathroomCeiling.position.set(-1, 3.9, -9);
        this.scene.add(bathroomCeiling);
        
        // === BATHROOM FIXTURES ===
        
        // Toilet (against back wall)
        const toiletGroup = new THREE.Group();
        
        // Toilet base
        const toiletBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.4, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.1, metalness: 0.05 })
        );
        toiletBase.position.set(0, 0.2, 0);
        toiletGroup.add(toiletBase);
        
        // Toilet bowl (rounded front)
        const toiletBowl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.25, 0.15, 16),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.1 })
        );
        toiletBowl.position.set(0, 0.42, 0.1);
        toiletGroup.add(toiletBowl);
        
        // Toilet tank
        const toiletTank = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.5, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.1 })
        );
        toiletTank.position.set(0, 0.65, -0.25);
        toiletGroup.add(toiletTank);
        
        // Toilet lid
        const toiletLid = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.05, 0.35),
            new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.15 })
        );
        toiletLid.position.set(0, 0.52, 0.05);
        toiletGroup.add(toiletLid);
        
        toiletGroup.position.set(-2.3, 0, -10.2);
        toiletGroup.rotation.y = Math.PI;  // Face doorway
        this.scene.add(toiletGroup);
        
        // Sink
        const sinkGroup = new THREE.Group();
        
        // Sink pedestal
        const sinkPedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.15 })
        );
        sinkPedestal.position.set(0, 0.4, 0);
        sinkGroup.add(sinkPedestal);
        
        // Sink basin
        const sinkBasin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.25, 0.15, 16),
            new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.1 })
        );
        sinkBasin.position.set(0, 0.85, 0);
        sinkGroup.add(sinkBasin);
        
        // Faucet
        const faucet = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.8 })
        );
        faucet.position.set(0, 1.0, -0.15);
        sinkGroup.add(faucet);
        
        // Faucet spout
        const faucetSpout = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.8 })
        );
        faucetSpout.rotation.x = Math.PI / 2;
        faucetSpout.position.set(0, 1.05, -0.08);
        sinkGroup.add(faucetSpout);
        
        sinkGroup.position.set(-1, 0, -10.5);
        this.scene.add(sinkGroup);
        
        // Mirror above sink
        const mirror = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1, 0.05),
            new THREE.MeshStandardMaterial({ 
                color: 0x8899aa, 
                roughness: 0.05, 
                metalness: 0.9,
                envMapIntensity: 1.5
            })
        );
        mirror.position.set(-1, 1.8, -10.9);
        this.scene.add(mirror);
        
        // Mirror frame
        const mirrorFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.1, 0.03),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
        );
        mirrorFrame.position.set(-1, 1.8, -10.92);
        this.scene.add(mirrorFrame);
        
        // Bathtub/Shower
        const bathtubGroup = new THREE.Group();
        
        // Bathtub base
        const bathtubBase = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.5, 0.7),
            new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.15 })
        );
        bathtubBase.position.set(0, 0.25, 0);
        bathtubGroup.add(bathtubBase);
        
        // Bathtub inner (darker to show depth)
        const bathtubInner = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.4, 0.55),
            new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.1 })
        );
        bathtubInner.position.set(0, 0.3, 0);
        bathtubGroup.add(bathtubInner);
        
        // Bathtub rim
        const bathtubRim = new THREE.Mesh(
            new THREE.BoxGeometry(1.7, 0.08, 0.8),
            new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.1 })
        );
        bathtubRim.position.set(0, 0.54, 0);
        bathtubGroup.add(bathtubRim);
        
        // Shower head pole
        const showerPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.8 })
        );
        showerPole.position.set(-0.7, 1.5, 0);
        bathtubGroup.add(showerPole);
        
        // Shower head
        const showerHead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.06, 0.1, 12),
            new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.7 })
        );
        showerHead.rotation.x = Math.PI / 4;
        showerHead.position.set(-0.7, 2.4, 0.1);
        bathtubGroup.add(showerHead);
        
        // Shower curtain rod
        const curtainRod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.7 })
        );
        curtainRod.rotation.z = Math.PI / 2;
        curtainRod.position.set(0, 2.3, 0.4);
        bathtubGroup.add(curtainRod);
        
        // Shower curtain (partially drawn)
        const curtain = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 1.8),
            new THREE.MeshStandardMaterial({ 
                color: 0xddeeff, 
                roughness: 0.8,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            })
        );
        curtain.position.set(0.4, 1.4, 0.35);
        bathtubGroup.add(curtain);
        
        bathtubGroup.position.set(0.3, 0, -9);
        bathtubGroup.rotation.y = 0;  // Along the wall
        this.scene.add(bathtubGroup);
        
        // Towel rack (on left wall)
        const towelRack = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.7 })
        );
        towelRack.rotation.z = Math.PI / 2;
        towelRack.position.set(-2.8, 1.2, -8);
        this.scene.add(towelRack);
        
        // Towel on rack
        const towel = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.8, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x446688, roughness: 0.9 })
        );
        towel.position.set(-2.8, 0.85, -8);
        this.scene.add(towel);
        
        // Toilet paper holder
        const tpHolder = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.6 })
        );
        tpHolder.position.set(-2.8, 0.8, -10);
        this.scene.add(tpHolder);
        
        // Toilet paper roll
        const tpRoll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
        );
        tpRoll.rotation.z = Math.PI / 2;
        tpRoll.position.set(-2.8, 0.8, -9.85);
        this.scene.add(tpRoll);
        
        // Small trash bin
        const trashBin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.1, 0.3, 12),
            new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.7 })
        );
        trashBin.position.set(-2, 0.15, -10.5);
        this.scene.add(trashBin);
        
        // Bath mat (in front of bathtub)
        const bathMat = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.02, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x557766, roughness: 0.95 })
        );
        bathMat.position.set(-0.5, 0.01, -8);
        this.scene.add(bathMat);
        
        // Bathroom light
        const bathroomLight = new THREE.PointLight(0xffffff, 2.0, 10, 1.5);
        bathroomLight.position.set(-1, 3.5, -9);
        bathroomLight.castShadow = true;
        this.scene.add(bathroomLight);
        this.bathroomLight = bathroomLight;
        
        // Light fixture
        const lightFixture = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0xffffee, emissiveIntensity: 0.3 })
        );
        lightFixture.position.set(-1, 3.85, -9);
        this.scene.add(lightFixture);
        
        // Small window (frosted)
        const bathroomWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.6),
            new THREE.MeshStandardMaterial({ 
                color: 0xccddee, 
                roughness: 0.6,
                transparent: true,
                opacity: 0.7
            })
        );
        bathroomWindow.position.set(-3.93, 2.2, -8);
        bathroomWindow.rotation.y = Math.PI / 2;
        this.scene.add(bathroomWindow);
        
        // Window frame
        const windowFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.7, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 })
        );
        windowFrame.position.set(-3.95, 2.2, -8);
        this.scene.add(windowFrame);
    }
    
    createInteractables() {
        // Exit door (main room - front)
        const exitDoor = new InteractableObject({
            name: 'Exit Door',
            description: 'The door leading outside. It\'s daylight - should be safe.',
            position: new THREE.Vector3(0, 1.5, 6.5),
            size: new THREE.Vector3(1.2, 2.5, 0.3),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "It's bright outside. The Light shouldn't be active during the day...",
                    choices: [
                        { text: "Go outside", action: () => { game.sceneManager.loadScene('exterior'); } },
                        { text: "Stay inside for now", action: () => {} }
                    ]
                });
            }
        });
        this.interactables.push(exitDoor);
        this.scene.add(exitDoor.mesh);
        
        // Alarm clock interaction (bedroom area)
        const alarmClockInteract = new InteractableObject({
            name: 'Alarm Clock',
            description: 'A digital alarm clock showing 7:00 AM',
            position: new THREE.Vector3(-3.3, 0.6, 3.5),
            size: new THREE.Vector3(0.3, 0.2, 0.2),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "7 AM... Time to get up."
                });
            }
        });
        this.interactables.push(alarmClockInteract);
        this.scene.add(alarmClockInteract.mesh);
        
        // Coffee maker (now in kitchen room)
        const coffeeMakerInteract = new InteractableObject({
            name: 'Coffee Maker',
            description: 'Tanner\'s coffee maker. Smells like fresh brew.',
            position: new THREE.Vector3(11.5, 1.1, -4.2),
            size: new THREE.Vector3(0.4, 0.5, 0.3),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Coffee... That might help with this headache."
                });
            }
        });
        this.interactables.push(coffeeMakerInteract);
        this.scene.add(coffeeMakerInteract.mesh);
        
        // Refrigerator (kitchen room)
        const fridgeInteract = new InteractableObject({
            name: 'Refrigerator',
            description: 'A well-stocked fridge. Tanner always keeps supplies.',
            position: new THREE.Vector3(18, 1.1, -3.5),
            size: new THREE.Vector3(0.8, 2, 0.8),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Some water and leftovers... Tanner's been keeping this place stocked."
                });
            }
        });
        this.interactables.push(fridgeInteract);
        this.scene.add(fridgeInteract.mesh);
        
        // Stove (kitchen room)
        const stoveInteract = new InteractableObject({
            name: 'Stove',
            description: 'A gas stove. Still works, thankfully.',
            position: new THREE.Vector3(15.5, 1, -4.3),
            size: new THREE.Vector3(0.8, 0.9, 0.6),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "The gas still works. One of the few things that still does in this world."
                });
            }
        });
        this.interactables.push(stoveInteract);
        this.scene.add(stoveInteract.mesh);
        
        // Kitchen window
        const kitchenWindowInteract = new InteractableObject({
            name: 'Kitchen Window',
            description: 'A window in the kitchen with a view outside.',
            position: new THREE.Vector3(18.5, 2, 0),
            size: new THREE.Vector3(0.3, 1.5, 2),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "The neighborhood looks quiet. During the day, it almost feels... normal."
                });
            }
        });
        this.interactables.push(kitchenWindowInteract);
        this.scene.add(kitchenWindowInteract.mesh);
        
        // Bookshelf (living room)
        const bookshelf = new InteractableObject({
            name: 'Bookshelf',
            description: 'Tanner\'s collection of survival guides and old novels.',
            position: new THREE.Vector3(6, 1, -5),
            size: new THREE.Vector3(1.5, 2, 0.4),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Tanner always liked to be prepared. These survival books have come in handy."
                });
            }
        });
        this.interactables.push(bookshelf);
        this.scene.add(bookshelf.mesh);
        
        // Window (main room)
        const window1 = new InteractableObject({
            name: 'Window',
            description: 'A window overlooking the outside. Warm daylight streams through.',
            position: new THREE.Vector3(-8, 2, 0),
            size: new THREE.Vector3(0.3, 1.5, 2),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "The sun is up. It's safe to go out during the day... The Light only comes at night."
                });
            }
        });
        this.interactables.push(window1);
        this.scene.add(window1.mesh);
        
        // Kitchen table
        const kitchenTableInteract = new InteractableObject({
            name: 'Kitchen Table',
            description: 'A sturdy dining table where Tanner and Adrian share meals.',
            position: new THREE.Vector3(14, 0.9, 1),
            size: new THREE.Vector3(2, 0.8, 1.5),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "We've shared a lot of meals at this table. Tanner's been a good friend through all this."
                });
            }
        });
        this.interactables.push(kitchenTableInteract);
        this.scene.add(kitchenTableInteract.mesh);
        
        // Medicine bottle in kitchen cabinet
        const medicineBottle = new InteractableObject({
            name: 'Medicine Cabinet',
            description: 'A small cabinet above the counter.',
            position: new THREE.Vector3(16, 2, 3),
            size: new THREE.Vector3(0.8, 0.6, 0.4),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                if (game.storyState.hasMedicine) {
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "I already took some medicine. Hopefully the headache goes away soon."
                    });
                } else if (game.storyState.hasHeadache) {
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "Found some painkillers. This should help with the headache.",
                        onComplete: () => {
                            game.storyState.hasMedicine = true;
                            // Show follow-up dialogue about Luis
                            setTimeout(() => {
                                game.dialogueSystem.showDialogue({
                                    speaker: 'Adrian',
                                    text: "Now I need to find Luis. Tanner said he's at the convoy shelter... I should head out once I'm ready."
                                });
                            }, 500);
                        }
                    });
                } else {
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "Some old medicine bottles. Nothing I need right now."
                    });
                }
            }
        });
        this.interactables.push(medicineBottle);
        this.scene.add(medicineBottle.mesh);
        
        // === LIVING ROOM INTERACTABLES ===
        
        // Couch
        const couchInteract = new InteractableObject({
            name: 'Couch',
            description: 'A comfortable couch. Looks inviting.',
            position: new THREE.Vector3(0, 0.6, -5),
            size: new THREE.Vector3(3, 1, 1),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "This couch has seen better days, but it's still comfortable. Sometimes I just sit here and think about... everything that's happened."
                });
            }
        });
        this.interactables.push(couchInteract);
        this.scene.add(couchInteract.mesh);
        
        // TV
        const tvInteract = new InteractableObject({
            name: 'TV',
            description: 'An old television. The screen is dark.',
            position: new THREE.Vector3(0, 1.1, -6.4),
            size: new THREE.Vector3(1.5, 1, 0.3),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "The TV doesn't work anymore. Not like there's anything to watch anyway... all the stations went dark months ago."
                });
            }
        });
        this.interactables.push(tvInteract);
        this.scene.add(tvInteract.mesh);
        
        // Coffee mug on table
        const coffeeMugInteract = new InteractableObject({
            name: 'Coffee Mug',
            description: 'A warm mug of coffee. Steam rises gently.',
            position: new THREE.Vector3(0.3, 0.5, -3.0),
            size: new THREE.Vector3(0.15, 0.15, 0.15),
            interactionRadius: 1.8,
            invisible: true,
            onInteract: (game) => {
                if (!this.game.storyState?.hadCoffee) {
                    if (this.game.storyState) this.game.storyState.hadCoffee = true;
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "*Takes a sip* ...That's good. The warmth helps. Feels almost normal for a moment."
                    });
                } else {
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "The mug is empty now. But I feel a little better."
                    });
                }
            }
        });
        this.interactables.push(coffeeMugInteract);
        this.scene.add(coffeeMugInteract.mesh);
        
        // Coffee table
        const coffeeTableInteract = new InteractableObject({
            name: 'Coffee Table',
            description: 'A wooden coffee table with various items.',
            position: new THREE.Vector3(0, 0.4, -3.2),
            size: new THREE.Vector3(1.2, 0.5, 0.8),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Some magazines, a remote that doesn't work anymore, and my coffee. The little things that remind me of normal life."
                });
            }
        });
        this.interactables.push(coffeeTableInteract);
        this.scene.add(coffeeTableInteract.mesh);
        
        // Armchair
        const armchairInteract = new InteractableObject({
            name: 'Armchair',
            description: 'A comfortable armchair by the window.',
            position: new THREE.Vector3(3, 0.5, -3.5),
            size: new THREE.Vector3(1, 1, 1),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Tanner's favorite spot. He likes to read here when the light is good."
                });
            }
        });
        this.interactables.push(armchairInteract);
        this.scene.add(armchairInteract.mesh);
        
        // Potted plant
        const plantInteract = new InteractableObject({
            name: 'Potted Plant',
            description: 'A healthy-looking houseplant.',
            position: new THREE.Vector3(-3.5, 0.4, -5.5),
            size: new THREE.Vector3(0.5, 1, 0.5),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Somehow this plant is still alive. Tanner waters it every day. Says it reminds him that life goes on."
                });
            }
        });
        this.interactables.push(plantInteract);
        this.scene.add(plantInteract.mesh);
        
        // === BATHROOM INTERACTABLES ===
        
        // Mirror
        const mirrorInteract = new InteractableObject({
            name: 'Mirror',
            description: 'A bathroom mirror. Your reflection stares back.',
            position: new THREE.Vector3(-1, 1.8, -10.5),
            size: new THREE.Vector3(0.8, 1, 0.3),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "I look tired. The bags under my eyes are getting worse... When was the last time I really slept?"
                });
            }
        });
        this.interactables.push(mirrorInteract);
        this.scene.add(mirrorInteract.mesh);
        
        // Sink
        const sinkInteract = new InteractableObject({
            name: 'Sink',
            description: 'A porcelain sink. The water still runs.',
            position: new THREE.Vector3(-1, 0.9, -10.5),
            size: new THREE.Vector3(0.6, 0.5, 0.4),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                if (this.hasWashedFace) {
                    // Already washed face
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "I've already washed my face. The cold water helped, but my head still hurts..."
                    });
                } else {
                    // Offer to wash face
                    game.dialogueSystem.showDialogue({
                        speaker: 'Adrian',
                        text: "The water is still running... Maybe splashing some cold water on my face will help me wake up.",
                        choices: [
                            {
                                text: "Wash your face",
                                action: () => {
                                    this.triggerFaceWashSequence(game);
                                }
                            },
                            {
                                text: "Not right now",
                                action: () => {}
                            }
                        ]
                    });
                }
            }
        });
        this.interactables.push(sinkInteract);
        this.scene.add(sinkInteract.mesh);
        
        // Bathtub/Shower
        const showerInteract = new InteractableObject({
            name: 'Shower',
            description: 'A bathtub with a shower. Looks clean.',
            position: new THREE.Vector3(0.3, 0.8, -9),
            size: new THREE.Vector3(1.8, 1, 0.8),
            interactionRadius: 2.5,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "A hot shower would be nice... but I don't want to waste the water. We never know when the supply will cut out."
                });
            }
        });
        this.interactables.push(showerInteract);
        this.scene.add(showerInteract.mesh);
        
        // Toilet
        const toiletInteract = new InteractableObject({
            name: 'Toilet',
            description: 'A standard toilet. Nothing special.',
            position: new THREE.Vector3(-2.3, 0.5, -10.2),
            size: new THREE.Vector3(0.5, 0.7, 0.6),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "At least the plumbing still works. Small mercies."
                });
            }
        });
        this.interactables.push(toiletInteract);
        this.scene.add(toiletInteract.mesh);
        
        // Towel
        const towelInteract = new InteractableObject({
            name: 'Towel',
            description: 'A blue towel hanging on the rack.',
            position: new THREE.Vector3(-2.8, 1, -8),
            size: new THREE.Vector3(0.5, 0.8, 0.2),
            interactionRadius: 2,
            invisible: true,
            onInteract: (game) => {
                game.dialogueSystem.showDialogue({
                    speaker: 'Adrian',
                    text: "Tanner's towel. He always did like blue."
                });
            }
        });
        this.interactables.push(towelInteract);
        this.scene.add(towelInteract.mesh);
    }
    
    createAtmosphericEffects() {
        // === MAIN DUST PARTICLES ===
        const dustCount = 400;
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustCount * 3);
        const dustSizes = new Float32Array(dustCount);
        
        for (let i = 0; i < dustCount; i++) {
            // Spread across both rooms (main room and kitchen)
            dustPositions[i * 3] = (Math.random() * 28) - 8;
            dustPositions[i * 3 + 1] = Math.random() * 4;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
            dustSizes[i] = 0.015 + Math.random() * 0.025; // Variable sizes
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            color: 0xffeedd,
            size: 0.03,
            transparent: true,
            opacity: 0.35,
            sizeAttenuation: true
        });
        
        this.dustParticles = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(this.dustParticles);
        this.dustOriginalPositions = dustPositions.slice();
        
        // === SUNBEAM DUST (near windows - denser, brighter) ===
        const sunbeamDustCount = 150;
        const sunbeamDustGeometry = new THREE.BufferGeometry();
        const sunbeamDustPositions = new Float32Array(sunbeamDustCount * 3);
        
        for (let i = 0; i < sunbeamDustCount; i++) {
            // Concentrated near the main window
            sunbeamDustPositions[i * 3] = -7 + Math.random() * 3;
            sunbeamDustPositions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
            sunbeamDustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        
        sunbeamDustGeometry.setAttribute('position', new THREE.BufferAttribute(sunbeamDustPositions, 3));
        
        const sunbeamDustMaterial = new THREE.PointsMaterial({
            color: 0xffffee,
            size: 0.04,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        this.sunbeamDustParticles = new THREE.Points(sunbeamDustGeometry, sunbeamDustMaterial);
        this.scene.add(this.sunbeamDustParticles);
        this.sunbeamDustOriginalPositions = sunbeamDustPositions.slice();
        
        // === KITCHEN DUST ===
        const kitchenDustCount = 100;
        const kitchenDustGeometry = new THREE.BufferGeometry();
        const kitchenDustPositions = new Float32Array(kitchenDustCount * 3);
        
        for (let i = 0; i < kitchenDustCount; i++) {
            kitchenDustPositions[i * 3] = 16 + Math.random() * 4;
            kitchenDustPositions[i * 3 + 1] = 1 + Math.random() * 3;
            kitchenDustPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        
        kitchenDustGeometry.setAttribute('position', new THREE.BufferAttribute(kitchenDustPositions, 3));
        
        const kitchenDustMaterial = new THREE.PointsMaterial({
            color: 0xffffee,
            size: 0.025,
            transparent: true,
            opacity: 0.45,
            sizeAttenuation: true
        });
        
        this.kitchenDustParticles = new THREE.Points(kitchenDustGeometry, kitchenDustMaterial);
        this.scene.add(this.kitchenDustParticles);
        this.kitchenDustOriginalPositions = kitchenDustPositions.slice();
        
        // === LIGHT RAYS (volumetric light effect near windows) ===
        this.createLightRays();
        
        // === AMBIENT PARTICLES (very subtle floating specks) ===
        this.createAmbientParticles();
    }
    
    createLightRays() {
        // Create volumetric light cone from main window
        const rayMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        // Main window light ray
        const rayGeometry = new THREE.ConeGeometry(3, 8, 8, 1, true);
        const lightRay = new THREE.Mesh(rayGeometry, rayMaterial);
        lightRay.position.set(-5, 2, 0);
        lightRay.rotation.z = Math.PI / 2;
        lightRay.rotation.y = Math.PI / 6;
        this.scene.add(lightRay);
        this.mainLightRay = lightRay;
        
        // Secondary light ray from back window
        const ray2Geometry = new THREE.ConeGeometry(2, 6, 6, 1, true);
        const lightRay2 = new THREE.Mesh(ray2Geometry, rayMaterial.clone());
        lightRay2.material.opacity = 0.05;
        lightRay2.position.set(0, 2, -4);
        lightRay2.rotation.x = Math.PI / 2;
        this.scene.add(lightRay2);
        this.secondaryLightRay = lightRay2;
        
        // Kitchen window light ray
        const ray3Geometry = new THREE.ConeGeometry(2, 5, 6, 1, true);
        const lightRay3 = new THREE.Mesh(ray3Geometry, rayMaterial.clone());
        lightRay3.material.opacity = 0.06;
        lightRay3.position.set(16, 2, 0);
        lightRay3.rotation.z = -Math.PI / 2;
        this.scene.add(lightRay3);
        this.kitchenLightRay = lightRay3;
    }
    
    createAmbientParticles() {
        // Very fine ambient particles throughout the house
        const ambientCount = 200;
        const ambientGeometry = new THREE.BufferGeometry();
        const ambientPositions = new Float32Array(ambientCount * 3);
        
        for (let i = 0; i < ambientCount; i++) {
            ambientPositions[i * 3] = (Math.random() * 30) - 10;
            ambientPositions[i * 3 + 1] = 0.5 + Math.random() * 4;
            ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
        }
        
        ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
        
        const ambientMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.015,
            transparent: true,
            opacity: 0.2,
            sizeAttenuation: true
        });
        
        this.ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
        this.scene.add(this.ambientParticles);
        this.ambientOriginalPositions = ambientPositions.slice();
    }
    
    triggerFaceWashSequence(game) {
        // Mark as washed
        this.hasWashedFace = true;
        if (game.storyState) {
            game.storyState.hasWashedFace = true;
            game.storyState.needsMedicine = true;
        }
        this.needsMedicine = true;
        
        // End any current dialogue
        game.dialogueSystem.endDialogue();
        
        // Play face wash animation
        const faceWashAnim = new FaceWashAnimation(game.audioManager, () => {
            // After animation, spawn Tanner in kitchen if not already there
            if (!this.hasTalkedToTanner) {
                this.spawnTanner();
            }
            
            // Show objective hint
            game.uiManager.showNotification('Find medicine for the headache', 'objective', 5000);
        });
        
        faceWashAnim.start();
    }
    
    spawnTanner() {
        // Create Tanner NPC in the kitchen
        const tanner = new NPCEntity({
            name: 'Tanner',
            position: new THREE.Vector3(14, 0, 0),
            color: 0x6b5b4f,
            accentColor: 0x8b7355,
            height: 1.8,
            dialogues: {
                'greeting': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "Hey, you're up! Heard you stumbling around. You look like hell, Adrian.",
                    responses: [
                        {
                            text: "My head is killing me...",
                            next: 'headache'
                        },
                        {
                            text: "Where are we? What happened?",
                            next: 'location'
                        }
                    ]
                },
                'headache': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "Yeah, I figured. Here, take this. *hands over medicine bottle* Should help with that. You've been out for a while.",
                    responses: [
                        {
                            text: "Thanks... How long was I out?",
                            next: 'howlong'
                        },
                        {
                            text: "Where's Luis?",
                            next: 'luis'
                        }
                    ]
                },
                'location': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "My place. You and Luis showed up a few days ago, remember? You were in bad shape. Kept mumbling about The Light.",
                    responses: [
                        {
                            text: "The Light... I remember falling.",
                            next: 'falling'
                        },
                        {
                            text: "Where's Luis now?",
                            next: 'luis'
                        }
                    ]
                },
                'howlong': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "About three days. You had a fever, nightmares... kept calling out for Luis. Whatever you saw out there really messed you up.",
                    responses: [
                        {
                            text: "Where's Luis?",
                            next: 'luis'
                        }
                    ]
                },
                'falling': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "Falling? You didn't fall, Adrian. Luis carried you here. Said you collapsed near the old plaza. Don't remember that?",
                    responses: [
                        {
                            text: "I... I thought I jumped.",
                            next: 'jumped'
                        },
                        {
                            text: "Where's Luis now?",
                            next: 'luis'
                        }
                    ]
                },
                'jumped': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "...Jumped? Adrian, you need to take it easy. The headaches, the nightmares... The Light does that to people. Luis is worried about you.",
                    responses: [
                        {
                            text: "I need to see him.",
                            next: 'luis'
                        }
                    ]
                },
                'luis': {
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "He's at the convoy shelter, helping set up medical supplies. He didn't want to leave you, but... well, you know Luis. Always trying to help everyone.",
                    responses: [
                        {
                            text: "I should go find him.",
                            action: (game) => {
                                this.hasTalkedToTanner = true;
                                this.hasMedicine = true;
                                if (game.storyState) {
                                    game.storyState.hasTalkedToTanner = true;
                                    game.storyState.hasMedicine = true;
                                }
                                game.dialogueSystem.showDialogue({
                                    speaker: 'Tanner',
                                    speakerColor: '#c4a574',
                                    text: "Take it easy out there. And Adrian... keep an eye on him. He's been acting strange since... well, since The Light touched him. Something changed."
                                });
                            }
                        }
                    ]
                }
            }
        });
        
        tanner.onInteract = (game) => {
            if (!this.hasTalkedToTanner) {
                game.dialogueSystem.startDialogue(tanner, tanner.getDialogue('greeting'));
            } else {
                game.dialogueSystem.showDialogue({
                    speaker: 'Tanner',
                    speakerColor: '#c4a574',
                    text: "Luis is at the convoy shelter. Be careful out there."
                });
            }
        };
        
        tanner.addToScene(this.scene);
        this.npcs.push(tanner);
    }
    
    update(deltaTime) {
        const time = Date.now() * 0.0005;
        const slowTime = Date.now() * 0.0002;
        
        // === ANIMATE MAIN DUST PARTICLES ===
        if (this.dustParticles && this.dustOriginalPositions) {
            const positions = this.dustParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Gentle floating motion with varying speeds
                const offset = i * 0.1;
                positions[i] = this.dustOriginalPositions[i] + Math.sin(time + offset) * 0.025;
                positions[i + 1] = this.dustOriginalPositions[i + 1] + Math.sin(time * 0.6 + offset) * 0.018;
                positions[i + 2] = this.dustOriginalPositions[i + 2] + Math.cos(time * 0.4 + offset) * 0.022;
            }
            
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // === ANIMATE SUNBEAM DUST (more active in light) ===
        if (this.sunbeamDustParticles && this.sunbeamDustOriginalPositions) {
            const positions = this.sunbeamDustParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const offset = i * 0.15;
                // More active swirling in sunbeams
                positions[i] = this.sunbeamDustOriginalPositions[i] + Math.sin(time * 1.2 + offset) * 0.035;
                positions[i + 1] = this.sunbeamDustOriginalPositions[i + 1] + Math.sin(time * 0.8 + offset) * 0.025;
                positions[i + 2] = this.sunbeamDustOriginalPositions[i + 2] + Math.cos(time * 0.6 + offset) * 0.03;
            }
            
            this.sunbeamDustParticles.geometry.attributes.position.needsUpdate = true;
            
            // Pulse opacity slightly
            this.sunbeamDustParticles.material.opacity = 0.5 + Math.sin(slowTime * 3) * 0.1;
        }
        
        // === ANIMATE KITCHEN DUST ===
        if (this.kitchenDustParticles && this.kitchenDustOriginalPositions) {
            const positions = this.kitchenDustParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const offset = i * 0.12;
                positions[i] = this.kitchenDustOriginalPositions[i] + Math.sin(time * 0.8 + offset) * 0.028;
                positions[i + 1] = this.kitchenDustOriginalPositions[i + 1] + Math.sin(time * 0.5 + offset) * 0.02;
                positions[i + 2] = this.kitchenDustOriginalPositions[i + 2] + Math.cos(time * 0.35 + offset) * 0.025;
            }
            
            this.kitchenDustParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // === ANIMATE AMBIENT PARTICLES (very slow drift) ===
        if (this.ambientParticles && this.ambientOriginalPositions) {
            const positions = this.ambientParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const offset = i * 0.08;
                positions[i] = this.ambientOriginalPositions[i] + Math.sin(slowTime + offset) * 0.04;
                positions[i + 1] = this.ambientOriginalPositions[i + 1] + Math.sin(slowTime * 0.7 + offset) * 0.03;
                positions[i + 2] = this.ambientOriginalPositions[i + 2] + Math.cos(slowTime * 0.5 + offset) * 0.035;
            }
            
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // === ANIMATE LIGHT RAYS (subtle pulsing) ===
        if (this.mainLightRay) {
            this.mainLightRay.material.opacity = 0.07 + Math.sin(slowTime * 2) * 0.015;
            this.mainLightRay.rotation.y = Math.PI / 6 + Math.sin(slowTime) * 0.02;
        }
        
        if (this.secondaryLightRay) {
            this.secondaryLightRay.material.opacity = 0.04 + Math.sin(slowTime * 2.5 + 1) * 0.01;
        }
        
        if (this.kitchenLightRay) {
            this.kitchenLightRay.material.opacity = 0.05 + Math.sin(slowTime * 2.2 + 2) * 0.012;
        }
        
        // === SUBTLE LIGHT FLICKERING (very minimal for safe, stable feeling) ===
        if (this.ceilingLight) {
            // Very subtle variation - almost imperceptible
            this.ceilingLight.intensity = 3.0 + Math.sin(time * 2) * 0.03;
        }
        
        if (this.bedroomLamp) {
            this.bedroomLamp.intensity = 2.5 + Math.sin(time * 2.5 + 1) * 0.025;
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
