class PumpkinPanic {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.difficulty = 1;
        this.level = 1;
        this.combo = 0;
        this.lastCatchTime = 0;
        this.powerUpActive = false;
        this.powerUpType = null;
        this.powerUpTimeLeft = 0;
        
        // Keep only essential advanced features
        this.feverMode = false;
        this.feverTimeLeft = 0;
        this.screenShake = 0;
        this.flashEffect = 0;
        
        this.ghost = {
            x: this.width / 2,
            y: this.height - 80,
            width: 60,
            height: 60,
            speed: 8,
            targetX: this.width / 2,
            invulnerable: false,
            invulnerableTime: 0,
            trail: []
        };
        
        this.pumpkins = [];
        this.bombs = [];
        this.powerUps = [];
        this.particles = [];
        this.stars = [];
        this.clouds = [];
        
        this.keys = {};
        this.mouseX = this.width / 2;
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000;
        this.powerUpSpawnChance = 0.05;
        
        // Sound effects (visual feedback instead of audio)
        this.screenShake = 0;
        this.flashEffect = 0;
        
        this.init();
    }
    
    init() {
        // Create background stars (reduced for performance)
        for (let i = 0; i < 30; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * 0.02
            });
        }
        
        // Create clouds (reduced)
        for (let i = 0; i < 3; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height / 3),
                width: Math.random() * 80 + 40,
                height: Math.random() * 25 + 15,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        // Event listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
        });
    }
    
    // NEW ADVANCED GAME MECHANICS
    updateSpawning() {
        const now = Date.now();
        let adjustedInterval = this.spawnInterval - (this.difficulty * 100);
        
        // Apply time effects
        adjustedInterval *= this.timeSlowdown;
        
        if (now - this.lastSpawnTime > adjustedInterval) {
            this.spawnItem();
            this.lastSpawnTime = now;
            
            // Special wave spawning
            if (this.waveNumber > 0 && Math.random() < 0.1) {
                this.spawnWave();
            }
        }
        
        // Random events
        if (Math.random() < 0.001 * this.difficulty) {
            this.triggerRandomEvent();
        }
    }
    
    triggerRandomEvent() {
        const events = [
            () => this.startRainOfFire(),
            () => this.activateTimeSlowdown(),
            () => this.createDimensionShift(),
            () => this.spawnBoss(),
            () => this.activateChaosMode(),
            () => this.createEarthquake(),
            () => this.enterDarknessMode(),
            () => this.activateWormhole()
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event();
    }
    
    startRainOfFire() {
        this.rainOfFire = true;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.bombs.push({
                    x: Math.random() * this.width,
                    y: -50 - Math.random() * 200,
                    width: 30,
                    height: 30,
                    type: 'fireball',
                    speed: 5 + Math.random() * 3,
                    rotation: Math.random() * Math.PI * 2,
                    floatY: 0
                });
            }, i * 100);
        }
        
        setTimeout(() => {
            this.rainOfFire = false;
        }, 3000);
    }
    
    spawnBoss() {
        if (!this.bossActive) {
            this.bossActive = true;
            this.bossHealth = 500;
            this.bossPhase = 0;
            this.createBossSummoning();
        }
    }
    
    createBossSummoning() {
        const centerX = this.width / 2;
        const centerY = 100;
        
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 5;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: '#ff0000',
                size: 10,
                life: 2,
                isBoss: true
            });
        }
    }
    
    updateBossBattle() {
        this.bossHealth--;
        
        if (this.bossPhase === 0 && this.bossHealth < 300) {
            this.bossPhase = 1;
        }
        
        if (this.bossHealth <= 0) {
            this.defeatBoss();
        }
        
        if (Math.random() < 0.02) {
            this.spawnBossAttack();
        }
    }
    
    spawnBossAttack() {
        const attackType = Math.floor(Math.random() * 3);
        
        switch(attackType) {
            case 0: // Laser beam
                this.energyBeams.push({
                    x: this.width / 2,
                    y: 100,
                    targetX: this.ghost.x,
                    targetY: this.ghost.y,
                    speed: 10,
                    life: 60,
                    type: 'laser'
                });
                break;
            case 1: // Bomb wave
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        this.bombs.push({
                            x: (this.width / 10) * i,
                            y: 50,
                            width: 35,
                            height: 35,
                            type: 'boss_bomb',
                            speed: 3,
                            rotation: 0,
                            floatY: 0
                        });
                    }, i * 100);
                }
                break;
            case 2: // Black hole
                this.blackHoles.push({
                    x: this.ghost.x,
                    y: 200,
                    radius: 40,
                    strength: 80,
                    rotation: 0,
                    isTemporary: true
                });
                break;
        }
    }
    
    defeatBoss() {
        this.bossActive = false;
        this.score += 1000;
        this.screenShake = 20;
        
        // Victory explosion
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const speed = Math.random() * 15 + 5;
            
            this.particles.push({
                x: this.width / 2,
                y: 100,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: ['#ffff00', '#ff8800', '#ff00ff'][Math.floor(Math.random() * 3)],
                size: Math.random() * 10 + 5,
                life: 3,
                isVictory: true
            });
        }
    }
    
    activateWormhole() {
        this.wormholeActive = true;
        this.createWormhole();
        
        setTimeout(() => {
            this.wormholeActive = false;
        }, 3000);
    }
    
    createWormhole() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 200;
            const speed = 5;
            
            this.particles.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: -Math.cos(angle) * speed,
                vy: -Math.sin(angle) * speed,
                color: '#ff00ff',
                size: Math.random() * 8 + 2,
                life: 3,
                isWormhole: true
            });
        }
    }
    
    updateEnvironment() {
        // Update cosmic background
        this.cosmicBackground.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
        });
        
        // Update auroras
        if (Math.random() < 0.01) {
            this.auroras.push({
                x: Math.random() * this.width,
                y: 0,
                width: Math.random() * 200 + 100,
                height: this.height,
                color: this.getRandomNebulaColor(),
                opacity: 0.3,
                speed: Math.random() * 2 + 1
            });
        }
        
        this.auroras = this.auroras.filter(aurora => {
            aurora.y += aurora.speed;
            aurora.opacity -= 0.002;
            return aurora.opacity > 0;
        });
    }
    
    checkLevelProgression() {
        if (this.score > 0 && this.score % 100 === 0) {
            this.level = Math.floor(this.score / 100) + 1;
            this.difficulty = this.level;
            
            // Trigger level up effects
            this.createLevelUpEffect();
            
            // Unlock new features at certain levels
            if (this.level === 5) {
                this.feverMode = true;
                this.feverTimeLeft = 300;
            } else if (this.level === 10) {
                this.spawnBoss();
            }
        }
    }
    
    createLevelUpEffect() {
        const text = `LEVEL ${this.level}!`;
        this.particles.push({
            x: this.width / 2,
            y: this.height / 2,
            vx: 0,
            vy: -2,
            color: '#ffff00',
            size: 30,
            life: 2,
            text: text,
            isLevelUp: true
        });
    }
    
    start() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.difficulty = 1;
        this.level = 1;
        this.combo = 0;
        this.lastCatchTime = 0;
        this.pumpkins = [];
        this.bombs = [];
        this.powerUps = [];
        this.particles = [];
        this.lastSpawnTime = Date.now();
        this.powerUpActive = false;
        this.powerUpType = null;
        this.powerUpTimeLeft = 0;
        this.feverMode = false;
        this.feverTimeLeft = 0;
        this.screenShake = 0;
        this.flashEffect = 0;
        
        this.updateUI();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake -= 0.5;
        }
        
        // Update flash effect
        if (this.flashEffect > 0) {
            this.flashEffect -= 0.05;
        }
        
        // Update ghost position - RESPONSIVE MOUSE MOVEMENT
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = this.mouseX;
        const canvasWidth = rect.width;
        
        this.ghost.targetX = mouseX;
        
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.ghost.targetX -= this.ghost.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.ghost.targetX += this.ghost.speed;
        }
        
        // Apply mouse control smoothly - adapted for mobile
        const speedMultiplier = this.powerUpType === 'speed' ? 2.5 : 1.8; // Faster for better mobile feel
        this.ghost.x += (this.ghost.targetX - this.ghost.x) * 0.3 * speedMultiplier;
        
        // Keep ghost in bounds
        this.ghost.x = Math.max(this.ghost.width/2, Math.min(this.width - this.ghost.width/2, this.ghost.x));
        
        // Update ghost trail
        this.ghost.trail.push({
            x: this.ghost.x,
            y: this.ghost.y,
            life: 1
        });
        
        this.ghost.trail = this.ghost.trail.filter(t => {
            t.life -= 0.05;
            return t.life > 0;
        });
        
        // Update invulnerability
        if (this.ghost.invulnerable) {
            this.ghost.invulnerableTime--;
            if (this.ghost.invulnerableTime <= 0) {
                this.ghost.invulnerable = false;
            }
        }
        
        // Update power-up
        if (this.powerUpActive) {
            this.powerUpTimeLeft--;
            if (this.powerUpTimeLeft <= 0) {
                this.powerUpActive = false;
                this.powerUpType = null;
            }
        }
        
        // Spawn items - MORE FREQUENT SPAWNING
        const now = Date.now();
        const adjustedInterval = Math.max(500, this.spawnInterval - (this.difficulty * 150)); // Faster spawning
        if (now - this.lastSpawnTime > adjustedInterval) {
            this.spawnItem();
            this.lastSpawnTime = now;
        }
        
        // Update pumpkins - FASTER MOVEMENT
        for (let i = this.pumpkins.length - 1; i >= 0; i--) {
            const pumpkin = this.pumpkins[i];
            pumpkin.y += pumpkin.speed * (1 + this.difficulty * 0.2); // Speed increases with difficulty
            pumpkin.rotation += 0.03; // Faster rotation
            
            // Random horizontal movement at higher levels
            if (this.difficulty > 3) {
                pumpkin.x += Math.sin(pumpkin.y * 0.02) * 2;
            }
            
            // Check collision with ghost
            if (this.checkCollision(pumpkin, this.ghost)) {
                this.catchPumpkin(i);
            }
            // Check if hit ground
            else if (pumpkin.y > this.height - 20) {
                this.missPumpkin(i);
            }
        }
        
        // Update bombs - SMARTER BOMBS
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.y += bomb.speed * (1 + this.difficulty * 0.15);
            bomb.rotation += 0.04;
            
            // Smart tracking at higher levels
            if (this.difficulty > 2) {
                const dx = this.ghost.x - bomb.x;
                if (Math.abs(dx) < 100) {
                    bomb.x += Math.sign(dx) * 1.5;
                }
            }
            
            // Check collision with ghost
            if (this.checkCollision(bomb, this.ghost) && !this.ghost.invulnerable) {
                this.hitBomb(i);
            }
            // Remove if off screen
            else if (bomb.y > this.height) {
                this.bombs.splice(i, 1);
            }
        }
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            powerUp.rotation += 0.02;
            
            // Magnetic attraction when speed power-up is active
            if (this.powerUpType === 'speed') {
                const dx = this.ghost.x - powerUp.x;
                const dy = this.ghost.y - powerUp.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    powerUp.x += (dx / distance) * 5;
                    powerUp.y += (dy / distance) * 3;
                }
            }
            
            // Check collision with ghost
            if (this.checkCollision(powerUp, this.ghost)) {
                this.collectPowerUp(i);
            }
            // Remove if off screen
            else if (powerUp.y > this.height) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3;
            particle.life -= 0.03;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update stars
        this.stars.forEach(star => {
            star.opacity += star.twinkle;
            if (star.opacity > 1 || star.opacity < 0.2) {
                star.twinkle = -star.twinkle;
            }
        });
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed * 1.5; // Faster clouds
            if (cloud.x > this.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        });
        
        // HARDER LEVEL PROGRESSION
        if (this.score > 0 && this.score % 30 === 0) { // Level up every 30 points (was 50)
            this.level = Math.floor(this.score / 30) + 1;
            this.difficulty = this.level;
            
            // Add more bombs at higher levels
            if (this.difficulty > 4) {
                for (let j = 0; j < Math.floor(this.difficulty / 3); j++) {
                    this.bombs.push({
                        x: Math.random() * this.width,
                        y: -40 - j * 50,
                        width: 35,
                        height: 35,
                        speed: 3 + Math.random() * 2,
                        rotation: 0
                    });
                }
            }
        }
        
        // Combo timeout
        if (Date.now() - this.lastCatchTime > 2000) { // Shorter combo window (was 3000)
            this.combo = 0;
        }
        
        // Fever mode at higher levels
        if (this.level > 6 && !this.feverMode && Math.random() < 0.001) {
            this.feverMode = true;
            this.feverTimeLeft = 180; // 3 seconds of chaos
        }
        
        // Update fever mode
        if (this.feverMode) {
            this.feverTimeLeft--;
            if (this.feverTimeLeft <= 0) {
                this.feverMode = false;
            }
        }
    }
    
    updateTimeMechanics() {
        if (this.timeSlowdown !== 1) {
            this.timeSlowdown += 0.01;
            if (this.timeSlowdown > 1) this.timeSlowdown = 1;
        }
        
        if (this.timeLoopActive) {
            // Handle time loop mechanics
            if (Date.now() % 10000 < 16) { // Every 10 seconds
                this.createTimeRift();
            }
        }
    }
    
    updateAdvancedModes() {
        if (this.realityShiftActive) {
            this.createRealityShift();
        }
        
        if (this.matrixMode) {
            this.createMatrixEffect();
        }
        
        if (this.wormholeActive) {
            this.updateWormhole();
        }
        
        if (this.dimensionShift) {
            this.shiftDimensions();
        }
        
        if (this.chaosMode) {
            this.applyChaosEffects();
        }
    }
    
    updateBossBattle() {
        // Boss AI and attacks
        this.bossHealth--;
        
        if (this.bossPhase === 0 && this.bossHealth < 300) {
            this.bossPhase = 1;
            this.initiateBossPhase2();
        }
        
        if (this.bossHealth <= 0) {
            this.defeatBoss();
        }
        
        // Spawn boss attacks
        if (Math.random() < 0.02) {
            this.spawnBossAttack();
        }
    }
    
    updateGhostMovement() {
        // Apply gravity effects
        if (this.gravityReverse) {
            this.ghost.y -= 2;
        }
        
        // Apply mirror mode
        let targetX = this.mouseX;
        if (this.mirrorMode) {
            targetX = this.width - this.mouseX;
        }
        
        // Update ghost position
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.ghost.targetX -= this.ghost.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.ghost.targetX += this.ghost.speed;
        }
        
        // Mouse control with power-up speed boost
        this.ghost.targetX = targetX;
        const speedMultiplier = this.powerUpType === 'speed' ? 1.5 : 1;
        this.ghost.x += (this.ghost.targetX - this.ghost.x) * 0.15 * speedMultiplier;
        
        // Apply black hole gravity
        this.blackHoles.forEach(hole => {
            const dx = hole.x - this.ghost.x;
            const dy = hole.y - this.ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < hole.radius * 3) {
                const force = (hole.strength / distance) * 0.1;
                this.ghost.x += (dx / distance) * force;
                this.ghost.y += (dy / distance) * force;
            }
        });
        
        // Keep ghost in bounds
        this.ghost.x = Math.max(this.ghost.width/2, Math.min(this.width - this.ghost.width/2, this.ghost.x));
        this.ghost.y = Math.max(this.ghost.height/2, Math.min(this.height - this.ghost.height/2, this.ghost.y));
    }
    
    updateGhostTrail() {
        this.ghost.trail.push({
            x: this.ghost.x,
            y: this.ghost.y,
            life: 1
        });
        
        this.ghost.trail = this.ghost.trail.filter(t => {
            t.life -= 0.05;
            return t.life > 0;
        });
        
        // Update ghost trail particles
        this.ghostTrail = this.ghostTrail.filter(t => {
            t.life -= 0.1;
            return t.life > 0;
        });
    }
    
    spawnItem() {
        const rand = Math.random();
        
        // Spawn power-up occasionally
        if (rand < 0.03) { // Slightly more power-ups
            this.spawnPowerUp();
            return;
        }
        
        // HARDER: More bombs as difficulty increases
        const bombChance = Math.min(0.4 + (this.difficulty * 0.05), 0.7); // More bombs
        const isBomb = Math.random() < bombChance;
        
        const item = {
            x: Math.random() * (this.width - 60) + 30,
            y: -40,
            width: 40,
            height: 40,
            speed: 2.5 + Math.random() * 2.5 + (this.difficulty * 0.4), // Faster items
            rotation: 0
        };
        
        if (isBomb) {
            this.bombs.push(item);
        } else {
            this.pumpkins.push(item);
        }
        
        // At high difficulty, spawn extra bombs
        if (this.difficulty > 5 && Math.random() < 0.3) {
            this.bombs.push({
                x: Math.random() * (this.width - 60) + 30,
                y: -80,
                width: 40,
                height: 40,
                speed: 3 + Math.random() * 3,
                rotation: 0
            });
        }
    }
    
    checkCollision(item1, item2) {
        return Math.abs(item1.x - item2.x) < (item1.width + item2.width) / 2 &&
               Math.abs(item1.y - item2.y) < (item1.height + item2.height) / 2;
    }
    
    catchPumpkin(index) {
        const pumpkin = this.pumpkins[index];
        
        // Update combo
        this.combo++;
        this.lastCatchTime = Date.now();
        
        // Calculate score with combo multiplier
        let points = 10;
        if (pumpkin.type === 'golden') {
            points = 50;
        } else if (pumpkin.type === 'speed') {
            points = 25;
        }
        
        points *= Math.max(1, this.combo);
        this.score += points;
        
        // Create visual feedback
        this.createParticles(pumpkin.x, pumpkin.y, '#ffa500');
        
        // Show score popup
        this.createScorePopup(pumpkin.x, pumpkin.y, points);
        
        // Screen shake for golden pumpkins
        if (pumpkin.type === 'golden') {
            this.screenShake = 5;
        }
        
        this.pumpkins.splice(index, 1);
        this.updateUI();
    }
    
    missPumpkin(index) {
        const pumpkin = this.pumpkins[index];
        
        // Extra penalty for missing golden pumpkins
        if (pumpkin.type === 'golden') {
            this.createParticles(pumpkin.x, this.height - 20, '#ffff00');
        } else {
            this.createParticles(pumpkin.x, this.height - 20, '#ff4444');
        }
        
        this.pumpkins.splice(index, 1);
        this.combo = 0; // Reset combo
        
        if (!this.powerUpType === 'shield') {
            this.lives--;
            this.flashEffect = 1;
        }
        
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    hitBomb(index) {
        const bomb = this.bombs[index];
        this.createExplosion(bomb.x, bomb.y);
        this.screenShake = 15;
        this.bombs.splice(index, 1);
        
        if (!this.powerUpType === 'shield') {
            this.lives = 0;
        }
        
        this.updateUI();
        
        setTimeout(() => {
            this.gameOver();
        }, 500);
    }
    
    collectPowerUp(index) {
        const powerUp = this.powerUps[index];
        this.createParticles(powerUp.x, powerUp.y, '#00ffff');
        this.powerUpActive = true;
        this.powerUpType = powerUp.type;
        this.powerUpTimeLeft = 300; // 5 seconds at 60fps
        
        // Immediate effects
        switch(powerUp.type) {
            case 'shield':
                this.ghost.invulnerable = true;
                this.ghost.invulnerableTime = 300;
                break;
            case 'slowmo':
                // Slow down all falling items
                this.pumpkins.forEach(p => p.speed *= 0.5);
                this.bombs.forEach(b => b.speed *= 0.5);
                break;
        }
        
        this.powerUps.splice(index, 1);
    }
    
    createScorePopup(x, y, points) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -3,
            color: '#00ff00',
            size: 20,
            life: 1,
            text: `+${points}`,
            isScore: true
        });
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: color,
                size: Math.random() * 6 + 2,
                life: 1
            });
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 8 + 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: ['#ff4444', '#ff8800', '#ffff00'][Math.floor(Math.random() * 3)],
                size: Math.random() * 8 + 4,
                life: 1
            });
        }
    }
    
    draw() {
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // Simple background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = star.opacity;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Draw clouds
        this.clouds.forEach(cloud => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity * 0.3})`;
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width/2, cloud.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.drawPowerUp(powerUp);
        });
        
        // Draw pumpkins
        this.pumpkins.forEach(pumpkin => {
            this.drawPumpkin(pumpkin);
        });
        
        // Draw bombs
        this.bombs.forEach(bomb => {
            this.drawBomb(bomb);
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life;
            
            if (particle.isScore) {
                this.ctx.font = 'bold 24px Creepster';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(particle.text, particle.x, particle.y);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.globalAlpha = 1;
        
        // Draw ghost trail
        this.ghost.trail.forEach(t => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${t.life * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw ghost
        this.drawGhost();
        
        // Draw power-up indicator
        if (this.powerUpActive) {
            this.drawPowerUpIndicator();
        }
        
        // Draw combo indicator
        if (this.combo > 2) {
            this.drawComboIndicator();
        }
        
        // Apply flash effect
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 165, 0, ${this.flashEffect * 0.3})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        this.ctx.restore();
    }
    
    drawCosmicBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(0.5, '#000066');
        gradient.addColorStop(1, '#000099');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw cosmic background elements
        this.cosmicBackground.forEach(nebula => {
            this.ctx.save();
            this.ctx.translate(nebula.x, nebula.y);
            this.ctx.rotate(nebula.rotation);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius);
            gradient.addColorStop(0, nebula.color + '33');
            gradient.addColorStop(1, nebula.color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(-nebula.radius, -nebula.radius, nebula.radius * 2, nebula.radius * 2);
            
            this.ctx.restore();
        });
        
        // Draw stars with advanced effects
        this.stars.forEach(star => {
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.opacity;
            this.ctx.beginPath();
            
            // Pulsing stars
            const size = star.size + Math.sin(Date.now() * star.pulse) * star.size;
            this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Star glow
            const glowGradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
            glowGradient.addColorStop(0, star.color + '66');
            glowGradient.addColorStop(1, star.color + '00');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawAuroras() {
        this.auroras.forEach(aurora => {
            const gradient = this.ctx.createLinearGradient(aurora.x - aurora.width/2, 0, aurora.x + aurora.width/2, 0);
            gradient.addColorStop(0, aurora.color + '00');
            gradient.addColorStop(0.5, aurora.color + Math.floor(aurora.opacity * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, aurora.color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(aurora.x - aurora.width/2, aurora.y, aurora.width, aurora.height);
        });
    }
    
    drawNebulae() {
        // Draw dynamic nebula clouds
        for (let i = 0; i < 3; i++) {
            const x = (Date.now() * 0.0001 * (i + 1)) % this.width;
            const y = this.height / 2 + Math.sin(Date.now() * 0.001 + i) * 100;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 200);
            gradient.addColorStop(0, this.getRandomNebulaColor() + '22');
            gradient.addColorStop(1, this.getRandomNebulaColor() + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 200, y - 200, 400, 400);
        }
    }
    
    drawFloatingIslands() {
        this.floatingIslands.forEach(island => {
            this.ctx.save();
            this.ctx.translate(island.x, island.y);
            this.ctx.rotate(island.rotation);
            
            // Island base
            const gradient = this.ctx.createLinearGradient(0, 0, 0, island.height);
            gradient.addColorStop(0, '#4a5f4a');
            gradient.addColorStop(1, '#2d3d2d');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, island.width/2, island.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // mystical glow
            const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, island.width/2);
            glowGradient.addColorStop(0, '#00ff0033');
            glowGradient.addColorStop(1, '#00ff0000');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, island.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawStargates() {
        this.stargates.forEach(gate => {
            this.ctx.save();
            this.ctx.translate(gate.x, gate.y);
            this.ctx.rotate(gate.rotation);
            
            if (gate.active) {
                // Active gate with energy effect
                for (let i = 0; i < 5; i++) {
                    const scale = 1 - i * 0.2;
                    const opacity = 0.6 - i * 0.1;
                    
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 30 * scale, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // Energy core
                const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
                coreGradient.addColorStop(0, '#ffffff');
                coreGradient.addColorStop(0.5, '#00ffff');
                coreGradient.addColorStop(1, '#0000ff');
                
                this.ctx.fillStyle = coreGradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Inactive gate
                this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    drawBlackHoles() {
        this.blackHoles.forEach(hole => {
            this.ctx.save();
            this.ctx.translate(hole.x, hole.y);
            this.ctx.rotate(hole.rotation);
            
            // Event horizon
            const eventHorizon = this.ctx.createRadialGradient(0, 0, 0, 0, 0, hole.radius);
            eventHorizon.addColorStop(0, '#000000');
            eventHorizon.addColorStop(0.7, '#1a0033');
            eventHorizon.addColorStop(1, '#4d009900');
            
            this.ctx.fillStyle = eventHorizon;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, hole.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Accretion disk
            this.ctx.strokeStyle = '#ff660088';
            this.ctx.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, hole.radius * (1.5 + i * 0.3), hole.radius * (0.5 + i * 0.2), 0, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    drawBoss() {
        const centerX = this.width / 2;
        const centerY = 100;
        
        // Boss body
        const bossGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60);
        bossGradient.addColorStop(0, '#ff0000');
        bossGradient.addColorStop(0.5, '#cc0000');
        bossGradient.addColorStop(1, '#660000');
        
        this.ctx.fillStyle = bossGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Boss eyes
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 20, centerY - 10, 10, 0, Math.PI * 2);
        this.ctx.arc(centerX + 20, centerY - 10, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Health bar
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(centerX - 100, centerY - 90, 200, 10);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(centerX - 100, centerY - 90, (this.bossHealth / 500) * 200, 10);
        
        // Boss name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Creepster';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PUMPKIN LORD', centerX, centerY - 100);
    }
    
    drawEnergyBeams() {
        this.energyBeams.forEach(beam => {
            // Beam trail
            const gradient = this.ctx.createLinearGradient(beam.x, beam.y, beam.targetX, beam.targetY);
            gradient.addColorStop(0, '#00ff0088');
            gradient.addColorStop(0.5, '#00ff00ff');
            gradient.addColorStop(1, '#00ff0088');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(beam.x, beam.y);
            this.ctx.lineTo(beam.targetX, beam.targetY);
            this.ctx.stroke();
            
            // Beam glow
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 20;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawParticle(particle) {
        if (particle.isScore) {
            // Draw score popup
            this.ctx.fillStyle = particle.color;
            this.ctx.font = 'bold 24px Creepster';
            this.ctx.textAlign = 'center';
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillText(particle.text, particle.x, particle.y);
        } else if (particle.isLevelUp) {
            // Draw level up text
            this.ctx.fillStyle = particle.color;
            this.ctx.font = 'bold 48px Creepster';
            this.ctx.textAlign = 'center';
            this.ctx.globalAlpha = particle.life;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 20;
            this.ctx.fillText(particle.text, particle.x, particle.y);
            this.ctx.shadowBlur = 0;
        } else {
            // Draw regular particle with special effects
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life;
            
            if (particle.isPortal || particle.isTime || particle.isWormhole || particle.isBoss || particle.isVictory) {
                // Special particle effects
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = particle.size;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawQuantumGhosts() {
        this.quantumGhosts.forEach(ghost => {
            this.ctx.globalAlpha = ghost.opacity;
            this.ctx.fillStyle = '#00ffff';
            
            // Quantum ghost effect
            this.ctx.save();
            this.ctx.translate(ghost.x, ghost.y);
            
            // Ethereal body
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Quantum trail
            this.ctx.strokeStyle = '#00ffff44';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-ghost.vx * 10, -ghost.vy * 10);
            this.ctx.stroke();
            
            this.ctx.restore();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawWormholeEffect() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Wormhole spiral
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        for (let i = 0; i < 20; i++) {
            const angle = Date.now() * 0.01 + (i * Math.PI / 10);
            const radius = i * 10;
            
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${0.5 - i * 0.02})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, angle, angle + Math.PI / 5);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawDarknessOverlay() {
        // Create darkness around player
        const darknessGradient = this.ctx.createRadialGradient(
            this.ghost.x, this.ghost.y, 50,
            this.ghost.x, this.ghost.y, 300
        );
        darknessGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        darknessGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        this.ctx.fillStyle = darknessGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawFeverModeEffect() {
        // Fever mode rainbow overlay
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        const hue = (Date.now() * 0.1) % 360;
        
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${hue + 60}, 100%, 50%, 0.1)`);
        gradient.addColorStop(1, `hsla(${hue + 120}, 100%, 50%, 0.1)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawEarthquakeEffect() {
        // Crack lines on screen
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            const startX = Math.random() * this.width;
            const startY = Math.random() * this.height;
            
            this.ctx.moveTo(startX, startY);
            
            for (let j = 0; j < 5; j++) {
                const nextX = startX + (Math.random() - 0.5) * 100;
                const nextY = startY + j * 50;
                this.ctx.lineTo(nextX, nextY);
            }
            
            this.ctx.stroke();
        }
    }
    
    drawGhost() {
        const x = this.ghost.x;
        const y = this.ghost.y + Math.sin(Date.now() * 0.003) * 3;
        
        // Simple white ghost
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 15, 25, Math.PI, 0);
        this.ctx.lineTo(x + 25, y + 10);
        
        // Wavy bottom
        for (let i = 0; i < 5; i++) {
            const waveX = x + 25 - (i * 10);
            const waveY = y + 10 + Math.sin(Date.now() * 0.01 + i) * 3;
            if (i === 0) {
                this.ctx.lineTo(waveX, waveY);
            } else {
                this.ctx.quadraticCurveTo(waveX + 5, waveY - 5, waveX, waveY);
            }
        }
        
        this.ctx.lineTo(x - 25, y + 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 15, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 8, y - 15, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Mouth
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 5, 8, 0, Math.PI);
        this.ctx.stroke();
    }
    
    drawPowerUp(powerUp) {
        this.ctx.save();
        this.ctx.translate(powerUp.x, powerUp.y);
        this.ctx.rotate(powerUp.rotation);
        
        // Simple power-up
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Simple icon
        this.ctx.fillStyle = '#ff8c00';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        
        switch(powerUp.type) {
            case 'shield':
                this.ctx.fillText('S', 0, 5);
                break;
            case 'speed':
                this.ctx.fillText('F', 0, 5);
                break;
            case 'magnet':
                this.ctx.fillText('M', 0, 5);
                break;
            case 'slowmo':
                this.ctx.fillText('T', 0, 5);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawPowerUpIndicator() {
        const x = this.width / 2;
        const y = 50;
        
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffffff';
        
        const text = `${this.powerUpType.toUpperCase()} - ${Math.ceil(this.powerUpTimeLeft / 60)}s`;
        this.ctx.fillText(text, x, y);
        
        // Simple progress bar
        const barWidth = 150;
        const barHeight = 5;
        const progress = this.powerUpTimeLeft / 300;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x - barWidth/2, y + 5, barWidth, barHeight);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x - barWidth/2, y + 5, barWidth * progress, barHeight);
    }
    
    drawComboIndicator() {
        const x = this.width / 2;
        const y = 100;
        
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ff8c00';
        
        const text = `${this.combo}x COMBO!`;
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    }
    
    drawPumpkin(pumpkin) {
        this.ctx.save();
        this.ctx.translate(pumpkin.x, pumpkin.y);
        this.ctx.rotate(pumpkin.rotation);
        
        // Simple orange pumpkin
        this.ctx.fillStyle = '#ff8c00';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 20, 18, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pumpkin lines
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i++) {
            this.ctx.beginPath();
            this.ctx.ellipse(i * 8, 0, 5, 15, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Stem
        this.ctx.fillStyle = '#228b22';
        this.ctx.fillRect(-3, -20, 6, 8);
        
        // Simple face
        this.ctx.fillStyle = '#000000';
        // Eyes
        this.ctx.beginPath();
        this.ctx.arc(-8, -5, 3, 0, Math.PI * 2);
        this.ctx.arc(8, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Mouth
        this.ctx.beginPath();
        this.ctx.arc(0, 2, 8, 0, Math.PI);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawBomb(bomb) {
        this.ctx.save();
        this.ctx.translate(bomb.x, bomb.y);
        this.ctx.rotate(bomb.rotation);
        
        // Simple bomb
        this.ctx.fillStyle = '#333333';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fuse
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -18);
        this.ctx.lineTo(0, -25);
        this.ctx.stroke();
        
        // Spark
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(0, -25, 4 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Skull symbol
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('☠', 0, 5);
        
        this.ctx.restore();
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;
        
        // Update hearts display
        const livesContainer = document.getElementById('livesValue');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = '❤️';
            livesContainer.appendChild(heart);
        }
        
        document.getElementById('comboValue').textContent = this.combo;
    }
    
    
    catchPumpkin(index) {
        const pumpkin = this.pumpkins[index];
        
        // Update combo
        this.combo++;
        this.lastCatchTime = Date.now();
        
        // Simple scoring
        let points = 10;
        points *= Math.max(1, this.combo); // Combo multiplier
        this.score += points;
        
        // Create visual feedback
        this.createParticles(pumpkin.x, pumpkin.y, '#ff8c00');
        this.createScorePopup(pumpkin.x, pumpkin.y, points);
        
        // Screen shake on combo
        if (this.combo > 5) {
            this.screenShake = 3;
        }
        
        this.pumpkins.splice(index, 1);
        this.updateUI();
    }
    
    missPumpkin(index) {
        const pumpkin = this.pumpkins[index];
        this.createParticles(pumpkin.x, this.height - 20, '#ff4444');
        this.pumpkins.splice(index, 1);
        this.combo = 0;
        
        if (!this.powerUpType === 'shield') {
            this.lives--;
            this.flashEffect = 1;
        }
        
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    hitBomb(index) {
        const bomb = this.bombs[index];
        this.createExplosion(bomb.x, bomb.y);
        this.screenShake = 10;
        this.bombs.splice(index, 1);
        
        if (!this.powerUpType === 'shield') {
            this.lives = 0;
        }
        
        this.updateUI();
        
        setTimeout(() => {
            this.gameOver();
        }, 500);
    }
    
    collectPowerUp(index) {
        const powerUp = this.powerUps[index];
        this.createParticles(powerUp.x, powerUp.y, '#ffffff');
        this.powerUpActive = true;
        this.powerUpType = powerUp.type;
        this.powerUpTimeLeft = 300; // 5 seconds
        
        this.powerUps.splice(index, 1);
    }
    
    spawnPowerUp() {
        const types = ['shield', 'speed', 'magnet', 'slowmo'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            x: Math.random() * (this.width - 60) + 30,
            y: -40,
            width: 35,
            height: 35,
            type: type,
            speed: 1.5,
            rotation: 0
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        
        const messages = [
            "You dropped the pumpkin!",
            "The ghosts are disappointed!",
            "Better luck next Halloween!",
            "The pumpkins got away!",
            "Boo! You scared yourself!"
        ];
        
        document.getElementById('gameOverMessage').textContent = 
            messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
}

// Game instance
let game;

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    if (!game) {
        game = new PumpkinPanic();
    }
    
    game.start();
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    game.start();
}