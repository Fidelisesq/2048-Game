class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.size = 4;
        this.hasWon = false;
        this.highScore = this.loadHighScore();
        this.currentTheme = this.loadTheme();
        this.soundEnabled = this.loadSoundSetting();
        this.achievedMilestones = new Set();
        this.milestones = [128, 256, 512, 1024, 2048];
        this.init();
        this.bindEvents();
        this.applyTheme();
        this.updateSoundButton();
        this.initAudio();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.hasWon = false;
        this.moveCount = 0;
        this.startTime = Date.now();
        this.updateScore();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.trackEvent('game_start');
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            
            // Play tile placement sound
            this.playSound(220, 60);
        }
    }

    updateDisplay() {
        const container = document.querySelector('.tile-container');
        container.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    tile.style.left = `${j * 117 + 10}px`;
                    tile.style.top = `${i * 117 + 10}px`;
                    container.appendChild(tile);
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            
            // Auto-submit new high score if player name exists
            const savedName = localStorage.getItem('2048-player-name');
            if (savedName && this.highScore >= 1000) { // Only submit scores >= 1000
                this.autoSubmitHighScore(savedName);
            }
        }
        
        document.getElementById('high-score').textContent = this.highScore;
    }

    move(direction) {
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                const row = direction === 'left' ? newGrid[i] : newGrid[i].slice().reverse();
                const newRow = this.processLine(row);
                if (direction === 'left') {
                    newGrid[i] = newRow;
                } else {
                    newGrid[i] = newRow.reverse();
                }
                if (JSON.stringify(this.grid[i]) !== JSON.stringify(newGrid[i])) {
                    moved = true;
                }
            }
        } else {
            for (let j = 0; j < this.size; j++) {
                const column = [];
                for (let i = 0; i < this.size; i++) {
                    column.push(newGrid[i][j]);
                }
                const processedColumn = direction === 'up' ? this.processLine(column) : this.processLine(column.reverse()).reverse();
                for (let i = 0; i < this.size; i++) {
                    if (this.grid[i][j] !== processedColumn[i]) {
                        moved = true;
                    }
                    newGrid[i][j] = processedColumn[i];
                }
            }
        }

        if (moved) {
            this.grid = newGrid;
            this.moveCount++;
            
            this.addRandomTile();
            this.updateDisplay();
            this.updateScore();
            
            // Check milestones after updating display
            this.checkMilestones();
            
            // Check for win (only show once)
            if (!this.hasWon && this.checkWin()) {
                this.hasWon = true;
                this.trackEvent('game_win', { score: this.score, moves: this.moveCount });
                setTimeout(() => {
                    if (confirm('You won! Reached 2048! Continue playing?')) {
                        // Continue playing
                    } else {
                        this.restart();
                    }
                }, 100);
            }
        }
        
        // Always check for loss after any move attempt
        if (this.checkLoss()) {
            this.trackEvent('game_over', { 
                score: this.score, 
                moves: this.moveCount,
                duration: Math.round((Date.now() - this.startTime) / 1000)
            });
            setTimeout(() => {
                alert('Game Over! No more moves available.');
                this.restart();
            }, 100);
        }
    }

    processLine(line) {
        const filtered = line.filter(val => val !== 0);
        const merged = [];
        let i = 0;
        let hasMerged = false;
        
        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                hasMerged = true;
                i += 2;
            } else {
                merged.push(filtered[i]);
                i++;
            }
        }
        
        // Play merge sound (metallic coin drop effect)
        if (hasMerged) {
            this.playCoinSound();
        }
        
        while (merged.length < this.size) {
            merged.push(0);
        }
        
        return merged;
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }
        });

        // Touch events for mobile
        let startX, startY;
        const gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.createRipple(e.touches[0].clientX, e.touches[0].clientY);
        });
        
        gameContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            let moveAttempted = false;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (Math.abs(diffX) > 30) {
                    this.addSwipeEffect();
                    this.move(diffX > 0 ? 'left' : 'right');
                    moveAttempted = true;
                }
            } else {
                // Vertical swipe
                if (Math.abs(diffY) > 30) {
                    this.addSwipeEffect();
                    this.move(diffY > 0 ? 'up' : 'down');
                    moveAttempted = true;
                }
            }
            
            // Check for game over on mobile even if no move was attempted
            if (!moveAttempted && this.checkLoss()) {
                setTimeout(() => {
                    alert('Game Over! No more moves available.');
                    this.restart();
                }, 100);
            }
            
            startX = startY = null;
        });
    }

    createRipple(x, y) {
        const gameContainer = document.querySelector('.game-container');
        const rect = gameContainer.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x - rect.left - 20}px`;
        ripple.style.top = `${y - rect.top - 20}px`;
        gameContainer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    addSwipeEffect() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            gameContainer.style.transform = 'scale(1)';
        }, 100);
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkLoss() {
        // Check if grid is full
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }
        return true;
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('2048-highscore') || '0');
    }

    saveHighScore() {
        localStorage.setItem('2048-highscore', this.highScore.toString());
    }

    shareScore() {
        const text = `I scored ${this.score} points in 2048! Can you beat it?`;
        if (navigator.share) {
            navigator.share({
                title: '2048 Game',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(`${text} ${window.location.href}`);
            alert('Score copied to clipboard!');
        }
    }

    loadTheme() {
        return localStorage.getItem('2048-theme') || 'default';
    }

    saveTheme() {
        localStorage.setItem('2048-theme', this.currentTheme);
    }

    toggleTheme() {
        const themes = ['default', 'theme-dark', 'theme-neon'];
        const currentIndex = themes.indexOf(this.currentTheme);
        this.currentTheme = themes[(currentIndex + 1) % themes.length];
        this.saveTheme();
        this.applyTheme();
    }

    applyTheme() {
        document.body.className = this.currentTheme === 'default' ? '' : this.currentTheme;
    }

    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    async toggleLeaderboard() {
        const leaderboard = document.getElementById('leaderboard');
        if (leaderboard.classList.contains('hidden')) {
            leaderboard.classList.remove('hidden');
            await this.loadLeaderboard();
        } else {
            leaderboard.classList.add('hidden');
        }
    }

    async loadLeaderboard() {
        const listElement = document.getElementById('leaderboard-list');
        listElement.innerHTML = 'Loading...';
        
        try {
            const apiUrl = this.getApiUrl();
            console.log('Loading leaderboard from:', apiUrl + '/leaderboard');
            const response = await fetch(apiUrl + '/leaderboard');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scores = await response.json();
            console.log('Leaderboard response:', scores);
            
            if (scores.length === 0) {
                listElement.innerHTML = '<p>No scores yet. Be the first!</p>';
                return;
            }
            
            listElement.innerHTML = scores.map((score, index) => 
                `<div class="leaderboard-entry">
                    <span>#${index + 1} ${score.playerName}</span>
                    <span>${score.score.toLocaleString()}</span>
                </div>`
            ).join('');
        } catch (error) {
            listElement.innerHTML = '<p>Failed to load leaderboard</p>';
            console.error('Leaderboard error:', error);
        }
    }

    async submitScore() {
        const playerName = document.getElementById('player-name').value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        
        if (this.score === 0) {
            alert('Play a game first!');
            return;
        }
        
        // Save player name for auto-submissions
        localStorage.setItem('2048-player-name', playerName);
        
        try {
            const apiUrl = this.getApiUrl();
            const payload = { playerName, score: this.score };
            console.log('Submitting score to:', apiUrl + '/score', payload);
            
            const response = await fetch(apiUrl + '/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            console.log('Submit response status:', response.status);
            const responseText = await response.text();
            console.log('Submit response:', responseText);
            
            if (response.ok) {
                alert('Score submitted successfully!');
                document.getElementById('player-name').value = '';
                await this.loadLeaderboard();
            } else {
                alert(`Failed to submit score: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            alert('Failed to submit score: ' + error.message);
            console.error('Submit score error:', error);
        }
    }

    getApiUrl() {
        // Try to get API URL from window object (set by Terraform output)
        if (window.API_GATEWAY_URL) {
            return window.API_GATEWAY_URL;
        }
        // Fallback to hardcoded URL - replace with your actual API Gateway URL
        return 'https://gu284dgt17.execute-api.us-east-1.amazonaws.com/prod';
    }

    async autoSubmitHighScore(playerName) {
        try {
            const apiUrl = this.getApiUrl();
            console.log('Auto-submitting high score:', this.highScore);
            await fetch(apiUrl + '/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerName: `${playerName} (auto)`,
                    score: this.highScore
                })
            });
        } catch (error) {
            console.error('Auto-submit failed:', error);
        }
    }

    initAudio() {
        // Create audio context for sound effects
        this.audioContext = null;
        if (typeof AudioContext !== 'undefined') {
            this.audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            this.audioContext = new webkitAudioContext();
        }
    }

    playSound(frequency = 440, duration = 100) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    playCoinSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const currentTime = this.audioContext.currentTime;
            
            // Main impact sound (coin hitting tray)
            const impact = this.audioContext.createOscillator();
            const impactGain = this.audioContext.createGain();
            const impactFilter = this.audioContext.createBiquadFilter();
            
            impact.connect(impactFilter);
            impactFilter.connect(impactGain);
            impactGain.connect(this.audioContext.destination);
            
            impact.frequency.setValueAtTime(150, currentTime);
            impact.type = 'square';
            impactFilter.type = 'highpass';
            impactFilter.frequency.setValueAtTime(100, currentTime);
            
            impactGain.gain.setValueAtTime(0.15, currentTime);
            impactGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.05);
            
            impact.start(currentTime);
            impact.stop(currentTime + 0.05);
            
            // Metallic ring (coin resonance)
            const ring = this.audioContext.createOscillator();
            const ringGain = this.audioContext.createGain();
            const ringFilter = this.audioContext.createBiquadFilter();
            
            ring.connect(ringFilter);
            ringFilter.connect(ringGain);
            ringGain.connect(this.audioContext.destination);
            
            ring.frequency.setValueAtTime(2400, currentTime + 0.01);
            ring.frequency.exponentialRampToValueAtTime(1800, currentTime + 0.3);
            ring.type = 'sine';
            
            ringFilter.type = 'bandpass';
            ringFilter.frequency.setValueAtTime(2000, currentTime);
            ringFilter.Q.setValueAtTime(8, currentTime);
            
            ringGain.gain.setValueAtTime(0, currentTime);
            ringGain.gain.linearRampToValueAtTime(0.08, currentTime + 0.02);
            ringGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
            
            ring.start(currentTime + 0.01);
            ring.stop(currentTime + 0.4);
            
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    loadSoundSetting() {
        return localStorage.getItem('2048-sound') !== 'false';
    }

    saveSoundSetting() {
        localStorage.setItem('2048-sound', this.soundEnabled.toString());
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundSetting();
        this.updateSoundButton();
        
        if (this.soundEnabled) {
            this.playSound(523, 150); // Test sound
        }
    }

    updateSoundButton() {
        const button = document.getElementById('sound-button');
        if (this.soundEnabled) {
            button.textContent = '🔊 Sound';
            button.classList.remove('muted');
        } else {
            button.textContent = '🔇 Sound';
            button.classList.add('muted');
        }
    }

    checkMilestones() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tileValue = this.grid[i][j];
                if (this.milestones.includes(tileValue) && !this.achievedMilestones.has(tileValue)) {
                    this.achievedMilestones.add(tileValue);
                    this.showMilestone(tileValue);
                    return;
                }
            }
        }
    }

    showMilestone(value) {
        const popup = document.getElementById('milestone-popup');
        const tile = document.getElementById('milestone-tile');
        const text = document.getElementById('milestone-text');
        
        tile.textContent = value;
        tile.className = `tile-${value}`;
        text.textContent = `You reached the ${value} tile!`;
        
        popup.classList.remove('hidden');
        
        // Play milestone sound
        this.playSound(659, 300);
    }

    closeMilestone() {
        document.getElementById('milestone-popup').classList.add('hidden');
    }

    restart() {
        this.achievedMilestones.clear();
        this.init();
    }
}

const game = new Game2048();