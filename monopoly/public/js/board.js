// board.js — HTML/CSS board generator for Patrimonio

const GROUP_COLORS = {
  brown:  '#92400e',
  lblue:  '#0891b2',
  pink:   '#db2777',
  orange: '#ea580c',
  red:    '#dc2626',
  yellow: '#ca8a04',
  green:  '#16a34a',
  dblue:  '#1d4ed8',
};

const BOARD_SQUARES = [
  { id:0,  type:'go',        name:'DÉPART',          short:'GO',       icon:'🚀',  sub:'+2000€' },
  { id:1,  type:'property',  name:'Limoges',         icon:'🏘️',  group:'brown',   price:600  },
  { id:2,  type:'community', name:'Caisse Commun.',  icon:'💼',  short:'Caisse' },
  { id:3,  type:'property',  name:'Clermont-Fd.',    icon:'🏘️',  group:'brown',   price:600  },
  { id:4,  type:'tax',       name:'Impôts',          icon:'💸',  sub:'2 000€' },
  { id:5,  type:'railroad',  name:'Gare de Lyon',    icon:'🚄' },
  { id:6,  type:'property',  name:'Rennes',          icon:'🏙️',  group:'lblue',   price:1000 },
  { id:7,  type:'chance',    name:'Opportunité',     icon:'⭐' },
  { id:8,  type:'property',  name:'Brest',           icon:'🏙️',  group:'lblue',   price:1000 },
  { id:9,  type:'property',  name:'Caen',            icon:'🏙️',  group:'lblue',   price:1200 },
  { id:10, type:'jail',      name:'PRISON',          short:'Prison', icon:'🏛️',  sub:'En visite' },
  { id:11, type:'property',  name:'Tours',           icon:'🏙️',  group:'pink',    price:1400 },
  { id:12, type:'utility',   name:'EDF Électricité', icon:'⚡' },
  { id:13, type:'property',  name:'Dijon',           icon:'🏙️',  group:'pink',    price:1400 },
  { id:14, type:'property',  name:'Reims',           icon:'🏙️',  group:'pink',    price:1600 },
  { id:15, type:'railroad',  name:'Gare du Nord',    icon:'🚄' },
  { id:16, type:'property',  name:'Strasbourg',      icon:'🏙️',  group:'orange',  price:1800 },
  { id:17, type:'community', name:'Caisse Commun.',  icon:'💼' },
  { id:18, type:'property',  name:'Grenoble',        icon:'🏙️',  group:'orange',  price:1800 },
  { id:19, type:'property',  name:'Toulouse',        icon:'🏙️',  group:'orange',  price:2000 },
  { id:20, type:'parking',   name:'PARKING',         short:'Parking', icon:'🅿️', sub:'Gratuit' },
  { id:21, type:'property',  name:'Nice',            icon:'🌴',  group:'red',     price:2200 },
  { id:22, type:'chance',    name:'Opportunité',     icon:'⭐' },
  { id:23, type:'property',  name:'Montpellier',     icon:'🌇',  group:'red',     price:2200 },
  { id:24, type:'property',  name:'Toulon',          icon:'🌊',  group:'red',     price:2400 },
  { id:25, type:'railroad',  name:'Gare St-Lazare',  icon:'🚄' },
  { id:26, type:'property',  name:'Lille',           icon:'🏙️',  group:'yellow',  price:2600 },
  { id:27, type:'property',  name:'Bordeaux',        icon:'🍷',  group:'yellow',  price:2600 },
  { id:28, type:'utility',   name:'Suez Eau',        icon:'💧' },
  { id:29, type:'property',  name:'Marseille',       icon:'⚓',  group:'yellow',  price:2800 },
  { id:30, type:'gotojail',  name:'EN PRISON',       short:'Prison', icon:'🚔',  sub:'Allez en prison' },
  { id:31, type:'property',  name:'Lyon Part-Dieu',  icon:'🏛️',  group:'green',   price:3000 },
  { id:32, type:'property',  name:'Lyon Confluence', icon:'🏛️',  group:'green',   price:3000 },
  { id:33, type:'community', name:'Caisse Commun.',  icon:'💼' },
  { id:34, type:'property',  name:"Lyon Presqu'île", icon:'🏛️',  group:'green',   price:3200 },
  { id:35, type:'railroad',  name:'Gare Montparnasse',icon:'🚄' },
  { id:36, type:'chance',    name:'Opportunité',     icon:'⭐' },
  { id:37, type:'property',  name:'Paris 8ème',      icon:'🗼',  group:'dblue',   price:3500 },
  { id:38, type:'tax',       name:'Taxe Patrimoine', icon:'💰',  sub:'1 000€' },
  { id:39, type:'property',  name:'Paris 1er',       icon:'🗼',  group:'dblue',   price:4000 },
];

// Square layout:
// Bottom row (L→R): 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
// Left col  (T→B): 19, 18, 17, 16, 15, 14, 13, 12, 11
// Top row   (L→R): 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
// Right col (T→B): 31, 32, 33, 34, 35, 36, 37, 38, 39

const BOTTOM_ROW  = [10,9,8,7,6,5,4,3,2,1,0];
const LEFT_COL    = [19,18,17,16,15,14,13,12,11];
const TOP_ROW     = [20,21,22,23,24,25,26,27,28,29,30];
const RIGHT_COL   = [31,32,33,34,35,36,37,38,39];

function fmt(n) {
  if (n >= 1000) return (n/1000).toFixed(n%1000===0?0:1)+'k€';
  return n+'€';
}

function makeSquare(id, sizeClass) {
  const sq = BOARD_SQUARES[id];
  const typeClass = `sq-${sq.type}`;
  const el = document.createElement('div');
  el.className = `sq ${sizeClass} ${typeClass}`;
  el.dataset.id = id;
  el.title = sq.name;
  el.onclick = () => window.onSquareClick && window.onSquareClick(id);

  if (sq.type === 'go' || sq.type === 'jail' || sq.type === 'parking' || sq.type === 'gotojail') {
    // Corner
    el.innerHTML = `
      <div class="sq-corner-inner">
        <div class="sq-corner-icon">${sq.icon}</div>
        <div class="sq-corner-label">${sq.short || sq.name}</div>
        ${sq.sub ? `<div class="sq-corner-sub">${sq.sub}</div>` : ''}
      </div>`;
  } else {
    // Regular square
    const band = sq.group ? `<div class="sq-band" style="background:${GROUP_COLORS[sq.group]}"></div>` : '';
    el.innerHTML = `
      ${band}
      <div class="sq-body">
        <div class="sq-icon">${sq.icon||''}</div>
        <div class="sq-name">${sq.name}</div>
        ${sq.price ? `<div class="sq-price">${fmt(sq.price)}</div>` : (sq.sub ? `<div class="sq-price" style="color:#94a3b8">${sq.sub}</div>` : '')}
      </div>`;
  }
  return el;
}

function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  // Top row
  const topRow = document.createElement('div');
  topRow.className = 'b-top-row';
  TOP_ROW.forEach((id, i) => {
    const isCorner = i === 0 || i === TOP_ROW.length - 1;
    topRow.appendChild(makeSquare(id, isCorner ? 'sq-corner' : 'sq-regular-h'));
  });
  board.appendChild(topRow);

  // Middle row
  const middle = document.createElement('div');
  middle.style.cssText = 'display:contents';

  // Left col
  const leftCol = document.createElement('div');
  leftCol.className = 'b-left-col';
  LEFT_COL.forEach(id => leftCol.appendChild(makeSquare(id, 'sq-regular-v')));
  board.appendChild(leftCol);

  // Center
  const center = document.createElement('div');
  center.className = 'b-center';
  center.id = 'board-center';
  center.innerHTML = `
    <div class="center-logo">PATRIMONIO</div>
    <div class="center-sub">Gestion de Patrimoine · France 🇫🇷</div>
  `;
  board.appendChild(center);

  // Right col
  const rightCol = document.createElement('div');
  rightCol.className = 'b-right-col';
  RIGHT_COL.forEach(id => rightCol.appendChild(makeSquare(id, 'sq-regular-v')));
  board.appendChild(rightCol);

  // Bottom row
  const bottomRow = document.createElement('div');
  bottomRow.className = 'b-bottom-row';
  BOTTOM_ROW.forEach((id, i) => {
    const isCorner = i === 0 || i === BOTTOM_ROW.length - 1;
    bottomRow.appendChild(makeSquare(id, isCorner ? 'sq-corner' : 'sq-regular-h'));
  });
  board.appendChild(bottomRow);
}

// Update board visuals from game state
function updateBoard(state) {
  if (!state) return;
  const { properties = {}, players = [] } = state;

  // Clear overlays
  document.querySelectorAll('.sq-owner-dot, .sq-houses').forEach(el => el.remove());
  document.querySelectorAll('.sq').forEach(el => {
    el.classList.remove('sq-mortgaged', 'sq-active-player');
  });

  // Apply property ownership & houses
  Object.entries(properties).forEach(([sqId, prop]) => {
    const el = document.querySelector(`.sq[data-id="${sqId}"]`);
    if (!el || !prop.owner) return;

    const owner = players.find(p => p.id === prop.owner);
    if (owner) {
      const dot = document.createElement('div');
      dot.className = 'sq-owner-dot';
      dot.style.background = owner.color;
      el.appendChild(dot);
    }

    if (prop.mortgaged) el.classList.add('sq-mortgaged');

    if (prop.houses > 0) {
      const houses = document.createElement('div');
      houses.className = 'sq-houses';
      if (prop.houses === 5) {
        houses.innerHTML = '<span class="sq-house">🏢</span>';
      } else {
        houses.innerHTML = Array(prop.houses).fill('<span class="sq-house">🏠</span>').join('');
      }
      el.appendChild(houses);
    }
  });

  // Highlight active player's position
  const activePlayer = players[state.currentPlayerIndex];
  if (activePlayer && !activePlayer.bankrupt) {
    const el = document.querySelector(`.sq[data-id="${activePlayer.position}"]`);
    if (el) el.classList.add('sq-active-player');
  }

  // Tokens
  updateTokens(state);
}

// Get center coords of a square (relative to board element)
function getSquareCenter(sqId) {
  const el = document.querySelector(`.sq[data-id="${sqId}"]`);
  const board = document.getElementById('board');
  if (!el || !board) return { x: 0, y: 0 };
  const sqRect    = el.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  return {
    x: sqRect.left - boardRect.left + sqRect.width / 2,
    y: sqRect.top  - boardRect.top  + sqRect.height / 2,
  };
}

function updateTokens(state) {
  if (!state) return;
  const board = document.getElementById('board');
  if (!board) return;

  // Remove old tokens
  document.querySelectorAll('.board-token').forEach(el => el.remove());

  state.players.forEach((player, pIdx) => {
    if (player.bankrupt) return;

    // Offset for multiple players on same square
    const sameSquare = state.players.slice(0, pIdx)
      .filter(p => p.position === player.position && !p.bankrupt);
    const offX = (sameSquare.length % 3 - 1) * 16;
    const offY = Math.floor(sameSquare.length / 3) * 16;

    const center = getSquareCenter(player.position);
    if (!center) return;

    const token = document.createElement('div');
    token.className = 'board-token';
    token.id = `token-${player.id}`;
    token.textContent = player.token;
    token.style.left = `${center.x + offX}px`;
    token.style.top  = `${center.y + offY}px`;
    board.appendChild(token);
  });
}

// Dice rendering with actual dot patterns
const DOT_POSITIONS = {
  1: [[1,1]],
  2: [[0,2],[2,0]],
  3: [[0,2],[1,1],[2,0]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]],
};

function renderDie(dieEl, value) {
  const inner = dieEl.querySelector('.die-inner');
  if (!inner) return;

  // Build 3×3 grid
  const filled = new Set();
  (DOT_POSITIONS[value] || []).forEach(([r,c]) => filled.add(`${r},${c}`));

  let html = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      html += `<div class="d-dot${filled.has(`${r},${c}`) ? ' on' : ''}"></div>`;
    }
  }
  inner.innerHTML = html;
}

function animateDice(dice) {
  const d0 = document.getElementById('die-0');
  const d1 = document.getElementById('die-1');
  if (!d0 || !d1) return;

  d0.classList.add('rolling');
  d1.classList.add('rolling');

  // Show random values during animation
  let frames = 0;
  const interval = setInterval(() => {
    renderDie(d0, Math.ceil(Math.random() * 6));
    renderDie(d1, Math.ceil(Math.random() * 6));
    frames++;
    if (frames >= 8) {
      clearInterval(interval);
      d0.classList.remove('rolling');
      d1.classList.remove('rolling');
      renderDie(d0, dice[0]);
      renderDie(d1, dice[1]);
      const isDoubles = dice[0] === dice[1];
      d0.classList.toggle('doubles', isDoubles);
      d1.classList.toggle('doubles', isDoubles);
    }
  }, 60);
}

window.buildBoard      = buildBoard;
window.updateBoard     = updateBoard;
window.updateTokens    = updateTokens;
window.animateDice     = animateDice;
window.renderDie       = renderDie;
window.GROUP_COLORS    = GROUP_COLORS;
window.BOARD_SQUARES   = BOARD_SQUARES;
