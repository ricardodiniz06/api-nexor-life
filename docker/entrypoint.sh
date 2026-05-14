#!/bin/sh
set -e
echo "[entrypoint] Aplicando migrations..."
node ./node_modules/typeorm/cli.js migration:run -d ./dist/database/data-source.js
echo "[entrypoint] Iniciando API..."
exec node ./dist/main.js
