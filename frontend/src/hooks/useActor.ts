import { useState, useEffect, useCallback } from "react";
import { ActorSubclass, Identity, Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { createActor, CanisterName, ServiceMap } from "../lib/createActor";
import { Principal } from "@dfinity/principal";
import { getMockData, saveMockData } from "../utils/mockWallets";
import { Wallet } from "../app/dashboard/page";

// --- Mock Actor for Local Development ---

const createMockActor = <T extends CanisterName>(canisterName: T): ActorSubclass<ServiceMap[T]> => {
  console.warn(
    `⚠️ Using MOCK actor for canister: '${canisterName}'. NO real backend calls will be made.`
  );

  const mockActor = {
    get_wallets: async () => {
      console.log("[Mock] get_wallets() called");
      return getMockData().wallets;
    },
    create_wallet: async (name: string, balance: bigint) => {
      console.log(`[Mock] create_wallet(${name}) called`);
      const data = getMockData();
      const newWallet: Wallet = {
        id: BigInt(Date.now()),
        name,
        balance: balance || 0n,
        owner: Principal.fromText("2vxsx-fae"), // A mock principal
        subWallets: [],
        transactions: [],
      };
      data.wallets.push(newWallet);
      saveMockData(data);
      return newWallet;
    },
    // Add other methods from your service definitions as needed
  };

  return mockActor as unknown as ActorSubclass<ServiceMap[T]>;
};


export function useActor<T extends CanisterName>(canisterName: T) {
  const [actor, setActor] = useState<ActorSubclass<ServiceMap[T]>>();
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isMock, setIsMock] = useState(false);

  // Initialize AuthClient
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        const authenticated = await client.isAuthenticated();
        setIsAuthenticated(authenticated);
        setIdentity(client.getIdentity());
      } catch (error) {
        console.error("Failed to initialize AuthClient:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // Create the actor when identity is available
  useEffect(() => {
    if (isInitializing || !identity || !canisterName) return;

    try {
      // This will throw an error if the canister ID is missing, which is caught below.
      const newActor = createActor(canisterName, identity);
      setActor(newActor);
    } catch (error) {
      console.error(`Failed to create actor for canister '${canisterName}':`, error);
      // If actor creation fails in local dev, consider using a mock
      if (process.env.NEXT_PUBLIC_DFX_NETWORK !== "ic") {
        console.warn("Falling back to mock actor due to creation failure.");
        setActor(createMockActor(canisterName));
        setIsMock(true);
      }
    }
  }, [isInitializing, identity, canisterName]);

  const login = async () => {
    if (!authClient) return;
    
    const loginTimeout = setTimeout(() => {
      if (process.env.NEXT_PUBLIC_DFX_NETWORK !== 'ic' && !isAuthenticated) {
        console.warn("Login timed out. Falling back to mock mode for UI testing.");
        setActor(createMockActor(canisterName));
        setIsAuthenticated(true); // Pretend to be authenticated for UI flow
        setIsMock(true);
      }
    }, 5000); // 5-second timeout

    try {
      await authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          clearTimeout(loginTimeout);
          setIsAuthenticated(true);
          setIdentity(authClient.getIdentity());
          window.location.reload();
        },
        onError: (err) => {
            clearTimeout(loginTimeout);
            console.error("Login failed:", err);
        }
      });
    } catch (error) {
        clearTimeout(loginTimeout);
        console.error("Exception during login:", error);
    }
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setActor(undefined);
    setIsMock(false);
    window.location.reload();
  };

  return {
    actor,
    login,
    logout,
    isAuthenticated,
    isInitializing,
    identity,
    isMock,
  };
}
