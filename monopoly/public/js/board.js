// board.js — Patrimonio HTML board

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

const BOARD_SQUARES = [
  { id:0,  type:'go',        name:'DÉPART',       icon:'🚀',  sub:'+2000€'  },
  { id:1,  type:'property',  name:'Limoges',      group:'brown',   price:600  },
  { id:2,  type:'community', name:'Caisse',        icon:'💼'                 },
  { id:3,  type:'property',  name:'Clermont',     group:'brown',   price:600  },
  { id:4,  type:'tax',       name:'Impôts',       icon:'💸',  sub:'2000€'  },
  { id:5,  type:'railroad',  name:'Gare Lyon',    icon:'🚄',  price:2000   },
  { id:6,  type:'property',  name:'Rennes',       group:'lblue',   price:1000 },
  { id:7,  type:'chance',    name:'Surprise',     icon:'❓'                 },
  { id:8,  type:'property',  name:'Brest',        group:'lblue',   price:1000 },
  { id:9,  type:'property',  name:'Caen',         group:'lblue',   price:1200 },
  { id:10, type:'jail',      name:'PRISON',       icon:'🔒',  sub:'Visite'  },
  { id:11, type:'property',  name:'Tours',        group:'pink',    price:1400 },
  { id:12, type:'utility',   name:'EDF',          icon:'⚡',  price:1500   },
  { id:13, type:'property',  name:'Dijon',        group:'pink',    price:1400 },
  { id:14, type:'property',  name:'Reims',        group:'pink',    price:1600 },
  { id:15, type:'railroad',  name:'Gare Nord',    icon:'🚄',  price:2000   },
  { id:16, type:'property',  name:'Strasbourg',   group:'orange',  price:1800 },
  { id:17, type:'community', name:'Caisse',        icon:'💼'                 },
  { id:18, type:'property',  name:'Grenoble',     group:'orange',  price:1800 },
  { id:19, type:'property',  name:'Toulouse',     group:'orange',  price:2000 },
  { id:20, type:'parking',   name:'PARKING',      icon:'🅿️',  sub:'Gratuit' },
  { id:21, type:'property',  name:'Nice',         group:'red',     price:2200 },
  { id:22, type:'chance',    name:'Surprise',     icon:'❓'                 },
  { id:23, type:'property',  name:'Montpellier',  group:'red',     price:2200 },
  { id:24, type:'property',  name:'Toulon',       group:'red',     price:2400 },
  { id:25, type:'railroad',  name:'Gare SL',      icon:'🚄',  price:2000   },
  { id:26, type:'property',  name:'Lille',        group:'yellow',  price:2600 },
  { id:27, type:'property',  name:'Bordeaux',     group:'yellow',  price:2600 },
  { id:28, type:'utility',   name:'Suez Eau',     icon:'💧',  price:1500   },
  { id:29, type:'property',  name:'Marseille',    group:'yellow',  price:2800 },
  { id:30, type:'gotojail',  name:'PRISON !',     icon:'🚔',  sub:'Allez'  },
  { id:31, type:'property',  name:'Lyon PD',      group:'green',   price:3000 },
  { id:32, type:'property',  name:'Lyon Conf.',   group:'green',   price:3000 },
  { id:33, type:'community', name:'Caisse',        icon:'💼'                 },
  { id:34, type:'property',  name:"Lyon Presq.",  group:'green',   price:3200 },
  { id:35, type:'railroad',  name:'Gare MP',      icon:'🚄',  price:2000   },
  { id:36, type:'chance',    name:'Surprise',     icon:'❓'                 },
  { id:37, type:'property',  name:'Paris 8e',     group:'dblue',   price:3500 },
  { id:38, type:'tax',       name:'Taxe Luxe',    icon:'💰',  sub:'1000€'  },
  { id:39, type:'property',  name:'Paris 1er',    group:'dblue',   price:4000 },
];

// DÉPART top-left, clockwise
const TOP_ROW    = [0,1,2,3,4,5,6,7,8,9,10];
const RIGHT_COL  = [11,12,13,14,15,16,17,18,19];
const BOTTOM_ROW = [30,29,28,27,26,25,24,23,22,21,20];
const LEFT_COL   = [39,38,37,36,35,34,33,32,31];

function fmtK(n) {
  if (!n) return '';
  return n >= 1000 ? (n/1000).toFixed(n%1000===0?0:1)+'k' : n+'€';
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

/* ── Single square ── */
function makeSquare(id, bandPos) {
  const sq = BOARD_SQUARES[id];
  const isCorner = [0,10,20,30].includes(id);
  const el = document.createElement('div');
  el.dataset.id = id;
  el.onclick = () => window.onSquareClick && window.onSquareClick(id);

  if (isCorner) {
    el.className = `sq sq-corner sq-${sq.type}`;
    el.innerHTML = `
      <div class="corner-in">
        <span class="c-icon">${sq.icon||''}</span>
        <span class="c-label">${sq.name}</span>
        ${sq.sub ? `<span class="c-sub">${sq.sub}</span>` : ''}
      </div>`;
    return el;
  }

  const isProperty = sq.type === 'property' && sq.group;
  el.className = `sq sq-reg sq-bp-${bandPos}`;

  // Color band (absolute positioned on outer edge)
  if (isProperty) {
    const band = document.createElement('div');
    band.className = 'sq-band';
    band.style.background = GROUP_COLORS[sq.group];
    el.appendChild(band);
  }

  // Body (centered)
  const body = document.createElement('div');
  body.className = 'sq-body';

  if (isProperty) {
    body.innerHTML = `
      <span class="sq-name">${sq.name}</span>
      <span class="sq-price">${fmtK(sq.price)}</span>`;
  } else {
    // Special squares: railroad, utility, chance, community, tax
    body.innerHTML = `
      <span class="sq-icon">${sq.icon||''}</span>
      <span class="sq-name sq-name-sm">${sq.name}</span>
      ${sq.price ? `<span class="sq-price">${fmtK(sq.price)}</span>` : ''}
      ${sq.sub   ? `<span class="sq-sub">${sq.sub}</span>`           : ''}`;
  }

  el.appendChild(body);
  return el;
}

/* ── Build board ── */
function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  // Top row
  const top = document.createElement('div');
  top.className = 'brow brow-top';
  TOP_ROW.forEach(id => top.appendChild(makeSquare(id, 'top')));
  board.appendChild(top);

  // Left col
  const left = document.createElement('div');
  left.className = 'bcol bcol-left';
  LEFT_COL.forEach(id => left.appendChild(makeSquare(id, 'left')));
  board.appendChild(left);

  // Center
  const center = document.createElement('div');
  center.className = 'bcenter';
  center.id = 'board-center';
  center.innerHTML = `
    <div class="center-title">PATRIMONIO</div>
    <div class="center-sub">Gestion de Patrimoine · 🇫🇷</div>
  `;
  board.appendChild(center);

  // Right col
  const right = document.createElement('div');
  right.className = 'bcol bcol-right';
  RIGHT_COL.forEach(id => right.appendChild(makeSquare(id, 'right')));
  board.appendChild(right);

  // Bottom row
  const bottom = document.createElement('div');
  bottom.className = 'brow brow-bottom';
  BOTTOM_ROW.forEach(id => bottom.appendChild(makeSquare(id, 'bottom')));
  board.appendChild(bottom);
}

/* ── Update board from game state ── */
function updateBoard(state) {
  if (!state) return;
  const { properties = {}, players = [] } = state;

  // Reset all squares
  document.querySelectorAll('.sq-reg').forEach(el => {
    el.style.background = '';
    el.style.boxShadow  = '';
  });
  document.querySelectorAll('.sq-houses-w, .sq-owner-dot').forEach(e => e.remove());
  document.querySelectorAll('.sq').forEach(e => e.classList.remove('sq-owned', 'sq-highlight', 'sq-mortgaged'));

  // Apply ownership
  Object.entries(properties).forEach(([sqId, prop]) => {
    const el = document.querySelector(`.sq[data-id="${sqId}"]`);
    if (!el) return;

    if (prop.mortgaged) el.classList.add('sq-mortgaged');

    if (!prop.owner) return;
    const owner = players.find(p => p.id === prop.owner);
    if (!owner) return;

    // Color the square with the player's color
    const [r,g,b] = hexToRgb(owner.color);
    el.style.background = `rgba(${r},${g},${b},0.20)`;
    el.style.boxShadow  = `inset 0 0 0 1.5px rgba(${r},${g},${b},0.55)`;
    el.classList.add('sq-owned');

    // Houses/hotel
    if (prop.houses > 0) {
      const hw = document.createElement('div');
      hw.className = 'sq-houses-w';
      hw.innerHTML = prop.houses === 5
        ? '<span>🏢</span>'
        : Array(prop.houses).fill('<span>🏠</span>').join('');
      el.appendChild(hw);
    }
  });

  // Highlight active player's square
  const ap = players[state.currentPlayerIndex];
  if (ap && !ap.bankrupt) {
    const el = document.querySelector(`.sq[data-id="${ap.position}"]`);
    if (el) el.classList.add('sq-highlight');
  }

  // Tokens — wait for layout
  requestAnimationFrame(() => requestAnimationFrame(() => updateTokens(state)));
}

/* ── Tokens ── */
function getCenter(sqId) {
  const el  = document.querySelector(`.sq[data-id="${sqId}"]`);
  const brd = document.getElementById('board');
  if (!el || !brd) return null;
  const er = el.getBoundingClientRect();
  const br = brd.getBoundingClientRect();
  if (!er.width || !br.width) return null;
  return {
    x: er.left - br.left + er.width  / 2,
    y: er.top  - br.top  + er.height / 2,
  };
}

function updateTokens(state) {
  if (!state) return;
  const board = document.getElementById('board');
  if (!board) return;

  state.players.forEach((player, idx) => {
    let tk = document.getElementById(`tk-${player.id}`);
    if (player.bankrupt) { if (tk) tk.remove(); return; }

    // Offset when multiple tokens on same square
    const same = state.players.slice(0, idx).filter(p => p.position === player.position && !p.bankrupt);
    const offX = (same.length % 3 - 1) * 16;
    const offY = Math.floor(same.length / 3) * 14;

    const c = getCenter(player.position);
    if (!c) return;

    if (!tk) {
      tk = document.createElement('div');
      tk.className = 'board-token';
      tk.id = `tk-${player.id}`;
      tk.textContent = player.token;
      board.appendChild(tk);
    }
    tk.style.left = `${c.x + offX}px`;
    tk.style.top  = `${c.y + offY}px`;
  });
}

/* ── Dice ── */
const DOT_POS = {
  1:[[1,1]],
  2:[[0,2],[2,0]],
  3:[[0,2],[1,1],[2,0]],
  4:[[0,0],[0,2],[2,0],[2,2]],
  5:[[0,0],[0,2],[1,1],[2,0],[2,2]],
  6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]],
};

function renderDie(el, val) {
  const inner = el?.querySelector('.die-inner');
  if (!inner) return;
  const on = new Set((DOT_POS[val]||[]).map(([r,c])=>`${r},${c}`));
  let h = '';
  for (let r=0;r<3;r++) for (let c=0;c<3;c++) h += `<div class="dd${on.has(`${r},${c}`)?' on':''}"></div>`;
  inner.innerHTML = h;
}

function animateDice(dice) {
  const d0 = document.getElementById('die-0');
  const d1 = document.getElementById('die-1');
  if (!d0||!d1) return;
  d0.classList.add('rolling'); d1.classList.add('rolling');
  let f=0;
  const iv = setInterval(()=>{
    renderDie(d0, Math.ceil(Math.random()*6));
    renderDie(d1, Math.ceil(Math.random()*6));
    if(++f>=8){
      clearInterval(iv);
      d0.classList.remove('rolling'); d1.classList.remove('rolling');
      renderDie(d0, dice[0]); renderDie(d1, dice[1]);
      const db = dice[0]===dice[1];
      d0.classList.toggle('doubles',db); d1.classList.toggle('doubles',db);
    }
  }, 60);
}

window.buildBoard    = buildBoard;
window.updateBoard   = updateBoard;
window.updateTokens  = updateTokens;
window.animateDice   = animateDice;
window.renderDie     = renderDie;
window.GROUP_COLORS  = GROUP_COLORS;
window.BOARD_SQUARES = BOARD_SQUARES;
