import { useState } from "react";
import { Pressable, View } from "react-native";
import { KitText, KitTitle } from "@/components/home/kit-ui";
import { HOME_VERSIONS, type HomeVersion } from "@/lib/home";
import { HOME_KITS } from "@/theme/home-kits";

type Props = {
  version: HomeVersion;
  emptyPreview: boolean;
  onVersion: (version: HomeVersion) => void;
  onEmptyPreview: (value: boolean) => void;
};

function ChipRow({
  items,
  version,
  kit,
  onVersion,
}: {
  items: typeof HOME_VERSIONS;
  version: HomeVersion;
  kit: (typeof HOME_KITS)[HomeVersion];
  onVersion: (version: HomeVersion) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {items.map((item) => {
        const on = item.id === version;
        const chip = HOME_KITS[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onVersion(item.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: on ? chip.primary : kit.surface,
              borderWidth: 1,
              borderColor: on ? chip.primary : "rgba(248,250,252,0.14)",
            }}
          >
            <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700", color: on ? chip.primaryFg : kit.text }}>
              {item.label}
            </KitText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HomeVersionBar({ version, emptyPreview, onVersion, onEmptyPreview }: Props) {
  const [open, setOpen] = useState(false);
  const kit = HOME_KITS[version];
  const current = HOME_VERSIONS.find((item) => item.id === version);
  const kits = HOME_VERSIONS.filter((item) => item.group === "kit");
  const hubs = HOME_VERSIONS.filter((item) => item.group === "hub");
  const trends = HOME_VERSIONS.filter((item) => item.group === "trend");

  return (
    <View style={{ gap: open ? 10 : 0 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={open ? "시안 바 접기" : "시안 바 펼치기"}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 4,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: kit.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KitText kit={kit} style={{ fontSize: 11, fontWeight: "900", color: kit.primary }}>
            {open ? "−" : "+"}
          </KitText>
        </View>
        <View style={{ flex: 1 }}>
          <KitTitle kit={kit} style={{ fontSize: 13, fontWeight: "800" }}>
            시안 {current?.label} · {current?.name}
          </KitTitle>
          {open ? (
            <KitText kit={kit} muted style={{ marginTop: 2, fontSize: 12 }}>
              {current?.blurb} · {kit.note}
            </KitText>
          ) : (
            <KitText kit={kit} muted style={{ marginTop: 1, fontSize: 11 }}>
              탭해서 시안 바꾸기
            </KitText>
          )}
        </View>
        <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "800" }}>
          {open ? "접기" : "펼치기"}
        </KitText>
      </Pressable>

      {open ? (
        <>
          <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "700" }}>
            이전 시안
          </KitText>
          <ChipRow items={kits} version={version} kit={kit} onVersion={onVersion} />

          <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "700", marginTop: 4 }}>
            브랜드 허브 · H1 기준
          </KitText>
          <ChipRow items={hubs} version={version} kit={kit} onVersion={onVersion} />

          <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "700", marginTop: 4 }}>
            트렌드 비교 (색은 H1과 동일)
          </KitText>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <ChipRow items={trends} version={version} kit={kit} onVersion={onVersion} />
            <Pressable
              onPress={() => onEmptyPreview(!emptyPreview)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: emptyPreview ? kit.surface2 : kit.surface,
                borderWidth: 1,
                borderColor: emptyPreview ? kit.primary : "rgba(248,250,252,0.14)",
                marginLeft: "auto",
              }}
            >
              <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700" }}>
                {emptyPreview ? "빈 화면 켜짐" : "빈 화면"}
              </KitText>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}
