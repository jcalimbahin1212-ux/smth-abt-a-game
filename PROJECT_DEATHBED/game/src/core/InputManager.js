/**
 * PROJECT DEATHBED - Input Manager
 * Handles keyboard and mouse input
 */

export class InputManager {
    constructor() {
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.mousePosition = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        // Bind event handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        
        // Set up event listeners
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);
    }
    
    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // Emit custom event for game systems
        document.dispatchEvent(new CustomEvent('game-keydown', { 
            detail: { code: event.code, key: event.key } 
        }));
    }
    
    onKeyUp(event) {
        this.keys[event.code] = false;
        
        document.dispatchEvent(new CustomEvent('game-keyup', { 
            detail: { code: event.code, key: event.key } 
        }));
    }
    
    onMouseMove(event) {
        if (this.isPointerLocked) {
            this.mouseMovement.x = event.movementX || 0;
            this.mouseMovement.y = event.movementY || 0;
        }
        
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
    }
    
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement !== null;
    }
    
    isKeyPressed(code) {
        return this.keys[code] === true;
    }
    
    getMouseMovement() {
        const movement = { ...this.mouseMovement };
        // Reset after reading (consumed)
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
        return movement;
    }
    
    update() {
        // Reset mouse movement each frame if not consumed
        // This prevents accumulation
    }
    
    destroy() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    }
}
