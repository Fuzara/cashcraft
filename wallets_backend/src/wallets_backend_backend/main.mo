import TrieMap "mo:base/TrieMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor {

  // ✅ Types
  public type Wallet = { id: Nat; name: Text; balance: Nat };
  public type SubWallet = { save: Nat; spend: Nat; invest: Nat };

  // ✅ Stable Storage
  stable var walletEntries : [(Principal, [Wallet])] = [];
  stable var subWalletEntries: [(Principal, SubWallet)] = [];

  var wallets = TrieMap.TrieMap<Principal, [Wallet]>(Principal.equal, Principal.hash);
  var subWallets = TrieMap.TrieMap<Principal, SubWallet>(Principal.equal, Principal.hash);

  // ✅ Upgrade Hooks
  system func preupgrade() {
    walletEntries := Iter.toArray(wallets.entries());
    subWalletEntries := Iter.toArray(subWallets.entries());
  };

  system func postupgrade() {
    wallets := TrieMap.fromEntries(Iter.fromArray(walletEntries), Principal.equal, Principal.hash);
    subWallets := TrieMap.fromEntries(Iter.fromArray(subWalletEntries), Principal.equal, Principal.hash);
  };

  // ✅ Auto-Split Deposit
  public shared(msg) func deposit(amount: Nat) : async () {
    assert(amount > 0);
    let caller = msg.caller;

    let saveAmount = amount * 4 / 10;
    let spendAmount = amount * 4 / 10;
    let investAmount = amount - saveAmount - spendAmount;

    let current : SubWallet = switch (subWallets.get(caller)) {
      case (?existing) existing;
      case null ({ save = 0; spend = 0; invest = 0 });
    };

    let updated : SubWallet = {
      save = current.save + saveAmount;
      spend = current.spend + spendAmount;
      invest = current.invest + investAmount;
    };

    subWallets.put(caller, updated);
  };

  // ✅ Query Functions
  public query func get_sub_wallet(user: Principal) : async ?SubWallet {
    return subWallets.get(user);
  };

  // ✅ Wallet CRUD
  public shared(msg) func create_wallet(name: Text, initialBalance: Nat) : async Wallet {
    let user = msg.caller;
    let newId = switch (wallets.get(user)) {
      case (?list) list.size();
      case null 0;
    };
    let wallet : Wallet = { id = newId; name = name; balance = initialBalance };
    let updated = switch (wallets.get(user)) {
      case (?list) Array.append(list, [wallet]);
      case null [wallet];
    };
    wallets.put(user, updated);
    return wallet;
  };

  public query func get_wallets(user: Principal) : async [Wallet] {
    switch (wallets.get(user)) {
      case (?list) list;
      case null [];
    };
  };

  public shared(msg) func update_balance(walletId: Nat, newBalance: Nat) : async Bool {
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
      case null false;
    };
  };

  public shared(msg) func delete_wallet(walletId: Nat) : async Bool {
    let user = msg.caller;
    switch (wallets.get(user)) {
      case (?list) {
        let filtered = Array.filter<Wallet>(list, func(w) { w.id != walletId });
        wallets.put(user, filtered);
        return true;
      };
      case null false;
    };
  };
};
