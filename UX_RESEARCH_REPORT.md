# UX Research Report: Korean History Prompt Dictionary
## Global Service Comprehensive Analysis

**Date:** 2026-02-21
**Service:** Korean History Prompt Dictionary (한국사 프롬프트 사전)
**Research Team:** 4 Parallel Research Agents

---

## Executive Summary

한국사 프롬프트 사전은 **전 세계적으로 경쟁자가 없는 독보적인 니치**를 차지하고 있습니다. 역사적으로 정확한 큐레이션 프롬프트 + 원클릭 AI 이미지 생성을 결합한 서비스는 글로벌에 존재하지 않습니다. 그러나 현재 상태로는 글로벌 서비스로 작동할 수 없는 **4가지 절대적 블로커**가 있습니다:

1. **100% 한국어 UI** - i18n 프레임워크 부재, 모든 문자열 하드코딩
2. **한국 전용 결제** - 토스페이먼츠만 지원, 해외 사용자 결제 불가
3. **모바일 내비게이션 없음** - `hidden md:flex`로 모바일에서 네비 완전 숨김
4. **SEO 부재** - 프롬프트 상세 페이지가 클라이언트 렌더링, 검색엔진 노출 불가

---

## 1. Competitive Analysis (경쟁사 분석)

### 1.1 시장 포지션: 독보적 니치

| 서비스 | 프롬프트 라이브러리 | AI 이미지 생성 | 특정 국가 역사 특화 | 원클릭 생성 |
|--------|:-:|:-:|:-:|:-:|
| **한국사 프롬프트 사전** | O | O | O | O |
| Midjourney | X | O | X | X |
| DALL-E | X | O | X | X |
| Leonardo AI | 커뮤니티 | O | X | X |
| Sakana AI (일본 우키요에) | X | O | O (일본) | X |
| PromptBase | O (판매) | X | X | X |

**핵심 인사이트**: 메이저 플랫폼들은 의도적으로 큐레이션 프롬프트 라이브러리를 제공하지 않아, 서드파티 마켓(PromptBase 등)이 생겨났습니다. 본 서비스의 큐레이션 + 생성 통합은 어떤 메이저 플랫폼도 네이티브로 제공하지 않는 차별점입니다.

### 1.2 가격 경쟁력

| 패키지 | 크레딧 | 가격 (KRW) | 이미지당 비용 (USD) | API 비용 | 마진 |
|--------|--------|-----------|-------------------|---------|------|
| 10 크레딧 | 10 | 1,000 | ~$0.072 | ~$0.03 | ~58% |
| 50 크레딧 | 50 | 4,500 | ~$0.065 | ~$0.03 | ~54% |
| 100 크레딧 | 100 | 8,000 | ~$0.058 | ~$0.03 | ~48% |

**VS 경쟁사**: Stable Diffusion API ($0.003) < Imagen 4 Fast ($0.02) < **본 서비스 ($0.058-0.072)** < Midjourney ($0.02-0.10/구독) < GPT Image High ($0.167-0.25)

**가격 포지셔닝**: 이미지당 가격은 경쟁사 대비 중간 수준이나, 전문가 큐레이션 프롬프트의 지적 가치를 포함하고 있어 합리적입니다. 글로벌 가격은 USD 기반으로 재설계 필요.

### 1.3 글로벌 가격 전략 제안

| 패키지 | 크레딧 | USD 가격 | KRW 가격 | 이미지당 |
|--------|--------|---------|---------|---------|
| Starter | 10 | $0.99 | 1,000 | $0.099 |
| Standard | 50 | $3.99 | 4,500 | $0.080 |
| Pro | 100 | $6.99 | 8,000 | $0.070 |
| Bulk | 500 | $29.99 | - | $0.060 |
| 구독 (월) | 200 | $9.99 | - | $0.050 |

---

## 2. Global User Personas (글로벌 타겟 유저)

### 7개 핵심 페르소나

| # | 이름 | 유형 | 위치 | 핵심 니즈 | 현재 블로커 |
|---|------|------|------|----------|-----------|
| 1 | **Sarah Chen** (26) | K-Culture 팬 | 토론토, 캐나다 | K-드라마 역사 장면 이미지 생성 | 한국어 UI, 결제 불가 |
| 2 | **Dr. James Whitfield** (52) | 대학 교수 | 런던, 영국 | 강의 자료용 역사 일러스트 | 영어 맥락 정보, 기관 결제 |
| 3 | **Yuki Tanaka** (31) | 인디 게임 개발자 | 오사카, 일본 | 삼국시대 컨셉아트 대량 생성 | API 미제공, 대량 할인 없음 |
| 4 | **Maria Gonzalez** (34) | 역사 유튜버 (45만 구독) | 멕시코시티 | 영상 썸네일 및 일러스트 | 스페인어/영어 지원, 결제 |
| 5 | **Park Minjun** (20) | 재미교포 학생 | LA, 미국 | 학업 발표용 역사 이미지 | 한자 용어 어려움, USD 결제 |
| 6 | **Amara Osei** (28) | 디지털 아티스트 | 아크라, 가나 | 비교문화 역사 아트 레퍼런스 | 완전한 언어 장벽, 결제 |
| 7 | **Prof. Kim Soojin** (45) | 해외 한국인 교수 | 베를린, 독일 | 강의 자료 + 학생과 공유 | 한국어 OK, 유럽 결제 불가 |

### 주요 인사이트

- **K-Culture 연결고리**: K-드라마, K-팝을 통해 한국 역사에 관심을 갖게 된 글로벌 팬층이 1차 타겟
- **교육 시장**: 대학 동아시아학과, K-12 역사 교사 → 기관 고객 가능성
- **콘텐츠 크리에이터**: 유튜버, 블로거 → 높은 볼륨 사용, 유료 전환 가능성 높음
- **게임/아트 개발자**: API 접근 + 대량 할인 필요, B2B 매출 채널

---

## 3. UI/UX Audit (현재 코드 감사)

### 3.1 P0 - 글로벌 서비스 블로커

#### i18n 프레임워크 부재
- `layout.tsx:24` - `<html lang="ko">` 하드코딩
- 30+ 컴포넌트에 100+ 한국어 문자열 인라인 하드코딩
- `next-intl`, `react-i18next` 등 i18n 라이브러리 미설치
- 날짜 포맷 `'ko-KR'` 하드코딩 (generations, transactions)
- 에라/카테고리 필터 한국어 전용 (`types/prompt.ts`)

#### 한국 전용 결제
- `@tosspayments/tosspayments-sdk` 만 설치
- `creditPackages.ts` - `priceKRW` 필드명, 원화 전용
- 해외 사용자 결제 수단 0개

#### 모바일 내비게이션 없음
- `Header.tsx:31` - `<nav className="hidden md:flex">` → 768px 이하 네비 완전 숨김
- 햄버거 메뉴, 모바일 드로어 없음
- 모바일 사용자는 프롬프트, 대시보드, 갤러리 접근 불가

#### SEO 부재
- `prompts/[id]/page.tsx` - `'use client'`로 클라이언트 렌더링 → 검색엔진 빈 페이지
- OG 태그, Twitter Card, 구조화 데이터 없음
- `sitemap.xml`, `robots.txt` 없음
- 메타데이터 한국어 전용

### 3.2 P1 - 중요 UX 이슈

| 이슈 | 파일 | 설명 |
|------|------|------|
| 다크모드 깨짐 | `globals.css:15-20` | CSS 변수 정의됨, 컴포넌트는 `bg-white` 하드코딩 |
| 페이지네이션 없음 | `PromptList.tsx` | 모든 프롬프트 한번에 로딩, 갤러리도 동일 |
| 검색 디바운스 없음 | `prompts/page.tsx:22` | 매 키입력마다 Firestore 쿼리 재실행 |
| `<img>` 사용 | PromptCard, 갤러리 등 | Next.js `<Image>` 미사용, 최적화/lazy loading 없음 |
| 드롭다운 외부클릭 | `Header.tsx:71-89` | 외부 클릭시 메뉴 안닫힘 |
| 비밀번호 찾기 없음 | `LoginForm.tsx` | "Forgot password?" 링크 없음 |
| 이메일 인증 없음 | `SignupForm.tsx` | 가입 후 이메일 확인 없음 |
| ARIA 레이블 없음 | 전체 | 드롭다운, 스피너, 배지 등 접근성 미비 |
| 크레딧 확인 없음 | `prompts/[id]` | 결제 행위에 확인 다이얼로그 없음 |
| Firebase 에러 노출 | LoginForm, SignupForm | `auth/user-not-found` 등 기술 에러 직접 표시 |

### 3.3 P2 - 개선 필요

- 신규 유저 온보딩/무료 크레딧 없음 (가입 시 `creditBalance: 0`)
- 터치 타겟 44px 미만 (필터 버튼 `py-1.5`, 아바타 `w-8 h-8`)
- 생성 이미지 alt 텍스트 "Generated" 일괄 사용
- 브레드크럼 네비게이션 없음
- 이용약관/개인정보 처리방침 페이지 없음
- `download` 속성 cross-origin 미작동 (Firebase Storage)
- 필터 상태 URL 미반영 (뒤로가기/공유 시 초기화)
- 한국어 전용 폰트 미로드 (Geist Sans = Latin only)
- 역사/문화적 브랜드 디자인 아이덴티티 없음 (범용 SaaS 디자인)

---

## 4. Global UX Best Practices (글로벌 UX 권장사항)

### 4.1 AI 이미지 생성 UX

| 현재 | 권장 |
|------|------|
| 읽기 전용 프롬프트 | 프롬프트 수정 가능한 textarea |
| 작은 스피너 + "생성 중..." | 스켈레톤 애니메이션 + 예상 시간 표시 |
| 단일 이미지 생성 | 생성 후 변형/재생성 옵션 |
| 개인 갤러리만 | 프롬프트별 커뮤니티 갤러리 |
| 다운로드만 | 소셜 공유 + 다운로드 |

### 4.2 크레딧 이코노미 UX

- **가입 시 무료 3-5 크레딧 제공** (전환율 3배 향상 연구 결과)
- 크레딧 사용 전 확인 다이얼로그: "1 크레딧이 사용됩니다. 잔액: X 크레딧. 계속하시겠습니까?"
- 잔액 부족 경고 배너 (3 크레딧 이하)
- 크레딧 차감 애니메이션
- 가격 페이지 "Most Popular" / "Best Value" 배지

### 4.3 i18n 우선순위 언어

| 순위 | 언어 | 이유 |
|------|------|------|
| 1 | 한국어 (현재) | 기본, 국내 사용자 |
| 2 | **영어** | 글로벌 기본, 최대 잠재 시장 |
| 3 | **일본어** | 문화적 친밀성, 공유 역사, K-컬처 대시장 |
| 4 | **중국어 (간체)** | 공유 역사, 대규모 시장 |
| 5 | 스페인어 | 대규모 인터넷 인구, 남미 K-컬처 성장 |
| 6 | 중국어 (번체) | 대만, 홍콩 |
| 7+ | 베트남어, 태국어 | 동남아 한류 성장 |

### 4.4 글로벌 결제

- **Stripe 통합** (해외 사용자): Visa, Mastercard, Apple Pay, Google Pay
- **Toss 유지** (국내 사용자): 현재 토스페이먼츠
- **지역별 결제**: 일본(편의점 결제), 중국(Alipay/WeChat Pay)
- **PPP 가격** (구매력 기반): 인도/동남아 0.4x, 남미 0.6x, 미국/EU/일본 1.0x
- **Stripe Adaptive Pricing**: 자동 지역 가격 조정 (신흥시장 고객 확보 45% 증가)

### 4.5 교육/문화 UX

- **역사적 맥락** 섹션 추가: 각 프롬프트에 2-3 문단의 역사 설명
- **인터랙티브 타임라인**: 시대별 프롬프트를 시간순으로 배치
- **스토리 경로**: "고구려의 흥망" 같은 내러티브 시퀀스
- **컬렉션 시스템**: "조선시대 12장면 중 3/12 완료" 게이미피케이션
- **일일 추천 프롬프트**: "오늘의 역사 장면"

---

## 5. Implementation Roadmap (구현 로드맵)

### Phase 1: Global Foundation (1-6주) - 글로벌 기반

| 우선순위 | 항목 | 임팩트 | 난이도 |
|---------|------|--------|--------|
| P0 | `next-intl` 설치 + 영어 번역 | Very High | Medium |
| P0 | Stripe 결제 통합 (해외용) | Very High | Medium |
| P0 | 모바일 햄버거 메뉴 | High | Low |
| P0 | 가입 시 무료 5 크레딧 | Very High | Low |
| P1 | OG 태그 + 소셜 공유 메타데이터 | High | Low |
| P1 | 프롬프트 상세 SSR 전환 (SEO) | High | Medium |
| P1 | 크레딧 사용 확인 다이얼로그 | High | Low |
| P1 | 이미지 생성 로딩 UX 개선 | High | Low |

### Phase 2: Content & Experience (7-14주) - 콘텐츠 강화

| 우선순위 | 항목 | 임팩트 | 난이도 |
|---------|------|--------|--------|
| P1 | 역사적 맥락 섹션 (프롬프트) | High | Medium |
| P1 | 일본어, 중국어 번역 | High | Medium |
| P1 | 프롬프트 수정 기능 | Medium | Low |
| P2 | 커뮤니티 갤러리 | Medium | Medium |
| P2 | 검색 디바운스 + 페이지네이션 | Medium | Low |
| P2 | 다크모드 수정 | Medium | Low |
| P2 | 접근성 (ARIA, 키보드 네비) | Medium | Medium |

### Phase 3: Growth & Scale (15-24주) - 성장

| 우선순위 | 항목 | 임팩트 | 난이도 |
|---------|------|--------|--------|
| P2 | 구독 플랜 ($9.99/월) | Medium | Medium |
| P2 | PPP 지역 가격 | Medium | Medium |
| P2 | 게이미피케이션 (컬렉션, 배지) | Medium | Medium |
| P3 | REST API 공개 (개발자용) | Medium | High |
| P3 | 블로그/콘텐츠 마케팅 | Medium | High |
| P3 | 인터랙티브 타임라인 | Medium | High |
| P3 | 이메일 마케팅 자동화 | Medium | High |

---

## 6. Key Strategic Recommendations (핵심 전략 권장)

### 6.1 즉시 실행 (Quick Wins)

1. **가입 시 무료 5 크레딧** - `create-user/route.ts`에서 `creditBalance: 5`로 변경 (코드 1줄)
2. **크레딧 사용 확인 다이얼로그** - 생성 버튼에 confirm 추가
3. **모바일 햄버거 메뉴** - Header 컴포넌트 수정
4. **OG 메타 태그** - layout.tsx에 추가
5. **드롭다운 외부 클릭 닫기** - Header useEffect 추가

### 6.2 단기 (1-2개월)

1. **`next-intl` + 영어 지원** - 글로벌 진출의 전제조건
2. **Stripe 통합** - 해외 결제의 전제조건
3. **프롬프트 상세 페이지 SSR** - SEO의 전제조건

### 6.3 중기 (3-6개월)

1. **일본어/중국어 지원** - 문화적 친밀성이 높은 시장
2. **역사적 맥락 콘텐츠** - 교육적 가치 차별화
3. **커뮤니티 갤러리** - 소셜 증거 + 유기적 성장

### 6.4 시장 기회

| 기회 | 예상 임팩트 | 설명 |
|------|-----------|------|
| **한국 에듀테크 시장** | 매우 높음 | $7.54B 시장, 정부의 AI 디지털 교과서 정책 |
| **글로벌 한류 팬층** | 높음 | K-드라마 사극 시청자 → 역사 이미지 수요 |
| **콘텐츠 크리에이터** | 높음 | 유튜버, 블로거 → 상업 라이선스 프리미엄 |
| **박물관/기관 파트너십** | 중간 | 국립중앙박물관, 해외 한국문화원 |
| **다국가 역사 확장** | 중간 | 플랫폼 아키텍처를 일본사, 중국사 등으로 복제 |

---

## 7. Conclusion

한국사 프롬프트 사전은 **큐레이션 역사 프롬프트 + AI 이미지 생성**이라는 글로벌에서 경쟁자가 없는 독보적 포지션을 보유하고 있습니다. 기술적 인프라(Firebase, Google Cloud, Imagen 3.0)는 이미 글로벌 레디이나, 사용자 대면 레이어(UI 언어, 결제, SEO)가 한국 전용입니다.

**가장 임팩트가 큰 3가지 즉시 조치:**
1. 영어 지원 (i18n) → 글로벌 시장 해제
2. Stripe 통합 → 글로벌 결제 해제
3. 무료 크레딧 → 가입 전환율 3x 향상

이 3가지만 해결하면 글로벌 서비스로의 전환이 가능합니다.

---

## Sources

### Competitive Analysis
- [Sakana AI Evo-Ukiyoe](https://huggingface.co/SakanaAI/Evo-Ukiyoe-v1)
- [Midjourney Pricing 2025](https://www.gamsgo.com/blog/midjourney-price)
- [Leonardo AI Pricing](https://therightgpt.com/leonardo-ai-guide/pricing/)
- [AI Image Generation Cost Comparison](https://www.imagine.art/blogs/ai-image-generation-cost)
- [PromptBase Marketplace](https://promptbase.com/)
- [South Korea EdTech Market](https://www.trade.gov/market-intelligence/south-korea-education-technology)

### UX Best Practices
- [Nielsen Norman Group: Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)
- [UserGuiding: AI Tools Onboarding](https://userguiding.com/blog/how-top-ai-tools-onboard-new-users)
- [Metronome: AI Credits Pricing](https://metronome.com/blog/the-rise-of-ai-credits)
- [Stripe: Adaptive Pricing](https://docs.stripe.com/payments/currencies/localize-prices/adaptive-pricing)

### Internationalization
- [next-intl Documentation](https://next-intl.dev/)
- [Phrase: UI Design for Multilingual Apps](https://phrase.com/blog/posts/ui-design-principles/)
- [Shopify: i18n Best Practices](https://shopify.engineering/internationalization-i18n-best-practices-front-end-developers)
- [Smartling: Internationalization Guide](https://www.smartling.com/blog/i18n)

### Cultural Heritage
- [ScienceDirect: Gamifying Cultural Heritage](https://www.sciencedirect.com/science/article/pii/S2772503024000367)
- [National Museum of Korea e-Museum](https://www.emuseum.go.kr/)
- [Heritage Connection Korea](https://heritageconnection.co.kr/about_en.html)
