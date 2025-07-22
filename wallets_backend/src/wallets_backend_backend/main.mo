import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor {
  public type Wallet = {
    id: Nat;
    name: Text;
    balance: Nat;
  };

  // Stable variable for upgrade persistence
  stable var walletBackup: [(Principal, [Wallet])] = [];

  // In-memory HashMap for runtime operations
  var wallets: HashMap.HashMap<Principal, [Wallet]> = HashMap.fromIter(Iter.fromArray(walletBackup), 10, Principal.equal, Principal.hash);

  // Backup data before an upgrade
  system func preupgrade() {
    walletBackup := Iter.toArray(wallets.entries());
  };

  // Restore data after an upgrade
  system func postupgrade() {
    wallets := HashMap.fromIter(Iter.fromArray(walletBackup), walletBackup.size(), Principal.equal, Principal.hash);
  };

  public shared (msg) func getWallets() : async [Wallet] {
    let user = msg.caller;
    switch (wallets.get(user)) {
      case (null) { return []; };
      case (?userWallets) { return userWallets; };
    };
  };

  public shared (msg) func createWallet(name: Text) : async () {
    let user = msg.caller;
    let newWallet: Wallet = {
      id = 0; // Simplified ID generation
      name = name;
      balance = 0;
    };

    switch (wallets.get(user)) {
      case (null) {
        wallets.put(user, [newWallet]);
      };
      case (?userWallets) {
        wallets.put(user, Array.append(userWallets, [newWallet]));
      };
    };
  };

  public shared (msg) func updateBalance(walletId: Nat, newBalance: Nat) : async () {
    let user = msg.caller;
    switch (wallets.get(user)) {
      case (null) { };
      case (?userWallets) {
        let updatedWallets = Array.map(userWallets, func(wallet: Wallet) : Wallet {
          if (wallet.id == walletId) {
            return { id = wallet.id; name = wallet.name; balance = newBalance };
          } else {
            return wallet;
          };
        });
        wallets.put(user, updatedWallets);
      };
    };
  };
};
