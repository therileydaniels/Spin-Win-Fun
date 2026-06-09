import { useCallback, useMemo } from "react";
import { useAuth, useUser } from "@clerk/react";
import type { LocalWheel } from "@/lib/localWheelStorage";
import * as local from "@/lib/localWheelStorage";
import * as cloud from "@/lib/cloudWheelStorage";

type WheelInput = { name: string; segments: LocalWheel["segments"] };
type Result<T> = { success: boolean; wheel?: T; error?: string };

export interface WheelStorage {
  isCloud: boolean;
  list: () => Promise<LocalWheel[]>;
  save: (wheel: WheelInput) => Promise<Result<LocalWheel>>;
  update: (id: string, data: Partial<WheelInput>) => Promise<Result<LocalWheel>>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  duplicate: (id: string) => Promise<Result<LocalWheel>>;
}

export function useWheelStorage(): WheelStorage {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const list = useCallback(async (): Promise<LocalWheel[]> => {
    if (isSignedIn) return cloud.listCloudWheels(getToken);
    return local.getLocalWheels();
  }, [isSignedIn, getToken]);

  const save = useCallback(
    async (wheel: WheelInput) => {
      if (isSignedIn) return cloud.saveCloudWheel(getToken, wheel);
      return local.saveWheelToLocal(wheel);
    },
    [isSignedIn, getToken]
  );

  const update = useCallback(
    async (id: string, data: Partial<WheelInput>) => {
      if (isSignedIn) return cloud.updateCloudWheel(getToken, id, data);
      return local.updateLocalWheel(id, data);
    },
    [isSignedIn, getToken]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isSignedIn) return cloud.deleteCloudWheel(getToken, id);
      return local.deleteLocalWheel(id);
    },
    [isSignedIn, getToken]
  );

  const duplicate = useCallback(
    async (id: string) => {
      if (isSignedIn) return cloud.duplicateCloudWheel(getToken, id);
      return local.duplicateLocalWheel(id);
    },
    [isSignedIn, getToken]
  );

  return useMemo(
    () => ({ isCloud: Boolean(isSignedIn), list, save, update, remove, duplicate }),
    [isSignedIn, list, save, update, remove, duplicate]
  );
}
