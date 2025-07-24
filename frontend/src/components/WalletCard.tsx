import { Wallet } from '../app/dashboard/page';
import { Principal } from '@dfinity/principal';
import { formatCurrencyPair } from '../utils/mockWallets';

type WalletCardProps = {
  wallet: Wallet;
  onClick: () => void;
  onDelete: () => void;
};

export default function WalletCard({ wallet, onClick, onDelete }: WalletCardProps) {
  const ownerText = wallet.owner instanceof Principal
    ? wallet.owner.toText()
    : (typeof wallet.owner === 'string' ? wallet.owner : "Unknown");

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">{wallet.name}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              onDelete();
            }}
            className="text-gray-400 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
        <p
          className="text-2xl font-mono text-indigo-600 my-4 cursor-pointer"
          onClick={onClick}
        >
          {formatCurrencyPair(wallet.balance)}
        </p>
      </div>
      <div className="text-sm text-gray-500 mt-4">
        <p>Owner: <span className="font-mono break-all">{ownerText}</span></p>
        <p>{wallet.subWallets.length} Sub-wallets</p>
      </div>
    </div>
  );
}