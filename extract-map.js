const fs = require('fs');
const path = require('path');

// Read the prefectures file and extract data via regex (avoid ES module)
const content = fs.readFileSync('./package/src/_prefectures.js', 'utf8');

// Extract viewBox
const vbMatch = content.match(/full:\s*"0\s+0\s+[\d.]+\s+[\d.]+"/);
const viewBox = vbMatch ? vbMatch[0].replace(/full:\s*"/, '').replace(/"$/, '') : '0 0 437.33432 516.01587';

// Extract each prefecture's full path - format: "Name": { id: N, ... full: "pathdata"
const prefRegex = /"([^"]+)":\s*\{\s*id:\s*\d+[^}]*full:\s*"((?:[^"\\]|\\.)*)"/g;
const prefectures = [];
let match;
while ((match = prefRegex.exec(content)) !== null) {
  prefectures.push({ name: match[1], d: match[2] });
}

console.log('Extracted', prefectures.length, 'prefectures, viewBox:', viewBox);

// Cute pastel colors - 8 regional colors cycling
const colors = [
  '#e8f2fc', '#d4e8f9', '#c0def6', '#acd4f3',
  '#98caf0', '#84c0ed', '#70b6ea', '#5cace7'
];

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="japan-map-cute">
  <g class="prefectures">`;

prefectures.forEach((p, i) => {
  const fill = colors[i % colors.length];
  svg += `\n    <path id="pref-${p.name}" d="${p.d}" fill="${fill}" stroke="#1a5fb4" stroke-width="0.4"/>`;
});

svg += `
  </g>
</svg>`;

fs.writeFileSync('japan-map.svg', svg);
console.log('Written japan-map.svg');
