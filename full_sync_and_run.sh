#!/bin/bash
#
# This script automates the entire process of setting up and running the
# local development environment for the cashcraft monorepo.
# It handles backend canister deployment, frontend setup, and starts the dev server.
#
# Usage:
#   ./full_sync_and_run.sh [network]
#
#   [network]: Optional. 'local' or 'ic'. Defaults to 'local'.
#
# Example:
#   ./full_sync_and_run.sh          # For local development
#   ./full_sync_and_run.sh ic       # For mainnet deployment tasks (doesn't run dev server)

# --- Fail on any error ---
#!/bin/bash
set -e

# --- Helper Functions ---
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

log() { echo -e "${GREEN}🚀 [Sync Script] $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️ [Sync Script] $1${NC}"; }
error() { echo -e "${RED}❌ [Sync Script] ERROR: $1${NC}" >&2; exit 1; }

# --- Dependency Checks ---
log "Step 1: Checking for required tools (dfx, node, jq)..."
command -v dfx >/dev/null 2>&1 || error "dfx is not installed. Install via https://internetcomputer.org/docs/current/developer-docs/quickstart/local-quickstart"
command -v node >/dev/null 2>&1 || error "Node.js is not installed. Install it first."
command -v jq >/dev/null 2>&1 || error "jq is not installed. Install it (brew install jq or apt-get install jq)."
log "✅ All required tools are available."

# --- Configuration ---
ROOT_DIR=$(pwd)
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
DECLARATIONS_DIR="$FRONTEND_DIR/src/declarations"
NETWORK=${1:-local} # Default to 'local'

log "Step 2: Setting up network environment for '$NETWORK'..."

# Stop and restart dfx for local
if [ "$NETWORK" == "local" ]; then
  log "-> Stopping any running dfx replica..."
  dfx stop || true

  log "-> Starting a fresh dfx replica in the background..."
  dfx start --clean --background

  log "-> Waiting for replica to be healthy..."
  for i in {1..10}; do
    if dfx ping "$NETWORK" >/dev/null 2>&1; then
      log "✅ Replica is healthy and running."
      break
    fi
    warn "Waiting for replica... attempt $i"
    sleep 2
  done
fi

# --- Deploy Canisters ---
log "Step 3: Deploying canisters to network '$NETWORK'..."
if ! dfx deploy --network "$NETWORK"; then
  warn "Deploy failed. Retrying with rebuild..."
  dfx build --network "$NETWORK" || error "Build failed. Check Motoko code."
  dfx deploy --network "$NETWORK" || error "Deploy failed even after retry."
fi
log "✅ Canisters deployed successfully."

# --- Generate Type Declarations ---
log "-> Generating type declarations for network '$NETWORK'..."
dfx generate || error "Failed to generate canister declarations."
log "✅ Declarations generated."

# --- Heal Environment and Declarations ---
log "Step 4: Running self-healing script for environment and declarations..."
./scripts/heal_env_and_declarations.sh "$NETWORK"
log "✅ Self-healing complete."

# --- Install Frontend Dependencies ---
log "Step 6: Checking frontend dependencies..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  log "node_modules not found. Installing dependencies..."
  npm install --prefix "$FRONTEND_DIR"
else
  log "✅ node_modules already exists."
fi

# --- Run Frontend ---
if [ "$NETWORK" == "local" ]; then
  log "Step 7: Starting Next.js development server..."
  cd "$FRONTEND_DIR"
  npm run dev
else
  log "✅ IC network setup complete. Please deploy your frontend manually."
fi
