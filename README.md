# Organizer

PDF 정리 앱 프로토타입이다. GitHub Pages에서는 브라우저 저장소에 저장되는 웹앱으로 실행되고, Windows에서는 Electron 앱으로 실행할 수 있다.

## GitHub Pages

이 repo의 루트 `index.html`을 GitHub Pages 진입점으로 사용한다.

브라우저에서 실행할 때는 앱 상태가 `localStorage`에 저장된다. Electron으로 실행할 때는 `data/app_data.json` 파일 기반 저장을 사용한다.

## 실행

웹앱 단일 파일 빌드:

```bash
cd /mnt/c/EunYoungKim/Organizer
npm run build:web-single
```

결과물은 `web/organizer-single.html`에 생성된다.

Electron 실행:

```bash
cd /mnt/c/EunYoungKim/Organizer
npm install
npm start
```

Windows에서 바로 실행:

- `x64/Launch Organizer.bat`: 콘솔 창을 보면서 실행
- `x64/Launch Organizer.vbs`: 콘솔 창 없이 더블클릭 실행
- `x64/Install Organizer Windows Dependencies.bat`: Windows용 Electron 의존성 설치
- `x64/Build Organizer EXE.bat`: Windows용 `.exe` 빌드

중요:

- 지금 이 폴더의 `node_modules`는 WSL에서 설치한 Linux용 의존성일 수 있다.
- 그래서 Windows에서 바로 더블클릭해도 창이 안 뜰 수 있다.
- 먼저 `x64/Install Organizer Windows Dependencies.bat`를 Windows에서 한 번 실행해서 Windows용 Electron을 설치해야 한다.
- 그 다음 `x64/Launch Organizer.vbs` 또는 `x64/Launch Organizer.bat`으로 실행한다.

EXE 빌드:

- Windows에서 `x64/Build Organizer EXE.bat`를 실행하면 `x64/dist/Organizer-0.2.0.exe` 형태의 portable executable을 만들도록 설정했다.
- 이 빌드는 Windows에서 실행해야 한다. 현재 WSL에서 설치된 Linux용 Electron으로는 Windows EXE를 바로 만들 수 없다.

## 포함된 기능

- Notebook / Chapter / Note 3단계 트리
- 대시보드 카드
- 샘플 PDF 연결 및 뷰어 iframe 표시
- note 메모 저장
- PDF별 페이지 코멘트 저장
- 태그, 제목, 메모, 코멘트 기반 검색
- 한국어 / 영어 UI 전환
- `data/app_data.json` 기반 상태 저장
- 저장 전 `data/backups/` 자동 백업

## 파일 구조

- `index.html`: 앱 진입점
- `style.js`: 테마 토큰 및 전체 스타일 주입
- `scripts.js`: 상태 관리, 렌더링, 이벤트 처리
- `storage.js`: seed 데이터 및 파일 저장용 데이터 정규화
- `pdf_viewer.js`: PDF URL 상태 관리
- `search.js`: 검색 인덱싱
- `dashboard.js`: 최근 열람 / 수정 계산
- `i18n.js`: KO / EN 텍스트
- `src/main.js`: Electron 메인 프로세스 및 파일 I/O
- `src/preload.js`: renderer <-> main IPC 브리지
- `data/app_data.json`: 실제 저장 데이터 파일
- `x64/`: Windows 실행/빌드 스크립트
- `manual/`: 사용자용 매뉴얼
- `docs/`: 개발 과정 참고 자료와 산출물
- `web/`: 단일 HTML 테스트 빌드 결과

## 현재 한계

- PDF 주석은 브라우저 내장 PDF 뷰어 옆의 메모 방식이다.
- 실제 파일 import / 복사 / 백업 파일 생성은 아직 구현하지 않았다.
- 전체 PDF annotation layer는 아직 없다.
- 폴더 선택형 저장소, PDF import, soft delete는 아직 다음 단계다.
