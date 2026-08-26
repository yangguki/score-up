import * as Clipboard from "expo-clipboard";
import { Platform } from "react-native";

function webFallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(field);
  return ok;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    if (Platform.OS === "web") return webFallbackCopy(text);
    return false;
  }
}
