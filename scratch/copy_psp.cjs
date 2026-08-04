const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\jain7\\.gemini\\antigravity-ide\\brain\\efe56089-f062-49d3-afd1-2b8017e448db\\cap_psp_1785823787595.png';
const dest = path.join(__dirname, '..', 'public', 'products', 'psp.png');

fs.copyFileSync(src, dest);
console.log('Successfully copied generated PSP image to:', dest);
