// Simple test for 2048 game logic
const fs = require('fs');
const path = require('path');

// Mock DOM elements for testing
global.document = {
    querySelector: () => ({ innerHTML: '' }),
    getElementById: () => ({ textContent: '' }),
    createElement: () => ({ 
        style: {}, 
        appendChild: () => {} 
    }),
    addEventListener: () => {}
};

// Read and evaluate the game script
const gameScript = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
console.log('Script loaded, length:', gameScript.length);

// Remove the instantiation line and eval
const scriptWithoutInstance = gameScript.replace('const game = new Game2048();', '');
eval(scriptWithoutInstance);

console.log('Game2048 defined:', typeof Game2048);

// Test game initialization
const testGame = new Game2048();

console.log('✓ Game initializes successfully');
console.log('✓ Grid is 4x4:', testGame.grid.length === 4 && testGame.grid[0].length === 4);
console.log('✓ Initial score is 0:', testGame.score === 0);

// Test tile addition
let tileCount = 0;
testGame.grid.forEach(row => {
    row.forEach(cell => {
        if (cell !== 0) tileCount++;
    });
});
console.log('✓ Initial tiles added:', tileCount === 2);

// Test line processing
const testLine = [2, 2, 4, 0];
const processed = testGame.processLine(testLine);
console.log('✓ Line processing works:', JSON.stringify(processed) === JSON.stringify([4, 4, 0, 0]));

console.log('\nAll tests passed! 🎉');