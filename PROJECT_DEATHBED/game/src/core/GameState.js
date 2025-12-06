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
        
        // Adrian's (player) condition
        this.playerCondition = {
            lucidity: 0,          // Increases when outside, resets when inside
            maxLucidity: 100,     // At max, death occurs
            lucidityRate: 5,      // Rate of increase per second when outside
            isWearingVest: false, // Radiation vest protects from lucidity increase
            vestDurability: 100,  // Vest wears down while outside
            vestDrainRate: 2      // How fast vest loses durability per second outside
        };
        
        // Location state
        this.isOutside = false;
        
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
            journal: true,
            radiationVest: 1  // Special vest to protect from The Light's lucidity effects
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
    
    // === PLAYER LUCIDITY SYSTEM ===
    // Lucidity increases when outside due to The Light's influence
    // At max lucidity, the player dies
    
    setOutside(isOutside) {
        this.isOutside = isOutside;
        // Reset lucidity when entering shelter
        if (!isOutside) {
            this.playerCondition.lucidity = Math.max(0, this.playerCondition.lucidity - 20);
        }
    }
    
    updatePlayerLucidity(deltaTime) {
        if (!this.isOutside) {
            // Slowly recover lucidity when inside
            this.playerCondition.lucidity = Math.max(0, 
                this.playerCondition.lucidity - (2 * deltaTime));
            return { lucidityChanged: false, died: false };
        }
        
        // Outside - lucidity increases unless wearing vest
        if (this.playerCondition.isWearingVest && this.playerCondition.vestDurability > 0) {
            // Vest protects but drains durability
            this.playerCondition.vestDurability = Math.max(0, 
                this.playerCondition.vestDurability - (this.playerCondition.vestDrainRate * deltaTime));
            
            // Check if vest broke
            if (this.playerCondition.vestDurability <= 0) {
                this.playerCondition.isWearingVest = false;
                return { lucidityChanged: false, died: false, vestBroken: true };
            }
            return { lucidityChanged: false, died: false };
        }
        
        // No vest or vest broken - lucidity increases
        this.playerCondition.lucidity = Math.min(
            this.playerCondition.maxLucidity,
            this.playerCondition.lucidity + (this.playerCondition.lucidityRate * deltaTime)
        );
        
        // Check for death
        if (this.playerCondition.lucidity >= this.playerCondition.maxLucidity) {
            return { lucidityChanged: true, died: true };
        }
        
        return { lucidityChanged: true, died: false };
    }
    
    getPlayerLucidityPercent() {
        return (this.playerCondition.lucidity / this.playerCondition.maxLucidity) * 100;
    }
    
    getVestDurabilityPercent() {
        return this.playerCondition.vestDurability;
    }
    
    equipVest() {
        if (this.hasItem('radiationVest')) {
            this.playerCondition.isWearingVest = true;
            this.playerCondition.vestDurability = 100;
            this.useItem('radiationVest');
            return true;
        }
        return false;
    }
    
    unequipVest() {
        if (this.playerCondition.isWearingVest) {
            this.playerCondition.isWearingVest = false;
            // Return vest to inventory if it has durability left
            if (this.playerCondition.vestDurability > 0) {
                this.addItem('radiationVest', 1);
            }
            return true;
        }
        return false;
    }
    
    isVestEquipped() {
        return this.playerCondition.isWearingVest;
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
            playerCondition: this.playerCondition,
            isOutside: this.isOutside,
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
        if (data.playerCondition) {
            Object.assign(this.playerCondition, data.playerCondition);
        }
        this.isOutside = data.isOutside || false;
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
