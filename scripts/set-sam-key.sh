#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

printf "Enter SAM_API_KEY (input hidden): "
IFS= read -r -s SAM_KEY
printf "\n"

if [[ -z "$SAM_KEY" ]]; then
  echo "No key entered; nothing changed."
  exit 1
fi

tmp_file="$(mktemp)"
found=0

while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" == SAM_API_KEY=* ]]; then
    printf 'SAM_API_KEY="%s"\n' "$SAM_KEY" >> "$tmp_file"
    found=1
  else
    printf '%s\n' "$line" >> "$tmp_file"
  fi
done < .env

if [[ "$found" -eq 0 ]]; then
  printf '\nSAM_API_KEY="%s"\n' "$SAM_KEY" >> "$tmp_file"
fi

mv "$tmp_file" .env
chmod 600 .env

echo "Saved SAM_API_KEY to .env"
