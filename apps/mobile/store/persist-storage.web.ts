import type { StateStorage } from "zustand/middleware";

export function createInnerStorage(): StateStorage {
  try {
    if (typeof localStorage === "undefined") throw new Error("no localStorage");
    return {
      getItem: (name) => localStorage.getItem(name),
      setItem: (name, value) => {
        localStorage.setItem(name, value);
      },
      removeItem: (name) => {
        localStorage.removeItem(name);
      },
    };
  } catch {
    const map = new Map<string, string>();
    return {
      getItem: (name) => map.get(name) ?? null,
      setItem: (name, value) => {
        map.set(name, value);
      },
      removeItem: (name) => {
        map.delete(name);
      },
    };
  }
}
