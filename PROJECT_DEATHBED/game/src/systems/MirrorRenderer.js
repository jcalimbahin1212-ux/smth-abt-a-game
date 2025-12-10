/**
 * PROJECT DEATHBED - Mirror Renderer
 * Renders player reflection in mirrors using render-to-texture
 */

import * as THREE from 'three';

export class MirrorRenderer {
    constructor(game, mirrorMesh, options = {}) {
        this.game = game;
        this.mirrorMesh = mirrorMesh;
        this.enabled = true;
        
        // Mirror render target properties
        this.width = options.width || 512;
        this.height = options.height || 512;
        
        // Create render target for mirror reflection
        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        });
        
        // Create mirror camera (will be positioned opposite to main camera)
        this.mirrorCamera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 50);
        
        // Store original material
        this.originalMaterial = mirrorMesh ? mirrorMesh.material.clone() : null;
        
        // Create mirror material with reflection texture
        this.mirrorMaterial = new THREE.MeshBasicMaterial({
            map: this.renderTarget.texture,
            side: THREE.FrontSide
        });
        
        // Apply mirror material
        if (this.mirrorMesh) {
            this.mirrorMesh.material = this.mirrorMaterial;
        }
        
        // Reference to player model
        this.playerModel = null;
        
        // Mirror plane for reflection calculation
        this.mirrorPlane = new THREE.Plane();
        
        // Temporary vectors for calculations
        this._tempVec = new THREE.Vector3();
        this._reflectedPos = new THREE.Vector3();
        this._mirrorPos = new THREE.Vector3();
        this._mirrorNormal = new THREE.Vector3();
        
        console.log('MirrorRenderer initialized:', this.mirrorMesh ? 'with mirror mesh' : 'NO MIRROR MESH');
    }
    
    setPlayerModel(playerModel) {
        this.playerModel = playerModel;
        console.log('MirrorRenderer: Player model set:', playerModel ? 'yes' : 'no');
    }
    
    update(scene, mainCamera, renderer) {
        if (!this.enabled || !this.mirrorMesh || !mainCamera || !renderer) {
            console.log('MirrorRenderer.update: Missing requirements:', {
                enabled: this.enabled,
                mirrorMesh: !!this.mirrorMesh,
                mainCamera: !!mainCamera,
                renderer: !!renderer
            });
            return;
        }
        
        // Get mirror world position
        this.mirrorMesh.getWorldPosition(this._mirrorPos);
        
        // Mirror faces +Z in local space (facing the player)
        this._mirrorNormal.set(0, 0, 1);
        this._mirrorNormal.applyQuaternion(this.mirrorMesh.quaternion);
        this._mirrorNormal.normalize();
        
        // Create mirror plane
        this.mirrorPlane.setFromNormalAndCoplanarPoint(this._mirrorNormal, this._mirrorPos);
        
        // Reflect camera position across mirror plane
        const cameraPos = mainCamera.position;
        const distToPlane = this.mirrorPlane.distanceToPoint(cameraPos);
        
        this._reflectedPos.copy(cameraPos);
        this._reflectedPos.addScaledVector(this._mirrorNormal, -2 * distToPlane);
        
        // Position mirror camera at reflected position
        this.mirrorCamera.position.copy(this._reflectedPos);
        
        // Mirror camera looks at the player position
        this._tempVec.copy(cameraPos);
        this._tempVec.y = 1.0; // Look at roughly chest height
        this.mirrorCamera.lookAt(this._tempVec);
        
        // Adjust camera settings
        this.mirrorCamera.fov = mainCamera.fov || 60;
        this.mirrorCamera.updateProjectionMatrix();
        
        // Position player model in front of mirror (at camera position)
        if (this.playerModel) {
            // Position at camera location, facing the mirror
            this.playerModel.group.position.set(cameraPos.x, 0, cameraPos.z);
            
            // Make the model face the mirror (opposite of mirror normal)
            const facingAngle = Math.atan2(-this._mirrorNormal.x, -this._mirrorNormal.z);
            this.playerModel.group.rotation.y = facingAngle;
            
            // Make visible for mirror render
            this.playerModel.group.visible = true;
        }
        
        // Store current render state
        const currentRenderTarget = renderer.getRenderTarget();
        
        // Render scene to mirror texture
        renderer.setRenderTarget(this.renderTarget);
        renderer.setClearColor(0x888888); // Set a visible clear color for debugging
        renderer.clear();
        renderer.render(scene, this.mirrorCamera);
        
        // Restore render state
        renderer.setRenderTarget(currentRenderTarget);
        
        // Hide player model for normal rendering
        if (this.playerModel) {
            this.playerModel.group.visible = false;
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled && this.mirrorMesh && this.originalMaterial) {
            this.mirrorMesh.material = this.originalMaterial;
        } else if (enabled && this.mirrorMesh) {
            this.mirrorMesh.material = this.mirrorMaterial;
        }
    }
    
    dispose() {
        if (this.renderTarget) {
            this.renderTarget.dispose();
        }
        if (this.mirrorMaterial) {
            this.mirrorMaterial.dispose();
        }
    }
}
