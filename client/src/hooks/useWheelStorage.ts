import { useCallback, useMemo } from "react";
import type { LocalWheel } from "@/lib/localWheelStorage";
import * as local from "@/lib/localWheelStorage";

type WheelInput = { name: string; segments: LocalWheel["segments"] };
type Result<T> = { success: boolean; wheel?: T; error?: string };

export interface WheelStorage {
  list: () => Promise<LocalWheel[]>;
  save: (wheel: WheelInput) => Promise<Result<LocalWheel>>;
  update: (id: string, data: Partial<WheelInput>) => Promise<Result<LocalWheel>>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  duplicate: (id: string) => Promise<Result<LocalWheel>>;
}

export function useWheelStorage(): WheelStorage {
  const list = useCallback(async (): Promise<LocalWheel[]> => {
    return local.getLocalWheels();
  }, []);

  const save = useCallback(async (wheel: WheelInput) => {
    return local.saveWheelToLocal(wheel);
  }, []);

  const update = useCallback(async (id: string, data: Partial<WheelInput>) => {
    return local.updateLocalWheel(id, data);
  }, []);

  const remove = useCallback(async (id: string) => {
    return local.deleteLocalWheel(id);
  }, []);

  const duplicate = useCallback(async (id: string) => {
    return local.duplicateLocalWheel(id);
  }, []);

  return useMemo(
    () => ({ list, save, update, remove, duplicate }),
    [list, save, update, remove, duplicate]
  );
}
