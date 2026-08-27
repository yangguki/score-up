import { useWindowDimensions } from "react-native";

const STACK_WIDTH = 820;
const SHORT_HEIGHT = 520;

/**
 * 스코어보드 반응형.
 * - 가로(landscape): 항상 좌우(side-by-side). 높이가 짧으면 compact로 점수·간격을 줄인다.
 * - 세로: 폭 820 미만이면 위아래 스택.
 * 점수가 주인공. 버튼은 BoardKey/sm으로 작게.
 */
export function useScoreboardLayout() {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const narrow = width < STACK_WIDTH;
  const short = height < SHORT_HEIGHT;
  const sideBySide = landscape || !narrow;
  const stacked = !sideBySide;
  const compact = short;

  const scoreSize = compact
    ? sideBySide
      ? Math.min(120, height * 0.36, width * 0.2)
      : Math.min(100, height * 0.18)
    : stacked
      ? Math.min(148, height * 0.24)
      : Math.min(220, height * 0.42, width * 0.2);

  return { width, height, landscape, narrow, short, sideBySide, stacked, compact, scoreSize };
}
