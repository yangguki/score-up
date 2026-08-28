import { useWindowDimensions } from "react-native";

const SHORT_HEIGHT = 520;

/**
 * 스코어보드는 **가로만**. 세로는 레이아웃을 접지 않고 돌리라는 안내를 띄운다.
 * 짧은 가로(높이 < 520)만 compact로 점수·간격을 줄인다.
 */
export function useScoreboardLayout() {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const compact = landscape && height < SHORT_HEIGHT;
  const scoreSize = compact
    ? Math.min(120, height * 0.36, width * 0.2)
    : Math.min(220, height * 0.42, width * 0.2);

  return { width, height, landscape, compact, scoreSize };
}
