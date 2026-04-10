const { BOARD, GROUP_SIZES, CHANCE_CARDS, COMMUNITY_CARDS, PLAYER_TOKENS, PLAYER_COLORS } = require('./board-data');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createGame(roomId) {
  return {
    id: roomId,
    phase: 'lobby', // lobby | playing | ended
    players: [],
    currentPlayerIndex: 0,
    turnPhase: 'roll', // roll | action | end
    dice: [0, 0],
    doublesCount: 0,
    properties: {}, // squareId -> { owner: playerId, houses: 0, mortgaged: false }
    chanceDeck: shuffle(CHANCE_CARDS),
    chanceIndex: 0,
    communityDeck: shuffle(COMMUNITY_CARDS),
    communityIndex: 0,
    log: [],
    auction: null,
    pendingTrade: null,
    parkingPot: 0,
  };
}

function createPlayer(id, name, isBot, tokenIndex) {
  return {
    id,
    name,
    isBot,
    token: PLAYER_TOKENS[tokenIndex % PLAYER_TOKENS.length],
    color: PLAYER_COLORS[tokenIndex % PLAYER_COLORS.length],
    position: 0,
    money: 15000,
    inJail: false,
    jailTurns: 0,
    jailFreeCards: 0,
    bankrupt: false,
    connected: true,
  };
}

function rollDice() {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

function getGroupProperties(game, group) {
  return BOARD.filter(s => s.type === 'property' && s.group === group);
}

function ownsFullGroup(game, playerId, group) {
  const props = getGroupProperties(game, group);
  return props.every(p => game.properties[p.id]?.owner === playerId);
}

function getRailroadCount(game, playerId) {
  return BOARD.filter(s => s.type === 'railroad')
    .filter(s => game.properties[s.id]?.owner === playerId).length;
}

function getUtilityCount(game, playerId) {
  return BOARD.filter(s => s.type === 'utility')
    .filter(s => game.properties[s.id]?.owner === playerId).length;
}

function calcRent(game, squareId, diceSum) {
  const square = BOARD[squareId];
  const prop = game.properties[squareId];
  if (!prop || !prop.owner || prop.mortgaged) return 0;

  if (square.type === 'railroad') {
    const count = getRailroadCount(game, prop.owner);
    return [0, 250, 500, 1000, 2000][count];
  }

  if (square.type === 'utility') {
    const count = getUtilityCount(game, prop.owner);
    return count === 1 ? diceSum * 40 : diceSum * 100;
  }

  if (square.type === 'property') {
    const houses = prop.houses || 0;
    let rent = square.rent[houses];
    if (houses === 0 && ownsFullGroup(game, prop.owner, square.group)) {
      rent *= 2;
    }
    return rent;
  }
  return 0;
}

function getNextCard(deck, indexRef) {
  const card = deck[indexRef.index % deck.length];
  indexRef.index++;
  return card;
}

function findNearestRailroad(position) {
  const railroads = [5, 15, 25, 35];
  for (let i = 0; i < railroads.length; i++) {
    if (railroads[i] > position) return railroads[i];
  }
  return railroads[0];
}

function addLog(game, message, type = 'info') {
  game.log.unshift({ message, type, time: Date.now() });
  if (game.log.length > 50) game.log.pop();
}

function transferMoney(game, fromId, toId, amount) {
  const from = fromId ? game.players.find(p => p.id === fromId) : null;
  const to   = toId   ? game.players.find(p => p.id === toId)   : null;
  if (from) from.money -= amount;
  if (to)   to.money   += amount;
}

function checkBankruptcy(game, player) {
  if (player.money < 0) {
    // Force sell all assets
    Object.entries(game.properties).forEach(([sqId, prop]) => {
      if (prop.owner === player.id) {
        prop.owner = null;
        prop.houses = 0;
        prop.mortgaged = false;
      }
    });
    player.bankrupt = true;
    player.money = 0;
    addLog(game, `${player.name} est en faillite !`, 'danger');
  }
}

function checkWinner(game) {
  const alive = game.players.filter(p => !p.bankrupt);
  if (alive.length === 1) {
    game.phase = 'ended';
    game.winner = alive[0].id;
    addLog(game, `${alive[0].name} remporte la partie !`, 'success');
    return true;
  }
  return false;
}

function advancePlayer(game, player, steps) {
  const oldPos = player.position;
  player.position = (player.position + steps) % 40;
  if (player.position < oldPos && steps > 0) {
    // Passed Go
    player.money += BOARD[0].salary;
    addLog(game, `${player.name} passe par le Départ et reçoit ${BOARD[0].salary}€`, 'success');
  }
}

function handleLanding(game, player, diceSum) {
  const square = BOARD[player.position];
  const events = [];

  if (square.type === 'go') {
    // Already handled in advancePlayer
  } else if (square.type === 'tax') {
    transferMoney(game, player.id, null, square.amount);
    game.parkingPot += square.amount;
    addLog(game, `${player.name} paie ${square.amount}€ d'impôts`, 'warning');
    checkBankruptcy(game, player);
  } else if (square.type === 'gotojail') {
    sendToJail(game, player);
  } else if (square.type === 'parking') {
    if (game.parkingPot > 0) {
      player.money += game.parkingPot;
      addLog(game, `${player.name} récupère le pot du parking : ${game.parkingPot}€ !`, 'success');
      game.parkingPot = 0;
    }
  } else if (square.type === 'chance') {
    const idxRef = { index: game.chanceIndex };
    const card = getNextCard(game.chanceDeck, idxRef);
    game.chanceIndex = idxRef.index;
    events.push({ type: 'card', cardType: 'chance', card });
    applyCard(game, player, card, diceSum, events);
  } else if (square.type === 'community') {
    const idxRef = { index: game.communityIndex };
    const card = getNextCard(game.communityDeck, idxRef);
    game.communityIndex = idxRef.index;
    events.push({ type: 'card', cardType: 'community', card });
    applyCard(game, player, card, diceSum, events);
  } else if (square.type === 'property' || square.type === 'railroad' || square.type === 'utility') {
    const prop = game.properties[square.id];
    if (!prop || !prop.owner) {
      // Unowned - offer to buy
      events.push({ type: 'canBuy', square, price: square.price });
    } else if (prop.owner !== player.id && !prop.mortgaged) {
      const rent = calcRent(game, square.id, diceSum);
      if (rent > 0) {
        transferMoney(game, player.id, prop.owner, rent);
        addLog(game, `${player.name} paie ${rent}€ de loyer à ${game.players.find(p=>p.id===prop.owner)?.name}`, 'warning');
        checkBankruptcy(game, player);
      }
    }
  }

  return events;
}

function applyCard(game, player, card, diceSum, events) {
  addLog(game, `${player.name} tire : "${card.text}"`, 'info');

  switch (card.action) {
    case 'goto': {
      const target = card.target;
      if (player.position > target && target !== 30) {
        player.money += BOARD[0].salary;
        addLog(game, `${player.name} passe par le Départ et reçoit ${BOARD[0].salary}€`, 'success');
      }
      player.position = target;
      if (card.collect) player.money += card.collect;
      if (target !== 30) {
        const landing = handleLanding(game, player, diceSum);
        events.push(...landing);
      } else {
        sendToJail(game, player);
      }
      break;
    }
    case 'move': {
      advancePlayer(game, player, card.amount);
      const landing = handleLanding(game, player, diceSum);
      events.push(...landing);
      break;
    }
    case 'nearestRailroad': {
      const target = findNearestRailroad(player.position);
      if (target < player.position) {
        player.money += BOARD[0].salary;
      }
      player.position = target;
      const landing = handleLanding(game, player, diceSum);
      events.push(...landing);
      break;
    }
    case 'collect':
      player.money += card.amount;
      break;
    case 'pay':
      transferMoney(game, player.id, null, card.amount);
      game.parkingPot += card.amount;
      checkBankruptcy(game, player);
      break;
    case 'jailFree':
      player.jailFreeCards++;
      break;
    case 'jail':
      sendToJail(game, player);
      break;
    case 'collectFromAll': {
      const others = game.players.filter(p => p.id !== player.id && !p.bankrupt);
      others.forEach(p => {
        transferMoney(game, p.id, player.id, card.amount);
        checkBankruptcy(game, p);
      });
      addLog(game, `${player.name} reçoit ${card.amount}€ de chaque joueur`, 'success');
      break;
    }
    case 'repairs': {
      let total = 0;
      Object.entries(game.properties).forEach(([sqId, prop]) => {
        if (prop.owner === player.id) {
          total += prop.houses >= 5 ? card.hotel : prop.houses * card.house;
        }
      });
      if (total > 0) {
        transferMoney(game, player.id, null, total);
        game.parkingPot += total;
        checkBankruptcy(game, player);
      }
      break;
    }
  }
}

function sendToJail(game, player) {
  player.position = 10;
  player.inJail = true;
  player.jailTurns = 0;
  addLog(game, `${player.name} est envoyé en prison !`, 'danger');
}

function buyProperty(game, playerId, squareId) {
  const square = BOARD[squareId];
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.money < square.price) return false;
  if (game.properties[squareId]?.owner) return false;

  player.money -= square.price;
  game.properties[squareId] = { owner: playerId, houses: 0, mortgaged: false };
  addLog(game, `${player.name} achète ${square.name} pour ${square.price}€`, 'success');
  return true;
}

function buildHouse(game, playerId, squareId) {
  const square = BOARD[squareId];
  const prop = game.properties[squareId];
  const player = game.players.find(p => p.id === playerId);
  if (!prop || prop.owner !== playerId || prop.mortgaged) return false;
  if (square.type !== 'property') return false;
  if (!ownsFullGroup(game, playerId, square.group)) return false;
  if (prop.houses >= 5) return false;

  // Even build rule
  const groupProps = getGroupProperties(game, square.group);
  const minHouses = Math.min(...groupProps.map(p => game.properties[p.id]?.houses || 0));
  if (prop.houses > minHouses) return false;

  if (player.money < square.houseCost) return false;

  player.money -= square.houseCost;
  prop.houses++;
  const label = prop.houses === 5 ? 'un immeuble' : 'un appartement';
  addLog(game, `${player.name} construit ${label} sur ${square.name}`, 'success');
  return true;
}

function sellHouse(game, playerId, squareId) {
  const square = BOARD[squareId];
  const prop = game.properties[squareId];
  const player = game.players.find(p => p.id === playerId);
  if (!prop || prop.owner !== playerId) return false;
  if (prop.houses <= 0) return false;

  // Even sell rule
  const groupProps = getGroupProperties(game, square.group);
  const maxHouses = Math.max(...groupProps.map(p => game.properties[p.id]?.houses || 0));
  if (prop.houses < maxHouses) return false;

  prop.houses--;
  player.money += Math.floor(square.houseCost / 2);
  return true;
}

function mortgageProperty(game, playerId, squareId) {
  const square = BOARD[squareId];
  const prop = game.properties[squareId];
  const player = game.players.find(p => p.id === playerId);
  if (!prop || prop.owner !== playerId || prop.mortgaged) return false;
  if (prop.houses > 0) return false;

  prop.mortgaged = true;
  player.money += Math.floor(square.price / 2);
  addLog(game, `${player.name} hypothèque ${square.name}`, 'warning');
  return true;
}

function unmortgageProperty(game, playerId, squareId) {
  const square = BOARD[squareId];
  const prop = game.properties[squareId];
  const player = game.players.find(p => p.id === playerId);
  if (!prop || prop.owner !== playerId || !prop.mortgaged) return false;
  const cost = Math.floor(square.price * 0.55);
  if (player.money < cost) return false;

  prop.mortgaged = false;
  player.money -= cost;
  addLog(game, `${player.name} lève l'hypothèque sur ${square.name}`, 'success');
  return true;
}

function endTurn(game) {
  const alive = game.players.filter(p => !p.bankrupt);
  if (alive.length <= 1) {
    checkWinner(game);
    return;
  }
  let next = (game.currentPlayerIndex + 1) % game.players.length;
  while (game.players[next].bankrupt) {
    next = (next + 1) % game.players.length;
  }
  game.currentPlayerIndex = next;
  game.turnPhase = 'roll';
  game.doublesCount = 0;
}

// Bot AI - simple strategy
function botTakeTurn(game, player) {
  const actions = [];

  // Bot decides to buy properties when landing on them
  // This is called after bot lands - handled in processBotAction

  // Build houses if possible
  const groups = [...new Set(
    BOARD.filter(s => s.type === 'property')
      .filter(s => game.properties[s.id]?.owner === player.id)
      .map(s => s.group)
      .filter(g => ownsFullGroup(game, player.id, g))
  )];

  groups.forEach(group => {
    const props = getGroupProperties(game, group);
    props.forEach(sq => {
      const prop = game.properties[sq.id];
      if (prop && prop.houses < 4 && player.money > sq.houseCost * 2) {
        actions.push({ type: 'buildHouse', squareId: sq.id });
      }
    });
  });

  return actions;
}

module.exports = {
  createGame, createPlayer, rollDice, handleLanding, advancePlayer,
  buyProperty, buildHouse, sellHouse, mortgageProperty, unmortgageProperty,
  sendToJail, endTurn, checkWinner, checkBankruptcy, calcRent, addLog,
  botTakeTurn, ownsFullGroup, getGroupProperties,
};
