# Medicine Manager

복용약 관리를 위한 단일 페이지 웹 애플리케이션입니다.

## 스크린샷

> 약 종류 등록 및 복용 기록 관리 화면

## 주요 기능

- 📋 **약 종류 등록**: 복용 중인 약을 슬롯으로 등록
- 📅 **날짜별 기록**: 날짜를 선택하여 복용 기록 관리
- 📊 **복용 횟수 집계**: 약별 복용 횟수를 실시간 표시
- ✨ **애니메이션 피드백**: 등록/삭제 시 시각적 피드백 제공
- 💾 **로컬 저장**: 브라우저 localStorage에 데이터 저장

## 기술 스택

| 분류 | 기술 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3 (애니메이션 포함) |
| 로직 | Vanilla JavaScript |
| 저장소 | localStorage |

## 파일 구조

```
webprogramming/
├── index.html          # 메인 HTML
├── style.css           # 스타일시트
├── app.js              # 핵심 로직
├── README.md           # 프로젝트 설명
└── .github/
    └── copilot-instructions.md  # AI 협업 명세
```

## 실행 방법

### 방법 1: 직접 열기

`index.html` 파일을 브라우저에서 직접 엽니다.

### 방법 2: VS Code Live Server

1. VS Code에서 프로젝트 폴더 열기
2. Live Server 확장 설치
3. `index.html` 우클릭 → "Open with Live Server"

## 사용 방법

### 약 종류 등록

1. 입력창에 약 이름 입력
2. "추가" 버튼 클릭
3. 등록된 약이 슬롯으로 표시됨

### 복용 기록 추가

1. 날짜 선택 (기본값: 오늘)
2. 등록된 약 슬롯 클릭
3. 복용 기록이 자동으로 추가됨

### 복용 횟수 조절

- **+** 버튼: 해당 약 복용 횟수 증가
- **−** 버튼: 해당 약 복용 횟수 감소

### 기록 초기화

- **하루 초기화**: 선택된 날짜의 기록만 삭제
- **전체 초기화**: 모든 날짜의 기록 삭제

## 데이터 구조

### localStorage 키

| 키 | 설명 | 예시 |
|----|------|------|
| `med-slots` | 등록된 약 목록 | `["비타민", "오메가3"]` |
| `med-records:YYYY-MM-DD` | 날짜별 복용 기록 | 아래 참조 |

### 복용 기록 스키마

```javascript
{
  id: "r_1734567890123_abc1",  // 고유 ID
  iso: "2025-12-19T09:30:00",  // 복용 시간 (ISO 8601)
  note: "비타민"               // 약 이름
}
```

## 브라우저 지원

| 브라우저 | 지원 |
|----------|------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |

## 개발 참고사항

### DOM 필수 요소

```html
<input id="datePicker">      <!-- 날짜 선택 -->
<button id="clearDay">       <!-- 하루 초기화 -->
<button id="clearAll">       <!-- 전체 초기화 -->
<input id="newMedInput">     <!-- 약 이름 입력 -->
<button id="addMedBtn">      <!-- 약 추가 버튼 -->
<ul id="medSlotsList">       <!-- 약 슬롯 목록 -->
<ul id="consumedList">       <!-- 복용 횟수 집계 -->
<ul id="recordList">         <!-- 상세 기록 목록 -->
```

### 주요 함수

| 함수 | 역할 |
|------|------|
| `renderMedSlots()` | 약 슬롯 렌더링 |
| `renderConsumed()` | 복용 횟수 집계 표시 |
| `loadRecords()` | 기록 로드 |
| `saveRecords()` | 기록 저장 |
| `render()` | 전체 UI 갱신 |

## 라이선스

MIT License

## 개발 정보

- **개발 기간**: 2025년 12월
- **개발 도구**: VS Code + GitHub Copilot
- **AI 모델**: Claude Opus 4.5

---

Made with ❤️ and AI-assisted development (Vibe Coding)
