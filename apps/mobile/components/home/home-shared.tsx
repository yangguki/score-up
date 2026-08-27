import { Link, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { KitText, KitTitle } from "@/components/home/kit-ui";
import type { HomeClubCard } from "@/lib/club-home";
import { HOME_KIT, type HomeKit } from "@/theme/home-kits";

const HOME_BLUE = "#3D8BFF";
const COURT_AMBER = "#F5A623";

export function HomeSectionTitle({
  kit = HOME_KIT,
  title,
  hint,
  live,
}: {
  kit?: HomeKit;
  title: string;
  hint?: string;
  live?: boolean;
}) {
  const accent = kit.accent ?? COURT_AMBER;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {live ? <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: kit.live }} /> : null}
        <KitTitle kit={kit} style={{ fontSize: 18, fontWeight: "900", letterSpacing: -0.4, color: "#F8FAFC" }}>
          {title}
        </KitTitle>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: HOME_BLUE }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.live }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: accent }} />
      </View>
      {hint ? (
        <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "600", marginTop: 2 }}>
          {hint}
        </KitText>
      ) : null}
    </View>
  );
}

export function HomeOperatorLink({ kit = HOME_KIT, name }: { kit?: HomeKit; name: string }) {
  return (
    <Link href="/settings" asChild>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1, paddingHorizontal: 4, paddingVertical: 4 })}>
        <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700", color: "#F8FAFC" }}>
          {name || "운영자"}
        </KitText>
      </Pressable>
    </Link>
  );
}

export function ClubCardList({
  kit = HOME_KIT,
  clubs,
}: {
  kit?: HomeKit;
  clubs: HomeClubCard[];
}) {
  const accent = kit.accent ?? COURT_AMBER;
  return (
    <View style={{ gap: 8 }}>
      {clubs.map(({ club, nextLine, voteLine }) => (
        <Link key={club.id} href={`/club/${club.id}` as Href} asChild>
          <Pressable>
            <View
              style={{
                backgroundColor: kit.surface,
                borderRadius: kit.heroRadius,
                borderWidth: 1.5,
                borderColor: kit.line,
                padding: 16,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <KitText kit={kit} style={{ fontSize: 16, fontWeight: "800", color: "#F8FAFC" }}>
                  {club.name}
                </KitText>
                <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
                  농구
                </KitText>
              </View>
              <KitText kit={kit} muted style={{ fontSize: 13 }}>
                다음 회차 {nextLine}
              </KitText>
              {voteLine ? (
                <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700", color: accent }}>
                  내 투표 {voteLine}
                </KitText>
              ) : null}
            </View>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

export function primaryClubHref(clubs: HomeClubCard[]): Href | null {
  const first = clubs[0];
  if (!first) return null;
  if (first.sessionId) return `/club/${first.club.id}/sessions/${first.sessionId}` as Href;
  return `/club/${first.club.id}` as Href;
}

export function primaryClubCtaLabel(clubs: HomeClubCard[]): string {
  const first = clubs[0];
  if (!first) return "모임 만들기";
  if (first.sessionStatus === "voting") return "이번 회차 · 투표하기";
  if (first.sessionId) return "이번 회차 열기";
  return "내 모임 열기";
}
