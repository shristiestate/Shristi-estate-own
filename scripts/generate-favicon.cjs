const fs = require('fs');

const b64Dark = fs.readFileSync('public/logo-icon-dark.png').toString('base64');
const dataUri = `data:image/png;base64,${b64Dark}`;

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a192f" />
      <stop offset="100%" stop-color="#040b17" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#bgGrad)" />
  <rect width="98" height="98" x="1" y="1" rx="21" fill="none" stroke="#233554" stroke-width="1.5" stroke-opacity="0.6" />
  <image href="${dataUri}" xlink:href="${dataUri}" x="10" y="10" width="80" height="80" preserveAspectRatio="xMidYMid meet" />
</svg>
`;

fs.writeFileSync('public/favicon.svg', svgContent.trim());
console.log('Successfully wrote public/favicon.svg, size:', svgContent.length);
