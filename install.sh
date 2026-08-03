#!/usr/bin/env sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker belum terpasang."
  echo "Ubuntu/Debian: curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

docker compose up -d --build

PORT=$(grep '^APP_PORT=' .env | cut -d= -f2 || true)
PORT=${PORT:-8080}

echo ""
echo "DraShort sudah berjalan."
echo "Buka: http://IP-VPS:${PORT}"
echo ""
echo "Cek status:"
docker compose ps
