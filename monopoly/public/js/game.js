// game.js — Patrimonio client

const socket = io();

let myPlayerId = sessionStorage.getItem('patrimonio_playerId');
let roomCode   = sessionStorage.getItem('patrimonio_roomCode');
let gameState  = null;

// ── Bootstrap ──────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (!myPlayerId || !roomCode) { window.location.href = '/'; return; }

  buildBoard();

  // Room code badge
  const badge = document.getElementById('room-code-badge');
  if (badge) badge.textContent = roomCode;

  // Chat enter key
  const input = document.getElementById('chat-input');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

  // Rejoin
  socket.emit('rejoinRoom', { roomCode, playerId: myPlayerId });
});

// ── Socket events ──────────────────────────────────────────────────────────────
socket.on('identityConfirmed', ({ playerId }) => {
  myPlayerId = playerId;
  sessionStorage.setItem('patrimonio_playerId', playerId);
});

socket.on('gameState', (state) => {
  gameState = state;
  updateBoard(state);
  renderPlayers(state);
  renderActionPanel(state);
  if (state.phase === 'ended' && state.winner) showWinScreen(state);
});

socket.on('diceRolled', ({ dice }) => {
  animateDice(dice);
  const total = document.getElementById('dice-total');
  if (total) {
    const isDoubles = dice[0] === dice[1];
    total.innerHTML = isDoubles
      ? `<span style="color:#f59e0b">Double ! — Rejouez</span>`
      : `Total : <strong>${dice[0] + dice[1]}</strong>`;
  }
});

socket.on('cardDrawn', ({ cardType, card }) => {
  showCardModal(cardType, card);
});

socket.on('chatMessage', (msg) => {
  appendChat(msg);
});

socket.on('error', (msg) => {
  showToast(msg, 'error');
});

socket.on('connect', () => {
  if (roomCode && myPlayerId) {
    socket.emit('rejoinRoom', { roomCode, playerId: myPlayerId });
  }
});

// ── Players panel ──────────────────────────────────────────────────────────────
function renderPlayers(state) {
  const panel = document.getElementById('players-list');
  if (!panel) return;
  panel.innerHTML = '';

  state.players.forEach((p, i) => {
    const isActive = i === state.currentPlayerIndex && state.phase === 'playing';
    const isMe = p.id === myPlayerId;
    const card = document.createElement('div');
    card.className = `player-card${isActive ? ' active' : ''}${p.bankrupt ? ' bankrupt' : ''}`;
    card.onclick = () => { if (!p.bankrupt) { isMe ? showManageModal() : showPlayerPropsInfo(p.id); } };

    const myProps = Object.entries(state.properties || {})
      .filter(([,v]) => v.owner === p.id)
      .map(([k]) => BOARD_SQUARES[parseInt(k)])
      .filter(Boolean);

    const dots = myProps.slice(0, 14).map(sq => {
      const color = sq.group ? GROUP_COLORS[sq.group] : '#475569';
      return `<div class="pc-prop-dot" style="background:${color}"></div>`;
    }).join('');

    card.innerHTML = `
      <div class="pc-top">
        ${isActive ? '<div class="pc-turn-dot"></div>' : ''}
        <span class="pc-token">${p.token}</span>
        <div class="pc-info">
          <div class="pc-name" style="color:${p.color}">${p.name}${isMe ? ' <small style="color:#6b7280;font-weight:400">(moi)</small>' : ''}${p.isBot ? ' 🤖' : ''}</div>
          <div class="pc-money">${fmt(p.money)}</div>
        </div>
      </div>
      <div class="pc-props">${dots}</div>
      ${p.inJail ? '<div style="font-size:11px;color:#f59e0b;margin-top:4px">🔒 En prison (tour '+p.jailTurns+'/3)</div>' : ''}
      ${p.bankrupt ? '<div style="font-size:11px;color:#ef4444;margin-top:4px">💀 Faillite</div>' : ''}
    `;
    panel.appendChild(card);
  });
}

// ── Action panel ───────────────────────────────────────────────────────────────
function renderActionPanel(state) {
  if (!state || state.phase !== 'playing') return;

  const cur = state.players[state.currentPlayerIndex];
  const isMyTurn = cur && cur.id === myPlayerId;
  const me = state.players.find(p => p.id === myPlayerId);

  // Turn label
  const lbl = document.getElementById('turn-label');
  if (lbl && cur) {
    lbl.innerHTML = isMyTurn
      ? `<strong>Votre tour</strong>`
      : `Tour de <strong style="color:${cur.color}">${cur.name}</strong>`;
  }

  // Dice display
  if (state.dice && state.dice[0]) {
    renderDie(document.getElementById('die-0'), state.dice[0]);
    renderDie(document.getElementById('die-1'), state.dice[1]);
    const isDoubles = state.dice[0] === state.dice[1];
    document.getElementById('die-0').classList.toggle('doubles', isDoubles);
    document.getElementById('die-1').classList.toggle('doubles', isDoubles);
    const total = document.getElementById('dice-total');
    if (total && state.dice[0]) {
      total.innerHTML = isDoubles
        ? `<span style="color:#f59e0b">Double !</span>`
        : `Total : <strong>${state.dice[0]+state.dice[1]}</strong>`;
    }
  }

  // Pending buy modal
  if (state.pendingBuy && state.pendingBuy.playerId === myPlayerId) {
    showBuyModal(state.pendingBuy.squareId);
    return;
  }

  // Buttons
  const btns = document.getElementById('action-btns');
  if (!btns) return;
  btns.innerHTML = '';

  if (!isMyTurn || !me || me.bankrupt) return;

  if (state.turnPhase === 'roll') {
    if (me.inJail) {
      if (me.jailFreeCards > 0)
        addBtn(btns, '🃏 Utiliser carte sortie', 'btn-secondary btn-sm', () => emit('useJailFreeCard'));
      if (me.money >= 500)
        addBtn(btns, '💰 Payer 500€ (prison)', 'btn-secondary btn-sm', () => emit('payJailFine'));
    }
    addBtn(btns, '🎲 Lancer les dés', 'btn-primary', doRollDice);

  } else if (state.turnPhase === 'action' || state.turnPhase === 'end') {
    const isDoubles = state.dice && state.dice[0] === state.dice[1];
    const canReroll = isDoubles && !me.inJail && state.doublesCount > 0 && state.doublesCount < 3;

    if (canReroll) {
      addBtn(btns, '🎲 Rejouer (double !)', 'btn-gold', doRollDice);
    } else {
      addBtn(btns, '⏭️ Fin de tour', 'btn-secondary', () => emit('endTurn'));
    }
    addBtn(btns, '🏗️ Gérer mes biens', 'btn-ghost', showManageModal);
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

// ── Dice action ────────────────────────────────────────────────────────────────
function doRollDice() {
  const d0 = document.getElementById('die-0');
  const d1 = document.getElementById('die-1');
  d0.classList.add('rolling');
  d1.classList.add('rolling');
  emit('rollDice');
}

// ── Buy modal ──────────────────────────────────────────────────────────────────
function showBuyModal(squareId) {
  const sq = BOARD_SQUARES[squareId];
  const serverSq = SERVER_DATA[squareId];
  const me = gameState?.players.find(p => p.id === myPlayerId);
  const price = serverSq?.price || 0;
  const canAfford = me && me.money >= price;
  const color = sq.group ? GROUP_COLORS[sq.group] : '#334155';

  const body = document.getElementById('modal-buy-body');
  body.innerHTML = `
    <div class="prop-header" style="background:${color}22;border-color:${color}">
      <div class="prop-name">${sq.name}</div>
      <div class="prop-group-label">${groupLabel(sq.group || sq.type)}</div>
    </div>
    <div class="prop-price">${fmt(price)}</div>
    <div style="font-size:12px;color:#6b7280">
      Votre solde : <strong style="color:${canAfford?'#22c55e':'#ef4444'}">${fmt(me?.money||0)}</strong>
    </div>
  `;

  const btnYes = document.getElementById('btn-buy-yes');
  btnYes.disabled = !canAfford;
  btnYes.onclick = () => { emit('buyProperty', { squareId }); closeBuyModal(); };

  document.getElementById('modal-buy').classList.remove('hidden');
}

function closeBuyModal() {
  document.getElementById('modal-buy').classList.add('hidden');
}

// ── Square click → property info ───────────────────────────────────────────────
window.onSquareClick = function(sqId) {
  const sq = BOARD_SQUARES[sqId];
  if (!sq || !['property','railroad','utility'].includes(sq.type)) return;

  const serverSq = SERVER_DATA[sqId];
  const prop = gameState?.properties[sqId];
  const owner = prop?.owner ? gameState.players.find(p => p.id === prop.owner) : null;
  const color = sq.group ? GROUP_COLORS[sq.group] : '#334155';

  let rentRows = '';
  if (serverSq?.rent) {
    const labels = ['Terrain nu','1 Appart.','2 Apparts','3 Apparts','4 Apparts','Immeuble'];
    serverSq.rent.forEach((r, i) => {
      const cur = (prop?.houses||0) === i;
      rentRows += `<tr class="${cur?'highlight':''}">
        <td>${labels[i]}</td><td>${fmt(r)}</td></tr>`;
    });
  }
  if (serverSq && sq.type === 'railroad') {
    [1,2,3,4].forEach(n => {
      rentRows += `<tr><td>${n} Gare${n>1?'s':''}</td><td>${fmt([0,250,500,1000,2000][n])}</td></tr>`;
    });
  }

  const body = document.getElementById('modal-prop-body');
  body.innerHTML = `
    <div class="prop-header" style="background:${color}22;border-color:${color}">
      <div class="prop-name">${sq.name}</div>
      <div class="prop-group-label">${groupLabel(sq.group || sq.type)}</div>
    </div>
    ${serverSq?.price ? `<div class="prop-price">${fmt(serverSq.price)}</div>` : ''}
    ${owner
      ? `<div class="owner-info">
          <div class="owner-dot-lg" style="background:${owner.color}"></div>
          <span>${owner.name}</span>
          ${prop.mortgaged ? '<span class="tag-mortgaged">Hypothéqué</span>' : ''}
        </div>`
      : '<div style="color:#6b7280;font-size:13px;margin-bottom:10px">Disponible à l\'achat</div>'
    }
    ${rentRows ? `
      <table class="rent-table">
        <thead><tr><th>Loyer</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>${rentRows}</tbody>
      </table>
    ` : ''}
    ${serverSq?.houseCost ? `
      <div style="margin-top:10px;font-size:11px;color:#6b7280">
        Construction : ${fmt(serverSq.houseCost)} · Hypothèque : ${fmt(Math.floor(serverSq.price/2))}
      </div>` : ''}
  `;

  document.getElementById('modal-prop').classList.remove('hidden');
};

// ── Manage properties ──────────────────────────────────────────────────────────
function showManageModal() {
  if (!gameState) return;
  const me = gameState.players.find(p => p.id === myPlayerId);
  if (!me) return;

  const myProps = Object.entries(gameState.properties)
    .filter(([,v]) => v.owner === myPlayerId)
    .map(([k,v]) => ({ ...v, sqId: parseInt(k), sq: BOARD_SQUARES[parseInt(k)], sd: SERVER_DATA[parseInt(k)] }))
    .filter(p => p.sq);

  const body = document.getElementById('modal-manage-body');

  if (!myProps.length) {
    body.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">Vous ne possédez aucune propriété.</p>';
  } else {
    // Group by group/type
    const groups = {};
    myProps.forEach(p => {
      const key = p.sq.group || p.sq.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    body.innerHTML = Object.entries(groups).map(([key, props]) => {
      const color = GROUP_COLORS[key] || '#475569';
      const fullGroup = props[0].sq.group && ownsFullGroup(props[0].sq.group);
      const rows = props.map(p => {
        const canBuild = fullGroup && p.sq.type==='property' && p.houses < 5 && !p.mortgaged && me.money >= (p.sd?.houseCost||0);
        const canSell  = p.houses > 0;
        const canMtg   = !p.mortgaged && p.houses === 0;
        const canUnmtg = p.mortgaged && me.money >= Math.floor((p.sd?.price||0)*0.55);

        const houseStr = p.houses===5 ? '🏢' : Array(p.houses).fill('🏠').join('') || '—';
        return `<div class="manage-prop-row">
          <div class="manage-prop-name">${p.sq.name} ${p.mortgaged?'<span class="tag-mortgaged">Hypo.</span>':''}</div>
          <div class="manage-houses">${houseStr}</div>
          <div class="manage-btns">
            ${canBuild  ? `<button class="btn btn-secondary btn-sm" onclick="doBuild(${p.sqId})">+🏠</button>` : ''}
            ${canSell   ? `<button class="btn btn-ghost btn-sm" onclick="doSell(${p.sqId})">-🏠</button>` : ''}
            ${canMtg    ? `<button class="btn btn-danger btn-sm" onclick="doMortgage(${p.sqId})">Hypo.</button>` : ''}
            ${canUnmtg  ? `<button class="btn btn-gold btn-sm" onclick="doUnmortgage(${p.sqId})">Lever</button>` : ''}
          </div>
        </div>`;
      }).join('');

      return `<div class="manage-group">
        <div class="manage-group-header">
          <div class="group-color-sq" style="background:${color}"></div>
          ${groupLabel(key)}${fullGroup?' ✅':''}
        </div>
        ${rows}
      </div>`;
    }).join('');
  }

  document.getElementById('modal-manage').classList.remove('hidden');
}

function ownsFullGroup(group) {
  if (!gameState) return false;
  const groupProps = BOARD_SQUARES.filter(s => s.type === 'property' && s.group === group);
  return groupProps.every(s => gameState.properties[s.id]?.owner === myPlayerId);
}

function doBuild(sqId)       { emit('buildHouse', { squareId: sqId }); setTimeout(showManageModal, 150); }
function doSell(sqId)        { emit('sellHouse',  { squareId: sqId }); setTimeout(showManageModal, 150); }
function doMortgage(sqId)    { emit('mortgage',   { squareId: sqId }); setTimeout(showManageModal, 150); }
function doUnmortgage(sqId)  { emit('unmortgage', { squareId: sqId }); setTimeout(showManageModal, 150); }

function showPlayerPropsInfo(playerId) {
  // Show basic info — could extend to trades later
}

// ── Card modal ─────────────────────────────────────────────────────────────────
function showCardModal(cardType, card) {
  const isChance = cardType === 'chance';
  document.getElementById('modal-card-body').innerHTML = `
    <div class="card-type">${isChance ? '⭐ Opportunité' : '💼 Caisse Communauté'}</div>
    <div class="card-icon">${isChance ? '⭐' : '💼'}</div>
    <div class="card-text">${card.text}</div>
  `;
  document.getElementById('modal-card').classList.remove('hidden');
}

// ── Win screen ─────────────────────────────────────────────────────────────────
function showWinScreen(state) {
  const winner = state.players.find(p => p.id === state.winner);
  if (!winner) return;
  const isMe = winner.id === myPlayerId;
  document.getElementById('win-title').textContent = isMe ? 'Victoire !' : `${winner.name} gagne !`;
  document.getElementById('win-sub').textContent   = isMe
    ? 'Félicitations, vous avez dominé le marché immobilier français !'
    : `${winner.name} a dominé le marché immobilier français.`;
  document.getElementById('win-screen').classList.remove('hidden');
}

// ── Chat ───────────────────────────────────────────────────────────────────────
function sendChat() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  socket.emit('chatMessage', { roomCode, message: text });
  input.value = '';
}

function appendChat(msg) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const isMe = msg.playerId === myPlayerId;

  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `
    <div class="chat-msg-header">
      <div class="chat-dot" style="background:${msg.playerColor}"></div>
      <span class="chat-name" style="color:${msg.playerColor}">${msg.playerName}</span>
    </div>
    <div class="chat-text${isMe?' mine':''}">${escapeHtml(msg.text)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function emit(event, data = {}) {
  socket.emit(event, { roomCode, ...data });
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function fmt(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1000) return new Intl.NumberFormat('fr-FR').format(n) + '€';
  return n + '€';
}

function groupLabel(key) {
  const m = {
    brown:'Petites villes', lblue:'Villes moyennes', pink:'Grandes villes',
    orange:'Métropoles Est', red:'Métropoles Sud', yellow:'Métropoles N/O',
    green:'Lyon', dblue:'Paris',
    railroad:'Gares SNCF', utility:'Services',
    chance:'Opportunité', community:'Caisse Communauté',
    tax:'Impôts', go:'Départ', jail:'Prison', parking:'Parking', gotojail:'Prison',
  };
  return m[key] || key;
}

function showToast(msg, type='info') {
  const t = document.createElement('div');
  const colors = { error:'#ef4444', success:'#22c55e', info:'#7c6cf0' };
  const c = colors[type] || colors.info;
  t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${c}22;border:1px solid ${c};color:#fff;
    padding:10px 20px;border-radius:8px;font-size:13px;z-index:999;
    backdrop-filter:blur(4px);animation:none;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Server-side data (prices/rents) duplicated for client display
const SERVER_DATA = {
  1:  { price:600,   rent:[20,100,300,900,1600,2500],     houseCost:500  },
  3:  { price:600,   rent:[40,200,600,1800,3200,4500],    houseCost:500  },
  5:  { price:2000 },
  6:  { price:1000,  rent:[60,300,900,2700,4000,5500],    houseCost:500  },
  8:  { price:1000,  rent:[60,300,900,2700,4000,5500],    houseCost:500  },
  9:  { price:1200,  rent:[80,400,1000,3000,4500,6000],   houseCost:500  },
  11: { price:1400,  rent:[100,500,1500,4500,6250,7500],  houseCost:1000 },
  12: { price:1500 },
  13: { price:1400,  rent:[100,500,1500,4500,6250,7500],  houseCost:1000 },
  14: { price:1600,  rent:[120,600,1800,5000,7000,9000],  houseCost:1000 },
  15: { price:2000 },
  16: { price:1800,  rent:[140,700,2000,5500,7500,9500],  houseCost:1000 },
  18: { price:1800,  rent:[140,700,2000,5500,7500,9500],  houseCost:1000 },
  19: { price:2000,  rent:[160,800,2200,6000,8000,10000], houseCost:1000 },
  21: { price:2200,  rent:[180,900,2500,7000,8750,10500], houseCost:1500 },
  23: { price:2200,  rent:[180,900,2500,7000,8750,10500], houseCost:1500 },
  24: { price:2400,  rent:[200,1000,3000,7500,9250,11000],houseCost:1500 },
  25: { price:2000 },
  26: { price:2600,  rent:[220,1100,3300,8000,9750,11500],houseCost:1500 },
  27: { price:2600,  rent:[220,1100,3300,8000,9750,11500],houseCost:1500 },
  28: { price:1500 },
  29: { price:2800,  rent:[240,1200,3600,8500,10250,12000],houseCost:1500},
  31: { price:3000,  rent:[260,1300,3900,9000,11000,12750],houseCost:2000 },
  32: { price:3000,  rent:[260,1300,3900,9000,11000,12750],houseCost:2000 },
  34: { price:3200,  rent:[280,1500,4500,10000,12000,14000],houseCost:2000},
  35: { price:2000 },
  37: { price:3500,  rent:[350,1750,5000,11000,13000,15000],houseCost:2000},
  39: { price:4000,  rent:[500,2000,6000,14000,17000,20000],houseCost:2000},
};
