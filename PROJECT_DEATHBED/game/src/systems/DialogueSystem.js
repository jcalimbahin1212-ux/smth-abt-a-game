/**
 * PROJECT DEATHBED - Dialogue System
 * Handles conversations, choices, and narrative flow
 */

export class DialogueSystem {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.currentNPC = null;
        this.currentDialogue = null;
        this.dialogueQueue = [];
        this.currentChoices = null;
        
        // Typewriter effect
        this.isTyping = false;
        this.typewriterIndex = 0;
        this.typewriterSpeed = 30; // ms per character
        this.fullText = '';
        
        // Auto-hide timer
        this.autoHideTimeout = null;
        this.autoHideDelay = 4000; // 4 seconds after text finishes
        
        // UI elements
        this.dialogueBox = document.getElementById('dialogue-box');
        this.speakerName = document.getElementById('speaker-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.continuePrompt = document.getElementById('dialogue-continue');
        
        // Listen for input
        document.addEventListener('game-keydown', (e) => {
            if (e.detail.code === 'Space') {
                this.handleContinue();
            }
            // Number keys for choices
            if (this.currentChoices && e.detail.code.startsWith('Digit')) {
                const num = parseInt(e.detail.code.replace('Digit', ''));
                if (num > 0 && num <= this.currentChoices.length) {
                    this.selectChoice(num - 1);
                }
            }
        });
        
        // Mouse click for choices
        this.dialogueBox.addEventListener('click', (e) => {
            if (e.target.classList.contains('dialogue-choice')) {
                const index = parseInt(e.target.dataset.index);
                this.selectChoice(index);
            }
        });
    }
    
    startDialogue(npc, dialogue) {
        this.isActive = true;
        this.currentNPC = npc;
        this.currentDialogue = dialogue;
        
        // Exit pointer lock for dialogue
        document.exitPointerLock();
        
        // Show dialogue box
        this.showDialogue(dialogue);
    }
    
    showDialogue(dialogue) {
        if (!dialogue) {
            this.endDialogue();
            return;
        }
        
        this.currentDialogue = dialogue;
        
        // Update speaker
        this.speakerName.textContent = dialogue.speaker || '';
        
        // Start typewriter effect
        this.fullText = dialogue.text;
        this.dialogueText.textContent = '';
        this.typewriterIndex = 0;
        this.isTyping = true;
        
        // Hide continue prompt while typing
        this.continuePrompt.style.display = 'none';
        
        // Clear any existing choices
        this.currentChoices = null;
        const existingChoices = this.dialogueBox.querySelectorAll('.dialogue-choices');
        existingChoices.forEach(el => el.remove());
        
        // Show dialogue box
        this.dialogueBox.classList.add('visible');
        
        // Start typewriter
        this.typeNextCharacter();
    }
    
    typeNextCharacter() {
        if (!this.isTyping) return;
        
        if (this.typewriterIndex < this.fullText.length) {
            this.dialogueText.textContent += this.fullText[this.typewriterIndex];
            this.typewriterIndex++;
            
            setTimeout(() => this.typeNextCharacter(), this.typewriterSpeed);
        } else {
            this.isTyping = false;
            this.showContinueOrChoices();
        }
    }
    
    showContinueOrChoices() {
        // Clear any existing auto-hide timer
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
        
        if (this.currentDialogue.responses && this.currentDialogue.responses.length > 0) {
            // Show dialogue choices
            this.showChoices(this.currentDialogue.responses);
        } else if (this.currentDialogue.choices && this.currentDialogue.choices.length > 0) {
            // Alternative format for choices
            this.showChoices(this.currentDialogue.choices);
        } else {
            // No choices - show continue prompt and start auto-hide timer
            this.continuePrompt.style.display = 'block';
            this.continuePrompt.textContent = 'Press SPACE to continue';
            
            // Auto-hide after delay if no interaction options
            // Calculate delay based on text length (longer text = more time)
            const textLength = this.fullText.length;
            const readTime = Math.max(this.autoHideDelay, textLength * 50); // ~50ms per character, min 4s
            
            this.autoHideTimeout = setTimeout(() => {
                if (this.isActive && !this.currentChoices) {
                    this.fadeOutDialogue();
                }
            }, readTime);
        }
    }
    
    showChoices(choices) {
        this.currentChoices = choices;
        
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'dialogue-choices';
        choicesContainer.style.cssText = `
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        
        choices.forEach((choice, index) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'dialogue-choice';
            choiceButton.dataset.index = index;
            choiceButton.textContent = `${index + 1}. ${choice.text}`;
            choiceButton.style.cssText = `
                background: rgba(201, 162, 39, 0.1);
                border: 1px solid rgba(201, 162, 39, 0.3);
                color: #e0e0e0;
                padding: 10px 15px;
                text-align: left;
                font-family: 'Georgia', serif;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            choiceButton.addEventListener('mouseenter', () => {
                choiceButton.style.background = 'rgba(201, 162, 39, 0.2)';
                choiceButton.style.borderColor = 'rgba(201, 162, 39, 0.6)';
            });
            
            choiceButton.addEventListener('mouseleave', () => {
                choiceButton.style.background = 'rgba(201, 162, 39, 0.1)';
                choiceButton.style.borderColor = 'rgba(201, 162, 39, 0.3)';
            });
            
            choicesContainer.appendChild(choiceButton);
        });
        
        this.dialogueBox.appendChild(choicesContainer);
        
        // Update continue prompt
        this.continuePrompt.style.display = 'block';
        this.continuePrompt.textContent = 'Choose a response (1-' + choices.length + ')';
    }
    
    selectChoice(index) {
        if (!this.currentChoices || index >= this.currentChoices.length) return;
        
        const choice = this.currentChoices[index];
        
        // Play choice sound
        this.game.audioManager.playSound('dialogue_choice');
        
        // Clear current choices to prevent double-selection
        this.currentChoices = null;
        
        // Clear choice UI
        const existingChoices = this.dialogueBox.querySelectorAll('.dialogue-choices');
        existingChoices.forEach(el => el.remove());
        
        // Execute effect if present
        if (choice.effect) {
            choice.effect(this.game);
        }
        
        // Execute action if present (alternative format)
        // If action is provided, it handles the next step - don't auto-close
        if (choice.action) {
            choice.action(this.game);
            // Action handles showing next dialogue or closing, so we return here
            return;
        }
        
        // Go to next dialogue or end (only if no action was provided)
        if (choice.next && this.currentNPC) {
            const nextDialogue = this.currentNPC.getDialogue(choice.next);
            if (nextDialogue) {
                this.showDialogue(nextDialogue);
            } else {
                this.endDialogue();
            }
        } else {
            this.endDialogue();
        }
    }
    
    handleContinue() {
        if (!this.isActive) return;
        
        if (this.isTyping) {
            // Skip typewriter effect
            this.isTyping = false;
            this.dialogueText.textContent = this.fullText;
            this.showContinueOrChoices();
        } else if (!this.currentChoices) {
            // No choices, just continue
            this.endDialogue();
        }
    }
    
    endDialogue() {
        // Clear auto-hide timer
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
        
        this.isActive = false;
        this.currentNPC = null;
        this.currentDialogue = null;
        this.currentChoices = null;
        
        // Hide dialogue box
        this.dialogueBox.classList.remove('visible');
        
        // Clear choices
        const existingChoices = this.dialogueBox.querySelectorAll('.dialogue-choices');
        existingChoices.forEach(el => el.remove());
    }
    
    fadeOutDialogue() {
        // Smooth fade out for auto-hide
        this.dialogueBox.style.transition = 'opacity 0.5s ease';
        this.dialogueBox.style.opacity = '0';
        
        setTimeout(() => {
            this.endDialogue();
            // Reset opacity for next dialogue
            this.dialogueBox.style.opacity = '';
            this.dialogueBox.style.transition = '';
        }, 500);
    }
    
    update(deltaTime) {
        // Any continuous dialogue updates can go here
    }
}
