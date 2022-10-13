const fs = require('fs');

const inputFile = fs.readFileSync('./input.js', 'utf8');
const outputFile = inputFile.replace(/\r\n/g, '');

fs.writeFileSync('./output.js', Buffer.from(outputFile));