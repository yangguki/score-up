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
  /** 좌우 컬럼이 화면 전체를 쓰므로 독을 뺀 높이 기준보다 크게. */
  const scoreSize = compact
    ? Math.min(156, height * 0.5, width * 0.3)
    : Math.min(300, height * 0.62, width * 0.34);

  return { width, height, landscape, compact, scoreSize };
}
