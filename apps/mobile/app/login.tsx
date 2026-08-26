import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, TextInput } from "react-native";
import { Btn, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function LoginScreen() {
  const params = useLocalSearchParams<{ next?: string }>();
  const signInAs = useAppStore((s) => s.signInAs);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    try {
      signInAs(name);
      const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/";
      router.replace(next as "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "이름을 입력하세요.");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>시작</H>
        <P muted>이 기기 이름입니다. 서버 계정은 없습니다.</P>
        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError("");
          }}
          placeholder="이름"
          placeholderTextColor={colors.muted}
          style={inputStyle}
        />
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        <Btn label="시작" onPress={submit} disabled={!name.trim()} />
      </ScrollView>
    </Screen>
  );
}

const inputStyle = {
  backgroundColor: colors.surface,
  color: colors.text,
  borderRadius: 12,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.line,
  fontSize: 16,
};
