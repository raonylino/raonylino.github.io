(function () {
  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function parseHsl(value) {
    const match = /hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/i.exec(value || 'hsl(220 70% 60%)');
    if (!match) return [220, 70, 60];
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function createMobileFrame(seed, accent, textColor) {
    const x = 80 + (seed % 30);
    const y = 60 + (seed % 40);
    return `
      <g>
        <rect x="${x}" y="55" width="210" height="370" rx="30" fill="rgba(9,12,18,0.9)" stroke="rgba(255,255,255,0.15)"/>
        <rect x="${x + 14}" y="72" width="182" height="336" rx="22" fill="rgba(255,255,255,0.04)"/>
        <circle cx="${x + 105}" cy="${y + 90}" r="28" fill="${accent}" opacity="0.9"/>
        <rect x="${x + 36}" y="${y + 138}" width="138" height="14" rx="7" fill="rgba(255,255,255,0.22)"/>
        <rect x="${x + 36}" y="${y + 170}" width="110" height="10" rx="5" fill="rgba(255,255,255,0.15)"/>
        <rect x="${x + 36}" y="${y + 214}" width="126" height="88" rx="16" fill="rgba(255,255,255,0.08)"/>
        <rect x="${x + 36}" y="${y + 320}" width="72" height="10" rx="5" fill="rgba(255,255,255,0.18)"/>
        <rect x="${x + 126}" y="${y + 320}" width="50" height="10" rx="5" fill="rgba(255,255,255,0.12)"/>
      </g>
    `;
  }

  function createBackendFrame(seed, accent, textColor) {
    const cx = 215 + (seed % 50);
    const cy = 200 + (seed % 80);
    const radius = 60 + (seed % 40);
    return `
      <g>
        <circle cx="${cx - 120}" cy="${cy - 90}" r="18" fill="rgba(255,255,255,0.18)"/>
        <circle cx="${cx}" cy="${cy}" r="18" fill="${accent}" opacity="0.9"/>
        <circle cx="${cx + 120}" cy="${cy - 90}" r="18" fill="rgba(255,255,255,0.18)"/>
        <path d="M ${cx - 100} ${cy - 85} L ${cx} ${cy} L ${cx + 100} ${cy - 85}" stroke="rgba(255,255,255,0.35)" stroke-width="4" fill="none"/>
        <rect x="${cx - 60}" y="${cy + 50}" width="120" height="90" rx="18" fill="rgba(9,12,18,0.68)" stroke="rgba(255,255,255,0.12)"/>
        <circle cx="${cx - 32}" cy="${cy + 92}" r="10" fill="${accent}" opacity="0.9"/>
        <circle cx="${cx}" cy="${cy + 92}" r="10" fill="rgba(255,255,255,0.22)"/>
        <circle cx="${cx + 32}" cy="${cy + 92}" r="10" fill="rgba(255,255,255,0.22)"/>
      </g>
    `;
  }

  window.gerarCapa = function (projeto) {
    const seed = hashString(projeto.id || 'default');
    const [h, s, l] = parseHsl(projeto.cor || 'hsl(220 70% 60%)');
    const accent = `hsl(${h} ${s}% ${Math.max(42, l - 4)}%)`;
    const textColor = '#f8f9fb';
    const id = `grad-${seed}`;
    const tags = (projeto.tags || []).slice(0, 3);
    const icon = projeto.icone || 'phone';
    const frame = projeto.categoria === 'backend' ? createBackendFrame(seed, accent, textColor) : createMobileFrame(seed, accent, textColor);
    const coverLabel = document.documentElement.lang === 'en' ? 'Project cover' : 'Capa do projeto';

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${coverLabel} ${projeto.titulo}">
        <defs>
          <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="hsl(${h} ${Math.min(80, s + 10)}% ${Math.min(26, l + 8)}%)"/>
            <stop offset="48%" stop-color="hsl(${(h + 18) % 360} ${s}% ${Math.max(10, l - 8)}%)"/>
            <stop offset="100%" stop-color="hsl(${(h + 38) % 360} ${Math.min(70, s - 8)}% ${Math.max(8, l - 10)}%)"/>
          </linearGradient>
        </defs>
        <rect width="800" height="500" fill="url(#${id})"/>
        <circle cx="700" cy="80" r="150" fill="rgba(255,255,255,0.08)"/>
        <circle cx="110" cy="430" r="170" fill="rgba(255,255,255,0.04)"/>
        <path d="M0 390 Q180 330 310 390 T800 408 V500 H0 Z" fill="rgba(12,17,24,0.16)"/>
        ${frame}
        <g transform="translate(500 86)">
          <rect x="0" y="0" width="180" height="160" rx="22" fill="rgba(9,12,18,0.24)" stroke="rgba(255,255,255,0.12)"/>
          <text x="86" y="74" text-anchor="middle" font-size="72" font-family="Arial, sans-serif" fill="${textColor}" font-weight="700">${icon === 'map' ? '▣' : icon === 'box' ? '▤' : icon === 'cart' ? '▣' : icon === 'film' ? '◉' : icon === 'heart' ? '♥' : icon === 'server' ? '⌂' : icon === 'api' ? '◌' : '⌁'}</text>
          <text x="90" y="120" text-anchor="middle" font-size="22" fill="${textColor}" font-family="Arial, sans-serif" font-weight="600">${projeto.titulo}</text>
        </g>
        <text x="48" y="440" fill="${textColor}" font-size="26" font-family="Arial, sans-serif" font-weight="700">${projeto.titulo}</text>
        <g transform="translate(48 452)">
          ${tags.map((tag, index) => `
            <g transform="translate(${index * 120} 0)">
              <rect width="108" height="28" rx="14" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.18)"/>
              <text x="54" y="18" text-anchor="middle" font-size="12" fill="${textColor}" font-family="Arial, sans-serif">${tag}</text>
            </g>
          `).join('')}
        </g>
      </svg>
    `;
  };
})();
