// game.js — Client-side game logic for Patrimonio

const socket = io();
let myPlayerId   = sessionStorage.getItem('patrimonio_playerId');
let roomCode     = sessionStorage.getItem('patrimonio_roomCode');
let isHost       = sessionStorage.getItem('patrimonio_isHost') === '1';
let gameState    = null;
let renderer     = null;
let pendingBuySquareId = null;

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (!myPlayerId || !roomCode) {
    window.location.href = '/';
    return;
  }

  const canvas = document.getElementById('board-canvas');
  renderer = new BoardRenderer(canvas);

  // Click on board → show property info
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const sqId = renderer.getSquareAt(x, y);
    if (sqId >= 0) onSquareClick(sqId);
  });

  // Reconnect to room
  socket.emit('rejoinRoom', { roomCode, playerId: myPlayerId });
});

// ── Socket events ─────────────────────────────────────────────────────────────
socket.on('gameState', (state) => {
  gameState = state;
  renderer.update(state);
  renderPlayers(state);
  renderActionPanel(state);
  renderLog(state);

  if (state.phase === 'ended' && state.winner) {
    showWinScreen(state);
  }
});

socket.on('cardDrawn', ({ cardType, card }) => {
  showCardModal(cardType, card);
});

socket.on('error', (msg) => {
  showToast(msg, 'error');
});

socket.on('connect', () => {
  if (roomCode && myPlayerId) {
    socket.emit('rejoinRoom', { roomCode, playerId: myPlayerId });
  }
});

// ── Players panel ─────────────────────────────────────────────────────────────
function renderPlayers(state) {
  const panel = document.getElementById('players-panel');
  panel.innerHTML = '';

  state.players.forEach((p, i) => {
    const isActive = i === state.currentPlayerIndex && state.phase === 'playing';
    const isMe = p.id === myPlayerId;

    const card = document.createElement('div');
    card.className = `player-card-game${isActive ? ' active' : ''}${p.bankrupt ? ' bankrupt' : ''}`;
    card.onclick = () => { if (!p.bankrupt) showPlayerProperties(p.id); };

    // Count player's props
    const myProps = Object.entries(state.properties || {})
      .filter(([, v]) => v.owner === p.id)
      .map(([k]) => BOARD_DATA[parseInt(k)]);

    const propDots = myProps.slice(0, 12).map(sq => {
      const color = sq?.group ? GROUP_COLORS[sq.group] : '#475569';
      return `<div class="prop-dot" style="background:${color}"></div>`;
    }).join('');

    card.innerHTML = `
      <div class="pc-header">
        ${isActive ? '<div class="pc-turn-indicator"></div>' : ''}
        <span class="pc-token">${p.token}</span>
        <span class="pc-name" style="color:${p.color}">${p.name}${isMe ? ' (moi)' : ''}${p.isBot ? ' 🤖' : ''}</span>
      </div>
      <div class="pc-money">${formatMoney(p.money)}</div>
      <div class="pc-props">${propDots}</div>
      ${p.inJail ? '<div style="font-size:11px;color:#f59e0b;margin-top:4px">🔒 En prison</div>' : ''}
      ${p.bankrupt ? '<div style="font-size:11px;color:#ef4444;margin-top:4px">💀 Faillite</div>' : ''}
    `;
    panel.appendChild(card);
  });
}

// ── Action panel ──────────────────────────────────────────────────────────────
function renderActionPanel(state) {
  const turnInfo = document.getElementById('turn-info');
  const btns     = document.getElementById('action-buttons');

  if (state.phase !== 'playing') return;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMyTurn = currentPlayer && currentPlayer.id === myPlayerId;
  const me = state.players.find(p => p.id === myPlayerId);

  // Turn info
  if (currentPlayer) {
    turnInfo.innerHTML = `
      <span style="color:${currentPlayer.color};font-weight:700">${currentPlayer.name}</span>
      ${isMyTurn ? ' <span style="color:#10b981">(votre tour)</span>' : ''}
      <br><small style="color:#475569">Phase : ${phaseName(state.turnPhase)}</small>
    `;
  }

  // Dice animation
  const [d1, d2] = state.dice;
  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  die1.textContent = d1 || '?';
  die2.textContent = d2 || '?';
  const isDoubles = d1 && d2 && d1 === d2;
  die1.className = `die${isDoubles ? ' doubles' : ''}`;
  die2.className = `die${isDoubles ? ' doubles' : ''}`;

  btns.innerHTML = '';

  if (!isMyTurn || !me || me.bankrupt) return;

  // Pending buy
  if (state.pendingBuy && state.pendingBuy.playerId === myPlayerId) {
    const sq = BOARD_DATA[state.pendingBuy.squareId];
    const serverSq = getServerSquare(state.pendingBuy.squareId);
    const price = serverSq?.price || 0;
    showBuyModal(sq, price, state.pendingBuy.squareId);
    return;
  }

  if (state.turnPhase === 'roll') {
    // Jail options
    if (me.inJail) {
      if (me.jailFreeCards > 0) {
        addBtn(btns, '🃏 Utiliser carte', 'btn-secondary', () => emit('useJailFreeCard'));
      }
      if (me.money >= 500) {
        addBtn(btns, '💰 Payer 500€', 'btn-secondary', () => emit('payJailFine'));
      }
    }
    addBtn(btns, '🎲 Lancer les dés', 'btn-primary', () => rollDice());

  } else if (state.turnPhase === 'action' || state.turnPhase === 'end') {
    const canEndTurn = !(isDoubles && !me.inJail && state.doublesCount > 0);
    addBtn(btns, isDoubles && !me.inJail ? '🎲 Rejouer (double !)' : '⏭️ Fin de tour',
      isDoubles && !me.inJail ? 'btn-warn' : 'btn-secondary',
      () => endTurn(), !canEndTurn && !isDoubles);

    addBtn(btns, '🏗️ Gérer mes biens', 'btn-ghost', () => showManageModal());
  }
}

function addBtn(container, label, cls, fn, disabled = false) {
  const btn = document.createElement('button');
  btn.className = `btn ${cls}`;
  btn.innerHTML = label;
  btn.disabled = disabled;
  btn.onclick = fn;
  container.appendChild(btn);
}

function phaseName(phase) {
  return { roll: 'Lancer les dés', action: 'Action', end: 'Fin de tour' }[phase] || phase;
}

// ── Log panel ─────────────────────────────────────────────────────────────────
function renderLog(state) {
  const el = document.getElementById('log-entries');
  el.innerHTML = '';
  (state.log || []).forEach(entry => {
    const div = document.createElement('div');
    div.className = `log-entry ${entry.type || 'info'}`;
    div.textContent = entry.message;
    el.appendChild(div);
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────
function emit(event, data = {}) {
  socket.emit(event, { roomCode, ...data });
}

function rollDice() {
  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  die1.classList.add('rolling');
  die2.classList.add('rolling');
  setTimeout(() => {
    die1.classList.remove('rolling');
    die2.classList.remove('rolling');
  }, 450);
  emit('rollDice');
}

function endTurn() {
  emit('endTurn');
}

// ── Buy Modal ─────────────────────────────────────────────────────────────────
function showBuyModal(sq, price, squareId) {
  const modal = document.getElementById('modal-buy');
  const content = document.getElementById('modal-buy-content');
  const me = gameState?.players.find(p => p.id === myPlayerId);
  const canAfford = me && me.money >= price;

  const color = sq.group ? GROUP_COLORS[sq.group] : '#475569';
  content.innerHTML = `
    <div class="prop-card">
      <div class="prop-card-header" style="background:${color}22;border-bottom:3px solid ${color}">
        <div class="prop-card-name">${sq.name.replace('\n', ' ')}</div>
        <div class="prop-card-group">${groupLabel(sq.group || sq.type)}</div>
      </div>
      <div class="prop-card-price">${formatMoney(price)}</div>
      <div style="font-size:13px;color:#94a3b8">
        Votre solde : <strong style="color:${canAfford ? '#10b981' : '#ef4444'}">${formatMoney(me?.money || 0)}</strong>
      </div>
    </div>
  `;

  const btnConfirm  = document.getElementById('btn-buy-confirm');
  const btnDecline  = document.getElementById('btn-buy-decline');
  btnConfirm.disabled = !canAfford;
  btnConfirm.onclick  = () => { emit('buyProperty', { squareId }); closeModal('modal-buy'); };
  btnDecline.onclick  = () => { emit('declineBuy'); closeModal('modal-buy'); };

  modal.classList.remove('hidden');
}

// ── Property Info Modal ───────────────────────────────────────────────────────
function onSquareClick(sqId) {
  const sq = BOARD_DATA[sqId];
  if (!sq || !['property', 'railroad', 'utility'].includes(sq.type)) return;

  const serverSq = getServerSquare(sqId);
  const prop = gameState?.properties[sqId];
  const owner = prop?.owner ? gameState.players.find(p => p.id === prop.owner) : null;
  const color = sq.group ? GROUP_COLORS[sq.group] : '#475569';

  const content = document.getElementById('modal-property-content');

  let rentRows = '';
  if (serverSq?.rent) {
    const labels = ['Terrain nu', '1 Appart.', '2 Apparts', '3 Apparts', '4 Apparts', 'Immeuble'];
    serverSq.rent.forEach((r, i) => {
      const isCurrent = prop?.houses === i;
      rentRows += `<tr class="${isCurrent ? 'current' : ''}">
        <td>${labels[i]}</td><td style="text-align:right;font-family:'Rajdhani',sans-serif;font-weight:600">${formatMoney(r)}</td>
      </tr>`;
    });
  }
  if (serverSq && sq.type === 'railroad') {
    [1,2,3,4].forEach(n => {
      const r = [0, 250, 500, 1000, 2000][n];
      rentRows += `<tr><td>${n} Gare${n>1?'s':''}</td><td style="text-align:right;font-family:'Rajdhani',sans-serif">${formatMoney(r)}</td></tr>`;
    });
  }

  content.innerHTML = `
    <div class="prop-card">
      <div class="prop-card-header" style="background:${color}33;border-bottom:3px solid ${color};margin:-28px -28px 20px;padding:20px 28px;border-top-left-radius:12px;border-top-right-radius:12px">
        <div class="prop-card-name">${sq.name.replace('\n', ' ')}</div>
        <div class="prop-card-group">${groupLabel(sq.group || sq.type)}</div>
      </div>
      ${serverSq?.price ? `<div class="prop-card-price">${formatMoney(serverSq.price)}</div>` : ''}
      ${owner ? `<div style="margin-bottom:12px;font-size:14px">Propriétaire : <strong style="color:${owner.color}">${owner.name}</strong>${prop?.mortgaged ? ' <span class="tag-mortgaged">HYPOTHÉQUÉ</span>' : ''}</div>` : '<div style="margin-bottom:12px;color:#94a3b8;font-size:14px">Disponible à l\'achat</div>'}
      ${rentRows ? `<table class="rent-table"><thead><tr><th>Loyer</th><th style="text-align:right">Montant</th></tr></thead><tbody>${rentRows}</tbody></table>` : ''}
      ${serverSq?.houseCost ? `<div style="margin-top:12px;font-size:12px;color:#94a3b8">Construction : ${formatMoney(serverSq.houseCost)} / Hypothèque : ${formatMoney(Math.floor(serverSq.price/2))}</div>` : ''}
    </div>
  `;

  document.getElementById('modal-property').classList.remove('hidden');
}

// ── Manage Properties Modal ───────────────────────────────────────────────────
function showManageModal() {
  if (!gameState) return;
  const me = gameState.players.find(p => p.id === myPlayerId);
  if (!me) return;

  const myProps = Object.entries(gameState.properties)
    .filter(([, v]) => v.owner === myPlayerId)
    .map(([k, v]) => ({ ...v, sqId: parseInt(k), sq: BOARD_DATA[parseInt(k)], serverSq: getServerSquare(parseInt(k)) }));

  // Group by type
  const groups = {};
  myProps.forEach(p => {
    const key = p.sq.group || p.sq.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  const content = document.getElementById('modal-manage-content');
  content.innerHTML = '';

  if (myProps.length === 0) {
    content.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px">Vous ne possédez aucune propriété.</p>';
  }

  Object.entries(groups).forEach(([key, props]) => {
    const color = GROUP_COLORS[key] || '#475569';
    const ownsAll = props[0].sq.group ? ownsFullGroup(key) : false;

    const div = document.createElement('div');
    div.className = 'manage-group';
    div.innerHTML = `
      <div class="manage-group-title">
        <div class="manage-group-dot" style="background:${color}"></div>
        ${groupLabel(key)}${ownsAll ? ' ✅' : ''}
      </div>
    `;

    props.forEach(p => {
      const canBuild = ownsAll && p.sq.type === 'property' && p.houses < 5 && !p.mortgaged;
      const canSell  = p.houses > 0;
      const canMortgage = !p.mortgaged && p.houses === 0;
      const canUnmortgage = p.mortgaged;

      const houses = Array.from({length: 5}, (_, i) =>
        `<span class="house-icon${i < p.houses ? ' filled' : ''}">${p.houses === 5 && i === 0 ? '🏢' : '🏠'}</span>`
      ).join('');

      const row = document.createElement('div');
      row.className = 'manage-prop-row';
      row.innerHTML = `
        <div class="manage-prop-name">${p.sq.name.replace('\n', ' ')}${p.mortgaged ? ' <span class="tag-mortgaged">HYPOTHÉQUÉ</span>' : ''}</div>
        <div class="houses-display">${houses}</div>
        <div class="manage-prop-actions">
          ${canBuild  ? `<button class="btn btn-secondary btn-sm" onclick="doBuild(${p.sqId})">+🏠</button>` : ''}
          ${canSell   ? `<button class="btn btn-ghost btn-sm" onclick="doSell(${p.sqId})">-🏠</button>` : ''}
          ${canMortgage   ? `<button class="btn btn-danger btn-sm" onclick="doMortgage(${p.sqId})">Hypo.</button>` : ''}
          ${canUnmortgage ? `<button class="btn btn-warn btn-sm"   onclick="doUnmortgage(${p.sqId})">Lever</button>` : ''}
        </div>
      `;
      div.appendChild(row);
    });

    content.appendChild(div);
  });

  document.getElementById('modal-manage').classList.remove('hidden');
}

function ownsFullGroup(group) {
  if (!gameState) return false;
  const groupProps = BOARD_DATA.filter(s => s.type === 'property' && s.group === group);
  return groupProps.every(s => gameState.properties[s.id]?.owner === myPlayerId);
}

function doBuild(sqId) {
  emit('buildHouse', { squareId: sqId });
  setTimeout(() => showManageModal(), 200);
}

function doSell(sqId) {
  emit('sellHouse', { squareId: sqId });
  setTimeout(() => showManageModal(), 200);
}

function doMortgage(sqId) {
  emit('mortgage', { squareId: sqId });
  setTimeout(() => showManageModal(), 200);
}

function doUnmortgage(sqId) {
  emit('unmortgage', { squareId: sqId });
  setTimeout(() => showManageModal(), 200);
}

// ── Show player properties ────────────────────────────────────────────────────
function showPlayerProperties(playerId) {
  if (playerId === myPlayerId) {
    showManageModal();
    return;
  }
  // Just show property info panel — could extend to trade in future
}

// ── Card Modal ────────────────────────────────────────────────────────────────
function showCardModal(cardType, card) {
  const isChance = cardType === 'chance';
  const content = document.getElementById('modal-card-content');
  content.innerHTML = `
    <div class="card-type-label">${isChance ? '⭐ Opportunité' : '💼 Caisse Communauté'}</div>
    <div class="card-icon">${isChance ? '⭐' : '💼'}</div>
    <div class="card-text">${card.text}</div>
  `;
  document.getElementById('modal-card').classList.remove('hidden');
}

// ── Win Screen ────────────────────────────────────────────────────────────────
function showWinScreen(state) {
  const winner = state.players.find(p => p.id === state.winner);
  if (!winner) return;
  document.getElementById('win-title').textContent = winner.id === myPlayerId ? 'Victoire !' : `${winner.name} gagne !`;
  document.getElementById('win-subtitle').textContent =
    winner.id === myPlayerId
      ? 'Félicitations, vous avez dominé le marché immobilier français !'
      : `${winner.name} a dominé le marché immobilier français.`;
  document.getElementById('screen-win').classList.remove('hidden');
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${type === 'error' ? '#ef444422' : '#10b98122'};
    border:1px solid ${type === 'error' ? '#ef4444' : '#10b981'};
    color:${type === 'error' ? '#fca5a5' : '#6ee7b7'};
    padding:10px 20px;border-radius:8px;font-size:14px;z-index:999;
    backdrop-filter:blur(4px);
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatMoney(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function groupLabel(key) {
  const labels = {
    brown: 'Petites villes', lblue: 'Villes moyennes', pink: 'Grandes villes',
    orange: 'Métropoles Est', red: 'Métropoles Sud', yellow: 'Métropoles Nord/Ouest',
    green: 'Lyon', dblue: 'Paris',
    railroad: 'Gares SNCF', utility: 'Services', go: '', jail: '', parking: '', gotojail: '', tax: '', chance: 'Opportunité', community: 'Caisse Communauté',
  };
  return labels[key] || key;
}

function getServerSquare(sqId) {
  // Server board data reference (prices, rents) — embedded here for client use
  const SERVER_SQUARES = {
    1:  { price: 600,  rent: [20,100,300,900,1600,2500],    houseCost: 500  },
    3:  { price: 600,  rent: [40,200,600,1800,3200,4500],   houseCost: 500  },
    5:  { price: 2000 },
    6:  { price: 1000, rent: [60,300,900,2700,4000,5500],   houseCost: 500  },
    8:  { price: 1000, rent: [60,300,900,2700,4000,5500],   houseCost: 500  },
    9:  { price: 1200, rent: [80,400,1000,3000,4500,6000],  houseCost: 500  },
    11: { price: 1400, rent: [100,500,1500,4500,6250,7500], houseCost: 1000 },
    12: { price: 1500 },
    13: { price: 1400, rent: [100,500,1500,4500,6250,7500], houseCost: 1000 },
    14: { price: 1600, rent: [120,600,1800,5000,7000,9000], houseCost: 1000 },
    15: { price: 2000 },
    16: { price: 1800, rent: [140,700,2000,5500,7500,9500], houseCost: 1000 },
    18: { price: 1800, rent: [140,700,2000,5500,7500,9500], houseCost: 1000 },
    19: { price: 2000, rent: [160,800,2200,6000,8000,10000],houseCost: 1000 },
    21: { price: 2200, rent: [180,900,2500,7000,8750,10500],houseCost: 1500 },
    23: { price: 2200, rent: [180,900,2500,7000,8750,10500],houseCost: 1500 },
    24: { price: 2400, rent: [200,1000,3000,7500,9250,11000],houseCost: 1500 },
    25: { price: 2000 },
    26: { price: 2600, rent: [220,1100,3300,8000,9750,11500],houseCost: 1500 },
    27: { price: 2600, rent: [220,1100,3300,8000,9750,11500],houseCost: 1500 },
    28: { price: 1500 },
    29: { price: 2800, rent: [240,1200,3600,8500,10250,12000],houseCost: 1500 },
    31: { price: 3000, rent: [260,1300,3900,9000,11000,12750],houseCost: 2000 },
    32: { price: 3000, rent: [260,1300,3900,9000,11000,12750],houseCost: 2000 },
    34: { price: 3200, rent: [280,1500,4500,10000,12000,14000],houseCost: 2000 },
    35: { price: 2000 },
    37: { price: 3500, rent: [350,1750,5000,11000,13000,15000],houseCost: 2000 },
    39: { price: 4000, rent: [500,2000,6000,14000,17000,20000],houseCost: 2000 },
  };
  return SERVER_SQUARES[sqId] || null;
}
