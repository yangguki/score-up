import { useState } from "react";
import { Redirect, router } from "expo-router";
import { ScrollView, TextInput } from "react-native";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function NewClubScreen() {
  const accountId = useAppStore((s) => s.accountId);
  const createClubAt = useAppStore((s) => s.createClubAt);
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");

  if (!accountId) return <Redirect href={"/login?next=/club/new"} />;

  const submit = () => {
    try {
      const id = createClubAt({ name, venue });
      router.replace(`/club/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "모임을 만들지 못했습니다.");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>종목</H>
        <Card style={{ borderColor: colors.primary }}>
          <H style={{ fontSize: 18 }}>농구</H>
          <P muted>1차 모임</P>
        </Card>
        <Card style={{ opacity: 0.4 }}>
          <H style={{ fontSize: 18 }}>배구</H>
          <P muted>지금은 선택할 수 없습니다</P>
        </Card>
        <Card style={{ opacity: 0.4 }}>
          <H style={{ fontSize: 18 }}>탁구</H>
          <P muted>지금은 선택할 수 없습니다</P>
        </Card>
        <P muted>이름</P>
        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError("");
          }}
          placeholder="주말 농구 모임"
          placeholderTextColor={colors.muted}
          style={inputStyle}
        />
        <P muted>기본 장소 (선택)</P>
        <TextInput
          value={venue}
          onChangeText={setVenue}
          placeholder="시민체육관 3코트"
          placeholderTextColor={colors.muted}
          style={inputStyle}
        />
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        <Btn label="모임 만들기" onPress={submit} disabled={!name.trim()} />
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
