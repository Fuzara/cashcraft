#!/bin/bash
#
# This script intelligently heals the development environment by ensuring that
# canister IDs from a dfx deployment are correctly synchronized with the
# frontend's .env.local file. It is idempotent and safe to run multiple times.
#
# It ensures the following variables are present and correct:
#   - NEXT_PUBLIC_DFX_NETWORK
#   - NEXT_PUBLIC_CANISTER_ID (for the primary backend canister)
#   - NEXT_PUBLIC_CANISTER_ID_<CANISTER_NAME> (for all canisters)
#
# Usage:
#   ./scripts/heal_env_and_declarations.sh [network]
#
#   [network]: Optional. 'local' or 'ic'. Defaults to 'local'.
#

# --- Fail on any error ---
set -e

# --- Helper Functions ---
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

log() { echo -e "${GREEN}✅ [Healer] $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️ [Healer] $1${NC}"; }
error() { echo -e "${RED}❌ [Healer] ERROR: $1${NC}" >&2; exit 1; }
info() { echo -e "[Healer] $1"; }

# --- Configuration ---
ROOT_DIR=$(pwd)
FRONTEND_DIR="$ROOT_DIR/frontend"
ENV_FILE="$FRONTEND_DIR/.env.local"
NETWORK=${1:-local}
CANISTER_IDS_FILE="$ROOT_DIR/.dfx/$NETWORK/canister_ids.json"
DFX_JSON_FILE="$ROOT_DIR/dfx.json"
PRIMARY_CANISTER="cashcraft_backend" # Define the main canister

# --- Main Logic ---
info "Starting environment synchronization process..."

# 1. Verify dfx.json and canister_ids.json exist
if [ ! -f "$DFX_JSON_FILE" ]; then
  error "dfx.json not found at '$DFX_JSON_FILE'. Are you in the project root?"
fi
if [ ! -f "$CANISTER_IDS_FILE" ]; then
  error "Canister ID file not found at '$CANISTER_IDS_FILE'. Please run 'dfx deploy --network $NETWORK' first."
fi
info "Found all necessary configuration files."

# 2. Ensure .env.local file exists
touch "$ENV_FILE"

# --- Function to check and add/update a variable in .env.local ---
# $1: Key (e.g., NEXT_PUBLIC_DFX_NETWORK)
# $2: Value (e.g., local)
check_and_set_env() {
  local key=$1
  local value=$2
  info "Checking for ${key}..."
  if grep -q "^${key}=" "$ENV_FILE"; then
    # Key exists, check if value is correct
    local existing_value=$(grep "^${key}=" "$ENV_FILE" | cut -d'=' -f2)
    if [ "$existing_value" != "$value" ]; then
      warn "Updating ${key} from '${existing_value}' to '${value}'."
      # Use sed to replace the line in-place
      sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE" && rm "${ENV_FILE}.bak"
    else
      log "${key} is already set correctly."
    fi
  else
    # Key does not exist, add it
    log "Setting ${key}=${value}."
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

# 3. Set DFX_NETWORK
check_and_set_env "NEXT_PUBLIC_DFX_NETWORK" "$NETWORK"

# 4. Read canister names from dfx.json and process them
info "Reading canister configurations from dfx.json..."
CANISTER_NAMES=$(jq -r '.canisters | keys[]' "$DFX_JSON_FILE")

if [ -z "$CANISTER_NAMES" ]; then
    error "No canisters found in '$DFX_JSON_FILE'. Please check your dfx configuration."
fi

for canister_name in $CANISTER_NAMES; do
  canister_id=$(jq -r --arg canister_name "$canister_name" '.[$canister_name]."'$NETWORK'"' "$CANISTER_IDS_FILE")

  if [ "$canister_id" == "null" ] || [ -z "$canister_id" ]; then
    warn "Could not find ID for canister '$canister_name' in '$CANISTER_IDS_FILE'. Skipping."
    continue
  fi

  # Set the specific canister ID variable
  env_var_name="NEXT_PUBLIC_CANISTER_ID_$(echo "$canister_name" | tr '[:lower:]' '[:upper:]')"
  check_and_set_env "$env_var_name" "$canister_id"

  # If this is the primary canister, also set the generic canister ID
  if [ "$canister_name" == "$PRIMARY_CANISTER" ]; then
    check_and_set_env "NEXT_PUBLIC_CANISTER_ID" "$canister_id"
  fi
done

info "Healing process complete. The frontend environment is synchronized."