const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const {
  createGame, createPlayer, rollDice, handleLanding, advancePlayer,
  buyProperty, buildHouse, sellHouse, mortgageProperty, unmortgageProperty,
  sendToJail, endTurn, checkWinner, checkBankruptcy, addLog, botTakeTurn,
} = require('./game-logic');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// public/ is at monopoly/public/ — one level up from monopoly/server/
const publicDir = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicDir));

const rooms = {}; // roomCode -> game state

function getRoom(code) { return rooms[code.toUpperCase()]; }

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms[code]);
  return code;
}

function broadcastGame(code) {
  const game = rooms[code];
  if (!game) return;
  io.to(code).emit('gameState', sanitizeGame(game));
}

function sanitizeGame(game) {
  return {
    id: game.id,
    phase: game.phase,
    players: game.players,
    currentPlayerIndex: game.currentPlayerIndex,
    turnPhase: game.turnPhase,
    dice: game.dice,
    doublesCount: game.doublesCount,
    properties: game.properties,
    log: game.log.slice(0, 20),
    auction: game.auction,
    parkingPot: game.parkingPot,
    winner: game.winner,
  };
}

async function runBotTurn(code) {
  const game = getRoom(code);
  if (!game || game.phase !== 'playing') return;

  const player = game.players[game.currentPlayerIndex];
  if (!player || !player.isBot || player.bankrupt) return;

  await delay(1200);

  if (game.turnPhase !== 'roll') return;

  // Roll dice
  const dice = rollDice();
  game.dice = dice;
  const diceSum = dice[0] + dice[1];
  const isDoubles = dice[0] === dice[1];

  addLog(game, `${player.name} (bot) lance les dés : ${dice[0]} + ${dice[1]} = ${diceSum}`, 'info');

  if (player.inJail) {
    player.jailTurns++;
    if (isDoubles || player.jailTurns >= 3) {
      player.inJail = false;
      player.jailTurns = 0;
      if (!isDoubles && player.jailTurns >= 3) {
        player.money -= 500;
        addLog(game, `${player.name} paie 500€ pour sortir de prison`, 'warning');
      }
    } else {
      addLog(game, `${player.name} reste en prison (tour ${player.jailTurns}/3)`, 'info');
      broadcastGame(code);
      game.turnPhase = 'end';
      await delay(800);
      endTurn(game);
      broadcastGame(code);
      scheduleNextBotTurn(code);
      return;
    }
  } else if (isDoubles) {
    game.doublesCount++;
    if (game.doublesCount >= 3) {
      sendToJail(game, player);
      broadcastGame(code);
      game.turnPhase = 'end';
      await delay(800);
      endTurn(game);
      broadcastGame(code);
      scheduleNextBotTurn(code);
      return;
    }
  } else {
    game.doublesCount = 0;
  }

  advancePlayer(game, player, diceSum);
  broadcastGame(code);

  await delay(800);

  const events = handleLanding(game, player, diceSum);
  broadcastGame(code);

  // Handle buy decision
  const canBuyEvent = events.find(e => e.type === 'canBuy');
  if (canBuyEvent && player.money >= canBuyEvent.square.price) {
    await delay(600);
    buyProperty(game, player.id, canBuyEvent.square.id);
  }

  // Bot extra actions
  await delay(600);
  const actions = botTakeTurn(game, player);
  for (const action of actions) {
    if (action.type === 'buildHouse') {
      buildHouse(game, player.id, action.squareId);
      await delay(300);
    }
  }

  broadcastGame(code);

  if (isDoubles && !player.inJail && game.doublesCount < 3) {
    await delay(800);
    runBotTurn(code);
  } else {
    game.turnPhase = 'end';
    await delay(600);
    endTurn(game);
    broadcastGame(code);
    scheduleNextBotTurn(code);
  }
}

function scheduleNextBotTurn(code) {
  const game = getRoom(code);
  if (!game || game.phase !== 'playing') return;
  const player = game.players[game.currentPlayerIndex];
  if (player && player.isBot && !player.bankrupt) {
    setTimeout(() => runBotTurn(code), 1000);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('createRoom', ({ playerName }) => {
    const code = generateRoomCode();
    const game = createGame(code);
    const player = createPlayer(socket.id, playerName, false, 0);
    game.players.push(player);
    rooms[code] = game;
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = socket.id;
    socket.emit('roomCreated', { code, playerId: socket.id });
    broadcastGame(code);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) { socket.emit('error', 'Salle introuvable'); return; }
    if (game.phase !== 'lobby') { socket.emit('error', 'Partie déjà commencée'); return; }
    if (game.players.filter(p => !p.isBot).length >= 6) { socket.emit('error', 'Salle pleine'); return; }

    const tokenIndex = game.players.length;
    const player = createPlayer(socket.id, playerName, false, tokenIndex);
    game.players.push(player);
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = socket.id;
    socket.emit('roomJoined', { code, playerId: socket.id });
    broadcastGame(code);
  });

  socket.on('addBot', ({ roomCode, botName }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'lobby') return;
    if (game.players.length >= 6) { socket.emit('error', 'Maximum 6 joueurs'); return; }

    const names = ['MaxBot', 'AlphaBot', 'RoboGest', 'PatriBot', 'WealthBot'];
    const name = botName || names[Math.floor(Math.random() * names.length)];
    const tokenIndex = game.players.length;
    const bot = createPlayer('bot_' + uuidv4(), name, true, tokenIndex);
    game.players.push(bot);
    addLog(game, `${name} (bot) rejoint la partie`, 'info');
    broadcastGame(code);
  });

  socket.on('removeBot', ({ roomCode, botId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'lobby') return;
    game.players = game.players.filter(p => p.id !== botId);
    broadcastGame(code);
  });

  socket.on('startGame', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'lobby') return;
    if (game.players.length < 2) { socket.emit('error', 'Il faut au moins 2 joueurs'); return; }

    // Shuffle player order
    game.players.sort(() => Math.random() - 0.5);
    game.phase = 'playing';
    game.currentPlayerIndex = 0;
    game.turnPhase = 'roll';
    addLog(game, 'La partie commence !', 'success');
    broadcastGame(code);

    // Start bot turn if first player is a bot
    scheduleNextBotTurn(code);
  });

  socket.on('rollDice', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'playing') return;

    const player = game.players[game.currentPlayerIndex];
    if (player.id !== socket.id || player.bankrupt) return;
    if (game.turnPhase !== 'roll') return;

    const dice = rollDice();
    game.dice = dice;
    const diceSum = dice[0] + dice[1];
    const isDoubles = dice[0] === dice[1];

    addLog(game, `${player.name} lance les dés : ${dice[0]} + ${dice[1]} = ${diceSum}`, 'info');

    if (player.inJail) {
      player.jailTurns++;
      if (isDoubles) {
        player.inJail = false;
        player.jailTurns = 0;
        addLog(game, `${player.name} sort de prison avec un double !`, 'success');
      } else if (player.jailTurns >= 3) {
        player.inJail = false;
        player.jailTurns = 0;
        player.money -= 500;
        checkBankruptcy(game, player);
        addLog(game, `${player.name} paie 500€ pour sortir de prison`, 'warning');
      } else {
        addLog(game, `${player.name} reste en prison (${player.jailTurns}/3)`, 'info');
        game.turnPhase = 'end';
        broadcastGame(code);
        return;
      }
    } else {
      if (isDoubles) {
        game.doublesCount++;
        if (game.doublesCount >= 3) {
          sendToJail(game, player);
          game.turnPhase = 'end';
          broadcastGame(code);
          return;
        }
      } else {
        game.doublesCount = 0;
      }
    }

    advancePlayer(game, player, diceSum);
    const events = handleLanding(game, player, diceSum);
    game.turnPhase = 'action';

    const canBuyEvent = events.find(e => e.type === 'canBuy');
    if (canBuyEvent) {
      game.pendingBuy = { squareId: canBuyEvent.square.id, playerId: player.id };
    } else {
      game.pendingBuy = null;
    }

    const cardEvent = events.find(e => e.type === 'card');
    if (cardEvent) {
      io.to(code).emit('cardDrawn', cardEvent);
    }

    checkWinner(game);
    broadcastGame(code);
  });

  socket.on('buyProperty', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    buyProperty(game, socket.id, squareId);
    game.pendingBuy = null;
    broadcastGame(code);
  });

  socket.on('declineBuy', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    game.pendingBuy = null;
    broadcastGame(code);
  });

  socket.on('buildHouse', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    buildHouse(game, socket.id, squareId);
    broadcastGame(code);
  });

  socket.on('sellHouse', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    sellHouse(game, socket.id, squareId);
    broadcastGame(code);
  });

  socket.on('mortgage', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    mortgageProperty(game, socket.id, squareId);
    broadcastGame(code);
  });

  socket.on('unmortgage', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    unmortgageProperty(game, socket.id, squareId);
    broadcastGame(code);
  });

  socket.on('payJailFine', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    const player = game.players.find(p => p.id === socket.id);
    if (!player || !player.inJail) return;
    if (player.money < 500) { socket.emit('error', 'Fonds insuffisants'); return; }
    player.money -= 500;
    player.inJail = false;
    player.jailTurns = 0;
    addLog(game, `${player.name} paie 500€ pour sortir de prison`, 'warning');
    broadcastGame(code);
  });

  socket.on('useJailFreeCard', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    const player = game.players.find(p => p.id === socket.id);
    if (!player || !player.inJail || player.jailFreeCards <= 0) return;
    player.jailFreeCards--;
    player.inJail = false;
    player.jailTurns = 0;
    addLog(game, `${player.name} utilise sa carte "Sortez de prison gratuitement"`, 'success');
    broadcastGame(code);
  });

  socket.on('endTurn', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'playing') return;
    const player = game.players[game.currentPlayerIndex];
    if (player.id !== socket.id) return;
    if (game.turnPhase === 'roll') return;

    // Allow re-roll on doubles
    if (game.dice[0] === game.dice[1] && game.doublesCount > 0 && !player.inJail) {
      game.turnPhase = 'roll';
      broadcastGame(code);
      return;
    }

    endTurn(game);
    broadcastGame(code);
    scheduleNextBotTurn(code);
  });

  socket.on('rejoinRoom', ({ roomCode, playerId }) => {
    const code = roomCode?.toUpperCase();
    const game = getRoom(code);
    if (!game) { socket.emit('error', 'Salle introuvable'); return; }

    // Re-attach socket to room channel
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = playerId;

    // Reassign socket id if player reconnects (same playerId stored in session)
    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.connected = true;
      addLog(game, `${player.name} s'est reconnecté`, 'info');
    }
    broadcastGame(code);
  });

  socket.on('disconnect', () => {
    const code = socket.data?.roomCode;
    const game = code ? getRoom(code) : null;
    if (game) {
      const player = game.players.find(p => p.id === socket.id);
      if (player) {
        player.connected = false;
        addLog(game, `${player.name} s'est déconnecté`, 'warning');
        broadcastGame(code);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Patrimonio server running on port ${PORT}`));
