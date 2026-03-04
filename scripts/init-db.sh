#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

PRISMA_ENGINES_CACHE_DIR=/tmp/prisma-engines npm run prisma:generate
XDG_CACHE_HOME=/tmp PRISMA_ENGINES_CACHE_DIR=/tmp/prisma-engines npm run db:push

echo "Database initialized successfully."
