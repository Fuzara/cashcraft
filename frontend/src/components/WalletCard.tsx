import { Wallet } from '../app/dashboard/page';
import { Principal } from '@dfinity/principal';
import { formatCurrencyPair } from '../utils/mockWallets';

type WalletCardProps = {
  wallet: Wallet;
  onClick: () => void;
  onDelete: () => void;
};

export default function WalletCard({
  wallet,
  onClick,
  onDelete,
  isActive,
}: WalletCardProps & { isActive?: boolean }) {
  const ownerText =
    wallet.owner instanceof Principal
      ? wallet.owner.toText()
      : typeof wallet.owner === "string"
      ? wallet.owner
      : "Unknown";

  const cardClasses = `
    p-safe rounded-2xl shadow-lg flex flex-col justify-between transition-all duration-300
    ${
      isActive
        ? "bg-gradient-to-br from-primary to-blue-400 text-white"
        : "bg-white"
    }
  `;

  return (
    <div className={cardClasses}>
      <div>
        <div className="flex justify-between items-start">
          <h3
            className={`text-xl font-bold ${
              isActive ? "text-white" : "text-gray-800"
            }`}
          >
            {wallet.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={
              isActive
                ? "text-white hover:text-red-300"
                : "text-gray-400 hover:text-error"
            }
            aria-label={`Delete ${wallet.name} wallet`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        <div
          className={`text-2xl font-mono my-4 cursor-pointer ${
            isActive ? "text-white" : "text-indigo-600"
          }`}
          onClick={onClick}
        >
          {formatCurrencyPair(wallet.balance)}
        </div>
      </div>
      <div
        className={`text-sm mt-4 ${
          isActive ? "text-blue-200" : "text-gray-500"
        }`}
      >
        <p>
          Owner: <span className="font-mono break-all">{ownerText}</span>
        </p>
        <p>{wallet.subWallets.length} Sub-wallets</p>
      </div>
    </div>
  );
}