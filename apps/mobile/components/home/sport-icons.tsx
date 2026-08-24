import { View } from "react-native";
import type { HomeSportId } from "@/lib/home-sports";

type Props = {
  id: HomeSportId;
  size?: number;
  muted?: boolean;
};

/** 종목별 실루엣 아이콘 — 텍스트 없이도 구분 가능하도록 형태를 다르게 그림 */
export function SportIcon({ id, size = 40, muted }: Props) {
  const o = muted ? 0.55 : 1;
  switch (id) {
    case "basketball":
      return <Basketball size={size} opacity={o} />;
    case "volleyball":
      return <Volleyball size={size} opacity={o} />;
    case "table-tennis":
      return <TableTennis size={size} opacity={o} />;
    case "soccer":
      return <Soccer size={size} opacity={o} />;
    case "baseball":
      return <Baseball size={size} opacity={o} />;
    case "badminton":
      return <Badminton size={size} opacity={o} />;
    case "squash":
      return <Squash size={size} opacity={o} />;
    case "futsal":
      return <Futsal size={size} opacity={o} />;
  }
}

function Basketball({ size, opacity }: { size: number; opacity: number }) {
  const line = "rgba(11,18,32,0.55)";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#E87722",
        opacity,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ position: "absolute", width: 2, height: size, backgroundColor: line }} />
      <View style={{ position: "absolute", width: size, height: 2, backgroundColor: line }} />
      <View
        style={{
          position: "absolute",
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: size,
          borderWidth: 2,
          borderColor: line,
          left: -size * 0.28,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: size,
          borderWidth: 2,
          borderColor: line,
          right: -size * 0.28,
        }}
      />
    </View>
  );
}

function Volleyball({ size, opacity }: { size: number; opacity: number }) {
  const line = "#1E3A5F";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#F8FAFC",
        borderWidth: 2,
        borderColor: line,
        opacity,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: size,
          borderWidth: 2,
          borderColor: line,
          top: -size * 0.35,
          left: -size * 0.1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 1.2,
          height: size * 1.2,
          borderRadius: size,
          borderWidth: 2,
          borderColor: line,
          bottom: -size * 0.35,
          right: -size * 0.1,
        }}
      />
      <View style={{ position: "absolute", left: size * 0.48, top: 0, bottom: 0, width: 2, backgroundColor: line }} />
    </View>
  );
}

function TableTennis({ size, opacity }: { size: number; opacity: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, opacity, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: s * 0.58,
          height: s * 0.58,
          borderRadius: s * 0.12,
          backgroundColor: "#C53030",
          transform: [{ rotate: "-28deg" }],
          marginRight: s * 0.12,
          marginBottom: s * 0.06,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: s * 0.16,
          height: s * 0.42,
          borderRadius: 3,
          backgroundColor: "#0B1220",
          right: s * 0.12,
          bottom: s * 0.08,
          transform: [{ rotate: "-28deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: s * 0.2,
          height: s * 0.2,
          borderRadius: s,
          backgroundColor: "#F5A623",
          borderWidth: 1.5,
          borderColor: "#0B1220",
          top: s * 0.08,
          right: s * 0.08,
        }}
      />
    </View>
  );
}

function Soccer({ size, opacity }: { size: number; opacity: number }) {
  const line = "#0B1220";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#F8FAFC",
        borderWidth: 2,
        borderColor: line,
        opacity,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          backgroundColor: line,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View style={{ position: "absolute", width: 2, height: size * 0.42, top: 2, backgroundColor: line }} />
      <View
        style={{
          position: "absolute",
          width: size * 0.42,
          height: 2,
          left: 2,
          top: size * 0.28,
          backgroundColor: line,
          transform: [{ rotate: "55deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.42,
          height: 2,
          right: 2,
          top: size * 0.28,
          backgroundColor: line,
          transform: [{ rotate: "-55deg" }],
        }}
      />
    </View>
  );
}

function Baseball({ size, opacity }: { size: number; opacity: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#F8FAFC",
        borderWidth: 2,
        borderColor: "#1A365D",
        opacity,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: size,
          borderWidth: 2,
          borderColor: "#E11D48",
          left: -size * 0.55,
          top: size * 0.05,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: size,
          borderWidth: 2,
          borderColor: "#E11D48",
          right: -size * 0.55,
          top: size * 0.05,
        }}
      />
    </View>
  );
}

function Badminton({ size, opacity }: { size: number; opacity: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, opacity, alignItems: "center", justifyContent: "flex-end" }}>
      <View style={{ flexDirection: "row", gap: 2, marginBottom: -2, zIndex: 1 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              width: 3,
              height: s * 0.34,
              backgroundColor: "#0F766E",
              borderRadius: 2,
              transform: [{ rotate: `${(i - 2) * 10}deg` }],
            }}
          />
        ))}
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: s * 0.18,
          borderRightWidth: s * 0.18,
          borderTopWidth: s * 0.28,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#F8FAFC",
          marginBottom: s * 0.06,
        }}
      />
      <View
        style={{
          width: s * 0.14,
          height: s * 0.14,
          borderRadius: s,
          backgroundColor: "#0B1220",
          marginBottom: s * 0.04,
        }}
      />
    </View>
  );
}

function Squash({ size, opacity }: { size: number; opacity: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, opacity, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: s * 0.55,
          height: s * 0.72,
          borderRadius: s * 0.28,
          borderWidth: 3,
          borderColor: "#9A3412",
          backgroundColor: "transparent",
          transform: [{ rotate: "-18deg" }],
          marginRight: s * 0.1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: s * 0.12,
          height: s * 0.36,
          borderRadius: 3,
          backgroundColor: "#0B1220",
          right: s * 0.1,
          bottom: s * 0.06,
          transform: [{ rotate: "-18deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: s * 0.18,
          height: s * 0.18,
          borderRadius: s,
          backgroundColor: "#F5A623",
          top: s * 0.06,
          right: s * 0.06,
        }}
      />
    </View>
  );
}

function Futsal({ size, opacity }: { size: number; opacity: number }) {
  const line = "#1D4ED8";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#DBEAFE",
        borderWidth: 2.5,
        borderColor: line,
        opacity,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ width: size * 0.28, height: size * 0.28, borderRadius: 4, backgroundColor: line }} />
      <View style={{ position: "absolute", width: size * 0.7, height: 2, backgroundColor: line }} />
      <View style={{ position: "absolute", width: 2, height: size * 0.7, backgroundColor: line }} />
    </View>
  );
}
