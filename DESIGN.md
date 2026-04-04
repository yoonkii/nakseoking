# Design System — 낙서왕 (Doodle King)

## Product Context
- **What this is:** 고등학교 교실에서 선생님 몰래 낙서하는 멀티플레이어 웹 게임
- **Who it's for:** 친구들과 링크 공유로 플레이하는 10-20대 한국 유저
- **Space/industry:** 파티 게임 / 드로잉 웹 게임 (skribbl.io, Gartic Phone 계열)
- **Project type:** 모바일 우선 웹 게임 (Next.js + Vercel)

## Aesthetic Direction
- **Direction:** Playful/Retro — 2000년대 한국 플래시 게임 미학
- **Decoration level:** intentional — 노트 줄, 분필 텍스처, 칠판 나무 프레임 등 교실 세계관 구축
- **Mood:** 약간 장난꾸러기 같은, 따뜻하고 노스탤지어 느낌. "세련됨"이 아니라 "교실 낙서장"
- **Reference sites:** skribbl.io (파티 게임 로비 패턴), Newgrounds/2000년대 플래시 게임 (미학)

## Anti-Slop Rules

**DO:**
- 두꺼운 검정 아웃라인 (2-3px solid #333)
- 플랫 컬러, 그라데이션 없음
- 약간 삐뚤빼뚤한 손그림 느낌 (CSS transform: rotate(-1deg~1deg) 랜덤)
- 노트 캔버스 = 줄 노트 (수평 라인 + 빨간 세로 여백선)
- 이모지를 아바타로 사용

**DON'T:**
- box-shadow, drop-shadow
- background gradient (linear-gradient, radial-gradient)
- border-radius 8px 이상 (4px까지만)
- glassmorphism, blur, backdrop-filter
- 시스템 폰트 단독 사용 (Inter, Roboto, Arial)
- 중앙 정렬 히어로 패턴
- 카드 그리드 레이아웃
- 페이드인 스크롤 애니메이션

## Typography
- **Display/Hero:** Jua (주아) — 둥글고 귀여운 한국어 디스플레이 폰트. 게임 제목, 키워드, UI 강조 텍스트
- **Body:** Pretendard — 깔끔한 한국어 본문 폰트. UI 텍스트, 안내문, 점수, 코멘트
- **Chalk:** Gaegu (가구) — 손글씨 느낌 한국어 폰트. 칠판 위 분필 텍스트
- **Loading:** Google Fonts CDN (Jua, Gaegu) + jsDelivr CDN (Pretendard)
- **Scale:**
  - xs: 11px — 상태 텍스트, 라벨
  - sm: 13px — 보조 텍스트, 타이머
  - base: 16px — 본문, UI 텍스트
  - lg: 20px — 칠판 텍스트, 부제
  - xl: 28px — 키워드 표시
  - 2xl: 36px — 제목, 점수 강조
  - 3xl: 48px — 게임 타이틀 (낙서왕)

## Color
- **Approach:** balanced — 교실 사물에서 추출한 의미 있는 팔레트
- **Background:** #faf6e8 — 따뜻한 크림, 오래된 노트 느낌
- **Chalkboard:** #2d5a3d — 짙은 초록, 칠판
- **Frame:** #8B6914 — 나무색, 칠판 프레임
- **Canvas:** #ffffff — 흰색, 노트/종이
- **Danger:** #c0392b — 빨강, 위험/버튼/걸림
- **Safe:** #27ae60 — 초록, 안전/통과
- **Warning:** #f39c12 — 노란, 경고/TELL
- **Text:** #333333 — 기본 텍스트
- **Muted:** #999999 — 비활성/보조 텍스트
- **Line:** #e0e0e0 — 노트 줄
- **Margin:** #ffb3b3 — 노트 빨간 여백선
- **Chalk text:** #e8e8d0 — 칠판 위 분필색
- **Dark mode:** 미지원 (교실 감성은 밝은 배경에서만 작동)

## Spacing
- **Base unit:** 4px
- **Density:** comfortable — 게임이라 터치 타겟 넉넉하게
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px)

## Layout
- **Approach:** grid-disciplined — 모바일 세로 스택 기본
- **Mobile (390px):** 풀스크린 세로 배치. 칠판→키워드→캔버스→버튼→플레이어바
- **Tablet (768px+):** 중앙 정렬, max-width: 500px
- **Desktop (1024px+):** 교실 배경 전체. 캔버스 600x400px. 플레이어바 사이드바로 이동
- **Max content width:** 500px (모바일/태블릿), 900px (데스크톱)
- **Border radius:** sm: 4px (기본), md: 6px (카드/보드), full: 50% (아바타만)

## Motion
- **Approach:** intentional — 게임 상태를 강화하는 모션만
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Game-specific:**
  - SAFE→TELL: 테두리 색상 전환 (200ms ease-out)
  - TELL→DANGER: 선생님 돌아보기 (300ms ease-in-out)
  - DANGER→SAFE (안도): 초록 글로우 + "휴..." (500ms)
  - 걸림: 화면 흔들림 (150ms) + 빨간 오버레이 (200ms)
  - 엎드려 뻗쳐: bounce 애니메이션 (800ms)
  - 왕관: scale bounce (400ms)
- **prefers-reduced-motion:** 깜빡임/흔들림 비활성화. 색상 변경만으로 상태 표현

## Component Vocabulary

| 컴포넌트 | 스타일 | 사용처 |
|---------|--------|--------|
| btn-primary | bg: #c0392b, color: white, border: 3px solid #333 | 제출, 시작 |
| btn-secondary | bg: #27ae60, color: white, border: 3px solid #333 | 게임 시작 |
| btn-warning | bg: #f39c12, color: white, border: 3px solid #333 | 한 판 더 |
| btn-ghost | bg: transparent, color: #333, border: 3px solid #333 | 취소, 보조 |
| input | bg: white, border: 3px solid #333, radius: 4px | 닉네임, 방 코드 |
| alert-success | bg: #d4edda, border: 3px solid #333 | 연결 복구 |
| alert-warning | bg: #fff3cd, border: 3px solid #333 | TELL 경고 |
| alert-danger | bg: #f5c6cb, border: 3px solid #333 | 걸림 |
| alert-info | bg: #d1ecf1, border: 3px solid #333 | 채점 중 |
| player-avatar | 32x32px, border-radius: 50%, border: 2px solid #333 | 플레이어 표시 |
| chalkboard | bg: #2d5a3d, border: 4px solid #8B6914, radius: 4px | 칠판 영역 |
| notebook | bg: white, border: 3px solid #333, 줄 노트 패턴 | 드로잉 캔버스 |

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-04 | Initial design system | /design-consultation. 레트로 플래시 게임 미학, 한국 교실 세계관 기반 |
| 2026-04-04 | Jua over Cafe24Ssurround | Google Fonts CDN 로드 용이. 둘 다 둥근 한국어 폰트이지만 Jua가 웹 배포에 적합 |
| 2026-04-04 | No dark mode | 교실 감성은 밝은 배경에서만 작동. 다크모드는 게임 세계관과 충돌 |
| 2026-04-04 | No gradient, no shadow | 의도적 "세련됨 거부". 플래시 게임 미학의 핵심 |
