import { useAuth } from "@/contexts/AuthProvider";
import { createActor, CanisterName } from "@/lib/createActor";
import { AuthClient } from "@dfinity/auth-client";

export const useActor = <T extends CanisterName>(canisterName: T) => {
  const { authClient } = useAuth();
  const identity = (authClient as AuthClient)?.getIdentity();
  return createActor(canisterName, identity);
};
