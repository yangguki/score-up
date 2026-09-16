import { ScrollView, View } from "react-native";
import { Card, H, P, Screen, SectionHead } from "@/components/ui";
import { space } from "@/theme/tokens";

export default function PrivacyScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <SectionHead title="개인정보 및 데이터 처리" />

        <Card>
          <H style={{ fontSize: 18 }}>데이터 저장 방식</H>
          <P muted style={{ marginTop: 8 }}>
            SCORE UP은 현재 **이 기기(브라우저)에만** 데이터를 저장합니다.
          </P>
          <View style={{ marginTop: 12, gap: 8 }}>
            <P>• 서버 전송 없음: 모든 데이터는 브라우저 localStorage에 저장됩니다.</P>
            <P>• 계정 없음: 이메일, 비밀번호 등 개인정보를 수집하지 않습니다.</P>
            <P>• 기기 간 동기화 없음: 다른 기기나 브라우저와 데이터가 공유되지 않습니다.</P>
          </View>
        </Card>

        <Card>
          <H style={{ fontSize: 18 }}>저장되는 정보</H>
          <View style={{ marginTop: 8, gap: 8 }}>
            <P>• 이 기기 이름 (모임 투표용)</P>
            <P>• 대회, 경기, 모임 기록</P>
            <P>• 앱 설정 (홈 시안, UI 설정)</P>
          </View>
          <P muted style={{ marginTop: 12 }}>
            설정 → 「시드 데이터로 되돌리기」로 언제든 초기화할 수 있습니다.
          </P>
        </Card>

        <Card>
          <H style={{ fontSize: 18 }}>네트워크 사용</H>
          <View style={{ marginTop: 8, gap: 8 }}>
            <P>• 앱 파일 로드: 정적 HTML/JS/CSS 파일만 다운로드합니다.</P>
            <P>• 외부 API 호출 없음: 현재 버전은 외부 서버와 통신하지 않습니다.</P>
          </View>
        </Card>

        <Card>
          <H style={{ fontSize: 18 }}>PWA 설치</H>
          <P muted style={{ marginTop: 8 }}>
            홈 화면에 추가해도 추가 권한을 요청하지 않습니다. 
            오프라인 캐시는 앱 파일(HTML/JS/CSS/이미지)만 저장합니다.
          </P>
        </Card>

        <Card>
          <H style={{ fontSize: 18 }}>문의</H>
          <P muted style={{ marginTop: 8 }}>
            데이터 처리에 대한 문의는 앱 관리자에게 연락해 주세요.
          </P>
        </Card>
      </ScrollView>
    </Screen>
  );
}
