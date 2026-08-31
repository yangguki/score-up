import { createContext, useContext, type ReactNode } from "react";
import { useUiPrefsStore } from "@/store/ui-prefs";
import { HOME_KIT, kitForVersion, type HomeKit } from "@/theme/home-kits";

const KitContext = createContext<HomeKit>(HOME_KIT);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const version = useUiPrefsStore((s) => s.homeVersion);
  return <KitContext.Provider value={kitForVersion(version)}>{children}</KitContext.Provider>;
}

export function useAppKit() {
  return useContext(KitContext);
}
