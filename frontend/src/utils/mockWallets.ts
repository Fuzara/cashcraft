import { Wallet, SubWallet } from "../app/dashboard/page";
import { Principal } from "@dfinity/principal";

// --- Constants ---
const ICP_TO_USD_RATE = 7.5;
const MOCK_WALLET_STORAGE_KEY = "mockWallets";
const RESERVE_BALANCE_KEY = "reserveBalance";

// --- Deep Clone Helper ---
export const deepClone = <T>(obj: T): T => {
  // Use a robust JSON-based deep clone with BigInt support as a fallback
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "bigint") {
        return { type: "bigint", value: value.toString() };
      }
      return value;
    }),
    (key, value) => {
      if (typeof value === "object" && value !== null && value.type === "bigint") {
        return BigInt(value.value);
      }
      return value;
    }
  );
};

// --- Session Storage Abstraction ---

const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = "__test__";
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

let inMemoryStore: Record<string, string> = {};

const storage = {
  getItem: (key: string): string | null => {
    if (isSessionStorageAvailable()) {
      return sessionStorage.getItem(key);
    }
    return inMemoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (isSessionStorageAvailable()) {
      sessionStorage.setItem(key, value);
    } else {
      inMemoryStore[key] = value;
    }
  },
};

// --- Initial Mock Data ---
const getInitialMockWallets = (): Wallet[] => {
  const mockPrincipal = Principal.fromText("2vxsx-fae"); // A consistent mock principal

  const salarySubWallets: Omit<SubWallet, "balance">[] = [
    { id: 101n, name: "Bills", percentage: 40 },
    { id: 102n, name: "Savings", percentage: 20 },
    { id: 103n, name: "Entertainment", percentage: 10 },
    { id: 104n, name: "Subscriptions", percentage: 30 },
  ];

  const allowanceSubWallets: Omit<SubWallet, "balance">[] = [
    { id: 201n, name: "Savings", percentage: 30 },
    { id: 202n, name: "Shopping", percentage: 30 },
    { id: 203n, name: "Other", percentage: 40 },
  ];

  const wallets: Omit<Wallet, "subWallets">[] = [
    {
      id: 1n,
      owner: mockPrincipal,
      name: "Salary",
      balance: 2000_00000000n,
    },
    {
      id: 2n,
      owner: mockPrincipal,
      name: "Allowance",
      balance: 1000_00000000n,
    },
  ];

  return wallets.map((wallet, index) => {
    const subWallets = index === 0 ? salarySubWallets : allowanceSubWallets;
    const fullWallet: Wallet = {
        ...wallet,
        subWallets: subWallets.map(sw => ({...sw, balance: 0n})) // temp balance
    };
    return calculateSubWalletAmounts(fullWallet);
  });
};

// --- Mock Data Management ---

export const getMockWallets = (): Wallet[] => {
  const storedData = storage.getItem(MOCK_WALLET_STORAGE_KEY);
  if (storedData) {
    // Deserialize with BigInt support
    return JSON.parse(storedData, (key, value) => {
      if (typeof value === "object" && value !== null && value.type === "bigint") {
        return BigInt(value.value);
      }
      return value;
    });
  }
  const initialData = getInitialMockWallets();
  saveMockWallets(initialData);
  return initialData;
};

export const saveMockWallets = (wallets: Wallet[]): void => {
  // Serialize with BigInt support
  const serializedData = JSON.stringify(wallets, (key, value) => {
    if (typeof value === "bigint") {
      return { type: "bigint", value: value.toString() };
    }
    return value;
  });
  storage.setItem(MOCK_WALLET_STORAGE_KEY, serializedData);
};

export const getReserveBalance = (): bigint => {
  const storedReserve = storage.getItem(RESERVE_BALANCE_KEY);
  return storedReserve ? BigInt(storedReserve) : 0n;
};

export const saveReserveBalance = (amount: bigint): void => {
  storage.setItem(RESERVE_BALANCE_KEY, amount.toString());
};

export const addToReserve = (amount: bigint): void => {
  const currentReserve = getReserveBalance();
  saveReserveBalance(currentReserve + amount);
};

export const moveFundsBetweenWallets = (sourceId: bigint, targetId: bigint, amount: bigint): void => {
    const wallets = getMockWallets();
    const sourceWallet = wallets.find(w => w.id === sourceId);
    const targetWallet = wallets.find(w => w.id === targetId);

    if (sourceWallet && targetWallet) {
        sourceWallet.balance -= amount;
        targetWallet.balance += amount;
        saveMockWallets(wallets);
    }
};

export const updateWalletName = (walletId: bigint, newName: string): void => {
    const wallets = getMockWallets();
    const walletToUpdate = wallets.find(w => w.id === walletId);
    if (walletToUpdate) {
        walletToUpdate.name = newName;
        saveMockWallets(wallets);
    }
};

export const clearMockWallets = (): void => {
  storage.setItem(MOCK_WALLET_STORAGE_KEY, "[]");
  storage.setItem(RESERVE_BALANCE_KEY, "0");
};

// --- Utility Functions ---

export function calculateSubWalletAmounts(wallet: Wallet): Wallet {
    const updatedSubWallets = wallet.subWallets.map(sw => ({
        ...sw,
        balance: (wallet.balance * BigInt(sw.percentage)) / 100n,
    }));
    return { ...wallet, subWallets: updatedSubWallets };
}

export const getMainWalletTotal = (wallets: Wallet[]): bigint => {
    return wallets.reduce((acc, wallet) => acc + wallet.balance, 0n);
};

export const formatCurrencyPair = (balanceE8s: bigint): string => {
  const icpAmount = Number(balanceE8s) / 1_00000000;
  const usdAmount = icpAmount * ICP_TO_USD_RATE;

  const formattedIcp = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(icpAmount);

  const formattedUsd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usdAmount);

  return `${formattedIcp} ICP (${formattedUsd})`;
};