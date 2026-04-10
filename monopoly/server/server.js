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

const { CHARACTERS } = require('./board-data');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const publicDir = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicDir));

const rooms = {};

// Helper: get the effective player ID for this socket
// After rejoin, socket.data.playerId holds the original persistent player ID
function pid(socket) {
  return socket.data.playerId || socket.id;
}

function getRoom(code) { return rooms[code?.toUpperCase()]; }

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
    pendingBuy: game.pendingBuy,
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

  const dice = rollDice();
  game.dice = dice;
  const diceSum = dice[0] + dice[1];
  const isDoubles = dice[0] === dice[1];

  io.to(code).emit('diceRolled', { dice, playerId: player.id });
  addLog(game, `${player.name} lance les dés : ${dice[0]} + ${dice[1]} = ${diceSum}`, 'info');

  if (player.inJail) {
    player.jailTurns++;
    if (isDoubles || player.jailTurns >= 3) {
      player.inJail = false;
      player.jailTurns = 0;
      if (!isDoubles) {
        player.money -= 500;
        addLog(game, `${player.name} paie 500€ pour sortir de prison`, 'warning');
      } else {
        addLog(game, `${player.name} sort de prison avec un double !`, 'success');
      }
    } else {
      addLog(game, `${player.name} reste en prison (${player.jailTurns}/3)`, 'info');
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

  await delay(600);
  advancePlayer(game, player, diceSum);
  broadcastGame(code);

  await delay(600);
  const events = handleLanding(game, player, diceSum);
  broadcastGame(code);

  const canBuyEvent = events.find(e => e.type === 'canBuy');
  if (canBuyEvent && player.money >= canBuyEvent.square.price) {
    await delay(500);
    buyProperty(game, player.id, canBuyEvent.square.id);
  }

  await delay(400);
  const actions = botTakeTurn(game, player);
  for (const action of actions) {
    if (action.type === 'buildHouse') {
      buildHouse(game, player.id, action.squareId);
      await delay(200);
    }
  }

  broadcastGame(code);

  if (isDoubles && !player.inJail && game.doublesCount < 3) {
    await delay(1000);
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
    setTimeout(() => runBotTurn(code), 1200);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ playerName, characterId }) => {
    const code = generateRoomCode();
    const game = createGame(code);
    const charColor = CHARACTERS.find(c => c.id === characterId)?.color;
    const player = createPlayer(socket.id, playerName, false, 0, charColor);
    game.players.push(player);
    rooms[code] = game;
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = socket.id;
    socket.emit('roomCreated', { code, playerId: socket.id });
    broadcastGame(code);
  });

  socket.on('joinRoom', ({ roomCode, playerName, characterId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) { socket.emit('error', 'Salle introuvable'); return; }
    if (game.phase !== 'lobby') { socket.emit('error', 'Partie déjà commencée'); return; }
    if (game.players.filter(p => !p.isBot).length >= 6) { socket.emit('error', 'Salle pleine'); return; }

    const tokenIndex = game.players.length;
    const charColor = CHARACTERS.find(c => c.id === characterId)?.color;
    const player = createPlayer(socket.id, playerName, false, tokenIndex, charColor);
    game.players.push(player);
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = socket.id;
    socket.emit('roomJoined', { code, playerId: socket.id });
    broadcastGame(code);
  });

  socket.on('rejoinRoom', ({ roomCode, playerId }) => {
    const code = roomCode?.toUpperCase();
    const game = getRoom(code);
    if (!game) { socket.emit('error', 'Salle introuvable'); return; }

    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerId = playerId; // Keep original player ID

    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.connected = true;
    }
    // Tell client their confirmed player ID
    socket.emit('identityConfirmed', { playerId });
    broadcastGame(code);
  });

  socket.on('addBot', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'lobby') return;
    if (game.players.length >= 6) { socket.emit('error', 'Maximum 6 joueurs'); return; }

    const names = ['MaxBot', 'AlphaBot', 'RoboGest', 'PatriBot', 'WealthBot', 'InvestBot'];
    const usedNames = game.players.map(p => p.name);
    const available = names.filter(n => !usedNames.includes(n));
    const name = available[0] || `Bot${game.players.length}`;
    const tokenIndex = game.players.length;
    const usedColors = game.players.map(p => p.color);
    const availChar = CHARACTERS.filter(c => !usedColors.includes(c.color));
    const botChar = availChar[Math.floor(Math.random() * availChar.length)] || CHARACTERS[game.players.length % CHARACTERS.length];
    const bot = createPlayer('bot_' + uuidv4(), name, true, tokenIndex, botChar.color);
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

    game.players.sort(() => Math.random() - 0.5);
    game.phase = 'playing';
    game.currentPlayerIndex = 0;
    game.turnPhase = 'roll';
    addLog(game, 'La partie commence ! Bonne chance à tous !', 'success');
    broadcastGame(code);
    scheduleNextBotTurn(code);
  });

  socket.on('rollDice', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game || game.phase !== 'playing') return;

    const playerId = pid(socket);
    const player = game.players[game.currentPlayerIndex];
    if (!player || player.id !== playerId || player.bankrupt) return;
    const isDoublesReroll = game.turnPhase === 'action' &&
      game.dice[0] === game.dice[1] &&
      game.doublesCount > 0 && game.doublesCount < 3 &&
      !game.pendingBuy;
    if (game.turnPhase !== 'roll' && !isDoublesReroll) return;
    if (isDoublesReroll) game.turnPhase = 'roll';

    const dice = rollDice();
    game.dice = dice;
    const diceSum = dice[0] + dice[1];
    const isDoubles = dice[0] === dice[1];

    io.to(code).emit('diceRolled', { dice, playerId: player.id });
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
    game.pendingBuy = canBuyEvent
      ? { squareId: canBuyEvent.square.id, playerId: player.id }
      : null;

    const cardEvent = events.find(e => e.type === 'card');
    if (cardEvent) io.to(code).emit('cardDrawn', cardEvent);

    checkWinner(game);
    broadcastGame(code);
  });

  socket.on('buyProperty', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    buyProperty(game, pid(socket), squareId);
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
    buildHouse(game, pid(socket), squareId);
    broadcastGame(code);
  });

  socket.on('sellHouse', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    sellHouse(game, pid(socket), squareId);
    broadcastGame(code);
  });

  socket.on('mortgage', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    mortgageProperty(game, pid(socket), squareId);
    broadcastGame(code);
  });

  socket.on('unmortgage', ({ roomCode, squareId }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    unmortgageProperty(game, pid(socket), squareId);
    broadcastGame(code);
  });

  socket.on('payJailFine', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    const player = game.players.find(p => p.id === pid(socket));
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
    const player = game.players.find(p => p.id === pid(socket));
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
    if (!player || player.id !== pid(socket)) return;
    if (game.turnPhase === 'roll') return;

    const isDoubles = game.dice[0] === game.dice[1];
    if (isDoubles && !player.inJail && game.doublesCount > 0 && game.doublesCount < 3) {
      game.turnPhase = 'roll';
      broadcastGame(code);
      return;
    }

    endTurn(game);
    broadcastGame(code);
    scheduleNextBotTurn(code);
  });

  // Chat
  socket.on('chatMessage', ({ roomCode, message }) => {
    const code = roomCode?.toUpperCase();
    const game = getRoom(code);
    if (!game) return;
    const player = game.players.find(p => p.id === pid(socket));
    if (!player) return;
    const text = String(message).trim().slice(0, 200);
    if (!text) return;
    io.to(code).emit('chatMessage', {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      text,
      time: Date.now(),
    });
  });

  socket.on('disconnect', () => {
    const code = socket.data?.roomCode;
    const game = code ? getRoom(code) : null;
    if (game) {
      const player = game.players.find(p => p.id === pid(socket));
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
