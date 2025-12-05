/**
 * PROJECT DEATHBED - Game State
 * Manages the current state of the game, Luis's condition, and story progress
 */

export class GameState {
    constructor() {
        // Luis's condition meters (0-100)
        this.luisCondition = {
            physicalStability: 65,
            lucidity: 78,
            shapeIntegrity: 52
        };
        
        // Story progress
        this.currentAct = 1;
        this.currentChapter = 1;
        this.currentScene = 'convoy_shelter';
        
        // Memory anchors collected
        this.memoryAnchors = [];
        
        // Relationship levels (0-100)
        this.relationships = {
            luis: 100,  // Adrian's bond with Luis - always high
            mae: 50,
            tanner: 60,
            rhea: 40
        };
        
        // Inventory
        this.inventory = {
            medication: 3,
            water: 5,
            coolingCloth: 2,
            journal: true
        };
        
        // Dialogue history
        this.dialogueHistory = [];
        
        // Flags for story events
        this.flags = {
            metMae: false,
            metTanner: false,
            metRhea: false,
            tannerExposed: false,
            tannerDead: false,
            firstVision: false,
            understoodLight: false
        };
        
        // Time of day (affects lighting and events)
        this.timeOfDay = 'dawn'; // dawn, day, dusk, night
        this.dayNumber = 1;
    }
    
    // Luis condition methods
    modifyStability(amount) {
        this.luisCondition.physicalStability = Math.max(0, Math.min(100, 
            this.luisCondition.physicalStability + amount));
        return this.luisCondition.physicalStability;
    }
    
    modifyLucidity(amount) {
        this.luisCondition.lucidity = Math.max(0, Math.min(100, 
            this.luisCondition.lucidity + amount));
        return this.luisCondition.lucidity;
    }
    
    modifyShapeIntegrity(amount) {
        this.luisCondition.shapeIntegrity = Math.max(0, Math.min(100, 
            this.luisCondition.shapeIntegrity + amount));
        return this.luisCondition.shapeIntegrity;
    }
    
    // Memory anchor methods
    addMemoryAnchor(anchor) {
        if (!this.memoryAnchors.find(a => a.id === anchor.id)) {
            this.memoryAnchors.push(anchor);
            // Adding memories improves shape integrity
            this.modifyShapeIntegrity(5);
            return true;
        }
        return false;
    }
    
    hasMemoryAnchor(anchorId) {
        return this.memoryAnchors.some(a => a.id === anchorId);
    }
    
    // Relationship methods
    modifyRelationship(character, amount) {
        if (this.relationships[character] !== undefined) {
            this.relationships[character] = Math.max(0, Math.min(100, 
                this.relationships[character] + amount));
        }
    }
    
    // Inventory methods
    useItem(item) {
        if (typeof this.inventory[item] === 'number' && this.inventory[item] > 0) {
            this.inventory[item]--;
            return true;
        }
        return false;
    }
    
    addItem(item, amount = 1) {
        if (typeof this.inventory[item] === 'number') {
            this.inventory[item] += amount;
        } else if (typeof this.inventory[item] === 'boolean') {
            this.inventory[item] = true;
        }
    }
    
    hasItem(item) {
        if (typeof this.inventory[item] === 'number') {
            return this.inventory[item] > 0;
        }
        return this.inventory[item] === true;
    }
    
    // Flag methods
    setFlag(flag, value = true) {
        this.flags[flag] = value;
    }
    
    getFlag(flag) {
        return this.flags[flag] || false;
    }
    
    // Time methods
    advanceTime() {
        const timeOrder = ['dawn', 'day', 'dusk', 'night'];
        const currentIndex = timeOrder.indexOf(this.timeOfDay);
        const nextIndex = (currentIndex + 1) % timeOrder.length;
        
        if (nextIndex === 0) {
            this.dayNumber++;
            // Daily deterioration
            this.modifyStability(-5);
            this.modifyShapeIntegrity(-3);
        }
        
        this.timeOfDay = timeOrder[nextIndex];
        return this.timeOfDay;
    }
    
    // Save/Load
    toJSON() {
        return {
            luisCondition: this.luisCondition,
            currentAct: this.currentAct,
            currentChapter: this.currentChapter,
            currentScene: this.currentScene,
            memoryAnchors: this.memoryAnchors,
            relationships: this.relationships,
            inventory: this.inventory,
            flags: this.flags,
            timeOfDay: this.timeOfDay,
            dayNumber: this.dayNumber
        };
    }
    
    fromJSON(data) {
        Object.assign(this.luisCondition, data.luisCondition);
        this.currentAct = data.currentAct;
        this.currentChapter = data.currentChapter;
        this.currentScene = data.currentScene;
        this.memoryAnchors = data.memoryAnchors || [];
        Object.assign(this.relationships, data.relationships);
        Object.assign(this.inventory, data.inventory);
        Object.assign(this.flags, data.flags);
        this.timeOfDay = data.timeOfDay;
        this.dayNumber = data.dayNumber;
    }
}
