const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\jain7\\.gemini\\antigravity-ide\\brain\\520702a1-0ae7-44a0-9279-e3aed8c42bdb\\media__1785736571207.jpg';
const dest = path.join(__dirname, '..', 'public', 'products', 'product7.0.jpg');

fs.copyFileSync(src, dest);
console.log('Successfully copied image to:', dest);
