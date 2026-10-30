const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>

    <!-- Glowing Line Gradients -->
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="neonRose" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>

    <!-- Filters for Glow -->
    <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Rect -->
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)" />

  <!-- Outer Neon Frame Border -->
  <rect x="24" y="24" width="464" height="464" rx="88" fill="none" stroke="#1e293b" stroke-width="4" />
  <rect x="24" y="24" width="464" height="464" rx="88" fill="none" stroke="#06b6d4" stroke-width="2" stroke-opacity="0.35" />

  <!-- Background Subtle Grid Points -->
  <g fill="#334155" opacity="0.4">
    <circle cx="128" cy="128" r="4" />
    <circle cx="256" cy="128" r="4" />
    <circle cx="384" cy="128" r="4" />
    <circle cx="128" cy="256" r="4" />
    <circle cx="384" cy="256" r="4" />
    <circle cx="128" cy="384" r="4" />
    <circle cx="256" cy="384" r="4" />
    <circle cx="384" cy="384" r="4" />
  </g>

  <!-- Glowing Maze / Route Paths (Connecting Nodes) -->
  <g filter="url(#glowCyan)">
    <!-- Circuit maze path -->
    <path d="M 128 384 L 128 256 L 256 256 L 256 128 L 384 128 L 384 384" 
          fill="none" stroke="#06b6d4" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
  </g>

  <!-- Connected Nodes (Attributes Representation) -->
  <!-- Start Node (Rose Circle) -->
  <circle cx="128" cy="384" r="22" fill="#020617" stroke="url(#neonRose)" stroke-width="8" />
  <circle cx="128" cy="384" r="8" fill="#fb7185" />

  <!-- Corner Node (Amber Triangle) -->
  <g transform="translate(128, 256)">
    <polygon points="0,-24 22,16 -22,16" fill="#020617" stroke="#fbbf24" stroke-width="7" stroke-linejoin="round" />
    <polygon points="0,-10 9,7 -9,7" fill="#fbbf24" />
  </g>

  <!-- Center Shifting Core (Prism / Diamond with 4 Dimensions) -->
  <g filter="url(#glowPurple)" transform="translate(256, 256)">
    <!-- Diamond Base -->
    <polygon points="0,-72 72,0 0,72 -72,0" fill="#090d16" stroke="url(#neonCyan)" stroke-width="10" stroke-linejoin="round" />
    
    <!-- 4 Facets representing 4 Dimensions: Color(Rose), Shape(Purple), Count(Cyan), Pattern(Amber) -->
    <polygon points="0,-72 72,0 0,0" fill="url(#neonPurple)" opacity="0.8" />
    <polygon points="72,0 0,72 0,0" fill="url(#neonRose)" opacity="0.8" />
    <polygon points="0,72 -72,0 0,0" fill="url(#neonCyan)" opacity="0.8" />
    <polygon points="-72,0 0,-72 0,0" fill="#fbbf24" opacity="0.8" />

    <!-- Center Pivot Gem -->
    <polygon points="0,-24 24,0 0,24 -24,0" fill="#ffffff" />
  </g>

  <!-- Top Turn Node (Purple Square) -->
  <g transform="translate(256, 128)">
    <rect x="-18" y="-18" width="36" height="36" rx="6" fill="#020617" stroke="url(#neonPurple)" stroke-width="7" />
    <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#c084fc" />
  </g>

  <!-- Top Right Node (Cyan Diamond) -->
  <g transform="translate(384, 128)">
    <polygon points="0,-22 22,0 0,22 -22,0" fill="#020617" stroke="url(#neonCyan)" stroke-width="7" stroke-linejoin="round" />
    <polygon points="0,-9 9,0 0,9 -9,0" fill="#38bdf8" />
  </g>

  <!-- Goal Node (Multi-layer Pulsing Star / Goal Target) -->
  <g transform="translate(384, 384)">
    <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="6,4" />
    <circle cx="0" cy="0" r="22" fill="#020617" stroke="url(#neonCyan)" stroke-width="8" />
    <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" fill="#38bdf8" />
  </g>
</svg>
`;

// Maskable version (needs safe-zone margin around center graphics)
const svgMaskableIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="neonCyanM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="neonPurpleM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="neonRoseM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
    <filter id="glowPurpleM" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Full Bleed Background for Maskable -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Inner Content scaled into 80% safe zone (center 400x400) -->
  <g transform="translate(56, 56) scale(0.78)">
    <!-- Circuit maze path -->
    <path d="M 128 384 L 128 256 L 256 256 L 256 128 L 384 128 L 384 384" 
          fill="none" stroke="#06b6d4" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />

    <!-- Start Node -->
    <circle cx="128" cy="384" r="22" fill="#020617" stroke="url(#neonRoseM)" stroke-width="8" />
    <circle cx="128" cy="384" r="8" fill="#fb7185" />

    <!-- Triangle Node -->
    <g transform="translate(128, 256)">
      <polygon points="0,-24 22,16 -22,16" fill="#020617" stroke="#fbbf24" stroke-width="7" stroke-linejoin="round" />
      <polygon points="0,-10 9,7 -9,7" fill="#fbbf24" />
    </g>

    <!-- Center Shifting Core -->
    <g filter="url(#glowPurpleM)" transform="translate(256, 256)">
      <polygon points="0,-76 76,0 0,76 -76,0" fill="#090d16" stroke="url(#neonCyanM)" stroke-width="10" stroke-linejoin="round" />
      <polygon points="0,-76 76,0 0,0" fill="url(#neonPurpleM)" opacity="0.8" />
      <polygon points="76,0 0,76 0,0" fill="url(#neonRoseM)" opacity="0.8" />
      <polygon points="0,76 -76,0 0,0" fill="url(#neonCyanM)" opacity="0.8" />
      <polygon points="-76,0 0,-76 0,0" fill="#fbbf24" opacity="0.8" />
      <polygon points="0,-26 26,0 0,26 -26,0" fill="#ffffff" />
    </g>

    <!-- Square Node -->
    <g transform="translate(256, 128)">
      <rect x="-18" y="-18" width="36" height="36" rx="6" fill="#020617" stroke="url(#neonPurpleM)" stroke-width="7" />
      <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#c084fc" />
    </g>

    <!-- Diamond Node -->
    <g transform="translate(384, 128)">
      <polygon points="0,-22 22,0 0,22 -22,0" fill="#020617" stroke="url(#neonCyanM)" stroke-width="7" stroke-linejoin="round" />
      <polygon points="0,-9 9,0 0,9 -9,0" fill="#38bdf8" />
    </g>

    <!-- Goal Node -->
    <g transform="translate(384, 384)">
      <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="6,4" />
      <circle cx="0" cy="0" r="22" fill="#020617" stroke="url(#neonCyanM)" stroke-width="8" />
      <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" fill="#38bdf8" />
    </g>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve(__dirname, '../public');

  console.log('Generating PWA icons into:', publicDir);

  // 1. icon-512x512.png
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));
  console.log('Created icon-512x512.png');

  // 2. icon-192x192.png
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));
  console.log('Created icon-192x192.png');

  // 3. icon-maskable-512x512.png
  await sharp(Buffer.from(svgMaskableIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512x512.png'));
  console.log('Created icon-maskable-512x512.png');

  // 4. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 5. favicon.ico / favicon-48.png
  await sharp(Buffer.from(svgIcon))
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  // Also write SVG for reference
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon.trim());
  console.log('Created icon.svg');
}

main().catch(console.error);
