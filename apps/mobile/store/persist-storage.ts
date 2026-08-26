import type { StateStorage } from "zustand/middleware";
import SQLiteKV from "expo-sqlite/kv-store";

export function createInnerStorage(): StateStorage {
  return {
    getItem: (name) => SQLiteKV.getItem(name),
    setItem: (name, value) => SQLiteKV.setItem(name, value),
    removeItem: (name) => SQLiteKV.removeItem(name),
  };
}
