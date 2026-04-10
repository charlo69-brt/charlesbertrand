#!/bin/bash
cd "$(dirname "$0")/server"
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances..."
  npm install
fi
echo "Démarrage de Patrimonio sur http://localhost:3001"
node server.js
