import { Wallet, SubWallet } from "../app/dashboard/page";
import { Principal } from "@dfinity/principal";

// --- Deep Clone Helper ---
export const deepClone = <T>(obj: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  // Fallback for environments without structuredClone, handling BigInt
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ),
    (_, value) => {
      // Reviver to convert string back to BigInt
      if (typeof value === "string" && /^\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
      }
      return value;
    }
  );
};

// --- Session Storage Abstraction ---
const MOCK_WALLET_STORAGE_KEY = "mockWallets";

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

  return [
    {
      id: 1n,
      owner: mockPrincipal,
      name: "Salary",
      balance: 200000n, // Representing $2000.00
      subWallets: calculateSubWalletAmounts(200000n, salarySubWallets),
    },
    {
      id: 2n,
      owner: mockPrincipal,
      name: "Monthly Allowance",
      balance: 100000n, // Representing $1000.00
      subWallets: calculateSubWalletAmounts(100000n, allowanceSubWallets),
    },
  ];
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

// --- Utility Functions ---

export function calculateSubWalletAmounts(
  totalBalance: bigint,
  subWallets: Omit<SubWallet, "balance">[]
): SubWallet[] {
  return subWallets.map((sw) => ({
    ...sw,
    balance: (totalBalance * BigInt(sw.percentage)) / 100n,
  }));
}

export const formatAmount = (amount: bigint, decimals: number = 2): string => {
    const amountString = amount.toString();
    const integerPart = amountString.slice(0, -decimals) || "0";
    const fractionalPart = amountString.slice(-decimals).padStart(decimals, "0");
    return `$${Number(integerPart).toLocaleString()}.${fractionalPart}`;
}