/**
 * PROJECT DEATHBED - Ending Credits Sequence
 * Music: "World Without You" by James C.
 * A somber, blue-toned emotional ending
 */

export class CreditsAnimation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 75000; // ~1:15 (adjust based on full song length)
        this.animationFrame = null;
        this.musicElement = null;
        this.musicStarted = false;
        
        // Gentle particle systems
        this.floatingParticles = [];
        this.glowOrbs = [];
        this.fallingEmbers = [];
        
        // Lyrics synced to your LRC timestamps (shifted -1 second)
        this.lyrics = [
            { time: 19.59, text: "They say a picture's worth a thousand words" },
            { time: 22.70, text: "but sometimes the words are worth it more." },
            { time: 25.54, text: "What will the future hold you wonder" },
            { time: 28.80, text: "as I sit here beside you and I wonder too" },
            { time: 33.90, text: "But I don't want to be a memory" },
            { time: 37.80, text: "that's lost to the world without you." },
            { time: 42.08, text: "Hold on to me like a lifeline." },
            { time: 45.40, text: "Everything fades away with time but you" },
            { time: 50.00, text: "are a part of me." },
            { time: 52.90, text: "Hold on to me 'cause I still believe" },
            { time: 56.60, text: "there could be a world without tragedy but not" },
            { time: 61.50, text: "a world without you." }
        ];
        
        // Credits to display
        this.credits = [
            { time: 5, text: "PROJECT DEATHBED", style: 'title' },
            { time: 10, text: "A Story of Brotherhood", style: 'subtitle' },
            { time: 15, text: "CAST", style: 'section-title' },
            { time: 17, text: "Isaac — Luis", style: 'cast' },
            { time: 20, text: "Jacob — Tanner", style: 'cast' },
            { time: 23, text: "Gaven — The Narrator", style: 'cast' },
            { time: 66, text: "Thank you for playing", style: 'thanks' },
            { time: 70, text: "Made by James C.", style: 'credit-final' }
        ];
        
        this.displayedLyrics = new Set();
        this.displayedCredits = new Set();
        this.currentLyric = '';
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'credits-animation';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #0a0a1a 0%, #0d1525 50%, #1a2535 100%);
            z-index: 3000;
            overflow: hidden;
            font-family: 'Georgia', 'Times New Roman', serif;
        `;
        
        // Stars background canvas
        this.starsCanvas = document.createElement('canvas');
        this.starsCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;
        this.container.appendChild(this.starsCanvas);
        this.starsCtx = this.starsCanvas.getContext('2d');
        
        // Particle canvas
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 5;
        `;
        this.container.appendChild(this.particleCanvas);
        this.particleCtx = this.particleCanvas.getContext('2d');
        
        // Lyrics container (center)
        this.lyricsContainer = document.createElement('div');
        this.lyricsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 20;
            text-align: center;
            width: 80%;
            pointer-events: none;
        `;
        this.container.appendChild(this.lyricsContainer);
        
        // Credits container (top)
        this.creditsContainer = document.createElement('div');
        this.creditsContainer.style.cssText = `
            position: absolute;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            z-index: 15;
            text-align: center;
            width: 80%;
            pointer-events: none;
        `;
        this.container.appendChild(this.creditsContainer);
        
        // Soft blue vignette
        this.vignette = document.createElement('div');
        this.vignette.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, transparent 30%, rgba(10, 20, 40, 0.8) 100%);
            z-index: 50;
            pointer-events: none;
        `;
        this.container.appendChild(this.vignette);
        
        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.innerHTML = 'skip →';
        this.skipButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: transparent;
            border: 1px solid rgba(100, 150, 200, 0.3);
            color: rgba(150, 180, 220, 0.6);
            padding: 10px 20px;
            font-family: 'Georgia', serif;
            font-size: 14px;
            font-style: italic;
            cursor: pointer;
            z-index: 200;
            opacity: 0;
            transition: all 0.5s ease;
        `;
        this.skipButton.onmouseenter = () => {
            this.skipButton.style.borderColor = 'rgba(100, 150, 200, 0.6)';
            this.skipButton.style.color = 'rgba(150, 180, 220, 0.9)';
        };
        this.skipButton.onmouseleave = () => {
            this.skipButton.style.borderColor = 'rgba(100, 150, 200, 0.3)';
            this.skipButton.style.color = 'rgba(150, 180, 220, 0.6)';
        };
        this.skipButton.onclick = () => this.skip();
        this.container.appendChild(this.skipButton);
        
        // Initialize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.initStars();
        this.addStyles();
        
        document.body.appendChild(this.container);
        
        // Keyboard skip
        this.keyHandler = (e) => {
            if (e.code === 'Escape') {
                e.preventDefault();
                this.skip();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        // Show skip after 5 seconds
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 5000);
    }
    
    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.starsCanvas.width = w;
        this.starsCanvas.height = h;
        this.particleCanvas.width = w;
        this.particleCanvas.height = h;
    }
    
    initStars() {
        this.stars = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 2 + 0.5,
                twinkleSpeed: 0.01 + Math.random() * 0.02,
                twinklePhase: Math.random() * Math.PI * 2,
                baseOpacity: 0.3 + Math.random() * 0.5
            });
        }
    }
    
    initParticles() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Floating particles - gentle blue motes
        for (let i = 0; i < 60; i++) {
            this.floatingParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -Math.random() * 0.5 - 0.2,
                opacity: Math.random() * 0.4 + 0.1,
                hue: 200 + Math.random() * 40 // Blue range
            });
        }
        
        // Glow orbs - larger, softer
        for (let i = 0; i < 8; i++) {
            this.glowOrbs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 50 + Math.random() * 100,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: 0.03 + Math.random() * 0.05,
                hue: 210 + Math.random() * 30
            });
        }
    }
    
    addStyles() {
        if (document.getElementById('credits-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'credits-styles';
        style.textContent = `
            @keyframes lyricFadeIn {
                0% { 
                    opacity: 0; 
                    transform: translateY(30px);
                    filter: blur(10px);
                }
                100% { 
                    opacity: 1; 
                    transform: translateY(0);
                    filter: blur(0);
                }
            }
            
            @keyframes lyricFadeOut {
                0% { opacity: 1; }
                100% { opacity: 0; transform: translateY(-20px); }
            }
            
            @keyframes gentleFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes softPulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            @keyframes titleReveal {
                0% { 
                    opacity: 0;
                    letter-spacing: 0.5em;
                    filter: blur(20px);
                }
                100% { 
                    opacity: 1;
                    letter-spacing: 0.3em;
                    filter: blur(0);
                }
            }
            
            .credits-lyric {
                font-size: 2.5vw;
                font-weight: 300;
                font-style: italic;
                color: #a8c8e8;
                text-shadow: 0 0 30px rgba(100, 150, 220, 0.5), 0 0 60px rgba(80, 130, 200, 0.3);
                animation: lyricFadeIn 1s ease forwards;
                line-height: 1.6;
            }
            
            .credits-title {
                font-size: 5vw;
                font-weight: 400;
                color: #c8d8f0;
                text-transform: uppercase;
                letter-spacing: 0.3em;
                text-shadow: 0 0 40px rgba(100, 150, 220, 0.6);
                animation: titleReveal 3s ease forwards;
            }
            
            .credits-subtitle {
                font-size: 1.8vw;
                font-weight: 300;
                font-style: italic;
                color: #8898b8;
                letter-spacing: 0.2em;
                margin-top: 20px;
                animation: lyricFadeIn 2s ease forwards;
            }
            
            .credits-section-title {
                font-size: 1.5vw;
                font-weight: 400;
                color: #6688aa;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                margin-top: 40px;
                animation: lyricFadeIn 1.5s ease forwards;
            }
            
            .credits-cast {
                font-size: 1.8vw;
                font-weight: 300;
                color: #a0b8d0;
                letter-spacing: 0.1em;
                animation: lyricFadeIn 1.5s ease forwards;
            }
            
            .credits-thanks {
                font-size: 2.5vw;
                font-weight: 300;
                color: #a8c8e8;
                letter-spacing: 0.15em;
                animation: lyricFadeIn 2s ease forwards;
            }
            
            .credits-credit-final {
                font-size: 3vw;
                font-weight: 400;
                color: #d0e0f8;
                letter-spacing: 0.2em;
                text-shadow: 0 0 30px rgba(150, 180, 220, 0.5);
                animation: lyricFadeIn 2s ease forwards, softPulse 3s ease-in-out infinite 2s;
            }
        `;
        document.head.appendChild(style);
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Start music
        try {
            this.musicElement = new Audio('/music/credits-theme.mp3');
            this.musicElement.volume = 0.85;
            this.musicElement.loop = false;
            
            this.musicElement.addEventListener('canplaythrough', () => {
                if (!this.musicStarted) {
                    this.musicElement.play().then(() => {
                        console.log('🎵 Credits music playing!');
                        this.musicStarted = true;
                        this.startTime = Date.now();
                        this.displayedLyrics.clear();
                        this.displayedCredits.clear();
                    }).catch(e => console.error('Music play failed:', e));
                }
            });
            
            setTimeout(() => {
                if (!this.musicStarted) {
                    this.musicElement.play().then(() => {
                        this.musicStarted = true;
                        this.startTime = Date.now();
                    }).catch(e => console.error('Music fallback failed:', e));
                }
            }, 500);
            
            this.musicElement.load();
        } catch (error) {
            console.error('Music error:', error);
            this.musicStarted = true;
        }
        
        this.animate();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        // Get sync time from music
        let syncTime = 0;
        if (this.musicElement && this.musicStarted && !isNaN(this.musicElement.currentTime)) {
            syncTime = this.musicElement.currentTime;
        } else {
            syncTime = (Date.now() - this.startTime) / 1000;
        }
        
        // Update systems
        this.updateParticles();
        this.updateLyrics(syncTime);
        this.updateCredits(syncTime);
        this.render(syncTime);
        
        // Check completion
        if (this.musicElement && this.musicElement.ended) {
            setTimeout(() => this.complete(), 2000);
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    updateParticles() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Floating particles
        this.floatingParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.y < -20) {
                p.y = h + 20;
                p.x = Math.random() * w;
            }
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
        });
        
        // Glow orbs - gentle movement
        this.glowOrbs.forEach(orb => {
            orb.x += orb.speedX;
            orb.y += orb.speedY;
            
            // Bounce off edges gently
            if (orb.x < -orb.size || orb.x > w + orb.size) orb.speedX *= -1;
            if (orb.y < -orb.size || orb.y > h + orb.size) orb.speedY *= -1;
        });
    }
    
    updateLyrics(syncTime) {
        // Find current lyric
        let currentLyric = null;
        
        for (let i = this.lyrics.length - 1; i >= 0; i--) {
            if (syncTime >= this.lyrics[i].time) {
                currentLyric = this.lyrics[i];
                break;
            }
        }
        
        if (currentLyric && !this.displayedLyrics.has(currentLyric.time)) {
            this.displayedLyrics.add(currentLyric.time);
            this.showLyric(currentLyric.text);
        }
    }
    
    showLyric(text) {
        // Fade out old lyric
        const oldLyric = this.lyricsContainer.querySelector('.credits-lyric');
        if (oldLyric) {
            oldLyric.style.animation = 'lyricFadeOut 0.5s ease forwards';
            setTimeout(() => oldLyric.remove(), 500);
        }
        
        // Show new lyric
        setTimeout(() => {
            this.lyricsContainer.innerHTML = `<div class="credits-lyric">${text}</div>`;
        }, oldLyric ? 300 : 0);
    }
    
    updateCredits(syncTime) {
        for (const credit of this.credits) {
            if (syncTime >= credit.time && !this.displayedCredits.has(credit.time)) {
                this.displayedCredits.add(credit.time);
                this.showCredit(credit.text, credit.style);
            }
        }
    }
    
    showCredit(text, style) {
        // Clear credits container for new credit
        this.creditsContainer.style.transition = 'opacity 1s ease';
        this.creditsContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.creditsContainer.innerHTML = `<div class="credits-${style}">${text}</div>`;
            this.creditsContainer.style.opacity = '1';
        }, 1000);
    }
    
    render(syncTime) {
        this.renderStars(syncTime);
        this.renderParticles();
    }
    
    renderStars(syncTime) {
        const ctx = this.starsCtx;
        const w = this.starsCanvas.width;
        const h = this.starsCanvas.height;
        
        // Clear with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#0d1525');
        gradient.addColorStop(1, '#1a2535');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Draw twinkling stars
        this.stars.forEach(star => {
            const twinkle = Math.sin(syncTime * star.twinkleSpeed * 10 + star.twinklePhase);
            const opacity = star.baseOpacity * (0.5 + twinkle * 0.5);
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
            ctx.fill();
        });
    }
    
    renderParticles() {
        const ctx = this.particleCtx;
        const w = this.particleCanvas.width;
        const h = this.particleCanvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Draw glow orbs (behind particles)
        this.glowOrbs.forEach(orb => {
            const gradient = ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.size
            );
            gradient.addColorStop(0, `hsla(${orb.hue}, 60%, 60%, ${orb.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(orb.x - orb.size, orb.y - orb.size, orb.size * 2, orb.size * 2);
        });
        
        // Draw floating particles
        this.floatingParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
            ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.5)`;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.musicElement) {
            this.musicElement.pause();
            this.musicElement = null;
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.removeEventListener('keydown', this.keyHandler);
        
        // Gentle fade out
        this.container.style.transition = 'opacity 2s ease';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.remove();
            const styleEl = document.getElementById('credits-styles');
            if (styleEl) styleEl.remove();
            if (this.onComplete) this.onComplete();
        }, 2000);
    }
}
