# PDF 기반 논문·자료 정리 앱 개발 작업지시서

## 1. 프로젝트 개요

이 앱의 이름은 Organizer이다.
아래 스택을 기준으로 작업한다.
pnpm create vite organizer --template vanilla
# 또는
pnpm create vite organizer --template react-ts


정신과 교수 사용자가 논문, 상담자료, 연구자료, 강의자료 등 PDF 중심의 문서를 편하게 정리하고, 열람하면서 동시에 필기·주석을 남길 수 있는 **개인용 오프라인 HTML 기반 웹앱**을 개발한다.

본 앱은 웹에 퍼블리싱하지 않고, 별도 서버·로그인·인증 없이 개인 컴퓨터에서 로컬로 실행되는 것을 목표로 한다. 기본 개발환경은 **WSL2**이며, 최종 사용환경은 **Mac**이다. 가능하다면 Mac과 iPhone 간 저장소 공유를 고려한다.

참고 서비스는 Notion, Microsoft OneNote, Obsidian이며, 특히 Notion처럼 왼쪽에 toggle 가능한 사이드 메뉴를 두고, PDF 열람 영역과 필기 영역을 함께 제공하는 구조를 지향한다.

빌드 확인을 위한 sample pdf는 `"C:\EunYoungKim\Organizer\sample\samplePDF_1.pdf"` 및 이하 동일 경로의 파일들을 활용한다.

---

## 2. 핵심 목적

사용자가 lecture별, 분야별, 업무용도별 PDF를 다음과 같이 관리할 수 있어야 한다.

1. PDF 파일을 계층적으로 정리한다.
2. PDF를 앱 내부에서 렌더링하여 바로 열람한다.
3. PDF를 보면서 옆에 필기, 메모, 코멘트, 주석을 작성한다.
4. 작성한 필기와 주석을 로컬 저장소에 저장한다.
5. 전체 자료를 검색할 수 있다.
6. 날짜별·최근 열람 기준으로 대시보드에서 추천 파일을 보여준다.
7. Notion처럼 왼쪽에 toggle 가능한 메뉴판을 제공한다.

---

## 3. 사용 시나리오 예시

예시 구조:

```text
상담자료 / 2026 / 김철수환자
```

위 note 안에 여러 개의 PDF를 업로드하거나 링크할 수 있다. 사용자는 각 PDF를 앱 안에서 열람하고, PDF 렌더링 화면 옆에 상담 관련 메모, 코멘트, 관찰 내용, 후속 조치 등을 기록한다. 이 기록은 해당 note와 PDF에 연결되어 저장되어야 한다.

다른 예시:

```text
연구자료 / ADHD / 최신논문리뷰
강의록 / 2026 / 정신병리학
연구자료 / 우울증 / 약물치료논문
```

---

## 4. 정보 구조

앱의 계층 구조는 3단계로 구성한다.

### 4.1 Notebook

가장 상위 구분이다.

예시:

- 상담자료
- 연구자료
- 강의록
- 학회자료
- 행정자료

### 4.2 Chapter

Notebook 내부의 중간 구분이다. 연도별, 주제별, 목적별로 자유롭게 생성 가능해야 한다.

예시:

- 2026
- 2025
- ADHD
- 우울증
- 수업자료
- 논문리뷰

### 4.3 Note

실제 PDF 파일과 메모가 모이는 단위이다.

하나의 note는 다음 정보를 포함할 수 있어야 한다.

- note 제목
- note 설명
- 연결된 PDF 파일 목록
- PDF별 필기·주석 데이터
- 일반 텍스트 메모
- 태그
- 생성일
- 수정일
- 최근 열람일

---

## 5. 주요 기능 요구사항

## 5.1 로컬 PDF 업로드 및 관리

- 사용자가 PDF 파일을 note에 추가할 수 있어야 한다.
- 하나의 note에 여러 개의 PDF를 연결할 수 있어야 한다.
- PDF 파일은 로컬 저장소에 복사하거나, 원본 경로를 참조하는 방식 중 하나를 선택할 수 있게 설계한다.
- 각 PDF에는 제목, 원본 파일명, 저장 경로, 추가일, 최근 열람일 메타데이터를 저장한다.

## 5.2 PDF 렌더링

- 앱 내부에서 PDF를 페이지 단위로 렌더링한다.
- PDF.js 사용을 우선 고려한다.
- 페이지 이동, 확대/축소, 페이지 번호 입력, 전체 페이지 수 표시 기능을 제공한다.
- PDF 영역과 필기 영역을 split view로 배치한다.

## 5.3 필기 및 코멘트

- PDF를 보면서 오른쪽 또는 하단에 텍스트 필기 영역을 제공한다.
- 필기는 note 전체에 대한 메모와 PDF별 메모를 구분할 수 있어야 한다.
- 가능하다면 페이지 번호별 코멘트를 지원한다.

예시 데이터:

```json
{
  "pdf_id": "pdf_001",
  "page": 12,
  "comment": "이 부분은 강의에서 설명할 때 사례와 함께 언급하면 좋음.",
  "created_at": "2026-04-24T10:00:00",
  "updated_at": "2026-04-24T10:05:00"
}
```

## 5.4 검색 기능

검색 대상:

- Notebook 이름
- Chapter 이름
- Note 제목
- Note 본문 메모
- PDF 파일명
- PDF별 코멘트
- 태그

가능하면 추후 확장을 위해 PDF 본문 텍스트 추출 검색도 고려한다.

초기 버전에서는 메타데이터와 사용자가 작성한 메모·코멘트 중심 검색을 우선 구현한다.

## 5.5 최근 열람 대시보드

앱 첫 화면에는 dashboard를 제공한다.

대시보드 항목:

- 최근 열어본 note
- 최근 열어본 PDF
- 최근 수정한 note
- 자주 열람한 note
- 오늘 열람한 파일
- 날짜별 최근 활동 기록

각 항목을 클릭하면 해당 note 또는 PDF로 바로 이동한다.

## 5.6 왼쪽 사이드바

Notion처럼 왼쪽에 toggle 가능한 계층형 메뉴를 제공한다.

구조:

```text
상담자료
  └── 2026
      └── 김철수환자
      └── 이영희환자
연구자료
  └── ADHD
      └── 최신논문리뷰
강의록
  └── 2026
      └── 정신병리학 1주차
```

요구사항:

- Notebook 접기/펼치기
- Chapter 접기/펼치기
- Note 선택
- 새 Notebook 생성
- 새 Chapter 생성
- 새 Note 생성
- 이름 변경
- 삭제

## 5.7 다국어 UI

- UI 메뉴는 한국어와 영어를 모두 사용할 수 있도록 설계한다.
- 초기 기본값은 한국어로 한다.
- 추후 `i18n` 구조로 확장 가능하게 텍스트 상수를 분리한다.

---

## 6. 기술 요구사항

## 6.1 실행 방식

- 인터넷 연결 없이 구동되어야 한다.
- HTML 기반 웹앱으로 구현한다.
- 웹에 퍼블리싱하지 않는다.
- 별도 서버, 로그인, authentication은 필요 없다.

단, 브라우저 보안 정책상 로컬 파일 접근과 저장에 제약이 있을 수 있으므로 다음 중 하나를 선택해야 한다.

### 선택지 A: 순수 정적 HTML 앱

- `index.html`, `style.js`, `scripts.js` 중심으로 구성
- 브라우저에서 직접 실행
- 구현이 단순함
- 로컬 파일 저장, 폴더 관리, 지속 저장에 제약이 큼

### 선택지 B: Electron 기반 로컬 데스크톱 앱

- HTML/CSS/JS UI를 유지하면서 데스크톱 앱처럼 실행
- Mac 배포가 쉬움
- 로컬 파일 시스템 접근 가능
- PDF, 메모, 데이터 저장 관리에 유리함
- 개인용 오프라인 앱 목적에 가장 적합함

### 선택지 C: Tauri 기반 로컬 데스크톱 앱

- Electron보다 가볍고 빠름
- Rust 기반 설정 필요
- 초기 개발 난이도는 Electron보다 높을 수 있음

권장 방향: **Electron 기반 로컬 앱**으로 개발한다. 단, UI는 HTML/CSS/JS 중심으로 구성하여 향후 정적 웹앱처럼 유지보수하기 쉽게 한다.

---

## 6.2 파일 구성 요구

사용자가 지정한 구조를 최대한 반영한다.

```text
project_root/
  index.html
  style.js
  scripts.js
  package.json
  README.md
  data/
    app_data.json
    pdfs/
    backups/
  assets/
    icons/
  src/
    main.js
    storage.js
    pdf_viewer.js
    search.js
    dashboard.js
    i18n.js
```

### index.html

- 전체 앱 레이아웃
- 사이드바
- 대시보드
- PDF 뷰어 영역
- 메모 패널
- 검색창

### style.js

- 앱의 스타일 설정값 관리
- 색상, 폰트, spacing, theme 관련 설정
- 가능하면 CSS custom properties를 동적으로 주입하는 방식 사용

### scripts.js

- 페이지 내부 UI 동작 관리
- 사이드바 toggle
- note 선택
- 검색 입력 처리
- 대시보드 렌더링
- PDF 선택 및 표시
- 메모 저장 이벤트

### storage.js

- 로컬 데이터 저장 및 로드
- JSON 기반 저장소 관리
- 백업 파일 생성

### pdf_viewer.js

- PDF.js 기반 렌더링
- 페이지 이동
- 확대/축소
- 현재 페이지 상태 관리

### search.js

- note, PDF, 메모, 코멘트 검색
- 검색 결과 정렬

### dashboard.js

- 최근 열람 파일
- 최근 수정 note
- 자주 열람 항목 계산

### i18n.js

- 한국어/영어 UI 텍스트 관리

---

## 7. 데이터 저장 구조 초안

초기 버전에서는 JSON 파일 기반 저장을 사용한다.

```json
{
  "version": "0.1.0",
  "settings": {
    "language": "ko",
    "theme": "light",
    "storage_mode": "local_copy"
  },
  "notebooks": [
    {
      "id": "notebook_001",
      "title": "상담자료",
      "chapters": [
        {
          "id": "chapter_001",
          "title": "2026",
          "notes": [
            {
              "id": "note_001",
              "title": "김철수환자",
              "description": "상담 기록 및 관련 문서",
              "tags": ["상담", "2026"],
              "created_at": "2026-04-24T10:00:00",
              "updated_at": "2026-04-24T10:00:00",
              "last_opened_at": "2026-04-24T10:00:00",
              "pdfs": [
                {
                  "id": "pdf_001",
                  "title": "초기상담자료.pdf",
                  "original_filename": "initial_consultation.pdf",
                  "path": "data/pdfs/pdf_001.pdf",
                  "added_at": "2026-04-24T10:00:00",
                  "last_opened_at": "2026-04-24T10:00:00",
                  "view_count": 3
                }
              ],
              "note_body": "전체 note에 대한 자유 메모",
              "pdf_comments": [
                {
                  "id": "comment_001",
                  "pdf_id": "pdf_001",
                  "page": 1,
                  "comment": "첫 페이지 관련 메모",
                  "created_at": "2026-04-24T10:00:00",
                  "updated_at": "2026-04-24T10:00:00"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 8. 화면 구성

## 8.1 전체 레이아웃

```text
+-------------------------------------------------------------+
| Top Bar: Search / Current Note / Settings                   |
+----------------------+--------------------------------------+
| Sidebar              | Main Content                         |
|                      |                                      |
| Notebook Tree        | Dashboard or Note Workspace          |
|                      |                                      |
| + 상담자료            | +------------------+---------------+ |
|   + 2026             | | PDF Viewer       | Memo Panel    | |
|     - 김철수환자      | |                  |               | |
| + 연구자료            | |                  |               | |
+----------------------+--------------------------------------+
```

## 8.2 Dashboard

- 앱 실행 시 기본 화면
- 최근 열람한 note 카드
- 최근 열람한 PDF 카드
- 최근 수정한 note 카드
- 검색창
- 빠른 생성 버튼

## 8.3 Note Workspace

- 상단: note 제목, 태그, 수정일
- 중앙 왼쪽: PDF 목록 및 PDF viewer
- 중앙 오른쪽: 메모 패널
- 하단 또는 우측: 페이지별 코멘트 목록

---

## 9. MVP 범위

먼저 구현할 최소 기능은 다음과 같다.

1. Electron 앱 기본 실행
2. `index.html`, `style.js`, `scripts.js` 기반 UI 구성
3. Notebook - Chapter - Note 3단계 트리 생성/수정/삭제
4. Note에 PDF 추가
5. PDF.js로 PDF 렌더링
6. Note별 일반 메모 저장
7. PDF별 페이지 코멘트 저장
8. 검색 기능
9. 최근 열람 대시보드
10. JSON 파일 기반 로컬 저장

---

## 10. 이후 확장 기능

MVP 이후 다음 기능을 고려한다.

- PDF 본문 텍스트 추출 후 full-text search
- PDF 위 직접 highlight annotation
- PDF 특정 영역에 comment anchor 연결
- Markdown 기반 note editor
- 태그 기반 필터링
- iCloud Drive 기반 Mac/iPhone 동기화
- 자동 백업
- PDF import 시 citation metadata 추출
- BibTeX export
- lecture mode
- presentation note mode
- patient/case note mode
- passcode 또는 local encryption

---

## 11. Mac 및 iPhone 저장소 공유 고려사항

사용자가 Mac과 iPhone 모두에서 저장소를 공유하기 원한다.

가능한 접근:

### 접근 1: iCloud Drive 폴더 사용

- Electron 앱의 데이터 폴더를 iCloud Drive 내부에 위치시킨다.
- Mac에서는 쉽게 구현 가능하다.
- iPhone에서는 직접 앱 UI를 공유하기 어렵지만, PDF와 JSON 데이터는 iCloud Files 앱에서 접근 가능하다.

### 접근 2: PWA 형태

- iPhone Safari에서도 접근 가능할 수 있으나, 로컬 파일 저장과 PDF 관리에 제약이 크다.
- 완전한 오프라인 개인 자료관리 앱으로는 한계가 있다.

### 접근 3: 추후 iOS 앱 별도 개발

- 가장 안정적이지만 개발 범위가 커진다.

권장 초기 방향:

- Mac용 Electron 앱을 먼저 만든다.
- 데이터 저장 위치를 사용자가 선택할 수 있게 한다.
- iCloud Drive 폴더를 저장 위치로 선택 가능하게 한다.

---

## 12. Codex에게 요청할 구현 방식

Codex는 다음 순서로 작업한다.

1. Electron 기반 프로젝트 스캐폴딩을 생성한다.
2. 기본 파일 구조를 만든다.
3. `index.html`에 3-panel 레이아웃을 구현한다.
4. `style.js`에서 theme token을 정의하고 CSS variable로 주입한다.
5. `scripts.js`에서 UI 상태관리와 이벤트 핸들러를 구현한다.
6. `storage.js`에서 JSON 저장소 read/write 함수를 구현한다.
7. `pdf_viewer.js`에서 PDF.js 렌더링 기능을 구현한다.
8. `search.js`에서 검색 인덱스 및 검색 결과 렌더링을 구현한다.
9. `dashboard.js`에서 최근 열람·최근 수정 데이터를 계산하고 표시한다.
10. 샘플 데이터를 포함하여 앱 실행 시 바로 테스트 가능하게 한다.
11. README에 실행 방법, 빌드 방법, 데이터 저장 위치를 문서화한다.

---

## 13. 개발 시 주의사항

- 모든 기능은 인터넷 연결 없이 작동해야 한다.
- PDF.js 등 외부 라이브러리는 CDN이 아니라 로컬 dependency로 포함한다.
- 개인용 앱이므로 authentication은 구현하지 않는다.
- 다만 상담자료 등 민감 정보가 포함될 수 있으므로 추후 local encryption 가능성을 고려한 구조로 만든다.
- 데이터 손상을 방지하기 위해 저장 전 자동 백업을 만든다.
- 삭제 기능은 즉시 삭제보다 soft delete 또는 확인 modal을 사용한다.
- UI 텍스트는 하드코딩하지 말고 i18n 구조로 분리한다.
- 앱 상태와 저장 데이터 구조를 명확히 분리한다.

---

# 사용자가 결정해야 할 항목 요약

## A. 앱 실행 방식

결정 필요:

- 순수 HTML 정적 앱으로 할 것인가?
- Electron 기반 Mac 데스크톱 앱으로 할 것인가?
- Tauri 기반 경량 앱으로 할 것인가?

권장:

- Electron 기반 로컬 앱

이유:

- Mac 배포가 비교적 쉽다.
- 로컬 파일 시스템 접근이 가능하다.
- PDF 저장, JSON 저장, 백업, iCloud Drive 연동에 유리하다.

---

## B. PDF 저장 방식

결정 필요:

1. PDF를 앱 내부 저장소로 복사할 것인가?
2. 원본 파일 경로만 참조할 것인가?
3. 둘 다 지원할 것인가?

권장:

- 기본은 앱 내부 저장소 복사

---

## C. 저장소 위치

결정 필요:

- 기본 앱 데이터 폴더에 저장할 것인가?
- 사용자가 직접 저장 폴더를 선택하게 할 것인가?
- iCloud Drive 폴더를 사용할 것인가?

권장:

- 최초 실행 시 저장소 폴더 선택
- 기본 추천 위치로 iCloud Drive\Organizer 를 새로 만들어서 지정

---

## D. iPhone 연동 수준

결정 필요:

- Mac에서만 사용할 것인가?
- iPhone에서는 PDF와 데이터 파일만 열람 가능하면 되는가?
- iPhone에서도 동일한 UI로 사용해야 하는가?

권장 초기 범위:

- Mac 앱을 우선 개발
- 데이터 폴더를 iCloud Drive에 둘 수 있게 설계
- iPhone 완전 지원은 후속 버전으로 분리

---

## E. PDF 주석의 깊이

결정 필요:

1. PDF 옆에 단순 메모만 작성
2. PDF 페이지 번호별 코멘트 작성
3. PDF 위에 직접 highlight와 annotation 작성
4. 특정 문장/영역에 anchored comment 작성

권장 MVP:

- note 전체 메모
- PDF별 메모
- 페이지 번호별 코멘트

후속 기능:

- highlight annotation
- 영역 기반 comment anchor

---

## F. 검색 범위

결정 필요:

- 메타데이터와 메모만 검색할 것인가?
- PDF 본문 텍스트까지 검색할 것인가?

권장 MVP:

- Notebook, Chapter, Note, PDF 파일명, 메모, 코멘트, 태그 검색
- Prototype 이므로 이정도만 한다.
후속 기능:

- PDF 본문 text extraction 기반 full-text search

---

## G. 민감정보 보호 수준
```
결정 필요:

- 별도 보안 없이 로컬 저장만 할 것인가?
- 앱 실행 시 비밀번호를 둘 것인가?
- 저장 데이터를 암호화할 것인가?

상담자료가 포함될 경우 권장:

- MVP에서는 로컬 저장 + 사용자 책임 기반
- 후속 버전에서 local encryption과 app passcode 고려

```
일단 Prototype 에서는 별도 보안 없이 로컬 저장만 하는 것으로 가정한다.

---

## H. UI 언어

사용자는 bilingual 이므로, 한국어/영어 둘을 혼용한다. 기본적으로 한국어로 하되, Notebook 등의 고유명사로 여겨지는 항목들은 영어로 한다.

---

## I. Note 편집 형식

결정 필요:

- plain text 메모
- Markdown 메모
- rich text editor
```
권장 MVP:

- Markdown 기반 메모

이유:

- Obsidian과 유사한 사용성
- 저장 구조가 단순함
- 검색과 백업이 쉬움
```
일단은 plain text memo 로 가정하고 prototype 을 만든다.

---

## J. 대시보드 추천 기준
```
결정 필요:

- 최근 열람순
- 최근 수정순
- 자주 열람한 파일
- 날짜별 활동 기록
- 특정 notebook 우선 표시
```
권장 MVP:

- 최근 수정 note

---

## K. 백업 정책
```
결정 필요:

- 저장할 때마다 자동 백업할 것인가?
- 하루 1회 백업할 것인가?
- 최근 N개 백업만 유지할 것인가?

권장:

- 앱 실행 시 1회 백업
- 데이터 저장 전 중요한 변경이 있을 때 백업
- 최근 20개 백업 유지
```
-> 지금은 Prototype 을 만드는 중이므로, 고려하지 않는다.
---

## L. 초기 MVP 범위 확정

권장 MVP 조합:

- Electron Mac 앱
- Notebook - Chapter - Note 계층 구조
- PDF 업로드 및 로컬 복사
- PDF.js 기반 PDF viewer
- note 전체 Markdown 메모
- PDF별·페이지별 코멘트
- JSON 저장소
- 최근 열람 dashboard
- 메모/파일명/태그 검색
- 한국어 기본 UI
- iCloud Drive 저장소 선택 가능

---

# Codex에게 줄 최종 한 줄 지시 요약

Electron 기반의 오프라인 개인용 PDF note-taking 앱을 만들어줘. Notion/OneNote/Obsidian을 참고하되, Notebook-Chapter-Note 3단계 계층 구조를 지원하고, 각 note 안에 여러 PDF를 추가하여 PDF.js로 렌더링하면서 옆에 Markdown 메모와 페이지별 코멘트를 작성·저장할 수 있게 해줘. 데이터는 로컬 JSON과 PDF 파일 폴더로 저장하고, 검색 기능과 최근 열람 dashboard를 제공해줘. 개발환경은 WSL2이고 최종 배포 대상은 Mac이며, 인터넷 없이 실행되어야 하고 별도 서버나 로그인은 필요 없어. UI 예시는 "C:\EunYoungKim\Organizer\UI_Example.pdf" 와 "C:\EunYoungKim\Organizer\UI_Example.pptx" 를 참고해. 그리고, 필요한 게 있으면 python 작업을 하도록 해. (가상환경 이름 codex)


# 2026-04-24 Codex's plan for MacOS compatibility (2nd Commit)

## 1. 결론 먼저

- Windows용 `.exe`는 MacOS에서 실행할 수 없다.
- Mac에서 실행 가능한 형태는 보통 `.app` 번들이다.
- 배포용으로는 `Organizer.app`, `Organizer.dmg`, 또는 `Organizer.zip` 형태를 만든다.
- 현재 Organizer가 Electron 기반이라면, Mac용 실행 파일도 Electron 빌드 체계로 만드는 것이 가장 현실적이다.

---

## 2. Mac에서 실행 가능한 형태는 무엇인가

Mac 사용자는 일반적으로 다음 중 하나를 받는다.

### 2.1 `.app`

- 실제 실행 가능한 Mac 앱 번들이다.
- Finder에서 일반 앱처럼 더블클릭 실행한다.
- 내부적으로는 폴더 구조를 가진 bundle이지만 사용자에게는 앱처럼 보인다.

### 2.2 `.dmg`

- Mac에서 흔히 배포하는 디스크 이미지 파일이다.
- 열면 앱 아이콘을 `Applications` 폴더로 드래그해서 설치하는 방식으로 쓴다.
- 사용자 경험이 가장 익숙해서 배포용으로 많이 쓴다.

### 2.3 `.zip`

- 압축을 풀면 `.app` 파일이 나오는 방식이다.
- 테스트 배포에는 간단하지만, 최종 배포물로는 `.dmg`보다 덜 친절하다.

정리하면, Mac용 executable을 만들고 싶다면 실제 목표는 보통 `Organizer.app`을 만들고, 배포는 `Organizer.dmg` 또는 `Organizer.zip`으로 하는 것이다.

---

## 3. Windows EXE와 Mac 앱의 차이

- Windows: `Organizer.exe`
- MacOS: `Organizer.app`

즉, Windows와 Mac은 실행 파일 형식이 다르다. 하나를 만들면 둘 다 되는 구조가 아니다. 운영체제별로 따로 빌드해야 한다.

---

## 4. 지금 프로젝트에서 가장 현실적인 방식

Organizer는 Electron 기반으로 가는 것이 맞다. 그러면 Mac 대응은 다음처럼 정리하는 것이 좋다.

1. 개발은 지금처럼 HTML/CSS/JS + Electron으로 유지한다.
2. Windows용은 `electron-builder`로 `portable exe`를 만든다.
3. Mac용은 같은 `electron-builder`로 `dmg` 또는 `zip`을 만든다.
4. 실제 Mac 배포본 생성은 가능하면 Mac 기기에서 직접 빌드한다.

---

## 5. 왜 Mac에서 빌드하는 것이 좋은가

이론적으로는 다른 OS에서 cross-build를 시도할 수 있지만, Mac 앱은 다음 이유로 Mac에서 빌드하는 것이 가장 안전하다.

- code signing 절차가 Mac 기준으로 맞물린다.
- notarization은 Apple 생태계 절차를 따른다.
- 최종 실행 테스트를 같은 환경에서 바로 할 수 있다.
- WSL/Windows에서 Mac 배포본을 억지로 만드는 것보다 실패 가능성이 낮다.

실무적으로는 아래 원칙이 가장 좋다.

- Windows 배포물은 Windows에서 빌드
- Mac 배포물은 Mac에서 빌드

---

## 6. Mac에서 실행 가능한 형태로 만들기 위한 실제 절차

### 6.1 Mac에 필요한 기본 준비

Mac에서 다음이 필요하다.

- Node.js 설치
- npm 또는 pnpm 설치
- 프로젝트 소스 복사
- 필요 시 Xcode Command Line Tools 설치

보통 아래 명령으로 기본 확인을 한다.

```bash
node -v
npm -v
xcode-select -p
```

`xcode-select -p`가 실패하면 보통 다음을 실행한다.

```bash
xcode-select --install
```

---

### 6.2 Mac에서 프로젝트 실행 확인

Mac으로 프로젝트를 옮긴 뒤 먼저 개발 실행이 되는지 본다.

```bash
cd Organizer
npm install
npm start
```

이 단계에서 확인할 것:

- 앱 창이 열리는지
- 한글 UI가 정상인지
- `data/app_data.json` 저장이 되는지
- PDF 경로가 Mac에서도 정상 동작하는지

특히 Windows 경로 문자열이 코드나 데이터에 남아 있으면 Mac에서 깨질 수 있으므로, 경로 처리는 항상 상대경로 또는 `path.join()` 기반으로 유지하는 것이 좋다.

---

### 6.3 Mac 배포용 빌드 설정

`package.json`의 `build` 설정에 mac target을 추가한다. 예를 들면 다음 구조를 사용한다.

```json
{
  "build": {
    "appId": "com.eunyoungkim.organizer",
    "productName": "Organizer",
    "directories": {
      "output": "dist"
    },
    "files": [
      "index.html",
      "assets/**/*",
      "data/**/*",
      "sample/**/*",
      "src/**/*",
      "*.js",
      "package.json"
    ],
    "mac": {
      "target": [
        "dmg",
        "zip"
      ],
      "category": "public.app-category.productivity"
    }
  }
}
```

그리고 script는 예를 들어 이렇게 둔다.

```json
{
  "scripts": {
    "start": "electron .",
    "dist:win": "electron-builder --win portable",
    "dist:mac": "electron-builder --mac dmg zip"
  }
}
```

---

### 6.4 Mac에서 실제 빌드

Mac에서 아래처럼 실행한다.

```bash
npm install
npm run dist:mac
```

빌드가 끝나면 보통 `dist/` 폴더에 이런 결과물이 생긴다.

- `Organizer.app`
- `Organizer-버전.dmg`
- `Organizer-버전-mac.zip`

사용자는 보통 `.dmg`를 받아 설치한다.

---

## 7. Apple 보안 체계 때문에 추가로 알아야 하는 것

Mac은 Windows보다 배포 보안 제약이 강하다.

### 7.1 서명 없이도 개인용 테스트는 가능한가

- 가능은 하다.
- 다만 Gatekeeper 경고가 뜰 수 있다.
- 사용자가 우클릭 후 열기, 또는 시스템 설정에서 허용해야 할 수 있다.

개인용 앱을 자기 Mac에서만 쓸 경우에는 unsigned build로도 시작할 수 있다.

---

### 7.2 다른 사람에게 배포하려면 무엇이 필요한가

정식 배포 수준으로 가려면 보통 다음이 필요하다.

- Apple Developer Program 계정
- code signing certificate
- notarization 절차

이 단계까지 가야 Mac에서 “알 수 없는 개발자” 경고를 줄이고 더 자연스럽게 실행된다.

---

## 8. Organizer 기준으로 Mac 호환성에서 특히 주의할 점

### 8.1 경로 처리

- Windows의 `C:\...` 경로를 코드에 직접 박아두면 안 된다.
- `path.join()`과 상대경로를 사용해야 한다.
- PDF 저장 위치를 사용자가 선택할 수 있게 하면 Mac에서도 자연스럽다.

### 8.2 한글 폰트

- 지금은 `assets/fonts`의 Freesentation을 직접 로드하므로 Mac에서도 비교적 안정적이다.
- OS 기본 폰트에 의존하지 않는 구조를 유지하는 것이 좋다.

### 8.3 로컬 저장소 위치

개인용 Mac 앱이라면 아래 중 하나를 선택하는 것이 좋다.

- 앱 폴더 내부 `data/`
- 사용자 홈 폴더 내부 전용 데이터 폴더
- 사용자가 선택한 iCloud Drive 폴더

최종 목표가 Mac + iPhone 저장소 연계라면, 장기적으로는 사용자가 `iCloud Drive/Organizer` 같은 폴더를 저장소로 지정할 수 있게 설계하는 것이 좋다.

### 8.4 PDF 파일 접근

- Mac sandbox나 권한 이슈를 고려하면 “앱 내부 복사” 방식이 제일 단순하다.
- 원본 경로 참조 방식은 이후 단계에서 선택 옵션으로 두는 것이 더 안전하다.

---

## 9. MacOS를 모르는 사용자를 위한 가장 단순한 운영 전략

현재 사용자 입장에서는 아래 방식이 가장 단순하다.

1. 지금 Organizer를 Electron 기반으로 계속 개발한다.
2. Windows에서 기능 개발과 UI 검증을 한다.
3. Mac이 준비되면 그 Mac에서 `npm install`, `npm run dist:mac`를 실행한다.
4. 만들어진 `.dmg`를 사용해서 Mac에 설치한다.
5. 나중에 필요하면 Apple 서명 및 notarization을 붙인다.

즉, 지금 당장 해야 할 핵심은 “Mac 전용 앱 구조로 갈아엎는 것”이 아니라 “Electron 구조를 OS 독립적으로 유지”하는 것이다.

---

## 10. 권장 작업 항목

다음 작업을 차례로 진행하는 것을 권장한다.

1. `package.json`에 `dist:mac` 스크립트와 `build.mac` 설정을 추가한다.
2. 코드 전체에서 Windows 고정 경로가 없는지 점검한다.
3. PDF 및 JSON 저장 경로를 상대경로 또는 사용자 선택 경로로 정리한다.
4. Mac에서 `npm start`가 되는지 먼저 확인한다.
5. Mac에서 `npm run dist:mac`로 `.app`와 `.dmg`를 만든다.
6. 필요 시 Apple signing / notarization을 나중 단계에서 붙인다.

---

## 11. 최종 요약

- 현재 만든 Windows `.exe`는 Mac에서 실행되지 않는다.
- Mac용 실행 파일은 `.app`이며, 배포는 보통 `.dmg`로 한다.
- Organizer는 Electron 기반이므로 Mac 대응 자체는 어렵지 않다.
- 다만 Mac용 배포본은 Mac에서 직접 빌드하는 것이 가장 안전하다.
- 개인용으로 먼저 쓸 때는 unsigned `.app` 또는 `.dmg`로 시작해도 된다.

# 2026-04-24 Jiwon's Request (2rd Commit)

지금은 UI_Example.pdf 의 내용을 충실히 따르고 있지 않다.
Notion 에서 처럼, 각 Chaper side medu 에 3 horizontal dots 를 활용하여 'More...' 를 만들었으면 좋겠다. 그래서 거기서 이름 수정,  삭제 등이 가능하도록 한다. (추가 button을 화면 메인에 드러나게 하지 않는다)

그리고, Notebook / Chapter 까지만 왼쪽 navigation bar 에 보여지게 한다.
Chapter 를 클릭하면, 그 안에 있는 여러가지 Leaf pages 에 접속 가능하다.
다시 Leaf pages 를 클릭하면, 그때 비로소 여러가지 PDF를 볼 수 있다.
이때 PDF 를 포함한 모듈은 클릭하면 동적으로 크기가 늘어난다.

그리고 side bar toggle menu는 side bar에 attached 되게 한다.

기타 아이콘 등의 사양은 Notion 과 최대한 비슷하게 한다.

각 Notebook/Chaper 항목 명마다 icon을 붙일 수 있게 한다. 사용자가 지정하지 않고, 지금 당장은 그냥 임의의 연관된 유니코드 문자열이나 emoji를 삽입한다. 예를 들어 📕📙📗📘 등을 설정할 수 있게 한다.

지금의 serif 글자는 너무 못생겼다. 'NanumGothic' 등의 san serif 로 할수있도록 한다.
"C:\EunYoungKim\Organizer\assets\fonts" 경로의 폰트들을 참조하여도 된다. 
글씨 크기도 웬만하면 조금씩 줄인다.

지금, Leaf pages 의 PDF에 comment 를 남긴 경우, 그 comment 의 위치 (Page 1)을 클릭하면 해당 page 로 PDF viewer 의 위치를 이동시킬 수 있도록 한다.

github.com/jiwon-baek 에 EunyoungKim 이라는 private repo를 만들고 main 에 push 한다.
"C:\EunYoungKim\index.html" 를 github pages 로 호스팅되도록 만든다.

---

# 2026-04-24 Claude's plan (3rd Commit)

## 작업 우선순위 요약

아래 8개 항목을 순서대로 구현한다. 각 항목은 독립적으로 커밋 가능하지만, 1→2→3→4 순서를 지켜야 상태(state) 충돌이 없다.

---

## 1. 폰트 교체 (style.js)

**문제**: Freesentation이 로드 실패 시 브라우저 기본 serif로 fallback되어 못생겨 보임.

**해결책**: NanumGothic TTF 파일을 `assets/fonts/` 에 추가한다.

- Python(venv: codex)으로 NanumGothic TTF 파일을 GitHub(google/fonts 또는 naver/nanumfont)에서 다운로드하여 `assets/fonts/NanumGothic.ttf`, `NanumGothicBold.ttf` 로 저장한다.
- `style.js`의 `@font-face` 블록에 NanumGothic을 추가한다.
- `theme.fonts.ui` 값을 `"'NanumGothic', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"` 로 변경한다.
- 전체 base font-size를 `13px`로 줄이고, sidebar 항목은 `12px`, 본문 텍스트는 `13px`로 통일한다.

---

## 2. Sidebar 구조 변경 (scripts.js)

**현재**: sidebar에 Notebook → Chapter → Note 3단계가 모두 표시됨.

**목표**: sidebar에 Notebook → Chapter 2단계만 표시. Note(Leaf page)는 메인 영역에서 표시.

### 2.1 상태(state) 추가

`scripts.js` 상단의 상태 변수에 아래를 추가한다:

```js
let selectedChapterId = null;   // 현재 선택된 Chapter ID
let selectedNotebookId = null;  // 현재 선택된 Notebook ID
```

`currentView`의 가능한 값을 `"dashboard"`, `"chapter"`, `"note"` 세 가지로 명시한다.

### 2.2 sidebar 렌더링 함수 수정

- 기존에 Note 항목을 렌더링하던 루프를 제거한다.
- Chapter 항목을 `<li>` 로 렌더링할 때 클릭 이벤트를 `setSelectedChapter(chapterId)` 로 연결한다.
- `setSelectedChapter()` 함수를 추가한다:

```js
async function setSelectedChapter(notebookId, chapterId) {
  selectedNotebookId = notebookId;
  selectedChapterId = chapterId;
  selectedNoteId = null;
  currentView = "chapter";
  render();
}
```

### 2.3 Chapter 뷰 렌더링 함수 추가

`renderChapterView(chapter)` 함수를 추가한다:

- UI_Example 1번째 스크린샷처럼 Chapter 이름을 h1으로 상단에 표시한다.
- 그 아래 Note 목록을 테이블/리스트 형태로 표시한다.
- 각 행: `[아이콘] [Note 제목]` 형태, 클릭 시 `setSelectedNote(noteId)` 호출.
- Note에 `icon` 필드가 없으면 기본값 `📄` 사용.

---

## 3. 3-dot 컨텍스트 메뉴 (scripts.js + style.js)

**목표**: sidebar의 각 Notebook/Chapter 항목에 hover 시 `···` 버튼이 나타나고, 클릭 시 dropdown 메뉴가 표시됨.

### 3.1 HTML 구조

각 sidebar 항목을 아래 구조로 렌더링한다:

```html
<li class="sidebar-item" data-id="...">
  <span class="item-icon">📕</span>
  <span class="item-label">상담자료</span>
  <button class="more-btn" title="더보기">···</button>
</li>
```

### 3.2 CSS (style.js에 추가)

```css
.more-btn {
  display: none;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--muted);
}
.sidebar-item:hover .more-btn {
  display: inline-block;
}
.more-btn:hover {
  background: var(--surfaceAlt);
}
.context-menu {
  position: absolute;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 200;
  min-width: 140px;
  padding: 4px 0;
}
.context-menu-item {
  padding: 7px 14px;
  cursor: pointer;
  font-size: 13px;
}
.context-menu-item:hover {
  background: var(--surfaceAlt);
}
```

### 3.3 컨텍스트 메뉴 동작

- `showContextMenu(event, type, id)` 함수를 추가한다. `type`은 `"notebook"` 또는 `"chapter"`.
- 메뉴 항목:
  - Notebook: `이름 수정`, `삭제`, `Chapter 추가`
  - Chapter: `이름 수정`, `삭제`, `Leaf page 추가`
- 메뉴 외부 클릭 시 닫힘 (document click listener).
- `이름 수정` 클릭 시 `prompt()` 로 새 이름 입력 → data 업데이트 → persistData() → render().
- `삭제` 클릭 시 `confirm()` 확인 modal → data에서 제거 → persistData() → render().
- **기존의 메인 화면에 드러난 추가/삭제 버튼은 모두 제거한다.**

---

## 4. Emoji 아이콘 (scripts.js + storage.js)

### 4.1 데이터 구조 변경

`storage.js`의 초기 샘플 데이터에서 각 Notebook과 Chapter에 `icon` 필드를 추가한다:

```json
{ "id": "notebook_001", "title": "상담자료", "icon": "💬", ... }
{ "id": "chapter_001", "title": "2025",     "icon": "📅", ... }
```

기본 Notebook 아이콘 후보: 💬 📚 🧪 🎓 📋 🏥 📝 🔬  
기본 Chapter 아이콘 후보: 📅 🗂️ 📁 📂 🗓️ 🔖

### 4.2 신규 생성 시 아이콘 자동 할당

Notebook/Chapter 신규 생성 시 랜덤 emoji를 자동 지정한다:

```js
const NOTEBOOK_ICONS = ['💬','📚','🧪','🎓','📋','🏥','📝','🔬'];
const CHAPTER_ICONS  = ['📅','🗂️','📁','📂','🗓️','🔖'];
function pickIcon(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}
```

### 4.3 아이콘 변경 UI (간단 버전)

3-dot 메뉴에 `아이콘 변경` 항목을 추가한다. 클릭 시 emoji picker 대신 `prompt()` 로 emoji 입력받아 저장한다. (본격 picker는 추후 확장)

---

## 5. Sidebar toggle 위치 변경 (scripts.js + style.js)

**현재**: toggle 버튼이 sidebar와 분리되어 있음.

**목표**: UI_Example처럼 toggle 버튼이 sidebar의 오른쪽 엣지에 붙어있음.

### CSS 변경

```css
#sidebar {
  position: relative;  /* 이미 있을 수 있음, 확인 필요 */
}
#sidebar-toggle {
  position: absolute;
  right: -14px;         /* sidebar 오른쪽 경계 밖으로 살짝 돌출 */
  top: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 1px 4px var(--shadow);
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}
```

sidebar가 닫혔을 때는 toggle 버튼만 남고 `>` 화살표가 표시된다.

---

## 6. PDF 카드 accordion 확장 (scripts.js + style.js)

**현재**: Note 선택 시 PDF viewer가 바로 전체 표시됨.

**목표**: Note 선택 시 PDF들이 접힌 카드 목록으로 표시되고, 카드 클릭 시 아래로 동적으로 펼쳐짐.

### 6.1 상태 추가

```js
let expandedPdfId = null;  // 현재 펼쳐진 PDF ID
```

### 6.2 카드 렌더링

UI_Example 2번째 스크린샷처럼:

```html
<div class="pdf-card" data-pdf-id="pdf_001">
  <div class="pdf-card-header">
    <span class="pdf-title">PDF_1.pdf</span>
    <span class="pdf-comment-count">16 comments</span>
  </div>
  <div class="pdf-card-body" style="display: none;">
    <!-- PDF viewer + comment panel -->
  </div>
</div>
```

### 6.3 accordion 토글

- `pdf-card-header` 클릭 시 `expandedPdfId` 업데이트 → render() 재호출.
- 이미 열린 카드를 클릭하면 닫힘 (toggle).
- CSS `max-height` + `transition` 으로 부드러운 확장 애니메이션 적용.

### 6.4 카드 내부 레이아웃

UI_Example 2번째 스크린샷처럼:
- 왼쪽: PDF viewer (페이지 이동 `<< 1/32 >>`)
- 오른쪽: 코멘트 패널 (각 코멘트 상단에 `Page X, line Y` 링크 표시)
- 우하단: `+` FAB 버튼 (코멘트 추가)

---

## 7. 코멘트 Page 클릭 → PDF 페이지 이동 (scripts.js + pdf_viewer.js)

**현재**: 코멘트의 페이지 정보가 텍스트로만 표시됨.

**목표**: `Page 4, line 15` 를 클릭하면 PDF viewer가 해당 페이지로 이동.

### 7.1 pdf_viewer.js 수정

`goToPage(viewerState, pageNum)` 함수가 없다면 추가한다:

```js
export function goToPage(viewerState, pageNum) {
  if (!viewerState || !viewerState.pdfDoc) return;
  const clipped = Math.max(1, Math.min(pageNum, viewerState.totalPages));
  viewerState.currentPage = clipped;
  renderPdfFrame(viewerState);
}
```

### 7.2 scripts.js 수정

코멘트 렌더링 시 페이지 정보를 클릭 가능한 링크로 만든다:

```html
<span class="comment-page-link" data-page="4">Page 4, line 15</span>
```

이벤트 위임(event delegation)으로 `.comment-page-link` 클릭 감지 → `goToPage(viewerState, page)` 호출 → `renderPdfFrame()` 재실행.

---

## 8. GitHub 작업

### 8.1 EunyoungKim private repo 생성 및 push

```bash
# C:\EunYoungKim 디렉토리에서
cd /mnt/c/EunYoungKim
git remote add origin https://github.com/jiwon-baek/EunyoungKim.git
git push -u origin main
```

`gh` CLI 또는 GitHub API로 private repo를 먼저 생성한다:

```bash
gh repo create jiwon-baek/EunyoungKim --private --source=. --remote=origin --push
```

### 8.2 GitHub Pages 설정 (C:\EunYoungKim\index.html)

`C:\EunYoungKim\index.html` 은 현재 EunYoungKim 프로필 사이트이다. 이것을 GitHub Pages로 호스팅한다.

- repo settings에서 Pages 활성화: Branch `main`, folder `/` (root)
- `gh api repos/jiwon-baek/EunyoungKim/pages` 로 확인
- Pages URL: `https://jiwon-baek.github.io/EunyoungKim/`

**주의**: Organizer 앱은 Electron 기반이므로 GitHub Pages 호스팅 대상이 아니다. Pages에 올라가는 것은 `C:\EunYoungKim\index.html` (프로필 사이트)만 해당한다.

---

## 구현 순서 요약

| 순서 | 항목 | 파일 |
|------|------|------|
| 1 | 폰트 교체 + 크기 조정 | `style.js`, `assets/fonts/` |
| 2 | Sidebar 2단계 구조 + Chapter 뷰 | `scripts.js` |
| 3 | 3-dot 컨텍스트 메뉴 | `scripts.js`, `style.js` |
| 4 | Emoji 아이콘 | `scripts.js`, `storage.js` |
| 5 | Sidebar toggle 위치 | `scripts.js`, `style.js` |
| 6 | PDF 카드 accordion | `scripts.js`, `style.js` |
| 7 | 코멘트 페이지 클릭 이동 | `scripts.js`, `pdf_viewer.js` |
| 8 | GitHub repo + Pages | shell / gh CLI |


# 2026-04-24 Jiwon's Request (4th Commit)

1. 지금은 검색기능이 되고 있는거 같지 않다. 검색 창에 실제로 단어를 입력하고 엔터를 누르면 (자동완성 등은 지원하지 않음) 관련된 단어가 포함된 leaf pages / chapters / notebooks 를 순서대로 나열하는 검색결과 페이지를 만든다.

2. 내비게이션 메뉴 토글용 버튼이 누르고 나면 가장 오른쪽으로 이동한다. 이것을 수정해서, 토글버튼이 가장 왼쪽에 작게 표시되게 하라.

3. '이름 변경' / 'Leaf page 추가' / '아이콘 변경' / '+ 새 Notebook' 기능을 추가로 개발하라.

4. leaf page 의 '메모' 의 '이름 변경' 메뉴가 작동하지 않는듯 하라. 이를 없애라.

5. '+ PDF 추가' 기능을 개발하라. Local storage 에서 선택할 수 있게 하라.

