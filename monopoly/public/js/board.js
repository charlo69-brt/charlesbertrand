// board.js — Patrimonio HTML board (richup.io style)

const GROUP_COLORS = {
  brown:  '#a16207',
  lblue:  '#0891b2',
  pink:   '#db2777',
  orange: '#ea580c',
  red:    '#dc2626',
  yellow: '#ca8a04',
  green:  '#16a34a',
  dblue:  '#2563eb',
};

const GROUP_LIGHT = {
  brown:  '#fef3c7',
  lblue:  '#cffafe',
  pink:   '#fce7f3',
  orange: '#ffedd5',
  red:    '#fee2e2',
  yellow: '#fef9c3',
  green:  '#dcfce7',
  dblue:  '#dbeafe',
};

const BOARD_SQUARES = [
  { id:0,  type:'go',        name:'DÉPART',          icon:'🚀',  sub:'Recevez 2 000€' },
  { id:1,  type:'property',  name:'Limoges',         icon:'🏘️',  group:'brown',   price:600  },
  { id:2,  type:'community', name:'Caisse',           icon:'💼' },
  { id:3,  type:'property',  name:'Clermont-Fd',     icon:'🏔️',  group:'brown',   price:600  },
  { id:4,  type:'tax',       name:'Impôts',          icon:'💸',  sub:'2 000€' },
  { id:5,  type:'railroad',  name:'Gare de Lyon',    icon:'🚄',  price:2000 },
  { id:6,  type:'property',  name:'Rennes',          icon:'🏙️',  group:'lblue',   price:1000 },
  { id:7,  type:'chance',    name:'Surprise',        icon:'❓' },
  { id:8,  type:'property',  name:'Brest',           icon:'⚓',  group:'lblue',   price:1000 },
  { id:9,  type:'property',  name:'Caen',            icon:'🏰',  group:'lblue',   price:1200 },
  { id:10, type:'jail',      name:'Prison',          icon:'🔒',  sub:'En visite' },
  { id:11, type:'property',  name:'Tours',           icon:'🏰',  group:'pink',    price:1400 },
  { id:12, type:'utility',   name:'EDF',             icon:'⚡',  price:1500 },
  { id:13, type:'property',  name:'Dijon',           icon:'🍷',  group:'pink',    price:1400 },
  { id:14, type:'property',  name:'Reims',           icon:'🥂',  group:'pink',    price:1600 },
  { id:15, type:'railroad',  name:'Gare du Nord',    icon:'🚄',  price:2000 },
  { id:16, type:'property',  name:'Strasbourg',      icon:'🏛️',  group:'orange',  price:1800 },
  { id:17, type:'community', name:'Caisse',           icon:'💼' },
  { id:18, type:'property',  name:'Grenoble',        icon:'⛷️',  group:'orange',  price:1800 },
  { id:19, type:'property',  name:'Toulouse',        icon:'🛩️',  group:'orange',  price:2000 },
  { id:20, type:'parking',   name:'Parking',         icon:'🅿️',  sub:'Gratuit' },
  { id:21, type:'property',  name:'Nice',            icon:'🌴',  group:'red',     price:2200 },
  { id:22, type:'chance',    name:'Surprise',        icon:'❓' },
  { id:23, type:'property',  name:'Montpellier',     icon:'☀️',  group:'red',     price:2200 },
  { id:24, type:'property',  name:'Toulon',          icon:'🚢',  group:'red',     price:2400 },
  { id:25, type:'railroad',  name:'Gare St-Lazare',  icon:'🚄',  price:2000 },
  { id:26, type:'property',  name:'Lille',           icon:'🏙️',  group:'yellow',  price:2600 },
  { id:27, type:'property',  name:'Bordeaux',        icon:'🍇',  group:'yellow',  price:2600 },
  { id:28, type:'utility',   name:'Suez Eau',        icon:'💧',  price:1500 },
  { id:29, type:'property',  name:'Marseille',       icon:'⛵',  group:'yellow',  price:2800 },
  { id:30, type:'gotojail',  name:'En Prison !',     icon:'🚔',  sub:'Allez en prison' },
  { id:31, type:'property',  name:'Lyon P-Dieu',     icon:'🦁',  group:'green',   price:3000 },
  { id:32, type:'property',  name:'Lyon Conflu.',    icon:'🦁',  group:'green',   price:3000 },
  { id:33, type:'community', name:'Caisse',           icon:'💼' },
  { id:34, type:'property',  name:"Lyon Presqu'île", icon:'🦁',  group:'green',   price:3200 },
  { id:35, type:'railroad',  name:'Gare Montp.',     icon:'🚄',  price:2000 },
  { id:36, type:'chance',    name:'Surprise',        icon:'❓' },
  { id:37, type:'property',  name:'Paris 8e',        icon:'🗼',  group:'dblue',   price:3500 },
  { id:38, type:'tax',       name:'Taxe Luxe',       icon:'💰',  sub:'1 000€' },
  { id:39, type:'property',  name:'Paris 1er',       icon:'🗼',  group:'dblue',   price:4000 },
];

// DÉPART (0) top-left, clockwise
const TOP_ROW    = [0,1,2,3,4,5,6,7,8,9,10];
const RIGHT_COL  = [11,12,13,14,15,16,17,18,19];
const BOTTOM_ROW = [30,29,28,27,26,25,24,23,22,21,20];
const LEFT_COL   = [39,38,37,36,35,34,33,32,31];

function fmtPrice(n) {
  if (!n) return '';
  if (n >= 1000) return (n/1000) + ' 000€';
  return n + '€';
}

function fmtShort(n) {
  if (!n) return '';
  if (n >= 1000) return (n/1000).toFixed(n%1000===0?0:1) + 'k';
  return n + '';
}

/* ── Build a single square ── */
function makeSquare(id, position) {
  const sq = BOARD_SQUARES[id];
  const isCorner = [0,10,20,30].includes(id);
  const el = document.createElement('div');

  el.dataset.id = id;
  el.onclick = () => window.onSquareClick && window.onSquareClick(id);

  if (isCorner) {
    el.className = `sq sq-corner sq-${sq.type}`;
    el.innerHTML = `
      <div class="corner-inner">
        <span class="corner-icon">${sq.icon}</span>
        <span class="corner-label">${sq.name}</span>
        ${sq.sub ? `<span class="corner-sub">${sq.sub}</span>` : ''}
      </div>`;
    return el;
  }

  // Regular square
  const isProperty = sq.group && sq.type === 'property';
  const color = isProperty ? GROUP_COLORS[sq.group] : null;
  const colorLight = isProperty ? GROUP_LIGHT[sq.group] : null;

  el.className = `sq sq-reg sq-${position} sq-type-${sq.type}`;

  // Inner structure
  const inner = document.createElement('div');
  inner.className = 'sq-inner';

  if (isProperty) {
    // Color header
    const header = document.createElement('div');
    header.className = 'sq-header';
    header.style.background = color;
    header.innerHTML = `<span class="sq-hicon">${sq.icon}</span>`;
    inner.appendChild(header);

    // Name
    const name = document.createElement('div');
    name.className = 'sq-name';
    name.textContent = sq.name;
    inner.appendChild(name);

    // Price
    if (sq.price) {
      const price = document.createElement('div');
      price.className = 'sq-price';
      price.style.background = color;
      price.textContent = fmtShort(sq.price);
      inner.appendChild(price);
    }
  } else {
    // Non-property (chance, community, railroad, utility, tax)
    inner.innerHTML = `
      <span class="sq-icon-lg">${sq.icon}</span>
      <span class="sq-name-alt">${sq.name}</span>
      ${sq.price ? `<span class="sq-price-alt">${fmtShort(sq.price)}</span>` : ''}
      ${sq.sub ? `<span class="sq-price-alt">${sq.sub}</span>` : ''}
    `;
  }

  el.appendChild(inner);
  return el;
}

/* ── Build entire board ── */
function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  // Top row
  const topRow = document.createElement('div');
  topRow.className = 'brow brow-top';
  TOP_ROW.forEach(id => topRow.appendChild(makeSquare(id, 'top')));
  board.appendChild(topRow);

  // Left column
  const leftCol = document.createElement('div');
  leftCol.className = 'bcol bcol-left';
  LEFT_COL.forEach(id => leftCol.appendChild(makeSquare(id, 'left')));
  board.appendChild(leftCol);

  // Center
  const center = document.createElement('div');
  center.className = 'bcenter';
  center.id = 'board-center';
  center.innerHTML = `
    <div class="center-name">PATRIMONIO</div>
    <div class="center-desc">Gestion de Patrimoine</div>
    <div class="center-flag">🇫🇷</div>
  `;
  board.appendChild(center);

  // Right column
  const rightCol = document.createElement('div');
  rightCol.className = 'bcol bcol-right';
  RIGHT_COL.forEach(id => rightCol.appendChild(makeSquare(id, 'right')));
  board.appendChild(rightCol);

  // Bottom row
  const bottomRow = document.createElement('div');
  bottomRow.className = 'brow brow-bottom';
  BOTTOM_ROW.forEach(id => bottomRow.appendChild(makeSquare(id, 'bottom')));
  board.appendChild(bottomRow);
}

/* ── Update board from game state ── */
function updateBoard(state) {
  if (!state) return;

  // Clear overlays
  document.querySelectorAll('.sq-owner, .sq-houses-wrap').forEach(e => e.remove());
  document.querySelectorAll('.sq').forEach(e => e.classList.remove('sq-mortgaged', 'sq-highlight'));

  Object.entries(state.properties || {}).forEach(([sqId, prop]) => {
    const el = document.querySelector(`.sq[data-id="${sqId}"]`);
    if (!el || !prop.owner) return;

    const owner = state.players.find(p => p.id === prop.owner);
    if (owner) {
      const dot = document.createElement('div');
      dot.className = 'sq-owner';
      dot.style.background = owner.color;
      el.appendChild(dot);
    }

    if (prop.mortgaged) el.classList.add('sq-mortgaged');

    if (prop.houses > 0) {
      const h = document.createElement('div');
      h.className = 'sq-houses-wrap';
      h.innerHTML = prop.houses === 5
        ? '<span class="house-i">🏢</span>'
        : Array(prop.houses).fill('<span class="house-i">🏠</span>').join('');
      el.appendChild(h);
    }
  });

  // Highlight active player square
  const active = state.players[state.currentPlayerIndex];
  if (active && !active.bankrupt) {
    const el = document.querySelector(`.sq[data-id="${active.position}"]`);
    if (el) el.classList.add('sq-highlight');
  }

  // Use rAF to wait for layout before positioning tokens
  requestAnimationFrame(() => {
    requestAnimationFrame(() => updateTokens(state));
  });
}

/* ── Token positioning ── */
function getSquareCenter(sqId) {
  const el = document.querySelector(`.sq[data-id="${sqId}"]`);
  const board = document.getElementById('board');
  if (!el || !board) return null;
  const sr = el.getBoundingClientRect();
  const br = board.getBoundingClientRect();
  if (sr.width === 0 || br.width === 0) return null;
  return {
    x: sr.left - br.left + sr.width / 2,
    y: sr.top  - br.top  + sr.height / 2,
  };
}

function updateTokens(state) {
  if (!state) return;
  const board = document.getElementById('board');
  if (!board) return;

  state.players.forEach((player, pIdx) => {
    if (player.bankrupt) {
      const old = document.getElementById(`tk-${player.id}`);
      if (old) old.remove();
      return;
    }

    const sameSquare = state.players.slice(0, pIdx)
      .filter(p => p.position === player.position && !p.bankrupt);
    const offX = (sameSquare.length % 3 - 1) * 14;
    const offY = Math.floor(sameSquare.length / 3) * 14 - 4;

    const center = getSquareCenter(player.position);
    if (!center) return;

    let tk = document.getElementById(`tk-${player.id}`);
    if (!tk) {
      tk = document.createElement('div');
      tk.className = 'board-token';
      tk.id = `tk-${player.id}`;
      tk.textContent = player.token;
      board.appendChild(tk);
    }
    tk.style.left = `${center.x + offX}px`;
    tk.style.top  = `${center.y + offY}px`;
  });
}

/* ── Dice ── */
const DOT_POS = {
  1: [[1,1]],
  2: [[0,2],[2,0]],
  3: [[0,2],[1,1],[2,0]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]],
};

function renderDie(dieEl, value) {
  const inner = dieEl?.querySelector('.die-inner');
  if (!inner) return;
  const filled = new Set();
  (DOT_POS[value] || []).forEach(([r,c]) => filled.add(`${r},${c}`));
  let html = '';
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      html += `<div class="dd${filled.has(`${r},${c}`) ? ' on' : ''}"></div>`;
  inner.innerHTML = html;
}

function animateDice(dice) {
  const d0 = document.getElementById('die-0');
  const d1 = document.getElementById('die-1');
  if (!d0 || !d1) return;
  d0.classList.add('rolling');
  d1.classList.add('rolling');
  let f = 0;
  const iv = setInterval(() => {
    renderDie(d0, Math.ceil(Math.random() * 6));
    renderDie(d1, Math.ceil(Math.random() * 6));
    if (++f >= 8) {
      clearInterval(iv);
      d0.classList.remove('rolling');
      d1.classList.remove('rolling');
      renderDie(d0, dice[0]);
      renderDie(d1, dice[1]);
      const db = dice[0] === dice[1];
      d0.classList.toggle('doubles', db);
      d1.classList.toggle('doubles', db);
    }
  }, 60);
}

// Export
window.buildBoard    = buildBoard;
window.updateBoard   = updateBoard;
window.updateTokens  = updateTokens;
window.animateDice   = animateDice;
window.renderDie     = renderDie;
window.GROUP_COLORS  = GROUP_COLORS;
window.BOARD_SQUARES = BOARD_SQUARES;
