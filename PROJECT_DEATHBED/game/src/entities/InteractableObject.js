/**
 * PROJECT DEATHBED - Interactable Object
 * Enhanced base class for objects the player can interact with
 */

import * as THREE from 'three';

export class InteractableObject {
    constructor(options) {
        this.name = options.name || 'Object';
        this.description = options.description || '';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || 0;
        this.size = options.size || new THREE.Vector3(0.5, 0.5, 0.5);
        this.color = options.color || 0x888888;
        this.accentColor = options.accentColor || 0xaaaaaa;
        this.interactionType = options.interactionType || 'examine'; // examine, use, pickup
        this.onInteract = options.onInteract || (() => {});
        this.isInteractable = true;
        this.interactionRadius = options.interactionRadius || 2.5;
        this.invisible = options.invisible || false;
        this.objectType = options.objectType || 'generic'; // Used for specialized models
        this.hasGlow = options.hasGlow || false;
        this.glowColor = options.glowColor || 0xc9a227;
        
        // Animation state
        this.animationPhase = Math.random() * Math.PI * 2;
        this.floatAmount = options.floatAmount || 0;
        this.bobSpeed = options.bobSpeed || 1;
        
        // Create the visual mesh
        this.createMesh();
        
        // Highlight state
        this.isHighlighted = false;
        this.originalEmissive = 0x000000;
    }
    
    createMesh() {
        this.group = new THREE.Group();
        
        // Create specialized models based on object type
        switch (this.objectType) {
            case 'photograph':
                this.createPhotograph();
                break;
            case 'window':
                this.createWindow();
                break;
            case 'bed':
                this.createBed();
                break;
            case 'door':
                this.createDoor();
                break;
            case 'ledge':
                this.createLedge();
                break;
            case 'tv':
                this.createTV();
                break;
            case 'book':
                this.createBook();
                break;
            case 'lamp':
                this.createLamp();
                break;
            case 'chair':
                this.createChair();
                break;
            case 'table':
                this.createTable();
                break;
            case 'phone':
                this.createPhone();
                break;
            case 'medicine':
                this.createMedicine();
                break;
            case 'workbench':
                this.createWorkbench();
                break;
            case 'vehicle':
                this.createVehicle();
                break;
            case 'crate':
                this.createCrate();
                break;
            case 'barrel':
                this.createBarrel();
                break;
            default:
                this.createGenericObject();
        }
        
        this.group.position.copy(this.position);
        this.group.rotation.y = this.rotation;
        
        // Add glow effect if enabled
        if (this.hasGlow) {
            this.addGlowEffect();
        }
        
        // Use group as main mesh for raycasting
        this.mesh = this.group;
        this.mesh.userData.interactable = this;
    }
    
    createGenericObject() {
        // Enhanced generic object with bevel and detail
        const mainGeometry = new THREE.BoxGeometry(
            this.size.x * 0.9, 
            this.size.y * 0.9, 
            this.size.z * 0.9
        );
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.6,
            metalness: 0.15,
            transparent: this.invisible,
            opacity: this.invisible ? 0 : 1
        });
        
        const mainMesh = new THREE.Mesh(mainGeometry, material);
        mainMesh.castShadow = !this.invisible;
        mainMesh.receiveShadow = !this.invisible;
        this.group.add(mainMesh);
        this.mainMesh = mainMesh;
        
        // Add edge highlights
        if (!this.invisible) {
            const edgeGeometry = new THREE.EdgesGeometry(mainGeometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ 
                color: this.accentColor, 
                transparent: true, 
                opacity: 0.3 
            });
            const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            this.group.add(edges);
        }
    }
    
    createPhotograph() {
        // Frame
        const frameGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.03);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a2a1a,
            roughness: 0.7,
            metalness: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        this.group.add(frame);
        this.mainMesh = frame;
        
        // Photo surface
        const photoGeometry = new THREE.PlaneGeometry(0.2, 0.25);
        const photoMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a7a6a,
            roughness: 0.95,
            metalness: 0
        });
        const photo = new THREE.Mesh(photoGeometry, photoMaterial);
        photo.position.z = 0.016;
        this.group.add(photo);
        
        // Inner border
        const borderGeometry = new THREE.BoxGeometry(0.22, 0.27, 0.032);
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5dc,
            roughness: 0.8
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = 0.001;
        this.group.add(border);
    }
    
    createWindow() {
        // Window frame
        const frameGroup = new THREE.Group();
        
        // Outer frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a50,
            roughness: 0.6,
            metalness: 0.3
        });
        
        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 0.1, 0.15),
            frameMaterial
        );
        frameTop.position.y = this.size.y / 2;
        frameGroup.add(frameTop);
        
        const frameBottom = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 0.1, 0.15),
            frameMaterial
        );
        frameBottom.position.y = -this.size.y / 2;
        frameGroup.add(frameBottom);
        
        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, this.size.y, 0.15),
            frameMaterial
        );
        frameLeft.position.x = -this.size.x / 2;
        frameGroup.add(frameLeft);
        
        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, this.size.y, 0.15),
            frameMaterial
        );
        frameRight.position.x = this.size.x / 2;
        frameGroup.add(frameRight);
        
        // Glass
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.3
        });
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(this.size.x - 0.15, this.size.y - 0.15),
            glassMaterial
        );
        frameGroup.add(glass);
        
        // Cross bars
        const barH = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x - 0.1, 0.04, 0.05),
            frameMaterial
        );
        frameGroup.add(barH);
        
        const barV = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, this.size.y - 0.1, 0.05),
            frameMaterial
        );
        frameGroup.add(barV);
        
        this.group.add(frameGroup);
        this.mainMesh = frameGroup;
    }
    
    createBed() {
        // Bed frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8
        });
        
        // Base
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 0.3, this.size.z),
            frameMaterial
        );
        base.position.y = 0.15;
        base.castShadow = true;
        this.group.add(base);
        
        // Headboard
        const headboard = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 0.6, 0.1),
            frameMaterial
        );
        headboard.position.set(0, 0.5, -this.size.z / 2 + 0.05);
        headboard.castShadow = true;
        this.group.add(headboard);
        
        // Mattress
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a8a7a,
            roughness: 0.9
        });
        const mattress = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x - 0.1, 0.15, this.size.z - 0.15),
            mattressMaterial
        );
        mattress.position.y = 0.38;
        mattress.castShadow = true;
        this.group.add(mattress);
        this.mainMesh = mattress;
        
        // Pillow
        const pillowMaterial = new THREE.MeshStandardMaterial({
            color: 0xc5c5b5,
            roughness: 0.95
        });
        const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.1, 0.25),
            pillowMaterial
        );
        pillow.position.set(0, 0.5, -this.size.z / 2 + 0.25);
        this.group.add(pillow);
        
        // Blanket
        const blanketMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.95
        });
        const blanket = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x - 0.15, 0.08, this.size.z * 0.6),
            blanketMaterial
        );
        blanket.position.set(0, 0.5, this.size.z / 4);
        this.group.add(blanket);
    }
    
    createDoor() {
        // Door frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.7
        });
        
        // Door panel
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.6,
            metalness: 0.1
        });
        
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y, 0.08),
            doorMaterial
        );
        door.castShadow = true;
        this.group.add(door);
        this.mainMesh = door;
        
        // Door panels (inset details)
        const panelGeometry = new THREE.BoxGeometry(this.size.x * 0.7, this.size.y * 0.35, 0.02);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.5
        });
        
        const topPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        topPanel.position.set(0, this.size.y * 0.25, 0.05);
        this.group.add(topPanel);
        
        const bottomPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        bottomPanel.position.set(0, -this.size.y * 0.2, 0.05);
        this.group.add(bottomPanel);
        
        // Door handle
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9a227,
            roughness: 0.3,
            metalness: 0.8
        });
        
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.1, 12),
            handleMaterial
        );
        handle.rotation.x = Math.PI / 2;
        handle.position.set(this.size.x / 2 - 0.1, 0, 0.06);
        this.group.add(handle);
    }
    
    createLedge() {
        // Concrete ledge
        const ledgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a60,
            roughness: 0.9,
            metalness: 0.05
        });
        
        const ledge = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z),
            ledgeMaterial
        );
        ledge.castShadow = true;
        ledge.receiveShadow = true;
        this.group.add(ledge);
        this.mainMesh = ledge;
        
        // Edge detail
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a50,
            roughness: 0.8
        });
        const edge = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x + 0.05, 0.03, this.size.z + 0.05),
            edgeMaterial
        );
        edge.position.y = this.size.y / 2;
        this.group.add(edge);
    }
    
    createTV() {
        // TV body
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.3
        });
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y, 0.1),
            bodyMaterial
        );
        body.castShadow = true;
        this.group.add(body);
        this.mainMesh = body;
        
        // Screen
        const screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a12,
            roughness: 0.1,
            metalness: 0.8,
            emissive: new THREE.Color(0x0a0a15),
            emissiveIntensity: 0.1
        });
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(this.size.x - 0.1, this.size.y - 0.08),
            screenMaterial
        );
        screen.position.z = 0.051;
        this.group.add(screen);
        
        // Stand
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.5,
            metalness: 0.4
        });
        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x * 0.3, 0.05, 0.15),
            standMaterial
        );
        stand.position.y = -this.size.y / 2 - 0.025;
        this.group.add(stand);
    }
    
    createBook() {
        // Book cover
        const coverMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.8
        });
        
        const cover = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.22, 0.03),
            coverMaterial
        );
        cover.castShadow = true;
        this.group.add(cover);
        this.mainMesh = cover;
        
        // Pages
        const pageMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5dc,
            roughness: 0.95
        });
        const pages = new THREE.Mesh(
            new THREE.BoxGeometry(0.13, 0.2, 0.025),
            pageMaterial
        );
        pages.position.z = -0.001;
        pages.position.x = 0.005;
        this.group.add(pages);
        
        // Spine
        const spineMaterial = new THREE.MeshStandardMaterial({
            color: this.accentColor,
            roughness: 0.6
        });
        const spine = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.22, 0.032),
            spineMaterial
        );
        spine.position.x = -0.075;
        this.group.add(spine);
    }
    
    createLamp() {
        // Base
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.6,
            metalness: 0.4
        });
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.03, 16),
            baseMaterial
        );
        this.group.add(base);
        
        // Stem
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.02, 0.3, 12),
            baseMaterial
        );
        stem.position.y = 0.16;
        this.group.add(stem);
        
        // Shade
        const shadeMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.85,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const shade = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.15, 16, 1, true),
            shadeMaterial
        );
        shade.position.y = 0.38;
        shade.rotation.x = Math.PI;
        this.group.add(shade);
        this.mainMesh = shade;
        
        // Light bulb glow
        if (this.hasGlow) {
            const bulbMaterial = new THREE.MeshBasicMaterial({
                color: 0xffcc66,
                transparent: true,
                opacity: 0.8
            });
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 12, 12),
                bulbMaterial
            );
            bulb.position.y = 0.32;
            this.group.add(bulb);
        }
    }
    
    createChair() {
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7
        });
        
        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.04, 0.4),
            woodMaterial
        );
        seat.position.y = 0.45;
        seat.castShadow = true;
        this.group.add(seat);
        this.mainMesh = seat;
        
        // Back
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.4, 0.04),
            woodMaterial
        );
        back.position.set(0, 0.7, -0.18);
        back.castShadow = true;
        this.group.add(back);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.04, 0.45, 0.04);
        const legPositions = [
            [-0.16, 0.22, 0.16],
            [0.16, 0.22, 0.16],
            [-0.16, 0.22, -0.16],
            [0.16, 0.22, -0.16]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
    }
    
    createTable() {
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.65
        });
        
        // Tabletop
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 0.05, this.size.z),
            woodMaterial
        );
        top.position.y = this.size.y;
        top.castShadow = true;
        top.receiveShadow = true;
        this.group.add(top);
        this.mainMesh = top;
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.06, this.size.y, 0.06);
        const legX = this.size.x / 2 - 0.08;
        const legZ = this.size.z / 2 - 0.08;
        const legPositions = [
            [-legX, this.size.y / 2, legZ],
            [legX, this.size.y / 2, legZ],
            [-legX, this.size.y / 2, -legZ],
            [legX, this.size.y / 2, -legZ]
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, woodMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
        });
    }
    
    createPhone() {
        // Phone body
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.6
        });
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.14, 0.01),
            bodyMaterial
        );
        body.castShadow = true;
        this.group.add(body);
        this.mainMesh = body;
        
        // Screen
        const screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a12,
            roughness: 0.1,
            metalness: 0.9,
            emissive: new THREE.Color(0x1a1a2a),
            emissiveIntensity: 0.2
        });
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.055, 0.11),
            screenMaterial
        );
        screen.position.z = 0.006;
        this.group.add(screen);
        
        // Camera bump
        const cameraMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8
        });
        const camera = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.003, 12),
            cameraMaterial
        );
        camera.rotation.x = Math.PI / 2;
        camera.position.set(0.02, 0.055, -0.007);
        this.group.add(camera);
    }
    
    createMedicine() {
        // Pill bottle
        const bottleMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.4,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        
        const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.08, 16),
            bottleMaterial
        );
        bottle.castShadow = true;
        this.group.add(bottle);
        this.mainMesh = bottle;
        
        // Cap
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.6
        });
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.032, 0.032, 0.02, 16),
            capMaterial
        );
        cap.position.y = 0.05;
        this.group.add(cap);
        
        // Label
        const labelMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9
        });
        const label = new THREE.Mesh(
            new THREE.CylinderGeometry(0.031, 0.031, 0.04, 16, 1, true),
            labelMaterial
        );
        label.position.y = -0.01;
        this.group.add(label);
    }
    
    createWorkbench() {
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.8
        });
        
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.4,
            metalness: 0.7
        });
        
        // Workbench top
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, 0.08, this.size.z),
            woodMaterial
        );
        top.position.y = this.size.y;
        top.castShadow = true;
        top.receiveShadow = true;
        this.group.add(top);
        this.mainMesh = top;
        
        // Metal frame legs
        const legGeometry = new THREE.BoxGeometry(0.05, this.size.y, 0.05);
        const legX = this.size.x / 2 - 0.1;
        const legZ = this.size.z / 2 - 0.1;
        
        [[-legX, legZ], [legX, legZ], [-legX, -legZ], [legX, -legZ]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeometry, metalMaterial);
            leg.position.set(x, this.size.y / 2, z);
            leg.castShadow = true;
            this.group.add(leg);
        });
        
        // Tools on bench
        const toolMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.5,
            metalness: 0.6
        });
        
        // Wrench
        const wrench = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.02, 0.03),
            toolMaterial
        );
        wrench.position.set(-0.2, this.size.y + 0.05, 0.1);
        wrench.rotation.y = 0.3;
        this.group.add(wrench);
        
        // Screwdriver
        const screwdriver = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8),
            toolMaterial
        );
        screwdriver.rotation.z = Math.PI / 2;
        screwdriver.position.set(0.15, this.size.y + 0.05, -0.1);
        this.group.add(screwdriver);
    }
    
    createVehicle() {
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.4,
            metalness: 0.6
        });
        
        // Main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y * 0.5, this.size.z),
            bodyMaterial
        );
        body.position.y = this.size.y * 0.35;
        body.castShadow = true;
        this.group.add(body);
        this.mainMesh = body;
        
        // Cabin
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x * 0.6, this.size.y * 0.35, this.size.z * 0.7),
            bodyMaterial
        );
        cabin.position.set(0, this.size.y * 0.68, -this.size.z * 0.1);
        cabin.castShadow = true;
        this.group.add(cabin);
        
        // Windows
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a6a8a,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.6
        });
        
        const windshield = new THREE.Mesh(
            new THREE.PlaneGeometry(this.size.x * 0.55, this.size.y * 0.25),
            windowMaterial
        );
        windshield.position.set(0, this.size.y * 0.68, this.size.z * 0.15);
        this.group.add(windshield);
        
        // Wheels
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        });
        const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
        const wheelPositions = [
            [this.size.x / 2 + 0.02, 0.15, this.size.z * 0.3],
            [-this.size.x / 2 - 0.02, 0.15, this.size.z * 0.3],
            [this.size.x / 2 + 0.02, 0.15, -this.size.z * 0.3],
            [-this.size.x / 2 - 0.02, 0.15, -this.size.z * 0.3]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            this.group.add(wheel);
        });
    }
    
    createCrate() {
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a5a4a,
            roughness: 0.85
        });
        
        // Main box
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z),
            woodMaterial
        );
        box.castShadow = true;
        box.receiveShadow = true;
        this.group.add(box);
        this.mainMesh = box;
        
        // Plank details
        const plankMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a3a,
            roughness: 0.9
        });
        
        // Horizontal planks
        for (let i = -1; i <= 1; i++) {
            const plank = new THREE.Mesh(
                new THREE.BoxGeometry(this.size.x + 0.02, 0.05, 0.02),
                plankMaterial
            );
            plank.position.set(0, i * this.size.y * 0.35, this.size.z / 2 + 0.01);
            this.group.add(plank);
        }
        
        // Corner reinforcements
        const cornerMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.5,
            metalness: 0.5
        });
        const cornerGeometry = new THREE.BoxGeometry(0.03, this.size.y, 0.03);
        const corners = [
            [this.size.x / 2, 0, this.size.z / 2],
            [-this.size.x / 2, 0, this.size.z / 2],
            [this.size.x / 2, 0, -this.size.z / 2],
            [-this.size.x / 2, 0, -this.size.z / 2]
        ];
        
        corners.forEach(pos => {
            const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
            corner.position.set(...pos);
            this.group.add(corner);
        });
    }
    
    createBarrel() {
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.5,
            metalness: 0.6
        });
        
        // Main cylinder
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(
                this.size.x / 2, 
                this.size.x / 2 * 0.9, 
                this.size.y, 
                16
            ),
            metalMaterial
        );
        barrel.position.y = this.size.y / 2;
        barrel.castShadow = true;
        this.group.add(barrel);
        this.mainMesh = barrel;
        
        // Rim rings
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.4,
            metalness: 0.8
        });
        
        const ringGeometry = new THREE.TorusGeometry(this.size.x / 2 + 0.01, 0.015, 8, 24);
        
        const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
        topRing.rotation.x = Math.PI / 2;
        topRing.position.y = this.size.y * 0.85;
        this.group.add(topRing);
        
        const midRing = new THREE.Mesh(ringGeometry, ringMaterial);
        midRing.rotation.x = Math.PI / 2;
        midRing.position.y = this.size.y * 0.5;
        this.group.add(midRing);
        
        const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
        bottomRing.rotation.x = Math.PI / 2;
        bottomRing.position.y = this.size.y * 0.15;
        this.group.add(bottomRing);
    }
    
    addGlowEffect() {
        // Add point light
        const light = new THREE.PointLight(this.glowColor, 0.5, 2, 2);
        light.position.y = this.size.y / 2;
        this.group.add(light);
        this.glowLight = light;
        
        // Add glow sprite
        const spriteMaterial = new THREE.SpriteMaterial({
            color: this.glowColor,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5, 0.5, 0.5);
        sprite.position.y = this.size.y / 2;
        this.group.add(sprite);
        this.glowSprite = sprite;
    }
    
    addToScene(scene) {
        scene.add(this.group);
    }
    
    removeFromScene(scene) {
        scene.remove(this.group);
    }
    
    update(deltaTime) {
        this.animationPhase += deltaTime * this.bobSpeed;
        
        // Floating animation for pickup items
        if (this.floatAmount > 0) {
            this.group.position.y = this.position.y + Math.sin(this.animationPhase) * this.floatAmount;
            this.group.rotation.y += deltaTime * 0.5;
        }
        
        // Pulse glow effect
        if (this.glowLight) {
            this.glowLight.intensity = 0.3 + Math.sin(this.animationPhase * 2) * 0.2;
        }
        if (this.glowSprite) {
            this.glowSprite.material.opacity = 0.2 + Math.sin(this.animationPhase * 2) * 0.1;
        }
    }
    
    highlight(enabled) {
        if (this.invisible) return;
        
        this.isHighlighted = enabled;
        
        // Find the main mesh to highlight
        const meshToHighlight = this.mainMesh || this.group.children[0];
        
        if (meshToHighlight && meshToHighlight.material) {
            if (enabled) {
                meshToHighlight.material.emissive = new THREE.Color(0x4a4a3a);
                meshToHighlight.material.emissiveIntensity = 0.4;
            } else {
                meshToHighlight.material.emissive = new THREE.Color(0x000000);
                meshToHighlight.material.emissiveIntensity = 0;
            }
        }
    }
    
    interact(game) {
        if (this.onInteract) {
            this.onInteract(game);
        }
    }
    
    getPosition() {
        return this.group.position;
    }
    
    distanceTo(point) {
        return this.group.position.distanceTo(point);
    }
    
    isInRange(point) {
        return this.distanceTo(point) <= this.interactionRadius;
    }
}
