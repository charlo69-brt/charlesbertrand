const socket = io();
let myPlayerId = null;
let currentRoomCode = null;
let isHost = false;
let gameState = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    setTimeout(() => el.classList.add('active'), 10);
  }
}

// Init screens hidden
document.querySelectorAll('.screen').forEach(s => {
  if (!s.classList.contains('active')) s.style.display = 'none';
});

function createRoom() {
  const name = document.getElementById('create-name').value.trim();
  if (!name) {
    document.getElementById('create-error').textContent = 'Saisis ton pseudo';
    return;
  }
  document.getElementById('create-error').textContent = '';
  socket.emit('createRoom', { playerName: name });
}

function joinRoom() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  const name = document.getElementById('join-name').value.trim();
  if (!code || code.length !== 5) {
    document.getElementById('join-error').textContent = 'Code invalide (5 caractères)';
    return;
  }
  if (!name) {
    document.getElementById('join-error').textContent = 'Saisis ton pseudo';
    return;
  }
  document.getElementById('join-error').textContent = '';
  socket.emit('joinRoom', { roomCode: code, playerName: name });
}

function addBot() {
  socket.emit('addBot', { roomCode: currentRoomCode });
}

function startGame() {
  socket.emit('startGame', { roomCode: currentRoomCode });
}

function copyCode() {
  if (currentRoomCode) {
    navigator.clipboard.writeText(currentRoomCode).then(() => {
      const btn = document.querySelector('.btn-copy');
      btn.textContent = '✅';
      setTimeout(() => btn.textContent = '📋', 1500);
    });
  }
}

function renderLobby(state) {
  gameState = state;
  document.getElementById('lobby-code').textContent = currentRoomCode;

  const list = document.getElementById('players-list');
  list.innerHTML = '';

  state.players.forEach((p, i) => {
    const isMe = p.id === myPlayerId;
    const card = document.createElement('div');
    card.className = `player-card${isMe ? ' is-you' : ''}${p.isBot ? ' is-bot' : ''}`;

    const badges = [];
    if (i === 0) badges.push('<span class="badge badge-host">Hôte</span>');
    if (isMe) badges.push('<span class="badge badge-you">Vous</span>');
    if (p.isBot) badges.push('<span class="badge badge-bot">Bot</span>');

    card.innerHTML = `
      <div class="player-token">${p.token}</div>
      <div class="player-info">
        <div class="player-name" style="color:${p.color}">${p.name}</div>
        <div class="player-badge">${badges.join('')}</div>
      </div>
      ${isHost && p.isBot ? `<button class="btn-remove" onclick="removeBot('${p.id}')" title="Retirer">✕</button>` : ''}
    `;
    list.appendChild(card);
  });

  // Empty slots
  for (let i = state.players.length; i < 6; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot-empty';
    slot.textContent = `Joueur ${i + 1} — En attente...`;
    list.appendChild(slot);
  }

  const hostControls = document.getElementById('lobby-host-controls');
  const waitingMsg = document.getElementById('lobby-waiting-msg');

  if (isHost) {
    hostControls.style.display = 'flex';
    waitingMsg.style.display = 'none';
    const btnStart = document.getElementById('btn-start');
    btnStart.disabled = state.players.length < 2;
    btnStart.style.opacity = state.players.length < 2 ? '0.5' : '1';
  } else {
    hostControls.style.display = 'none';
    waitingMsg.style.display = 'block';
  }
}

function removeBot(botId) {
  socket.emit('removeBot', { roomCode: currentRoomCode, botId });
}

// Socket events
socket.on('roomCreated', ({ code, playerId }) => {
  myPlayerId = playerId;
  currentRoomCode = code;
  isHost = true;
  showScreen('screen-lobby');
});

socket.on('roomJoined', ({ code, playerId }) => {
  myPlayerId = playerId;
  currentRoomCode = code;
  isHost = false;
  showScreen('screen-lobby');
});

socket.on('gameState', (state) => {
  if (state.phase === 'playing' || state.phase === 'ended') {
    // Redirect to game page
    sessionStorage.setItem('patrimonio_playerId', myPlayerId);
    sessionStorage.setItem('patrimonio_roomCode', currentRoomCode);
    sessionStorage.setItem('patrimonio_isHost', isHost ? '1' : '0');
    window.location.href = '/game.html';
    return;
  }
  if (state.phase === 'lobby') {
    showScreen('screen-lobby');
    renderLobby(state);
  }
});

socket.on('error', (msg) => {
  // Show error in whichever screen is active
  const activeScreen = document.querySelector('.screen.active');
  if (activeScreen) {
    let errEl = activeScreen.querySelector('.error-msg');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'error-msg';
      activeScreen.appendChild(errEl);
    }
    errEl.textContent = msg;
  }
});

// Enter key support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const create = document.getElementById('screen-create');
    const join   = document.getElementById('screen-join');
    if (create && create.classList.contains('active')) createRoom();
    if (join   && join.classList.contains('active'))   joinRoom();
  }
});
