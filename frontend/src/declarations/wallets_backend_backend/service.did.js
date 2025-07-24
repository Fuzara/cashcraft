export const idlFactory = ({ IDL }) => {
  const Wallet = IDL.Record({
    'id' : IDL.Nat,
    'balance' : IDL.Nat,
    'name' : IDL.Text,
  });
  const SubWallet = IDL.Record({
    'save' : IDL.Nat,
    'spend' : IDL.Nat,
    'invest' : IDL.Nat,
  });
  return IDL.Service({
    'create_wallet' : IDL.Func([IDL.Text, IDL.Nat], [Wallet], []),
    'delete_wallet' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'deposit' : IDL.Func([IDL.Nat], [], []),
    'get_sub_wallet' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(SubWallet)],
        ['query'],
      ),
    'get_wallets' : IDL.Func([IDL.Principal], [IDL.Vec(Wallet)], ['query']),
    'update_balance' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
