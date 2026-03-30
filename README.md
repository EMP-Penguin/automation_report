# 자동 참관보고서 생성기

## 프로젝트 소개
의무기록(EMR) 또는 학생 필기 내용을 입력하면 서버에서 Google AI Studio의 Gemini API를 호출하여 참관보고서를 생성하는 웹 애플리케이션이다. 브라우저는 내부 API인 `/api/generate-report`만 호출하며, API 키는 환경변수로만 관리한다.

## 설치 방법
```bash
npm install
```

## 환경변수 설정 방법
프로젝트 루트의 `.env.local`에 아래 값을 설정한다.

```env
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-pro
MASTER_PROMPT_PATH=C:\Users\gurwn\OneDrive\바탕 화면\#01 의대자료\#97 실습 관련 자료 및 전체적 정리자료\참관보고서 마스터프롬프트.txt
```

## Google AI Studio API key 설정 방법
1. Google AI Studio에서 API 키를 발급한다.
2. 발급한 키를 `.env.local`의 `GEMINI_API_KEY`에 입력한다.
3. 품질 우선이면 `GEMINI_MODEL=gemini-2.5-pro`, 속도/비용 우선이면 `gemini-2.5-flash`를 사용한다.
4. 시스템 프롬프트 파일 경로가 다르면 `MASTER_PROMPT_PATH`를 실제 파일 위치로 수정한다.

## 실행 방법
개발 서버 실행:

```bash
cmd /c npm run dev
```

브라우저 접속:

```text
http://localhost:3000
```

프로덕션 빌드:

```bash
cmd /c npm run build
cmd /c npm run start
```

## 폴더 구조
```text
app/
  api/generate-report/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  ErrorState.tsx
  InputArea.tsx
  LoadingState.tsx
  OutputCard.tsx
  ReportSelector.tsx
  TemplateViewer.tsx
lib/
  gemini.ts
  masterPrompt.ts
  prompts.ts
  report-config.ts
  reportFormatter.ts
README.md
```

## 보고서 생성 흐름
1. 사용자가 보고서 종류를 선택한다.
2. 클라이언트가 EMR 또는 학생 필기를 입력받는다.
3. 클라이언트는 `/api/generate-report`로 `reportType`, `inputText`를 전송한다.
4. 서버는 외부 txt 파일에서 마스터 시스템 프롬프트를 읽는다.
5. 서버는 보고서 종류별 전용 사용자 프롬프트와 함께 Gemini API를 호출한다.
6. 서버는 결과를 검증하고 누락 섹션에 `없음`을 삽입하며, 필요한 경우 500bytes 제한과 형식 보정을 적용한다.
7. 보정된 결과를 카드 UI에 출력한다.

## 확장 아이디어
- 병원/학교별 템플릿 커스터마이징
- 생성 이력 저장 및 PDF 내보내기
- 사용자 인증 및 개인별 보고서 관리
- 다국어 보고서 생성
- 민감정보 마스킹 규칙 추가
