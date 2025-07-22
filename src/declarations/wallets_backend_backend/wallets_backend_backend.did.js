export const idlFactory = ({ IDL }) => {
  const Wallet = IDL.Record({
    'id' : IDL.Nat,
    'balance' : IDL.Nat,
    'name' : IDL.Text,
  });
  return IDL.Service({
    'createWallet' : IDL.Func([IDL.Text], [], []),
    'getWallets' : IDL.Func([], [IDL.Vec(Wallet)], []),
    'updateBalance' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
