/**
 * PROJECT DEATHBED - Adrian's Journal Animation (Prologue 2)
 * A 2-minute animated journal sequence revealing Adrian's story
 */

export class JournalAnimation {
    constructor(audioManager, onComplete) {
        this.audioManager = audioManager;
        this.onComplete = onComplete;
        this.container = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 120000; // 2 minutes in milliseconds
        this.animationFrame = null;
        this.currentEntryIndex = -1;
        
        // Journal entries - Adrian's story
        this.journalEntries = [
            {
                start: 0,
                end: 15,
                date: 'March 15th',
                title: 'The Beginning',
                content: `The sky turned red today. Not sunset red—something else entirely. 
                
They're calling it "The Light" on the news. Scientists say it's some kind of atmospheric phenomenon. 
                
Luis called me, scared. He's always been the sensitive one. I told him everything would be fine.

I hope I wasn't lying.`
            },
            {
                start: 15,
                end: 30,
                date: 'March 22nd',
                title: 'One Week Later',
                content: `The power grid failed yesterday. They say it's temporary.

People are starting to leave the city. There's talk of "safe zones" in the countryside.

I found Tanner at the old warehouse. He's been gathering supplies—food, water, medical kits.

"We need to be ready," he said. Ready for what, I wonder.`
            },
            {
                start: 30,
                end: 45,
                date: 'April 3rd',
                title: 'The Exodus',
                content: `Half the city is empty now. Those who stayed are getting desperate.

Tanner showed me the convoy he's been building. An old military transport, reinforced. 
"A shelter on wheels," he called it.

Luis has been coughing. Says it's just allergies. 

I've seen that look in his eyes before. He's hiding something.`
            },
            {
                start: 45,
                end: 60,
                date: 'April 18th',
                title: 'The Diagnosis',
                content: `Luis finally told us the truth. The doctors found something in his lungs before all this started.

Six months, they said. Maybe less with the air quality now.

Tanner didn't say anything. Just walked out and spent the whole night working on the convoy.

I found him at dawn, hands bleeding from the work. 

"We're going to find help," he said. "There has to be someone out there who can save him."`
            },
            {
                start: 60,
                end: 75,
                date: 'May 2nd',
                title: 'The Promise',
                content: `We leave tomorrow. The three of us, in Tanner's convoy.

Luis made us promise something tonight. Made us swear on our mother's memory.

"Stay together until the end," he said. "Whatever happens."

Tanner held his hand. I've never seen him cry before.

"Until the end," we promised. "Brothers until the end."`
            },
            {
                start: 75,
                end: 90,
                date: 'May 15th',
                title: 'On The Road',
                content: `Two weeks on the road now. The world outside is... different.

Cities stand empty. Nature is reclaiming everything.

Luis is getting weaker, but he tries to hide it. Tells jokes to keep our spirits up.

Tanner barely sleeps. He's obsessed with finding a research facility we heard about on the radio.

"Project Lazarus," they called it. A last hope for humanity.

A last hope for Luis.`
            },
            {
                start: 90,
                end: 105,
                date: 'June 1st',
                title: 'The Shelter',
                content: `We found a place to rest. An old convoy depot—Tanner says we can fortify it.

Luis had a bad night. The coughing won't stop.

I sit with him while Tanner works. We talk about the old days. 
Before The Light. Before any of this.

"Remember when we were kids?" he asked. "When we thought we'd live forever?"

I remember.`
            },
            {
                start: 105,
                end: 120,
                date: 'June 3rd',
                title: 'This Is Where We Are',
                content: `I don't know if anyone will ever read this journal.

Maybe I'm just writing to keep myself sane. To remember who we were before.

But if you're reading this—if you found this after we're gone—know this:

We were brothers. We loved each other. And we stayed together until the end.

That's all that matters now.

— Adrian`
            }
        ];
    }
    
    create() {
        this.container = document.createElement('div');
        this.container.id = 'journal-animation';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1612;
            z-index: 3000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        `;
        
        // Journal book container
        this.journal = document.createElement('div');
        this.journal.style.cssText = `
            width: 800px;
            max-width: 90vw;
            height: 600px;
            max-height: 80vh;
            background: linear-gradient(135deg, #f4e4bc 0%, #e8d5a3 50%, #d4c089 100%);
            border-radius: 5px 15px 15px 5px;
            box-shadow: 
                -5px 0 15px rgba(0,0,0,0.3),
                5px 5px 20px rgba(0,0,0,0.4),
                inset 0 0 50px rgba(139, 119, 83, 0.3);
            position: relative;
            padding: 40px 50px;
            font-family: 'Georgia', serif;
            overflow: hidden;
            transform: perspective(1000px) rotateY(-5deg);
            transition: transform 0.5s ease;
        `;
        
        // Leather binding edge
        const binding = document.createElement('div');
        binding.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 30px;
            height: 100%;
            background: linear-gradient(90deg, #5c4a32, #7a6548, #5c4a32);
            border-radius: 5px 0 0 5px;
            box-shadow: inset -5px 0 10px rgba(0,0,0,0.3);
        `;
        this.journal.appendChild(binding);
        
        // Page lines (subtle)
        const lines = document.createElement('div');
        lines.style.cssText = `
            position: absolute;
            top: 60px;
            left: 60px;
            right: 50px;
            bottom: 60px;
            background: repeating-linear-gradient(
                transparent,
                transparent 28px,
                rgba(139, 119, 83, 0.2) 28px,
                rgba(139, 119, 83, 0.2) 29px
            );
            pointer-events: none;
        `;
        this.journal.appendChild(lines);
        
        // Journal header
        this.header = document.createElement('div');
        this.header.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        `;
        this.journal.appendChild(this.header);
        
        // Journal content
        this.content = document.createElement('div');
        this.content.style.cssText = `
            position: relative;
            z-index: 1;
            color: #3a3020;
            font-size: 1.1em;
            line-height: 1.8;
            white-space: pre-wrap;
            opacity: 0;
            transition: opacity 1s ease;
            max-height: calc(100% - 100px);
            overflow-y: auto;
        `;
        this.journal.appendChild(this.content);
        
        this.container.appendChild(this.journal);
        
        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.textContent = 'Skip Journal (Space)';
        this.skipButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            background: transparent;
            border: 1px solid rgba(244, 228, 188, 0.3);
            color: rgba(244, 228, 188, 0.5);
            padding: 10px 20px;
            font-family: 'Georgia', serif;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
        `;
        this.skipButton.onclick = () => this.skip();
        this.container.appendChild(this.skipButton);
        
        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #8b7753, #c9a227);
            width: 0%;
            transition: width 0.1s linear;
        `;
        this.container.appendChild(this.progressBar);
        
        // Ambient particles (dust motes)
        this.createDustParticles();
        
        document.body.appendChild(this.container);
        
        // Keyboard listener
        this.keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
                this.skip();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        // Show skip button after delay
        setTimeout(() => {
            this.skipButton.style.opacity = '1';
        }, 3000);
    }
    
    createDustParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0.4;
        `;
        this.container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.dustParticles = [];
        for (let i = 0; i < 30; i++) {
            this.dustParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        this.dustCanvas = canvas;
        this.dustCtx = ctx;
    }
    
    updateDust() {
        const ctx = this.dustCtx;
        const canvas = this.dustCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.dustParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 228, 188, ${p.opacity})`;
            ctx.fill();
        });
    }
    
    async start() {
        this.create();
        this.isPlaying = true;
        this.startTime = Date.now();
        
        // Play ambient music (reuse intro theme or add separate journal music)
        await this.audioManager.playCustomMusic('intro-theme.mp3', {
            loop: true,
            volume: 0.3,
            fadeIn: 2.0
        });
        
        this.animate();
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const elapsed = Date.now() - this.startTime;
        const elapsedSeconds = elapsed / 1000;
        const progress = Math.min(elapsed / this.duration, 1);
        
        this.progressBar.style.width = `${progress * 100}%`;
        this.updateDust();
        
        // Find current entry
        const entryIndex = this.journalEntries.findIndex(
            entry => elapsedSeconds >= entry.start && elapsedSeconds < entry.end
        );
        
        if (entryIndex !== -1 && entryIndex !== this.currentEntryIndex) {
            this.currentEntryIndex = entryIndex;
            this.showEntry(this.journalEntries[entryIndex]);
        }
        
        if (elapsed >= this.duration) {
            this.complete();
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    showEntry(entry) {
        // Fade out current content
        this.content.style.opacity = '0';
        
        setTimeout(() => {
            // Update header
            this.header.innerHTML = `
                <div style="
                    font-size: 0.9em;
                    color: #6a5a40;
                    margin-bottom: 5px;
                    font-style: italic;
                ">${entry.date}</div>
                <div style="
                    font-size: 1.4em;
                    color: #3a3020;
                    font-weight: bold;
                    border-bottom: 2px solid #8b7753;
                    padding-bottom: 10px;
                    display: inline-block;
                ">${entry.title}</div>
            `;
            
            // Update content with typewriter effect simulation
            this.content.textContent = entry.content;
            this.content.style.opacity = '1';
            
            // Subtle page turn animation
            this.journal.style.transform = 'perspective(1000px) rotateY(-3deg)';
            setTimeout(() => {
                this.journal.style.transform = 'perspective(1000px) rotateY(-5deg)';
            }, 300);
            
        }, 500);
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.removeEventListener('keydown', this.keyHandler);
        
        // Fade out
        this.container.style.transition = 'opacity 2s ease';
        this.container.style.opacity = '0';
        
        this.audioManager.stopCustomMusic(2.0);
        
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            
            if (this.onComplete) {
                this.onComplete();
            }
        }, 2000);
    }
    
    destroy() {
        this.isPlaying = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        document.removeEventListener('keydown', this.keyHandler);
    }
}
