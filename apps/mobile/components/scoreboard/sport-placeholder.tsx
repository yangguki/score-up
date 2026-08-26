import { router } from "expo-router";
import { View } from "react-native";
import type { SportId } from "@score-up/domain";
import { Btn, H, P, Screen } from "@/components/ui";
import { sportLabel } from "@/lib/match-routes";
import { space } from "@/theme/tokens";

export function SportPlaceholderBoard({ sport }: { sport: SportId }) {
  return (
    <Screen style={{ justifyContent: "center", padding: space.lg, gap: space.md }}>
      <View style={{ gap: 8 }}>
        <H>{sportLabel(sport)} 스코어보드</H>
        <P muted>이 종목 보드는 아직 붙이지 않았습니다. 지금은 농구·배구·탁구 mock만 운영합니다.</P>
      </View>
      <Btn label="돌아가기" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
