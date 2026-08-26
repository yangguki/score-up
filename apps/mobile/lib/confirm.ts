import { Alert, Platform } from "react-native";

export function confirmAction(title: string, message: string, onOk: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: "취소", style: "cancel" },
    { text: "확인", onPress: onOk },
  ]);
}
