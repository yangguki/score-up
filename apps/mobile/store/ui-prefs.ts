import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createAppPersistStorage } from "./persist";

/** 제품 방향 비교용. A=현행 대회 도구, B/C=모임 OS 후보. */
export type HomeDirection = "a" | "b" | "c";

type UiPrefs = {
  homeDirection: HomeDirection;
  setHomeDirection: (next: HomeDirection) => void;
};

export const useUiPrefsStore = create<UiPrefs>()(
  persist(
    (set) => ({
      homeDirection: "a",
      setHomeDirection: (homeDirection) => set({ homeDirection }),
    }),
    {
      name: "score-up-ui-prefs",
      version: 1,
      storage: createJSONStorage(() => createAppPersistStorage()),
      partialize: (state) => ({ homeDirection: state.homeDirection }),
    },
  ),
);

export function homeDirectionLabel(id: HomeDirection): string {
  switch (id) {
    case "a":
      return "A · 현장 대회 도구";
    case "b":
      return "B · 모임 OS · 회차 CTA";
    case "c":
      return "C · 모임 OS · 듀얼 CTA";
  }
}
