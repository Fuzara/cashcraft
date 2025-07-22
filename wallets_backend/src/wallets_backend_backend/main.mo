import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";

actor {
  type Wallet = { id: Nat; name: Text; balance: Nat };

  stable var walletEntries : [(Principal, [Wallet])] = [];

  // Runtime structure
  var wallets = TrieMap.TrieMap<Principal, [Wallet]>(Principal.equal, Principal.hash);

  // Load stable data into TrieMap on upgrade
  system func postupgrade() {
    Debug.print("Restoring wallets...");
    for ((p, ws) in walletEntries.vals()) {
      wallets.put(p, ws);
    };
  };

  // Save TrieMap into stable format before upgrade
  system func preupgrade() {
    Debug.print("Backing up wallets...");
    walletEntries := wallets.entries();
  };

  public shared (msg) func create_wallet(name: Text, initialBalance: Nat) : async Wallet {
    let user = msg.caller;
    let newId = switch (wallets.get(user)) {
      case (?list) list.size();
      case (null) 0;
    };
    let wallet: Wallet = { id = newId; name = name; balance = initialBalance };
    let updated = switch (wallets.get(user)) {
      case (?list) list # [wallet];
      case (null) [wallet];
    };
    wallets.put(user, updated);
    return wallet;
  };

  public query func get_wallets(user: Principal) : async [Wallet] {
    switch (wallets.get(user)) {
      case (?list) list;
      case (null) [];
    }
  };

  public shared (msg) func update_balance(walletId: Nat, newBalance: Nat) : async Bool {
    let user = msg.caller;
    switch (wallets.get(user)) {
      case (?list) {
        let buffer = Buffer.fromArray<Wallet>(list);
        if (walletId < buffer.size()) {
          let w = buffer.get(walletId);
          buffer.put(walletId, { id = w.id; name = w.name; balance = newBalance });
          wallets.put(user, Buffer.toArray(buffer));
          return true;
        };
        return false;
      };
      case (null) return false;
    };
  };

  public shared (msg) func delete_wallet(walletId: Nat) : async Bool {
    let user = msg.caller;
    switch (wallets.get(user)) {
      case (?list) {
        let filtered = Array.filter<Wallet>(list, func(w) { w.id != walletId });
        wallets.put(user, filtered);
        return true;
      };
      case (null) return false;
    };
  };
}
