#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions for Logging ---
log_step() {
  echo "🚀  $1"
}

log_success() {
  echo "✅  $1"
}

log_error() {
  echo "❌  $1" >&2
  exit 1
}

# --- Main Deployment Logic ---

# 1. Run a Clean Local Build
log_step "Running clean local build..."
rm -rf .next node_modules/.cache
if npm install && npm run build; then
  log_success "Next.js production build completed successfully."
else
  log_error "Next.js build failed."
fi

# 2. Deploy Motoko Canisters to ICP Mainnet
log_step "Deploying Motoko canisters to ICP mainnet..."

# Check for DFX_IDENTITY secret
if [ -z "$DFX_IDENTITY" ]; then
  log_error "DFX_IDENTITY secret is not set."
fi

# Create identity file from secret
echo "$DFX_IDENTITY" > identity.pem

# Import identity
if dfx identity import cicd-identity identity.pem --storage-mode=plaintext; then
  log_success "DFX identity 'cicd-identity' imported."
else
  log_error "Failed to import DFX identity."
fi

# Deploy canisters
if dfx deploy --network ic --yes; then
  log_success "Canisters deployed successfully to the IC mainnet."
else
  log_error "Canister deployment failed."
fi

# Generate canister declarations
if dfx generate --network ic; then
  log_success "Canister declarations regenerated."
else
  log_error "Failed to regenerate canister declarations."
fi

# 3. Sync Canister IDs to Frontend
log_step "Syncing canister IDs to frontend..."
CANISTER_IDS_FILE=".dfx/ic/canister_ids.json"

if [ ! -f "$CANISTER_IDS_FILE" ]; then
  log_error "Canister IDs file not found at $CANISTER_IDS_FILE"
fi

# Parse canister IDs
WALLETS_BACKEND_ID=$(jq -r '.wallets_backend_backend.ic' "$CANISTER_IDS_FILE")
CASHCRAFT_BACKEND_ID=$(jq -r '.cashcraft_backend.ic' "$CANISTER_IDS_FILE")

if [ -z "$WALLETS_BACKEND_ID" ] || [ -z "$CASHCRAFT_BACKEND_ID" ]; then
  log_error "Failed to parse one or more canister IDs from $CANISTER_IDS_FILE"
fi

# Create .env.production file
ENV_FILE=".env.production"
echo "NEXT_PUBLIC_WALLETS_BACKEND_CANISTER_ID=$WALLETS_BACKEND_ID" > "$ENV_FILE"
echo "NEXT_PUBLIC_CASHCRAFT_BACKEND_CANISTER_ID=$CASHCRAFT_BACKEND_ID" >> "$ENV_FILE"
log_success "Updated $ENV_FILE with new canister IDs."

# 4. Trigger Vercel Production Deployment
log_step "Triggering Vercel production deployment..."

# Check for VERCEL_TOKEN secret
if [ -z "$VERCEL_TOKEN" ]; then
  log_error "VERCEL_TOKEN secret is not set."
fi

# Check for VERCEL_PROJECT_ID
if [ -z "$VERCEL_PROJECT_ID" ]; then
    log_error "VERCEL_PROJECT_ID is not set."
fi

# Trigger Vercel deploy hook
DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/$VERCEL_PROJECT_ID"
if curl -X POST "$DEPLOY_HOOK_URL" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json"; then
  log_success "Vercel deployment triggered successfully."
else
  log_error "Failed to trigger Vercel deployment."
fi

# --- Cleanup ---
rm identity.pem
log_step "Deployment pipeline completed successfully!"