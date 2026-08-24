import { Link, Stack } from "expo-router";
import { Btn, H, P, Screen } from "@/components/ui";
import { space } from "@/theme/tokens";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "페이지 없음" }} />
      <Screen style={{ justifyContent: "center", alignItems: "center", padding: space.lg }}>
        <H style={{ fontSize: 20, textAlign: "center" }}>화면을 찾을 수 없습니다</H>
        <P muted style={{ marginTop: 8, textAlign: "center" }}>
          주소를 확인하거나 홈으로 돌아가 주세요.
        </P>
        <Link href="/" asChild>
          <Btn label="홈으로" style={{ marginTop: space.lg, alignSelf: "stretch" }} />
        </Link>
      </Screen>
    </>
  );
}
