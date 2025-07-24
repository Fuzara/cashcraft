import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface SubWallet {
  'save' : bigint,
  'spend' : bigint,
  'invest' : bigint,
}
export interface Wallet { 'id' : bigint, 'balance' : bigint, 'name' : string }
export interface _SERVICE {
  'create_wallet' : ActorMethod<[string, bigint], Wallet>,
  'delete_wallet' : ActorMethod<[bigint], boolean>,
  'deposit' : ActorMethod<[bigint], undefined>,
  'get_sub_wallet' : ActorMethod<[Principal], [] | [SubWallet]>,
  'get_wallets' : ActorMethod<[Principal], Array<Wallet>>,
  'update_balance' : ActorMethod<[bigint, bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
