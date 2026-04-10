// board-render.js — Canvas rendering of the Patrimonio board

const GROUP_COLORS = {
  brown:  '#8B4513',
  lblue:  '#87CEEB',
  pink:   '#FF69B4',
  orange: '#FF8C00',
  red:    '#DC143C',
  yellow: '#FFD700',
  green:  '#228B22',
  dblue:  '#00008B',
};

const BOARD_DATA = [
  { id: 0,  type: 'go',        name: 'DÉPART',            short: 'DÉPART' },
  { id: 1,  type: 'property',  name: 'Limoges',           short: 'Limoges',         group: 'brown'  },
  { id: 2,  type: 'community', name: 'Caisse\nCommunauté',short: 'Caisse' },
  { id: 3,  type: 'property',  name: 'Clermont\nFerrand', short: 'Clermont',         group: 'brown'  },
  { id: 4,  type: 'tax',       name: 'IMPÔTS\n2 000€',   short: 'Impôts' },
  { id: 5,  type: 'railroad',  name: 'Gare\nde Lyon',     short: 'Gare Lyon' },
  { id: 6,  type: 'property',  name: 'Rennes',            short: 'Rennes',           group: 'lblue'  },
  { id: 7,  type: 'chance',    name: 'OPPOR-\nTUNITÉ',   short: 'Opport.' },
  { id: 8,  type: 'property',  name: 'Brest',             short: 'Brest',            group: 'lblue'  },
  { id: 9,  type: 'property',  name: 'Caen',              short: 'Caen',             group: 'lblue'  },
  { id: 10, type: 'jail',      name: 'PRISON',            short: 'Prison' },
  { id: 11, type: 'property',  name: 'Tours',             short: 'Tours',            group: 'pink'   },
  { id: 12, type: 'utility',   name: 'EDF\nÉlec.',        short: 'EDF' },
  { id: 13, type: 'property',  name: 'Dijon',             short: 'Dijon',            group: 'pink'   },
  { id: 14, type: 'property',  name: 'Reims',             short: 'Reims',            group: 'pink'   },
  { id: 15, type: 'railroad',  name: 'Gare\ndu Nord',     short: 'Gare Nord' },
  { id: 16, type: 'property',  name: 'Strasbourg',        short: 'Stras.',           group: 'orange' },
  { id: 17, type: 'community', name: 'Caisse\nCommunauté',short: 'Caisse' },
  { id: 18, type: 'property',  name: 'Grenoble',          short: 'Grenoble',         group: 'orange' },
  { id: 19, type: 'property',  name: 'Toulouse',          short: 'Toulouse',         group: 'orange' },
  { id: 20, type: 'parking',   name: 'PARKING\nGRATUIT',  short: 'Parking' },
  { id: 21, type: 'property',  name: 'Nice',              short: 'Nice',             group: 'red'    },
  { id: 22, type: 'chance',    name: 'OPPOR-\nTUNITÉ',   short: 'Opport.' },
  { id: 23, type: 'property',  name: 'Montpellier',       short: 'Montpel.',         group: 'red'    },
  { id: 24, type: 'property',  name: 'Toulon',            short: 'Toulon',           group: 'red'    },
  { id: 25, type: 'railroad',  name: 'Gare\nSaint-Lazare',short: 'Gare SL' },
  { id: 26, type: 'property',  name: 'Lille',             short: 'Lille',            group: 'yellow' },
  { id: 27, type: 'property',  name: 'Bordeaux',          short: 'Bordeaux',         group: 'yellow' },
  { id: 28, type: 'utility',   name: 'Suez\nEau',         short: 'Suez' },
  { id: 29, type: 'property',  name: 'Marseille',         short: 'Marseille',        group: 'yellow' },
  { id: 30, type: 'gotojail',  name: 'ALLEZ EN\nPRISON',  short: 'Go Jail' },
  { id: 31, type: 'property',  name: 'Lyon\nPart-Dieu',   short: 'Lyon PD',          group: 'green'  },
  { id: 32, type: 'property',  name: 'Lyon\nConfluence',  short: 'Lyon C.',          group: 'green'  },
  { id: 33, type: 'community', name: 'Caisse\nCommunauté',short: 'Caisse' },
  { id: 34, type: 'property',  name: "Lyon\nPresqu'île",  short: "Lyon P.",          group: 'green'  },
  { id: 35, type: 'railroad',  name: 'Gare\nMontparnasse',short: 'Gare MP' },
  { id: 36, type: 'chance',    name: 'OPPOR-\nTUNITÉ',   short: 'Opport.' },
  { id: 37, type: 'property',  name: 'Paris\n8ème',       short: 'Paris 8e',         group: 'dblue'  },
  { id: 38, type: 'tax',       name: 'TAXE\n1 000€',      short: 'Taxe' },
  { id: 39, type: 'property',  name: 'Paris\n1er',        short: 'Paris 1er',        group: 'dblue'  },
];

class BoardRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = 0;
    this.cornerSize = 0;
    this.cellW = 0;
    this.cellH = 0;
    this.squarePositions = [];  // center x,y of each square for token placement
    this.properties = {};
    this.players = [];
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const area = document.getElementById('board-area');
    const maxSize = Math.min(area.clientWidth - 20, area.clientHeight - 20, 680);
    this.size = Math.max(maxSize, 300);
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.cornerSize = Math.floor(this.size * 0.155);
    this.cellW = Math.floor((this.size - this.cornerSize * 2) / 9);
    this.cellH = this.cornerSize;
    this.computeSquarePositions();
    this.draw();
  }

  computeSquarePositions() {
    const S = this.size, C = this.cornerSize, W = this.cellW;
    this.squarePositions = new Array(40);

    // Bottom row (squares 0–10, right to left)
    for (let i = 0; i <= 10; i++) {
      if (i === 0) {
        this.squarePositions[0] = { x: S - C / 2, y: S - C / 2 };
      } else if (i === 10) {
        this.squarePositions[10] = { x: C / 2, y: S - C / 2 };
      } else {
        const x = S - C - (i - 0.5) * W;
        this.squarePositions[i] = { x, y: S - C / 2 };
      }
    }
    // Left col (squares 11–20, bottom to top)
    for (let i = 11; i <= 20; i++) {
      if (i === 20) {
        this.squarePositions[20] = { x: C / 2, y: C / 2 };
      } else {
        const y = S - C - (i - 10 - 0.5) * W;
        this.squarePositions[i] = { x: C / 2, y };
      }
    }
    // Top row (squares 21–30, left to right)
    for (let i = 21; i <= 30; i++) {
      if (i === 30) {
        this.squarePositions[30] = { x: S - C / 2, y: C / 2 };
      } else {
        const x = C + (i - 21 + 0.5) * W;
        this.squarePositions[i] = { x, y: C / 2 };
      }
    }
    // Right col (squares 31–39, top to bottom)
    for (let i = 31; i <= 39; i++) {
      const y = C + (i - 31 + 0.5) * W;
      this.squarePositions[i] = { x: S - C / 2, y };
    }
  }

  getSquareRect(id) {
    const S = this.size, C = this.cornerSize, W = this.cellW, H = this.cellH;
    // Bottom row: 0=bottom-right corner, 1-9=bottom cells, 10=bottom-left corner
    if (id === 0)  return { x: S - C, y: S - C, w: C, h: C };
    if (id === 10) return { x: 0,     y: S - C, w: C, h: C };
    if (id === 20) return { x: 0,     y: 0,     w: C, h: C };
    if (id === 30) return { x: S - C, y: 0,     w: C, h: C };

    if (id >= 1 && id <= 9) {
      const x = S - C - id * W;
      return { x, y: S - H, w: W, h: H };
    }
    if (id >= 11 && id <= 19) {
      const y = S - C - (id - 10) * W;
      return { x: 0, y, w: H, h: W };
    }
    if (id >= 21 && id <= 29) {
      const x = C + (id - 21) * W;
      return { x, y: 0, w: W, h: H };
    }
    if (id >= 31 && id <= 39) {
      const y = C + (id - 31) * W;
      return { x: S - H, y, w: H, h: W };
    }
    return { x: 0, y: 0, w: W, h: H };
  }

  draw() {
    const ctx = this.ctx;
    const S = this.size;
    ctx.clearRect(0, 0, S, S);

    // Background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, S, S);

    // Draw all squares
    for (let i = 0; i < 40; i++) {
      this.drawSquare(i);
    }

    // Center area
    this.drawCenter();

    // Grid border
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, S - 1, S - 1);
  }

  drawSquare(id) {
    const ctx = this.ctx;
    const sq = BOARD_DATA[id];
    const r = this.getSquareRect(id);
    const prop = this.properties[id];

    // Background
    ctx.fillStyle = this.getSquareBg(sq, prop);
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // Border
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Color band for properties
    if (sq.type === 'property' && sq.group) {
      this.drawColorBand(id, sq, r, prop);
    }

    // Special square icons
    this.drawSquareContent(id, sq, r, prop);

    // Mortgage overlay
    if (prop?.mortgaged) {
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
  }

  getSquareBg(sq, prop) {
    if (prop?.owner) {
      const player = this.players.find(p => p.id === prop.owner);
      if (player) return `${player.color}18`;
    }
    switch (sq.type) {
      case 'go':       return '#0f2340';
      case 'jail':     return '#0f2340';
      case 'parking':  return '#0f2340';
      case 'gotojail': return '#0f2340';
      case 'tax':      return '#150a1e';
      case 'chance':   return '#1a1205';
      case 'community':return '#051a1a';
      case 'railroad': return '#0a1a0f';
      case 'utility':  return '#0a1a0f';
      default:         return '#0d1a2e';
    }
  }

  drawColorBand(id, sq, r, prop) {
    const ctx = this.ctx;
    const bandSize = Math.floor(Math.min(r.w, r.h) * 0.28);
    const color = GROUP_COLORS[sq.group] || '#fff';

    // Determine which edge to draw the band on
    let bx = r.x, by = r.y, bw = r.w, bh = r.h;
    if (id >= 1 && id <= 9)   { by = r.y; bh = bandSize; }           // bottom row → top band
    if (id >= 11 && id <= 19) { bx = r.x + r.w - bandSize; bw = bandSize; } // left col → right band
    if (id >= 21 && id <= 29) { by = r.y + r.h - bandSize; bh = bandSize; } // top row → bottom band
    if (id >= 31 && id <= 39) { bx = r.x; bw = bandSize; }           // right col → left band

    ctx.fillStyle = color;
    ctx.fillRect(bx, by, bw, bh);

    // Owner dot
    if (prop?.owner) {
      const player = this.players.find(p => p.id === prop.owner);
      if (player) {
        const dotX = bx + bw / 2;
        const dotY = by + bh / 2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, bandSize * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Houses
    if (prop?.houses > 0) {
      this.drawHouseIcons(id, r, bandSize, prop.houses, bx, by, bw, bh);
    }
  }

  drawHouseIcons(id, r, bandSize, houses, bx, by, bw, bh) {
    const ctx = this.ctx;
    const isHotel = houses === 5;
    const count = isHotel ? 1 : houses;
    const icon = isHotel ? '🏢' : '🏠';
    const fontSize = Math.max(8, Math.floor(bandSize * 0.55));
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isHotel) {
      ctx.fillText(icon, bx + bw / 2, by + bh / 2);
    } else {
      const spacing = Math.min(bw, bh) / (count + 1);
      const isHoriz = (id >= 1 && id <= 9) || (id >= 21 && id <= 29);
      for (let i = 0; i < count; i++) {
        const ox = isHoriz ? bx + spacing * (i + 1) : bx + bw / 2;
        const oy = isHoriz ? by + bh / 2 : by + spacing * (i + 1);
        ctx.fillText(icon, ox, oy);
      }
    }
  }

  drawSquareContent(id, sq, r, prop) {
    const ctx = this.ctx;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const bandSize = sq.type === 'property' ? Math.floor(Math.min(r.w, r.h) * 0.28) : 0;

    // Adjust center for band
    let textCx = cx, textCy = cy;
    if (sq.type === 'property') {
      if (id >= 1 && id <= 9)   textCy = r.y + bandSize + (r.h - bandSize) / 2;
      if (id >= 11 && id <= 19) textCx = r.x + (r.w - bandSize) / 2;
      if (id >= 21 && id <= 29) textCy = r.y + (r.h - bandSize) / 2;
      if (id >= 31 && id <= 39) textCx = r.x + bandSize + (r.w - bandSize) / 2;
    }

    // Corner squares
    if (id === 0)  this.drawCornerGo(r);
    if (id === 10) this.drawCornerJail(r);
    if (id === 20) this.drawCornerParking(r);
    if (id === 30) this.drawCornerGoJail(r);

    if ([0, 10, 20, 30].includes(id)) return;

    // Rotation for left/right columns
    const isLeft  = id >= 11 && id <= 19;
    const isRight = id >= 31 && id <= 39;

    ctx.save();
    if (isLeft)  { ctx.translate(textCx, textCy); ctx.rotate(Math.PI / 2);  ctx.translate(-textCx, -textCy); }
    if (isRight) { ctx.translate(textCx, textCy); ctx.rotate(-Math.PI / 2); ctx.translate(-textCx, -textCy); }

    const maxW = isLeft || isRight ? r.h * 0.85 : r.w * 0.85;
    const fontSize = Math.max(6, Math.floor(Math.min(r.w, r.h) * 0.165));

    // Icon
    let icon = '';
    if (sq.type === 'railroad') icon = '🚄';
    if (sq.type === 'utility' && id === 12) icon = '⚡';
    if (sq.type === 'utility' && id === 28) icon = '💧';
    if (sq.type === 'chance')   icon = '⭐';
    if (sq.type === 'community') icon = '💼';
    if (sq.type === 'tax')      icon = '💸';

    if (icon) {
      ctx.font = `${fontSize * 1.4}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, textCx, textCy - fontSize * 0.7);
    }

    // Name text
    ctx.font = `${fontSize}px 'Exo 2', sans-serif`;
    ctx.fillStyle = '#c8d5e8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const lines = sq.name.split('\n');
    const lineH = fontSize * 1.2;
    const totalH = lines.length * lineH;
    const startY = icon
      ? textCy + fontSize * 0.6
      : textCy - totalH / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, textCx, startY + i * lineH, maxW);
    });

    ctx.restore();
  }

  drawCornerGo(r) {
    const ctx = this.ctx;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const fs = Math.floor(r.w * 0.22);
    ctx.font = `bold ${fs}px 'Rajdhani', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Gradient text
    const grad = ctx.createLinearGradient(cx - fs, cy, cx + fs, cy);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    ctx.fillText('DÉPART', cx, cy - fs * 0.3);
    ctx.font = `${fs * 0.7}px 'Exo 2', sans-serif`;
    ctx.fillStyle = '#10b981';
    ctx.fillText('→ +2000€', cx, cy + fs * 0.6);
  }

  drawCornerJail(r) {
    const ctx = this.ctx;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const fs = Math.floor(r.w * 0.18);
    ctx.font = `bold ${fs}px 'Rajdhani', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('🏛️', cx, cy - fs * 0.6);
    ctx.fillText('PRISON', cx, cy + fs * 0.3);
    ctx.font = `${fs * 0.6}px 'Exo 2', sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('En visite', cx, cy + fs * 1.1);
  }

  drawCornerParking(r) {
    const ctx = this.ctx;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const fs = Math.floor(r.w * 0.2);
    ctx.font = `${fs * 1.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🅿️', cx, cy - fs * 0.4);
    ctx.font = `bold ${fs * 0.7}px 'Rajdhani', sans-serif`;
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('GRATUIT', cx, cy + fs * 0.8);
  }

  drawCornerGoJail(r) {
    const ctx = this.ctx;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const fs = Math.floor(r.w * 0.17);
    ctx.font = `${fs * 1.4}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚔', cx, cy - fs * 0.6);
    ctx.font = `bold ${fs * 0.85}px 'Rajdhani', sans-serif`;
    ctx.fillStyle = '#ef4444';
    ctx.fillText('ALLEZ EN', cx, cy + fs * 0.4);
    ctx.fillText('PRISON', cx, cy + fs * 1.3);
  }

  drawCenter() {
    const ctx = this.ctx;
    const S = this.size, C = this.cornerSize;
    const cx = S / 2, cy = S / 2;
    const innerW = S - C * 2;

    // Inner background
    ctx.fillStyle = '#060d1a';
    ctx.fillRect(C, C, innerW, innerW);

    // Subtle grid
    ctx.strokeStyle = 'rgba(0,212,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const x = C + (innerW / 4) * i;
      ctx.beginPath(); ctx.moveTo(x, C); ctx.lineTo(x, S - C); ctx.stroke();
      const y = C + (innerW / 4) * i;
      ctx.beginPath(); ctx.moveTo(C, y); ctx.lineTo(S - C, y); ctx.stroke();
    }

    // Logo
    const fs = Math.floor(innerW * 0.1);
    ctx.font = `bold ${fs}px 'Rajdhani', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const grad = ctx.createLinearGradient(cx - fs * 3, cy, cx + fs * 3, cy);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(0.5, '#a78bfa');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillText('PATRIMONIO', cx, cy - fs * 0.5);

    ctx.font = `${fs * 0.38}px 'Exo 2', sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('GESTION DE PATRIMOINE', cx, cy + fs * 0.6);

    // France map emoji
    ctx.font = `${fs * 1.2}px serif`;
    ctx.fillText('🇫🇷', cx, cy + fs * 1.8);
  }

  update(state) {
    if (state) {
      this.properties = state.properties || {};
      this.players = state.players || [];
    }
    this.draw();
    this.updateTokens(state);
  }

  updateTokens(state) {
    if (!state) return;
    const layer = document.getElementById('tokens-layer');
    layer.innerHTML = '';

    state.players.forEach((player, pIdx) => {
      if (player.bankrupt) return;
      const sq = this.squarePositions[player.position];
      if (!sq) return;

      // Offset multiple tokens on same square
      const sameSquare = state.players.filter((p, i) => i < pIdx && p.position === player.position && !p.bankrupt);
      const offsetX = (sameSquare.length % 3) * 16 - (Math.min(sameSquare.length, 2) * 8);
      const offsetY = Math.floor(sameSquare.length / 3) * 16;

      const token = document.createElement('div');
      token.className = 'token-piece';
      token.id = `token-${player.id}`;
      token.style.left = `${sq.x + offsetX}px`;
      token.style.top  = `${sq.y + offsetY}px`;
      token.textContent = player.token;
      layer.appendChild(token);
    });
  }

  getSquareAt(x, y) {
    for (let i = 0; i < 40; i++) {
      const r = this.getSquareRect(i);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return i;
      }
    }
    return -1;
  }
}

window.BoardRenderer = BoardRenderer;
window.BOARD_DATA = BOARD_DATA;
window.GROUP_COLORS = GROUP_COLORS;
