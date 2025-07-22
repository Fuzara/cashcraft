import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Wallet { 'id' : bigint, 'balance' : bigint, 'name' : string }
export interface _SERVICE {
  'createWallet' : ActorMethod<[string], undefined>,
  'getWallets' : ActorMethod<[], Array<Wallet>>,
  'updateBalance' : ActorMethod<[bigint, bigint], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
