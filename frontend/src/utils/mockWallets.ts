import { Wallet, SubWallet, Transaction, TransactionType } from "../app/dashboard/page";
import { Principal } from "@dfinity/principal";

// --- Constants ---
const ICP_TO_USD_RATE = 7.5;
const MOCK_DATA_KEY = "cashCraftMockData";

// --- Data Schema ---
type MockData = {
  wallets: Wallet[];
  transactions: Transaction[];
  reserveBalance: bigint;
};

// --- Deep Clone Helper ---
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => 
      typeof value === 'bigint' ? { type: 'bigint', value: value.toString() } : value
    ),
    (key, value) => {
      if (typeof value === 'object' && value !== null && value.type === 'bigint') {
        return BigInt(value.value);
      }
      return value;
    }
  );
};

// --- Session Storage Abstraction ---
const isSessionStorageAvailable = (): boolean => {
  try {
    sessionStorage.setItem('__test__', '__test__');
    sessionStorage.removeItem('__test__');
    return true;
  } catch (e) {
    return false;
  }
};

let inMemoryStore: Record<string, string> = {};

const storage = {
  getItem: (key: string): string | null => 
    isSessionStorageAvailable() ? sessionStorage.getItem(key) : inMemoryStore[key] || null,
  setItem: (key: string, value: string): void => {
    if (isSessionStorageAvailable()) {
      sessionStorage.setItem(key, value);
    } else {
      inMemoryStore[key] = value;
    }
  },
};

// --- Initial Mock Data ---
const getInitialMockData = (): MockData => {
  const mockPrincipal = Principal.fromText("2vxsx-fae");

  const salarySubWallets: Omit<SubWallet, "balance">[] = [
    { id: 101n, name: "Housing", percentage: 35 },
    { id: 102n, name: "Groceries", percentage: 25 },
    { id: 103n, name: "Transport", percentage: 15 },
    { id: 104n, name: "Utilities", percentage: 25 },
  ];

  const allowanceSubWallets: Omit<SubWallet, "balance">[] = [
    { id: 201n, name: "Savings", percentage: 30 },
    { id: 202n, name: "Shopping", percentage: 30 },
    { id: 203n, name: "Other", percentage: 40 },
  ];

  const wallets: Wallet[] = [
    {
      id: 1n,
      owner: mockPrincipal,
      name: "Salary",
      balance: 120000000000n, // Approx $1200
      subWallets: salarySubWallets.map(sw => ({...sw, balance: 0n})),
      transactions: [
        { id: "tx1", description: "Paycheck", amount: 1200, category: "Income", date: "2023-10-26T10:00:00Z", type: "income" },
        { id: "tx2", description: "Rent", amount: 600, category: "Bills", date: "2023-10-27T11:00:00Z", type: "expense" },
      ],
    },
    {
      id: 2n,
      owner: mockPrincipal,
      name: "Monthly Allowance",
      balance: 50000000000n, // Approx $500
      subWallets: allowanceSubWallets.map(sw => ({...sw, balance: 0n})),
      transactions: [
        { id: "tx3", description: "Weekly Top-up", amount: 125, category: "Income", date: "2023-10-26T09:00:00Z", type: "income" },
      ],
    },
  ];

  // Calculate initial sub-wallet balances
  wallets.forEach(calculateSubWalletAmounts);

  return {
    wallets,
    transactions: wallets.flatMap(w => w.transactions),
    reserveBalance: 0n,
  };
};

// --- Mock Data Management ---
export const getMockData = (): MockData => {
  const storedData = storage.getItem(MOCK_DATA_KEY);
  if (storedData) {
    const data = JSON.parse(storedData, (key, value) => {
        if (typeof value === 'object' && value !== null && value.type === 'bigint') {
            return BigInt(value.value);
        }
        return value;
    });
    // Data migration for robustness
    const initialData = getInitialMockData();
    data.wallets = data.wallets.map((w: Wallet) => {
      const initialWallet = initialData.wallets.find(iw => iw.id === w.id);
      return {
        ...w,
        transactions: w.transactions || [],
        subWallets: (w.subWallets && w.subWallets.length > 0) ? w.subWallets : (initialWallet?.subWallets || [])
      };
    });
    data.transactions = data.transactions || [];
    data.reserveBalance = data.reserveBalance || 0n;
    
    // Recalculate subwallet balances after migration
    data.wallets.forEach(calculateSubWalletAmounts);
    
    return data;
  }
  const initialData = getInitialMockData();
  saveMockData(initialData);
  return initialData;
};

export const saveMockData = (data: MockData): void => {
  storage.setItem(MOCK_DATA_KEY, JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? { type: 'bigint', value: value.toString() } : value
  ));
};

export const resetMockData = (): void => {
    const initialData = getInitialMockData();
    saveMockData(initialData);
};

// --- Transaction Helpers ---
export const addTransaction = (walletId: bigint, transaction: Omit<Transaction, 'id' | 'date'>): void => {
    const data = getMockData();
    const walletIndex = data.wallets.findIndex(w => w.id === walletId);
    if (walletIndex > -1) {
        const wallet = data.wallets[walletIndex];
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
            date: new Date().toISOString(),
        };
        data.transactions.push(newTransaction);
        wallet.transactions.push(newTransaction);
        
        const amountE8s = BigInt(Math.round(newTransaction.amount / ICP_TO_USD_RATE * 1_00000000));
        if (newTransaction.type === 'expense') {
            wallet.balance -= amountE8s;
        } else {
            wallet.balance += amountE8s;
        }
        
        // Recalculate sub-wallet balances and update the wallet in the array
        data.wallets[walletIndex] = calculateSubWalletAmounts(wallet);
        
        saveMockData(data);
    }
};

export const updateTransaction = (updatedTransaction: Transaction): void => {
    const data = getMockData();
    const txIndex = data.transactions.findIndex(t => t.id === updatedTransaction.id);
    if (txIndex > -1) {
        data.transactions[txIndex] = updatedTransaction;
        data.wallets.forEach(w => {
            const walletTxIndex = w.transactions.findIndex(t => t.id === updatedTransaction.id);
            if (walletTxIndex > -1) {
                w.transactions[walletTxIndex] = updatedTransaction;
            }
        });
        saveMockData(data);
    }
};

export const deleteTransaction = (transactionId: string): void => {
    const data = getMockData();
    data.transactions = data.transactions.filter(t => t.id !== transactionId);
    data.wallets.forEach(w => {
        w.transactions = w.transactions.filter(t => t.id !== transactionId);
    });
    saveMockData(data);
};

// --- Utility Functions ---
export const calculateSubWalletAmounts = (wallet: Wallet): Wallet => {
    const updatedSubWallets = wallet.subWallets.map(sw => ({
        ...sw,
        balance: (wallet.balance * BigInt(sw.percentage)) / 100n,
    }));
    return { ...wallet, subWallets: updatedSubWallets };
};

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