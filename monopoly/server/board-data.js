// Plateau de jeu - Patrimonio (Monopoly version Gestion de Patrimoine)

const BOARD = [
  // Square 0-9
  { id: 0,  type: 'go',        name: 'Départ',              salary: 2000 },
  { id: 1,  type: 'property',  name: 'Limoges',             group: 'brown',  price: 600,  rent: [20,100,300,900,1600,2500],  houseCost: 500 },
  { id: 2,  type: 'community', name: 'Caisse Communauté' },
  { id: 3,  type: 'property',  name: 'Clermont-Ferrand',    group: 'brown',  price: 600,  rent: [40,200,600,1800,3200,4500],  houseCost: 500 },
  { id: 4,  type: 'tax',       name: 'Impôts Fonciers',     amount: 2000 },
  { id: 5,  type: 'railroad',  name: 'Gare de Lyon',        price: 2000 },
  { id: 6,  type: 'property',  name: 'Rennes',              group: 'lblue',  price: 1000, rent: [60,300,900,2700,4000,5500],  houseCost: 500 },
  { id: 7,  type: 'chance',    name: 'Opportunité' },
  { id: 8,  type: 'property',  name: 'Brest',               group: 'lblue',  price: 1000, rent: [60,300,900,2700,4000,5500],  houseCost: 500 },
  { id: 9,  type: 'property',  name: 'Caen',                group: 'lblue',  price: 1200, rent: [80,400,1000,3000,4500,6000],  houseCost: 500 },
  // Square 10-19
  { id: 10, type: 'jail',      name: 'Prison' },
  { id: 11, type: 'property',  name: 'Tours',               group: 'pink',   price: 1400, rent: [100,500,1500,4500,6250,7500], houseCost: 1000 },
  { id: 12, type: 'utility',   name: 'EDF Électricité',     price: 1500 },
  { id: 13, type: 'property',  name: 'Dijon',               group: 'pink',   price: 1400, rent: [100,500,1500,4500,6250,7500], houseCost: 1000 },
  { id: 14, type: 'property',  name: 'Reims',               group: 'pink',   price: 1600, rent: [120,600,1800,5000,7000,9000], houseCost: 1000 },
  { id: 15, type: 'railroad',  name: 'Gare du Nord',        price: 2000 },
  { id: 16, type: 'property',  name: 'Strasbourg',          group: 'orange', price: 1800, rent: [140,700,2000,5500,7500,9500], houseCost: 1000 },
  { id: 17, type: 'community', name: 'Caisse Communauté' },
  { id: 18, type: 'property',  name: 'Grenoble',            group: 'orange', price: 1800, rent: [140,700,2000,5500,7500,9500], houseCost: 1000 },
  { id: 19, type: 'property',  name: 'Toulouse',            group: 'orange', price: 2000, rent: [160,800,2200,6000,8000,10000],houseCost: 1000 },
  // Square 20-29
  { id: 20, type: 'parking',   name: 'Parking Gratuit' },
  { id: 21, type: 'property',  name: 'Nice',                group: 'red',    price: 2200, rent: [180,900,2500,7000,8750,10500],houseCost: 1500 },
  { id: 22, type: 'chance',    name: 'Opportunité' },
  { id: 23, type: 'property',  name: 'Montpellier',         group: 'red',    price: 2200, rent: [180,900,2500,7000,8750,10500],houseCost: 1500 },
  { id: 24, type: 'property',  name: 'Toulon',              group: 'red',    price: 2400, rent: [200,1000,3000,7500,9250,11000],houseCost: 1500 },
  { id: 25, type: 'railroad',  name: 'Gare Saint-Lazare',   price: 2000 },
  { id: 26, type: 'property',  name: 'Lille',               group: 'yellow', price: 2600, rent: [220,1100,3300,8000,9750,11500],houseCost: 1500 },
  { id: 27, type: 'property',  name: 'Bordeaux',            group: 'yellow', price: 2600, rent: [220,1100,3300,8000,9750,11500],houseCost: 1500 },
  { id: 28, type: 'utility',   name: 'Suez Eau',            price: 1500 },
  { id: 29, type: 'property',  name: 'Marseille',           group: 'yellow', price: 2800, rent: [240,1200,3600,8500,10250,12000],houseCost: 1500 },
  // Square 30-39
  { id: 30, type: 'gotojail',  name: 'Allez en Prison' },
  { id: 31, type: 'property',  name: 'Lyon Part-Dieu',      group: 'green',  price: 3000, rent: [260,1300,3900,9000,11000,12750],houseCost: 2000 },
  { id: 32, type: 'property',  name: 'Lyon Confluence',     group: 'green',  price: 3000, rent: [260,1300,3900,9000,11000,12750],houseCost: 2000 },
  { id: 33, type: 'community', name: 'Caisse Communauté' },
  { id: 34, type: 'property',  name: 'Lyon Presqu\'île',    group: 'green',  price: 3200, rent: [280,1500,4500,10000,12000,14000],houseCost: 2000 },
  { id: 35, type: 'railroad',  name: 'Gare Montparnasse',   price: 2000 },
  { id: 36, type: 'chance',    name: 'Opportunité' },
  { id: 37, type: 'property',  name: 'Paris 8ème',          group: 'dblue',  price: 3500, rent: [350,1750,5000,11000,13000,15000],houseCost: 2000 },
  { id: 38, type: 'tax',       name: 'Taxe de Patrimoine',  amount: 1000 },
  { id: 39, type: 'property',  name: 'Paris 1er',           group: 'dblue',  price: 4000, rent: [500,2000,6000,14000,17000,20000],houseCost: 2000 },
];

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

const GROUP_SIZES = {
  brown: 2, lblue: 3, pink: 3, orange: 3,
  red: 3, yellow: 3, green: 3, dblue: 2,
};

const CHANCE_CARDS = [
  { id: 'c1',  text: 'Avancez jusqu\'au Départ. Recevez 2000€', action: 'goto', target: 0, collect: 2000 },
  { id: 'c2',  text: 'Avancez jusqu\'à Paris 1er', action: 'goto', target: 39 },
  { id: 'c3',  text: 'Avancez jusqu\'à la Gare la plus proche', action: 'nearestRailroad' },
  { id: 'c4',  text: 'La banque vous verse un dividende de 500€', action: 'collect', amount: 500 },
  { id: 'c5',  text: 'Sortez de prison gratuitement', action: 'jailFree' },
  { id: 'c6',  text: 'Reculez de 3 cases', action: 'move', amount: -3 },
  { id: 'c7',  text: 'Allez directement en prison', action: 'jail' },
  { id: 'c8',  text: 'Réparations générales : 1500€ par immeuble, 400€ par appartement', action: 'repairs', hotel: 1500, house: 400 },
  { id: 'c9',  text: 'Amende de 150€', action: 'pay', amount: 150 },
  { id: 'c10', text: 'Vous recevez un héritage de 1000€', action: 'collect', amount: 1000 },
  { id: 'c11', text: 'Avancez jusqu\'à Bordeaux', action: 'goto', target: 27 },
  { id: 'c12', text: 'Chaque joueur vous verse 500€', action: 'collectFromAll', amount: 500 },
];

const COMMUNITY_CARDS = [
  { id: 'cc1',  text: 'Avancez jusqu\'au Départ. Recevez 2000€', action: 'goto', target: 0, collect: 2000 },
  { id: 'cc2',  text: 'Remboursement d\'impôts : recevez 2000€', action: 'collect', amount: 2000 },
  { id: 'cc3',  text: 'Sortez de prison gratuitement', action: 'jailFree' },
  { id: 'cc4',  text: 'Allez directement en prison', action: 'jail' },
  { id: 'cc5',  text: 'Frais médicaux : payez 1000€', action: 'pay', amount: 1000 },
  { id: 'cc6',  text: 'Vente d\'actions : recevez 500€', action: 'collect', amount: 500 },
  { id: 'cc7',  text: 'C\'est votre anniversaire ! Chaque joueur vous donne 100€', action: 'collectFromAll', amount: 100 },
  { id: 'cc8',  text: 'Vous héritez de 1000€', action: 'collect', amount: 1000 },
  { id: 'cc9',  text: 'Consultance patrimoniale : payez 500€', action: 'pay', amount: 500 },
  { id: 'cc10', text: 'Revenus locatifs : recevez 2000€', action: 'collect', amount: 2000 },
  { id: 'cc11', text: 'Travaux de copropriété : 400€ par appartement, 1150€ par immeuble', action: 'repairs', hotel: 1150, house: 400 },
  { id: 'cc12', text: 'Prix du patrimoine exceptionnel : recevez 1000€', action: 'collect', amount: 1000 },
];

const PLAYER_TOKENS = ['🏠','🚗','🎩','🐕','🛳️','⭐'];
const PLAYER_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];

const CHARACTERS = [
  { id: 'char-lime',   color: '#84cc16' },
  { id: 'char-yellow', color: '#eab308' },
  { id: 'char-orange', color: '#f97316' },
  { id: 'char-red',    color: '#ef4444' },
  { id: 'char-blue',   color: '#3b82f6' },
  { id: 'char-cyan',   color: '#06b6d4' },
  { id: 'char-teal',   color: '#14b8a6' },
  { id: 'char-green',  color: '#22c55e' },
  { id: 'char-purple', color: '#a78bfa' },
  { id: 'char-pink',   color: '#ec4899' },
  { id: 'char-rose',   color: '#f43f5e' },
  { id: 'char-violet', color: '#8b5cf6' },
];

module.exports = { BOARD, GROUP_COLORS, GROUP_SIZES, CHANCE_CARDS, COMMUNITY_CARDS, PLAYER_TOKENS, PLAYER_COLORS, CHARACTERS };
