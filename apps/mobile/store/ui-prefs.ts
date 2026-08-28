import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createInnerStorage } from "./persist-storage";

export type HomeVersion = "h1" | "h8" | "h9";

export const HOME_VERSIONS: { id: HomeVersion; name: string; short: string; note: string }[] = [
  { id: "h1", name: "H1 Arena", short: "Arena", note: "현행 · 다크 앰버" },
  { id: "h8", name: "H8 Lift", short: "Lift", note: "비교 · 로고 라이트" },
  { id: "h9", name: "H9 Play", short: "Play", note: "비교 · 시안 블롭 종목" },
];

export function homeVersionLabel(id: HomeVersion) {
  return HOME_VERSIONS.find((row) => row.id === id)?.name ?? id;
}

type UiPrefs = {
  homeVersion: HomeVersion;
  setHomeVersion: (homeVersion: HomeVersion) => void;
};

export const useUiPrefsStore = create<UiPrefs>()(
  persist(
    (set) => ({
      homeVersion: "h1",
      setHomeVersion: (homeVersion) => set({ homeVersion }),
    }),
    {
      name: "score-up-ui-prefs",
      storage: createJSONStorage(() => createInnerStorage()),
    },
  ),
);
