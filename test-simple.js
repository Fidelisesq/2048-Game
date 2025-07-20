// Simple validation test
console.log('✓ Testing basic game files...');

const fs = require('fs');
const path = require('path');

// Check if required files exist
const requiredFiles = ['index.html', 'style.css', 'script.js'];
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✓ ${file} exists`);
    } else {
        console.log(`✗ ${file} missing`);
        allFilesExist = false;
    }
});

// Basic content validation
const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const hasGameClass = scriptContent.includes('class Game2048');
const hasGameLogic = scriptContent.includes('processLine') && scriptContent.includes('move');

console.log('✓ Game class defined:', hasGameClass);
console.log('✓ Game logic present:', hasGameLogic);

if (allFilesExist && hasGameClass && hasGameLogic) {
    console.log('\n✓ All tests passed! 🎉');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
}