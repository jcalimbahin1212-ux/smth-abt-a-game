/**
 * PROJECT DEATHBED - Somber Cinematic Intro
 * A melancholic anime-style opening
 * Made by James C.
 * 
 * This version is SOMBER - gentle particles, slow fades,
 * emotional beats synced to the music
 */

export class IntroAnimation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 197000; // 3:17 in milliseconds
        this.animationFrame = null;
        this.time = 0;
        this.musicElement = null;
        this.musicStarted = false;
        this.lastMusicTime = 0;
        
        // Gentle particle systems (reduced from explosive)
        this.explosionParticles = [];
        this.dustParticles = [];
        this.sparkParticles = [];
        this.glitchLines = [];
        this.lightBeams = [];
        this.afterimages = [];
        this.electricArcs = [];
        
        // Screen shake (reduced intensity)
        this.shakeIntensity = 0;
        this.shakeDecay = 0.95; // Slower decay for gentler shakes
        
        // Chromatic aberration (reduced)
        this.chromaOffset = 0;
        this.targetChroma = 0;
        
        // Beat pulse (screen border flash)
        this.beatPulse = 0;
        
        // Glitch state (used sparingly)
        this.glitchActive = false;
        this.glitchTimer = 0;
        
        // Energy level (builds slowly)
        this.energy = 0;
        this.targetEnergy = 0;
        
        // Music sync - KEY TIMESTAMPS (in seconds)
        // SOMBER - minimal effects, focus on emotion and text
        this.musicEvents = [
            // Opening - Adrian and Luis scene (0-15s)
            { time: 0, action: 'start_particles' },
            { time: 0, action: 'brothers_scene' },
            { time: 5, action: 'text', content: 'A Game By' },
            { time: 8, action: 'text', content: 'JAMES C.', style: 'credit_big' },
            { time: 12, action: 'fade_brothers' },
            
            // Title reveal (14-25s) - Gentle
            { time: 14, action: 'fade_text' },
            { time: 15, action: 'title', content: 'PROJECT' },
            { time: 17, action: 'title_add', content: 'DEATHBED' },
            { time: 22, action: 'fade_text' },
            
            // Story beats (25-55s) - Slow, emotional pacing
            { time: 25, action: 'text', content: 'When the light came...' },
            { time: 30, action: 'text', content: '...everything changed.' },
            { time: 36, action: 'text', content: 'Two brothers.' },
            { time: 42, action: 'text', content: 'One choice.' },
            { time: 48, action: 'fade_text' },
            
            // Character reveals (50-70s) - Simple, no flash
            { time: 50, action: 'character', name: 'LUIS', subtitle: 'Brother' },
            { time: 58, action: 'fade_text' },
            { time: 60, action: 'character', name: 'TANNER', subtitle: 'Friend' },
            { time: 68, action: 'fade_text' },
            
            // Emotional quote (70-85s)
            { time: 72, action: 'quote', content: '"Stay with me until the end."' },
            { time: 80, action: 'fade_text' },
            
            // Story continuation (85-110s)
            { time: 85, action: 'text', content: 'Their home.' },
            { time: 92, action: 'text', content: 'Their sanctuary.' },
            { time: 99, action: 'text', content: 'Their last hope.' },
            { time: 106, action: 'fade_text' },
            
            // Theme (110-135s)
            { time: 110, action: 'quote', content: '"Brothers until the end."' },
            { time: 118, action: 'fade_text' },
            { time: 120, action: 'text', content: 'A story about love.' },
            { time: 128, action: 'text', content: 'A story about letting go.' },
            { time: 136, action: 'fade_text' },
            
            // Final title (140-165s)
            { time: 140, action: 'title_final', content: 'PROJECT DEATHBED' },
            { time: 150, action: 'tagline', content: 'Their final journey begins.' },
            { time: 160, action: 'fade_text' },
            
            // Outro & credits (165-197s)
            { time: 168, action: 'credit_final', content: 'Made by James C.' },
            { time: 180, action: 'fade_text' },
            { time: 185, action: 'press_start' }
        ];
        
        this.processedEvents = new Set();
        this.currentTextContent = '';
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'intro-animation';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000000;
            z-index: 3000;
            overflow: hidden;
            font-family: 'Crimson Text', 'Georgia', serif;
        `;
        
        // Main particle canvas - for explosions
        this.explosionCanvas = document.createElement('canvas');
        this.explosionCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
        `;
        this.container.appendChild(this.explosionCanvas);
        this.explosionCtx = this.explosionCanvas.getContext('2d');
        
        // Spark canvas
        this.sparkCanvas = document.createElement('canvas');
        this.sparkCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 15;
        `;
        this.container.appendChild(this.sparkCanvas);
        this.sparkCtx = this.sparkCanvas.getContext('2d');
        
        // Glitch overlay canvas
        this.glitchCanvas = document.createElement('canvas');
        this.glitchCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 50;
            pointer-events: none;
            mix-blend-mode: screen;
        `;
        this.container.appendChild(this.glitchCanvas);
        this.glitchCtx = this.glitchCanvas.getContext('2d');
        
        // Flash overlay
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0;
            z-index: 100;
            pointer-events: none;
        `;
        this.container.appendChild(this.flashOverlay);
        
        // Energy pulse rings
        this.pulseContainer = document.createElement('div');
        this.pulseContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 5;
            pointer-events: none;
        `;
        this.container.appendChild(this.pulseContainer);
        
        // Text content container
        this.textContainer = document.createElement('div');
        this.textContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 60;
            text-align: center;
            width: 90%;
            pointer-events: none;
        `;
        this.container.appendChild(this.textContainer);
        
        // Vignette
        this.vignette = document.createElement('div');
        this.vignette.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.9) 100%);
            z-index: 70;
            pointer-events: none;
        `;
        this.container.appendChild(this.vignette);
        
        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.innerHTML = 'SKIP ➤';
        this.skipButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: transparent;
            border: 2px solid rgba(201, 162, 39, 0.5);
            color: rgba(201, 162, 39, 0.8);
            padding: 12px 24px;
            font-family: 'Arial Black', sans-serif;
            font-size: 14px;
            cursor: pointer;
            z-index: 200;
            opacity: 0;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 3px;
        `;
        this.skipButton.onmouseenter = () => {
            this.skipButton.style.background = 'rgba(201, 162, 39, 0.2)';
            this.skipButton.style.borderColor = '#c9a227';
        };
        this.skipButton.onmouseleave = () => {
            this.skipButton.style.background = 'transparent';
            this.skipButton.style.borderColor = 'rgba(201, 162, 39, 0.5)';
        };
        this.skipButton.onclick = () => this.skip();
        this.container.appendChild(this.skipButton);
        
        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, #c9a227, #ff6b35, #c9a227);
            width: 0%;
            z-index: 200;
            box-shadow: 0 0 20px #c9a227;
        `;
        this.container.appendChild(this.progressBar);
        
        // Initialize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initDustParticles();
        this.addStyles();
        
        document.body.appendChild(this.container);
        
        // Keyboard skip
        this.keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
                this.skip();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        // Show skip button after 5 seconds
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 5000);
    }
    
    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.explosionCanvas.width = w;
        this.explosionCanvas.height = h;
        this.sparkCanvas.width = w;
        this.sparkCanvas.height = h;
        this.glitchCanvas.width = w;
        this.glitchCanvas.height = h;
    }
    
    initDustParticles() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        for (let i = 0; i < 100; i++) {
            this.dustParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '#c9a227' : '#ff6b35'
            });
        }
    }
    
    addStyles() {
        if (document.getElementById('intro-explosive-styles')) return;
        
        // Load Google Fonts for elegant typography
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        
        const style = document.createElement('style');
        style.id = 'intro-explosive-styles';
        style.textContent = `
            @keyframes elegantIn {
                0% { 
                    opacity: 0; 
                    transform: translateY(20px);
                    filter: blur(10px);
                }
                100% { 
                    opacity: 1; 
                    transform: translateY(0);
                    filter: blur(0);
                }
            }
            
            @keyframes elegantOut {
                0% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); filter: blur(5px); }
            }
            
            @keyframes titleGlitch {
                0%, 100% { 
                    text-shadow: 0 0 30px rgba(201, 162, 39, 0.5), 0 0 60px rgba(201, 162, 39, 0.3);
                    transform: translate(0, 0);
                }
                50% {
                    text-shadow: 0 0 50px rgba(201, 162, 39, 0.7), 0 0 80px rgba(201, 162, 39, 0.4);
                }
            }
            
            @keyframes gentlePulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            
            @keyframes textPulse {
                0%, 100% { text-shadow: 0 0 20px currentColor; }
                50% { text-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
            }
            
            @keyframes floatUp {
                0% { transform: translateY(0); }
                100% { transform: translateY(-5px); }
            }
            
            .explosive-title {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 6vw;
                font-weight: 600;
                color: #c9a227;
                text-transform: uppercase;
                letter-spacing: 0.5em;
                text-shadow: 0 0 40px rgba(201, 162, 39, 0.4), 0 0 80px rgba(201, 162, 39, 0.2);
                animation: elegantIn 1.5s ease-out forwards,
                           titleGlitch 4s ease-in-out infinite 1.5s;
            }
            
            .explosive-title-sub {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 8vw;
                font-weight: 700;
                color: #e8d8b8;
                text-transform: uppercase;
                letter-spacing: 0.3em;
                margin-top: 10px;
                text-shadow: 0 0 50px rgba(232, 216, 184, 0.3), 0 0 100px rgba(201, 162, 39, 0.2);
                animation: elegantIn 1.8s ease-out forwards,
                           titleGlitch 5s ease-in-out infinite 1.8s;
            }
            
            .explosive-text {
                font-family: 'Cormorant Garamond', 'Georgia', serif;
                font-size: 3vw;
                font-weight: 400;
                color: #d0c8b8;
                letter-spacing: 0.15em;
                text-shadow: 0 0 20px rgba(201, 162, 39, 0.3);
                animation: elegantIn 1s ease-out forwards, gentlePulse 3s ease-in-out infinite;
            }
            
            .explosive-quote {
                font-family: 'Crimson Text', 'Georgia', serif;
                font-size: 3vw;
                font-weight: 400;
                font-style: italic;
                color: #c9a227;
                letter-spacing: 0.08em;
                text-shadow: 0 0 30px rgba(201, 162, 39, 0.4);
                animation: elegantIn 1.2s ease-out forwards;
            }
            
            .explosive-character {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 6vw;
                font-weight: 700;
                color: #ffffff;
                text-transform: uppercase;
                letter-spacing: 0.4em;
                text-shadow: 0 0 50px rgba(201, 162, 39, 0.5), 0 0 100px rgba(201, 162, 39, 0.3);
                animation: elegantIn 1s ease-out forwards;
            }
            
            .explosive-subtitle {
                font-family: 'Cormorant Garamond', 'Georgia', serif;
                font-size: 1.8vw;
                font-weight: 300;
                font-style: italic;
                color: #9a9080;
                text-transform: uppercase;
                letter-spacing: 0.6em;
                margin-top: 25px;
                opacity: 0;
                animation: elegantIn 1.2s ease-out 0.4s forwards;
            }
            
            .explosive-credit {
                font-family: 'Cormorant Garamond', 'Georgia', serif;
                font-size: 1.8vw;
                font-weight: 400;
                color: #6a6560;
                text-transform: uppercase;
                letter-spacing: 0.4em;
                animation: elegantIn 1s ease-out forwards;
            }
            
            .explosive-credit-big {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 4vw;
                font-weight: 600;
                color: #c9a227;
                text-transform: uppercase;
                letter-spacing: 0.25em;
                text-shadow: 0 0 40px rgba(201, 162, 39, 0.4);
                animation: elegantIn 1.2s ease-out forwards;
            }
            
            .explosive-tagline {
                font-family: 'Crimson Text', 'Georgia', serif;
                font-size: 2vw;
                font-weight: 400;
                font-style: italic;
                color: #d0c8b8;
                letter-spacing: 0.15em;
                text-shadow: 0 0 20px rgba(201, 162, 39, 0.3);
                animation: elegantIn 1.2s ease-out forwards;
            }
            
            .explosive-press-start {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 1.5vw;
                font-weight: 500;
                color: #c9a227;
                text-transform: uppercase;
                letter-spacing: 0.5em;
                animation: textPulse 2s ease-in-out infinite;
            }
            
            .title-final {
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 10vw;
                font-weight: 700;
                color: #c9a227;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                text-shadow: 
                    0 0 60px rgba(201, 162, 39, 0.5), 
                    0 0 120px rgba(201, 162, 39, 0.3), 
                    0 0 180px rgba(201, 162, 39, 0.2);
                animation: elegantIn 1.5s ease-out forwards,
                           titleGlitch 4s ease-in-out infinite 1.5s;
            }
            
            .pulse-ring {
                position: absolute;
                border: 2px solid rgba(201, 162, 39, 0.5);
                border-radius: 50%;
                animation: pulseExpand 3s ease-out forwards;
            }
            
            @keyframes pulseExpand {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 0.8;
                }
                100% {
                    width: 200vw;
                    height: 200vw;
                    opacity: 0;
                    margin-left: -100vw;
                    margin-top: -100vw;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Initialize audio manager
        await this.audioManager.initialize();
        
        // Start music
        try {
            this.musicElement = new Audio('/music/intro-theme.mp3');
            this.musicElement.volume = 0.9;
            this.musicElement.loop = false;
            
            // Critical: Start music and sync animation to it
            this.musicElement.addEventListener('canplaythrough', () => {
                if (!this.musicStarted) {
                    this.musicElement.play().then(() => {
                        console.log('🎵 MUSIC SYNCED AND PLAYING!');
                        this.musicStarted = true;
                        this.startTime = Date.now(); // Reset start time when music begins
                        this.processedEvents.clear(); // Reset events
                    }).catch(e => console.error('Music play failed:', e));
                }
            });
            
            // Fallback if canplaythrough doesn't fire
            setTimeout(() => {
                if (!this.musicStarted) {
                    this.musicElement.play().then(() => {
                        console.log('🎵 MUSIC PLAYING (fallback)!');
                        this.musicStarted = true;
                        this.startTime = Date.now();
                        this.processedEvents.clear();
                    }).catch(e => console.error('Music fallback failed:', e));
                }
            }, 500);
            
            this.musicElement.load();
        } catch (error) {
            console.error('Music error:', error);
            this.musicStarted = true; // Continue anyway
        }
        
        // Start animation loop
        this.animate();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const now = Date.now();
        const elapsed = now - this.startTime;
        const elapsedSeconds = elapsed / 1000;
        this.time = elapsedSeconds;
        
        // Use music time if available for better sync
        let syncTime = elapsedSeconds;
        if (this.musicElement && this.musicStarted && !isNaN(this.musicElement.currentTime)) {
            syncTime = this.musicElement.currentTime;
        }
        
        // Update progress bar
        const progress = Math.min(syncTime / 197, 1);
        this.progressBar.style.width = `${progress * 100}%`;
        
        // Process music events
        this.processMusicEvents(syncTime);
        
        // Update all systems
        this.updateScreenShake();
        this.updateParticles();
        this.updateLightBeams();
        this.updateElectricArcs();
        this.updateChroma();
        this.updateGlitch();
        this.updateEnergy();
        this.render();
        
        // Check completion
        if (syncTime >= 197 || (this.musicElement && this.musicElement.ended)) {
            this.complete();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    processMusicEvents(currentTime) {
        for (const event of this.musicEvents) {
            const eventKey = `${event.time}-${event.action}`;
            
            // Trigger events within 0.1s window
            if (currentTime >= event.time && currentTime < event.time + 0.15 && !this.processedEvents.has(eventKey)) {
                this.processedEvents.add(eventKey);
                this.triggerEvent(event);
            }
        }
    }
    
    triggerEvent(event) {
        console.log(`🎬 Event: ${event.action} at ${event.time}s`);
        
        switch (event.action) {
            case 'start_particles':
                this.targetEnergy = 0.3;
                break;
                
            case 'glitch':
                this.triggerGlitch(event.intensity || 0.5);
                break;
                
            case 'shake':
                this.triggerShake(event.intensity || 10);
                break;
                
            case 'explosion':
                this.triggerExplosion(event.count || 50);
                break;
                
            case 'flash_white':
                this.flash('#ffffff', 400);
                break;
                
            case 'flash_gold':
                this.flash('#c9a227', 300);
                break;
                
            case 'text':
                this.showText(event.content, event.style || 'explosive-text');
                break;
                
            case 'title':
                this.textContainer.innerHTML = `<div class="explosive-title">${event.content}</div>`;
                this.triggerPulseRing();
                break;
                
            case 'title_add':
                this.textContainer.innerHTML += `<div class="explosive-title-sub">${event.content}</div>`;
                this.triggerPulseRing();
                break;
                
            case 'title_final':
                this.textContainer.innerHTML = `<div class="title-final">${event.content}</div>`;
                this.triggerPulseRing();
                this.triggerPulseRing();
                break;
                
            case 'quote':
                this.textContainer.innerHTML = `<div class="explosive-quote">${event.content}</div>`;
                break;
                
            case 'character':
                this.textContainer.innerHTML = `
                    <div class="explosive-character">${event.name}</div>
                    <div class="explosive-subtitle">${event.subtitle}</div>
                `;
                this.triggerPulseRing();
                break;
                
            case 'tagline':
                this.textContainer.innerHTML = `<div class="explosive-tagline">${event.content}</div>`;
                break;
                
            case 'credit_final':
                this.textContainer.innerHTML = `<div class="explosive-credit-big">${event.content}</div>`;
                break;
                
            case 'press_start':
                this.textContainer.innerHTML = `<div class="explosive-press-start">▶ PRESS ANY KEY TO BEGIN ◀</div>`;
                break;
                
            case 'fade_text':
                this.textContainer.innerHTML = '';
                break;
                
            case 'buildup':
                this.targetEnergy = 1.0;
                // Add rapid sparks
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => this.addSpark(), i * 30);
                }
                break;
                
            case 'energy_surge':
                this.targetEnergy = 0.8;
                this.triggerPulseRing();
                break;
                
            case 'light_beam':
                this.triggerLightBeam();
                break;
                
            case 'electric_arc':
                this.triggerElectricArc();
                break;
                
            case 'chroma':
                this.targetChroma = event.intensity || 0.5;
                break;
                
            case 'brothers_scene':
                this.showBrothersScene();
                break;
                
            case 'fade_brothers':
                this.fadeBrothersScene();
                break;
        }
    }
    
    showBrothersScene() {
        // Create a somber scene with Adrian and Luis silhouettes looking at the sky
        this.brothersOverlay = document.createElement('div');
        this.brothersOverlay.id = 'brothers-scene';
        this.brothersOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 5;
            background: linear-gradient(to top, #0a0a15 0%, #1a1a2e 40%, #2d2d44 70%, #3d3d5c 100%);
            opacity: 0;
            transition: opacity 2s ease;
        `;
        
        // Create sky with subtle stars
        const sky = document.createElement('div');
        sky.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 60%;
            overflow: hidden;
        `;
        
        // Add stars
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            const size = 1 + Math.random() * 2;
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, ${0.3 + Math.random() * 0.5});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
            `;
            sky.appendChild(star);
        }
        this.brothersOverlay.appendChild(sky);
        
        // Add a subtle glow in the sky (The Light in distance)
        const lightGlow = document.createElement('div');
        lightGlow.style.cssText = `
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 200px;
            background: radial-gradient(ellipse at center, rgba(201, 162, 39, 0.15) 0%, transparent 70%);
            animation: pulseGlow 4s ease-in-out infinite;
        `;
        this.brothersOverlay.appendChild(lightGlow);
        
        // Ground/horizon
        const ground = document.createElement('div');
        ground.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 25%;
            background: #0a0a12;
        `;
        this.brothersOverlay.appendChild(ground);
        
        // Adrian silhouette (taller, on left)
        const adrian = document.createElement('div');
        adrian.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 35%;
            width: 60px;
            height: 140px;
            background: #0a0a0a;
            clip-path: polygon(50% 0%, 35% 15%, 30% 35%, 20% 100%, 80% 100%, 70% 35%, 65% 15%);
        `;
        // Adrian's head
        const adrianHead = document.createElement('div');
        adrianHead.style.cssText = `
            position: absolute;
            bottom: 140px;
            left: calc(35% + 15px);
            width: 30px;
            height: 35px;
            background: #0a0a0a;
            border-radius: 50%;
        `;
        this.brothersOverlay.appendChild(adrian);
        this.brothersOverlay.appendChild(adrianHead);
        
        // Luis silhouette (shorter, on right, slightly hunched)
        const luis = document.createElement('div');
        luis.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 55%;
            width: 55px;
            height: 120px;
            background: #0a0a0a;
            clip-path: polygon(45% 0%, 30% 20%, 25% 40%, 15% 100%, 85% 100%, 75% 40%, 70% 20%);
        `;
        // Luis's head
        const luisHead = document.createElement('div');
        luisHead.style.cssText = `
            position: absolute;
            bottom: 120px;
            left: calc(55% + 12px);
            width: 28px;
            height: 32px;
            background: #0a0a0a;
            border-radius: 50%;
        `;
        this.brothersOverlay.appendChild(luis);
        this.brothersOverlay.appendChild(luisHead);
        
        // Add subtle animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
            @keyframes pulseGlow {
                0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
                50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
        
        this.container.appendChild(this.brothersOverlay);
        
        // Fade in
        setTimeout(() => {
            this.brothersOverlay.style.opacity = '1';
        }, 100);
    }
    
    fadeBrothersScene() {
        if (this.brothersOverlay) {
            this.brothersOverlay.style.transition = 'opacity 2s ease';
            this.brothersOverlay.style.opacity = '0';
            setTimeout(() => {
                if (this.brothersOverlay && this.brothersOverlay.parentNode) {
                    this.brothersOverlay.remove();
                }
            }, 2000);
        }
    }
    
    showText(content, className) {
        this.textContainer.innerHTML = `<div class="${className}">${content}</div>`;
    }
    
    triggerExplosion(count) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 5 + Math.random() * 20;
            const size = 3 + Math.random() * 15;
            
            this.explosionParticles.push({
                x: cx + (Math.random() - 0.5) * 100,
                y: cy + (Math.random() - 0.5) * 100,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                color: Math.random() > 0.3 ? '#c9a227' : '#ff6b35',
                type: Math.random() > 0.5 ? 'circle' : 'square'
            });
        }
    }
    
    addSpark() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        this.sparkParticles.push({
            x: cx,
            y: cy,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            life: 1,
            decay: 0.03,
            size: 2 + Math.random() * 4
        });
    }
    
    triggerShake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    triggerGlitch(intensity) {
        this.glitchActive = true;
        this.glitchIntensity = intensity;
        this.glitchTimer = 0.3 + intensity * 0.5;
    }
    
    triggerPulseRing() {
        const ring = document.createElement('div');
        ring.className = 'pulse-ring';
        ring.style.cssText = `
            position: absolute;
            width: 0;
            height: 0;
            border: 4px solid rgba(201, 162, 39, 0.8);
            border-radius: 50%;
            box-shadow: 0 0 20px #c9a227;
        `;
        this.pulseContainer.appendChild(ring);
        
        setTimeout(() => ring.remove(), 2000);
    }
    
    triggerLightBeam() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        // Create multiple light beams radiating from center
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
            this.lightBeams.push({
                x: cx,
                y: cy,
                angle: angle,
                length: 0,
                maxLength: Math.max(window.innerWidth, window.innerHeight) * 1.5,
                width: 3 + Math.random() * 8,
                life: 1,
                decay: 0.015,
                color: Math.random() > 0.5 ? '#c9a227' : '#ffffff',
                speed: 50 + Math.random() * 30
            });
        }
    }
    
    triggerElectricArc() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Create electric arcs from edges to center
        for (let i = 0; i < 5; i++) {
            const side = Math.floor(Math.random() * 4);
            let startX, startY;
            
            switch(side) {
                case 0: startX = Math.random() * w; startY = 0; break;
                case 1: startX = w; startY = Math.random() * h; break;
                case 2: startX = Math.random() * w; startY = h; break;
                case 3: startX = 0; startY = Math.random() * h; break;
            }
            
            this.electricArcs.push({
                startX: startX,
                startY: startY,
                endX: w / 2 + (Math.random() - 0.5) * 200,
                endY: h / 2 + (Math.random() - 0.5) * 200,
                life: 1,
                decay: 0.04,
                segments: 8 + Math.floor(Math.random() * 8),
                jitter: 30 + Math.random() * 40
            });
        }
    }
    
    flash(color, duration) {
        this.flashOverlay.style.background = color;
        this.flashOverlay.style.opacity = '1';
        this.flashOverlay.style.transition = `opacity ${duration}ms ease-out`;
        
        setTimeout(() => {
            this.flashOverlay.style.opacity = '0';
        }, 50);
    }
    
    updateScreenShake() {
        if (this.shakeIntensity > 0.1) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.container.style.transform = 'translate(0, 0)';
            this.shakeIntensity = 0;
        }
    }
    
    updateParticles() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Update explosion particles
        this.explosionParticles = this.explosionParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.vx *= 0.99;
            p.life -= p.decay;
            return p.life > 0;
        });
        
        // Update spark particles
        this.sparkParticles = this.sparkParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            return p.life > 0;
        });
        
        // Update dust particles
        this.dustParticles.forEach(p => {
            p.x += p.speedX + (Math.random() - 0.5) * 0.5;
            p.y += p.speedY + (Math.random() - 0.5) * 0.5;
            
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
        });
    }
    
    updateGlitch() {
        if (this.glitchActive && this.glitchTimer > 0) {
            this.glitchTimer -= 0.016;
        } else {
            this.glitchActive = false;
        }
    }
    
    updateEnergy() {
        this.energy += (this.targetEnergy - this.energy) * 0.05;
        this.targetEnergy *= 0.995; // Slow decay
    }
    
    updateLightBeams() {
        this.lightBeams = this.lightBeams.filter(beam => {
            beam.length += beam.speed;
            beam.life -= beam.decay;
            return beam.life > 0 && beam.length < beam.maxLength;
        });
    }
    
    updateElectricArcs() {
        this.electricArcs = this.electricArcs.filter(arc => {
            arc.life -= arc.decay;
            arc.jitter *= 0.95; // Reduce jitter over time
            return arc.life > 0;
        });
    }
    
    updateChroma() {
        this.chromaOffset += (this.targetChroma * 15 - this.chromaOffset) * 0.1;
        this.targetChroma *= 0.95; // Decay
        
        // Apply chromatic aberration to text container
        if (this.chromaOffset > 0.5) {
            const offset = this.chromaOffset;
            this.textContainer.style.textShadow = `
                ${offset}px 0 0 rgba(255, 0, 0, 0.7),
                ${-offset}px 0 0 rgba(0, 255, 255, 0.7),
                0 0 30px rgba(201, 162, 39, 0.8)
            `;
        } else {
            this.textContainer.style.textShadow = '0 0 30px rgba(201, 162, 39, 0.8)';
        }
    }
    
    render() {
        this.renderExplosions();
        this.renderSparks();
        this.renderLightBeams();
        this.renderElectricArcs();
        this.renderGlitch();
        this.renderBeatPulse();
    }
    
    renderExplosions() {
        const ctx = this.explosionCtx;
        const w = this.explosionCanvas.width;
        const h = this.explosionCanvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Draw dust
        this.dustParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.5 + this.energy * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity * (0.3 + this.energy * 0.7);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        // Draw explosions
        this.explosionParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20;
            
            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size * p.life, p.size * p.life);
            }
            ctx.restore();
        });
    }
    
    renderSparks() {
        const ctx = this.sparkCtx;
        const w = this.sparkCanvas.width;
        const h = this.sparkCanvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        this.sparkParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#c9a227';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.3, p.y - p.vy * 0.3);
            ctx.stroke();
            ctx.restore();
        });
        
        // Also draw light beams on spark canvas
        this.lightBeams.forEach(beam => {
            ctx.save();
            ctx.globalAlpha = beam.life * 0.8;
            ctx.strokeStyle = beam.color;
            ctx.shadowColor = beam.color;
            ctx.shadowBlur = 30;
            ctx.lineWidth = beam.width * beam.life;
            
            ctx.beginPath();
            ctx.moveTo(beam.x, beam.y);
            ctx.lineTo(
                beam.x + Math.cos(beam.angle) * beam.length,
                beam.y + Math.sin(beam.angle) * beam.length
            );
            ctx.stroke();
            ctx.restore();
        });
    }
    
    renderLightBeams() {
        // Light beams are rendered in renderSparks for efficiency
    }
    
    renderElectricArcs() {
        const ctx = this.sparkCtx;
        
        this.electricArcs.forEach(arc => {
            ctx.save();
            ctx.globalAlpha = arc.life;
            ctx.strokeStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 2 + arc.life * 3;
            
            ctx.beginPath();
            ctx.moveTo(arc.startX, arc.startY);
            
            // Draw jagged lightning path
            const dx = arc.endX - arc.startX;
            const dy = arc.endY - arc.startY;
            
            for (let i = 1; i <= arc.segments; i++) {
                const t = i / arc.segments;
                const x = arc.startX + dx * t + (Math.random() - 0.5) * arc.jitter;
                const y = arc.startY + dy * t + (Math.random() - 0.5) * arc.jitter;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
            
            // Inner bright core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = arc.life * 0.8;
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    renderBeatPulse() {
        // Render energy-based border glow
        if (this.energy > 0.1) {
            const intensity = Math.floor(this.energy * 100);
            this.vignette.style.boxShadow = `inset 0 0 ${intensity}px rgba(201, 162, 39, ${this.energy * 0.4})`;
        } else {
            this.vignette.style.boxShadow = 'none';
        }
    }
    
    renderGlitch() {
        const ctx = this.glitchCtx;
        const w = this.glitchCanvas.width;
        const h = this.glitchCanvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        if (!this.glitchActive) return;
        
        const intensity = this.glitchIntensity || 0.5;
        
        // Random color bars
        for (let i = 0; i < 10 * intensity; i++) {
            const y = Math.random() * h;
            const barHeight = Math.random() * 30 + 5;
            const offset = (Math.random() - 0.5) * 50 * intensity;
            
            ctx.fillStyle = Math.random() > 0.5 ? 
                `rgba(255, 0, 0, ${0.3 * intensity})` : 
                `rgba(0, 255, 255, ${0.3 * intensity})`;
            ctx.fillRect(offset, y, w, barHeight);
        }
        
        // Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 2);
        }
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        // Stop music
        if (this.musicElement) {
            this.musicElement.pause();
            this.musicElement = null;
        }
        
        // Cancel animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove keyboard handler
        document.removeEventListener('keydown', this.keyHandler);
        
        // Fade out
        this.container.style.transition = 'opacity 1s ease';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.remove();
            const styleEl = document.getElementById('intro-explosive-styles');
            if (styleEl) styleEl.remove();
            if (this.onComplete) this.onComplete();
        }, 1000);
    }
}
