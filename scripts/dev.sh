#!/usr/bin/env bash
set -Eeuo pipefail

# One-command local development launcher for AEP Notification Engine.
# Run from anywhere: bash scripts/dev.sh (from repository root).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"
API_DIR="$ROOT_DIR/apps/api"
ENV_FILE="$ROOT_DIR/.env"

log() { printf '\n\033[1;36m[AEP]\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

for command in node npm docker; do
  command -v "$command" >/dev/null 2>&1 || fail "'$command' is required. Install it and try again."
done

docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required. Start Docker Desktop/Engine and try again."

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( node_major >= 20 )) || fail "Node.js 20 or newer is required. Current version: $(node --version)"

[[ -f "$WEB_DIR/package.json" ]] || fail "Could not find $WEB_DIR/package.json. Run this script from a cloned repository."
[[ -f "$API_DIR/package.json" ]] || fail "Could not find $API_DIR/package.json."

if [[ ! -f "$ENV_FILE" ]]; then
  log "Creating local .env from .env.example"
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
fi

cleanup() {
  log "Stopping web and API processes..."
  [[ -n "${WEB_PID:-}" ]] && kill "$WEB_PID" 2>/dev/null || true
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  log "PostgreSQL container is left running. Stop it with: docker compose down"
}
trap cleanup EXIT INT TERM

log "Installing web dependencies..."
(cd "$WEB_DIR" && npm install)

log "Installing API dependencies..."
(cd "$API_DIR" && npm install)

log "Starting PostgreSQL with Docker Compose..."
(cd "$ROOT_DIR" && docker compose up -d postgres)

log "Launching NestJS API on http://localhost:3000"
(
  cd "$API_DIR"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  npm run start:dev
) &
API_PID=$!

log "Launching React + Vite UI on http://localhost:5173"
(
  cd "$WEB_DIR"
  npm run dev -- --host 0.0.0.0
) &
WEB_PID=$!

printf '\n'
printf '============================================================\n'
printf ' AEP Notification Engine — local development\n'
printf '============================================================\n'
printf ' Web UI:  http://localhost:5173\n'
printf ' API:     http://localhost:3000/api/events\n'
printf ' Health:  http://localhost:3000/api/events\n'
printf '\n'
printf 'Press Ctrl+C to stop the web and API processes.\n'
printf 'PostgreSQL remains running; stop it separately with:\n'
printf '  cd "%s" && docker compose down\n' "$ROOT_DIR"
printf '\n'

# If either process exits, stop the whole development session.
while kill -0 "$API_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null; do
  sleep 2
done

log "A web or API process exited. Check the logs above."
exit 1
