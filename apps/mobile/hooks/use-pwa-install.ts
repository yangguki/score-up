import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export type PwaInstallState =
  | "standalone"
  | "can-prompt"
  | "ios-safari"
  | "unsupported";

function isStandalone(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof window === "undefined") return false;

  const isDisplayStandalone = window.matchMedia?.(
    "(display-mode: standalone)"
  ).matches;
  const isNavigatorStandalone =
    (navigator as unknown as { standalone?: boolean }).standalone === true;

  return isDisplayStandalone || isNavigatorStandalone;
}

function isIosSafari(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
  return isIos && isSafari;
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
}

export function usePwaInstall() {
  const [state, setState] = useState<PwaInstallState>("unsupported");
  const [promptAvailable, setPromptAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      setState("unsupported");
      return;
    }

    if (isStandalone()) {
      setState("standalone");
      return;
    }

    if (isIosSafari()) {
      setState("ios-safari");
      return;
    }

    if (deferredPrompt) {
      setState("can-prompt");
      setPromptAvailable(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setState("can-prompt");
      setPromptAvailable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const appInstalledHandler = () => {
      setState("standalone");
      deferredPrompt = null;
      setPromptAvailable(false);
    };
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const triggerPrompt = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        deferredPrompt = null;
        setPromptAvailable(false);
        setState("standalone");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    state,
    promptAvailable,
    triggerPrompt,
    isStandalone: state === "standalone",
    canPrompt: state === "can-prompt",
    isIosSafari: state === "ios-safari",
    isMobileViewport,
  };
}

export { isStandalone, isIosSafari, isMobileViewport };
