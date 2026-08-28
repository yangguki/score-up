import { type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAppStore } from "@/store/app-store";
import { useUiPrefsStore } from "@/store/ui-prefs";
import { arena } from "@/theme/arena";

const HYDRATE_TIMEOUT_MS = 3000;

export function HydrateGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(useAppStore.persist.hasHydrated() && useUiPrefsStore.persist.hasHydrated());

  useEffect(() => {
    const bothReady = () => useAppStore.persist.hasHydrated() && useUiPrefsStore.persist.hasHydrated();
    if (bothReady()) {
      setReady(true);
      return;
    }
    let alive = true;
    const finish = () => {
      if (alive) setReady(true);
    };
    const check = () => {
      if (alive && bothReady()) setReady(true);
    };
    const timeout = setTimeout(finish, HYDRATE_TIMEOUT_MS);
    const unsubApp = useAppStore.persist.onFinishHydration(check);
    const unsubUi = useUiPrefsStore.persist.onFinishHydration(check);
    void Promise.all([
      Promise.resolve(useAppStore.persist.rehydrate()),
      Promise.resolve(useUiPrefsStore.persist.rehydrate()),
    ]).finally(check);
    return () => {
      alive = false;
      clearTimeout(timeout);
      unsubApp();
      unsubUi();
    };
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: arena.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={arena.primary} size="large" />
      </View>
    );
  }

  return children;
}
