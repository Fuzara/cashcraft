import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Hash "mo:base/Hash";

actor {
    public type Wallet = {
        id: Nat;
        name: Text;
        owner: Principal;
        balance: Nat;
    };

    var wallets = HashMap.HashMap<Nat, Wallet>(10, Nat.equal, Hash.hash);
    var userWallets = HashMap.HashMap<Principal, [Nat]>(10, Principal.equal, Principal.hash);
    var nextWalletId: Nat = 0;

    public shared({ caller }) func create_wallet(name: Text): async Nat {
        let id = nextWalletId;
        nextWalletId += 1;

        let wallet: Wallet = { id; name; owner = caller; balance = 1000 };
        wallets.put(id, wallet);

        let existing = switch (userWallets.get(caller)) {
            case (?arr) arr;
            case null [];
        };
        userWallets.put(caller, Array.append(existing, [id]));

        return id;
    };

    public shared({ caller }) func get_wallets(): async [Wallet] {
        switch (userWallets.get(caller)) {
            case (?ids) {
                return Array.map<Nat, Wallet>(ids, func(id) {
                    switch (wallets.get(id)) {
                        case (?wallet) wallet;
                        case null {
                            let unknown_wallet : Wallet = { id = id; name = "Unknown"; owner = caller; balance = 0 };
                            unknown_wallet
                        };
                    }
                });
            };
            case null [];
        }
    };

    public query func getBalance(walletId: Nat): async Nat {
        switch (wallets.get(walletId)) {
            case (?wallet) wallet.balance;
            case null 0;
        }
    };
};


