#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/BackEnd"
FRONTEND_DIR="${ROOT_DIR}/FrontEnd"

if [[ ! -d "${BACKEND_DIR}" || ! -d "${FRONTEND_DIR}" ]]; then
  echo "BackEnd/ or FrontEnd/ directory missing."
  exit 1
fi

if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  echo "Missing BackEnd/.env. Copy BackEnd/.env.example and configure it first."
  exit 1
fi

if [[ ! -d "${BACKEND_DIR}/node_modules" ]]; then
  echo "Installing backend dependencies..."
  (cd "${BACKEND_DIR}" && npm install)
fi

if [[ ! -d "${FRONTEND_DIR}/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "${FRONTEND_DIR}" && npm install)
fi

cleanup() {
  echo ""
  echo "Stopping local services..."
  [[ -n "${BACK_PID:-}" ]] && kill "${BACK_PID}" 2>/dev/null || true
  [[ -n "${FRONT_PID:-}" ]] && kill "${FRONT_PID}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "Starting backend on http://localhost:5000 ..."
(cd "${BACKEND_DIR}" && npm run dev) &
BACK_PID=$!

echo "Starting frontend on http://localhost:5173 ..."
(cd "${FRONTEND_DIR}" && VITE_API_URL="http://localhost:5000/api/v1" npm run dev -- --host 0.0.0.0 --port 5173) &
FRONT_PID=$!

echo "CAR EASE local stack is running."
echo "Frontend: http://localhost:5173"
echo "Backend : http://localhost:5000"
echo "Press Ctrl+C to stop both."

wait "${BACK_PID}" "${FRONT_PID}"
