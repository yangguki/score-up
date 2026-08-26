import type { AppData } from "@score-up/domain";
import type { StateStorage } from "zustand/middleware";
import { createInnerStorage } from "./persist-storage";

export const APP_PERSIST_NAME = "score-up-app";
export const APP_PERSIST_VERSION = 2;

const WRITE_DEBOUNCE_MS = 500;

export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  if (
    !Array.isArray(data.competitions) ||
    !Array.isArray(data.teams) ||
    !Array.isArray(data.players) ||
    !Array.isArray(data.matches) ||
    !Array.isArray(data.brackets)
  ) {
    return false;
  }
  return data.matches.every((match) => {
    if (!match || typeof match !== "object") return false;
    const row = match as Record<string, unknown>;
    return typeof row.id === "string" && typeof row.sportId === "string";
  });
}

const CLUB_KEYS = [
  "accounts",
  "clubs",
  "clubMembers",
  "sessions",
  "sessionVotes",
  "sessionGuests",
  "sessionAssignments",
] as const;

export function withClubDefaults(data: AppData): AppData {
  const record = data as AppData & Record<string, unknown>;
  const next = { ...data } as AppData;
  next.accountId = (record.accountId as string | null | undefined) ?? null;
  for (const key of CLUB_KEYS) {
    const value = record[key];
    (next as Record<string, unknown>)[key] = Array.isArray(value) ? value : [];
  }
  return next;
}

function debounceStorage(storage: StateStorage, delayMs = WRITE_DEBOUNCE_MS): StateStorage {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingName: string | undefined;
  let pendingValue: string | undefined;

  const flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (pendingName === undefined || pendingValue === undefined) return;
    const name = pendingName;
    const value = pendingValue;
    pendingName = undefined;
    pendingValue = undefined;
    void storage.setItem(name, value);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", flush);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }

  return {
    getItem: (name) => storage.getItem(name),
    setItem: (name, value) => {
      pendingName = name;
      pendingValue = value;
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(flush, delayMs);
    },
    removeItem: (name) => {
      pendingName = undefined;
      pendingValue = undefined;
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      return storage.removeItem(name);
    },
  };
}

export function createAppPersistStorage(): StateStorage {
  return debounceStorage(createInnerStorage());
}
