import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";

// Import IDL factories from declarations
// The '@declarations' alias is configured in tsconfig.json and next.config.ts
import { idlFactory as cashcraftIdlFactory } from "@declarations/cashcraft_backend";
import { idlFactory as walletsIdlFactory } from "@declarations/wallets_backend";

// Import service types from the .did files
import type { _SERVICE as CashcraftService } from "@declarations/cashcraft_backend/cashcraft_backend.did";
import type { _SERVICE as WalletsService } from "@declarations/wallets_backend/wallets_backend.did";

// A map of canister names to their IDL factories
const idlFactories = {
  cashcraft_backend: cashcraftIdlFactory,
  wallets_backend: walletsIdlFactory,
};

// A map of canister names to their service types
export interface ServiceMap {
  cashcraft_backend: CashcraftService;
  wallets_backend: WalletsService;
}

// A type for the names of canisters available
export type CanisterName = keyof typeof idlFactories;

/**
 * Gets the canister ID for a given canister name from environment variables.
 * The environment variables are expected to be prefixed with NEXT_PUBLIC_
 * and follow the format: NEXT_PUBLIC_CANISTER_ID_{CANISTER_NAME_IN_UPPERCASE}
 * @param canisterName The name of the canister.
 * @returns The canister ID.
 * @throws If the environment variable for the canister ID is not set.
 */
const getCanisterId = (canisterName: CanisterName): string => {
  const envKey = `NEXT_PUBLIC_CANISTER_ID_${canisterName.toUpperCase()}`;
  const canisterId = process.env[envKey];

  if (!canisterId) {
    throw new Error(
      `Environment variable ${envKey} is not set. Make sure to define it in your .env.local file.`
    );
  }

  return canisterId;
};

/**
 * Creates a type-safe actor for a specified canister.
 * This function is designed to work on the client-side.
 * @param canisterName The name of the canister to create an actor for.
 * @param identity The user's identity. Optional, for authenticated calls.
 * @returns A type-safe actor instance.
 */
export const createActor = <T extends CanisterName>(
  canisterName: T,
  identity?: Identity
): ActorSubclass<ServiceMap[T]> => {
  const host =
    process.env.DFX_NETWORK === "ic"
      ? "https://icp0.io"
      : "http://127.0.0.1:4943";

  const agent = new HttpAgent({
    identity,
    host,
  });

  // For local development, we need to fetch the root key
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running."
      );
      console.error(err);
    });
  }

  const canisterId = getCanisterId(canisterName);
  const idlFactory = idlFactories[canisterName];

  // Create and return the actor
  const actor = Actor.createActor<ServiceMap[T]>(idlFactory, {
    agent,
    canisterId,
  });

  return actor;
};
