import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as WalletsService } from "../declarations/wallets_backend_backend/service.did";

type Wallet = {
  id: bigint;
  owner: Principal;
  name: string;
  balance: bigint;
};

type WalletCardProps = {
  wallet: Wallet;
  onClick: () => void;
};

export default function WalletCard({ wallet, onClick }: WalletCardProps) {
  return (
    <div
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-xl font-bold text-gray-800 truncate mb-2">{wallet.name}</h3>
      <p className="text-2xl font-mono text-blue-600 mb-4">
        {Number(wallet.balance).toLocaleString()} ICP
      </p>
      <p className="text-xs text-gray-400 break-all">
        Owner: {wallet.owner.toText()}
      </p>
    </div>
  );
}