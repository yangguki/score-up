import { type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAppStore } from "@/store/app-store";
import { arena } from "@/theme/arena";

const HYDRATE_TIMEOUT_MS = 3000;

export function HydrateGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    let alive = true;
    const finish = () => {
      if (alive) setReady(true);
    };
    const timeout = setTimeout(finish, HYDRATE_TIMEOUT_MS);
    const unsub = useAppStore.persist.onFinishHydration(finish);
    void Promise.resolve(useAppStore.persist.rehydrate()).finally(() => {
      clearTimeout(timeout);
      finish();
    });
    return () => {
      alive = false;
      clearTimeout(timeout);
      unsub();
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
