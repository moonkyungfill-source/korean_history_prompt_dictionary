# UX Research: Korean History Prompt Dictionary (Global Service)
## Target User Personas, User Journey & Global Needs Analysis

**Research Date:** 2026-02-21
**Service:** Korean History Prompt Dictionary (한국사 프롬프트 사전)
**Current State:** Korean-only UI, Toss Payments (Korea-only), Firebase Auth (Email + Google)

---

## Table of Contents

1. [Current Service Audit](#1-current-service-audit)
2. [Global User Personas](#2-global-user-personas)
3. [User Journey Mapping](#3-user-journey-mapping)
4. [Global User Needs Analysis](#4-global-user-needs-analysis)
5. [User Motivation Research](#5-user-motivation-research)
6. [Recommended Features for Global Users](#6-recommended-features-for-global-users)
7. [Priority Roadmap](#7-priority-roadmap)

---

## 1. Current Service Audit

### What Exists Today

| Aspect | Current State | Global Readiness |
|--------|--------------|------------------|
| **UI Language** | 100% Korean (html lang="ko") | Not ready |
| **Prompt Text** | Korean only | Not ready |
| **Auth** | Email/Password + Google OAuth | Partially ready (Google is global) |
| **Payments** | Toss Payments (KRW only) | Not ready (Korea-only provider) |
| **Pricing** | KRW denominated (1,000 / 4,500 / 8,000 KRW) | Not ready |
| **Era Categories** | Korean labels only (선사시대, 고조선, etc.) | Not ready |
| **Type Categories** | Korean labels only (전쟁, 문화, etc.) | Not ready |
| **Image Generation** | Google Imagen 3.0 via Firebase AI | Ready (global infrastructure) |
| **Storage** | Firebase Storage (Google Cloud) | Ready |
| **Error Messages** | Korean only | Not ready |

### Key Structural Observations

- **No i18n framework** -- all strings are hardcoded in Korean throughout components
- **No locale-aware routing** (e.g., /en/prompts, /ja/prompts)
- **Prompt data model** has no fields for translated titles, descriptions, or prompt text
- **Credit packages** are hardcoded with KRW pricing; no multi-currency support
- **No historical context or educational content** accompanies the prompts
- **No sharing, embedding, or social features**
- **No API for third-party developers**

---

## 2. Global User Personas

### Persona 1: "Sarah Chen" -- K-Culture Enthusiast Turned History Explorer

| Attribute | Detail |
|-----------|--------|
| **Age** | 26 |
| **Location** | Toronto, Canada |
| **Occupation** | Marketing coordinator |
| **Languages** | English (native), Mandarin (heritage), beginner Korean (from K-drama) |
| **Tech Comfort** | High -- daily social media user, uses Canva, familiar with AI tools |

**Background:**
Sarah became fascinated with Korean culture through K-dramas like *Jewel in the Palace* (대장금) and *Mr. Sunshine*. She follows K-pop groups and has started self-studying Korean on Duolingo. She watches historical dramas and wants to understand the real history behind them, but finds academic sources dry and inaccessible.

**Goals:**
- Generate visually compelling images of historical scenes she saw depicted in K-dramas
- Share AI-generated Korean historical artwork on her Instagram and TikTok
- Learn real Korean history in an engaging, visual format
- Create fan content that merges her K-drama/K-pop interests with historical themes

**Pain Points with Current Service:**
- Cannot read any UI text; would rely entirely on visual cues and layout guessing
- Toss Payments is inaccessible outside Korea (no international credit card support)
- No English historical context to distinguish drama fiction from actual history
- Prompt text is in Korean -- she cannot evaluate whether a prompt matches what she wants
- Era names (고조선, 삼국시대) mean nothing to her without translation

**Scenario:**
Sarah wants to create an image of a Joseon-era court lady in traditional hanbok for her "Historical K-drama Moments" Instagram series. She discovers the service through a Korean culture subreddit but bounces within 30 seconds because she cannot read anything on the page.

**Quote:**
*"I love Korean history but every resource is either a dry Wikipedia article or only in Korean. I want something visual and fun."*

---

### Persona 2: "Dr. James Whitfield" -- University Educator

| Attribute | Detail |
|-----------|--------|
| **Age** | 52 |
| **Location** | London, United Kingdom |
| **Occupation** | Senior Lecturer in East Asian Studies, SOAS University of London |
| **Languages** | English (native), Japanese (fluent), Korean (conversational reading) |
| **Tech Comfort** | Moderate -- uses PowerPoint, basic LMS tools, skeptical of AI but curious |

**Background:**
Dr. Whitfield has taught Korean history as part of the broader East Asian Studies curriculum for 15 years. He struggles to find quality visual materials for his lectures. Existing images are either low-resolution scans of historical paintings, copyrighted museum photographs, or anime-style interpretations that lack historical rigor. He is cautious about AI but recognizes its potential for educational illustration.

**Goals:**
- Generate historically accurate illustrations for lecture slides and course materials
- Find prompts that are vetted for historical accuracy, not just artistic quality
- Produce images that represent diverse aspects of Korean history (not just wars and kings)
- Use the service within his university's educational fair-use framework

**Pain Points with Current Service:**
- Needs English-language historical context to verify accuracy of prompts
- Cannot justify paying through Toss (institutional procurement requires invoices in GBP/USD)
- Concerned about historical accuracy -- needs to know who curated the prompts
- Wants to modify prompts (e.g., add "academic illustration style") but needs to understand the Korean prompt text first
- No licensing information for educational use of generated images

**Scenario:**
Dr. Whitfield is preparing a lecture on Goryeo-era Buddhist culture and wants to illustrate the creation of the Tripitaka Koreana. He needs 5-6 images and wants them to be consistent in style. He can read some Korean but needs English explanations of what each prompt will generate.

**Quote:**
*"I need images that I can confidently show to 200 students and say 'this is an AI interpretation based on historical sources' -- not just pretty pictures with no scholarly basis."*

---

### Persona 3: "Yuki Tanaka" -- Indie Game Developer

| Attribute | Detail |
|-----------|--------|
| **Age** | 31 |
| **Location** | Osaka, Japan |
| **Occupation** | Independent game developer (2-person studio) |
| **Languages** | Japanese (native), English (professional), Korean (basic reading from similar Hanja/Kanji) |
| **Tech Comfort** | Very high -- developer, uses Stable Diffusion, Midjourney, Unity |

**Background:**
Yuki is developing a strategy RPG set in the Three Kingdoms period of Korea (Goguryeo, Baekje, Silla). He needs concept art and reference images for character design, architecture, armor, and landscapes. He currently uses generic AI image generators but they produce culturally inaccurate results -- mixing Chinese, Japanese, and Korean elements indiscriminately. He needs Korean-history-specific prompts that an expert has crafted for accuracy.

**Goals:**
- Generate concept art reference images for Korean Three Kingdoms era
- Access curated, historically accurate prompts for architecture, armor, daily life, and weapons
- Use the service via API for batch generation (needs 100+ reference images)
- Ensure commercial licensing is clear for game development use

**Pain Points with Current Service:**
- No API access for bulk generation or integration into his workflow
- 1-credit-per-image pricing is expensive at scale (needs hundreds of images)
- No commercial licensing terms specified
- Cannot filter by sub-era within Three Kingdoms (Goguryeo vs. Baekje vs. Silla)
- Japanese-language support would be valuable; English is adequate but not preferred

**Scenario:**
Yuki needs 50 reference images of Goguryeo fortress architecture for level design. He wants to run them through the service's API, generate variations, and use them as inspiration (not final assets). The current one-by-one web UI workflow is unacceptable for his volume needs.

**Quote:**
*"Midjourney gives me generic 'Asian temple' results. I need specifically Korean -- Goguryeo tombs, Baekje tiles, Silla gold crowns. Someone who knows Korean history needs to have written these prompts."*

---

### Persona 4: "Maria Gonzalez" -- History Education YouTuber

| Attribute | Detail |
|-----------|--------|
| **Age** | 34 |
| **Location** | Mexico City, Mexico |
| **Occupation** | Full-time YouTuber (450K subscribers, history education channel in Spanish) |
| **Languages** | Spanish (native), English (fluent), no Korean |
| **Tech Comfort** | High -- video editing, thumbnail design, AI image tools, social media management |

**Background:**
Maria runs "Historia Sin Fronteras" (History Without Borders), a popular YouTube channel covering world history. Her audience has been requesting Korean history content after the global success of Netflix Korean historical dramas. She has covered Joseon briefly but lacks visual materials and deep knowledge. She needs a way to create compelling thumbnail images and in-video illustrations quickly.

**Goals:**
- Create eye-catching YouTube thumbnails featuring Korean historical scenes
- Generate illustrations for video segments (battle scenes, court life, architecture)
- Access historical background information she can use in her scripts
- Download high-resolution images suitable for 1080p/4K video
- Generate images at volume (10-15 per video, 4 videos per month)

**Pain Points with Current Service:**
- Zero Spanish support; limited English would be her fallback
- Cannot understand era categories or prompt descriptions
- Payment system unusable from Mexico (needs PayPal, international cards, or local methods)
- No historical context to help her write accurate video scripts
- Needs to understand usage rights for monetized YouTube content
- Current image resolution and format specifications are unclear

**Scenario:**
Maria is producing a 3-part series on the Imjin War (Japanese invasions of Korea, 1592-1598). She needs images of Admiral Yi Sun-sin, turtle ships, the Battle of Myeongnyang, and Japanese samurai invaders from the Korean perspective. She searches "Korean history AI images" on Google and finds the service but cannot proceed past the landing page.

**Quote:**
*"My audience wants Korean history but every time I search for visuals, I get the same 5 paintings recycled everywhere. I need fresh, unique images I can use in my videos."*

---

### Persona 5: "Park Minjun" -- Korean Diaspora Student

| Attribute | Detail |
|-----------|--------|
| **Age** | 20 |
| **Location** | Los Angeles, USA |
| **Occupation** | Undergraduate student, Asian American Studies major |
| **Languages** | English (native), Korean (heritage speaker -- conversational, limited literacy) |
| **Tech Comfort** | Very high -- digital native, uses AI tools daily, social media power user |

**Background:**
Minjun is a second-generation Korean American who grew up speaking Korean at home but attended English-language schools. He can speak Korean conversationally but reads it slowly and with difficulty. He is studying Korean history as part of his major and is working on a thesis project about visual representations of Korean history in digital media. He is also active in his university's Korean Student Association and creates content for their social media.

**Goals:**
- Generate images for academic presentations on Korean historical topics
- Create social media content for the Korean Student Association (Instagram, stories)
- Explore Korean history visually as a complement to his academic reading
- Build a personal gallery of Korean historical imagery for his thesis research
- Share generated images with classmates and professors

**Pain Points with Current Service:**
- Can partially read Korean UI but struggles with historical terminology (한자-based era names)
- Needs English translations alongside Korean to fully understand prompt content
- Payment in KRW is inconvenient; prefers USD pricing with standard US payment methods
- No citation or source information to use in academic work
- Cannot collaborate or share galleries with classmates

**Scenario:**
Minjun is preparing a presentation on the March 1st Movement (3.1 운동) for his Korean American History class. He wants dramatic, historically grounded images of the independence protests. He can sound out the Korean on the site but needs English context to confirm he is selecting the right prompts.

**Quote:**
*"I want to connect with my heritage through history, not just through food and K-pop. But my Korean reading level is like a middle schooler's -- I need some English to get through the site."*

---

### Persona 6: "Amara Osei" -- Digital Artist & Afrofuturist

| Attribute | Detail |
|-----------|--------|
| **Age** | 28 |
| **Location** | Accra, Ghana |
| **Occupation** | Freelance digital artist and illustrator |
| **Languages** | English (native), Twi, basic French |
| **Tech Comfort** | High -- Procreate, Photoshop, Midjourney, Stable Diffusion |

**Background:**
Amara is a digital artist who specializes in cross-cultural historical art. She creates pieces that draw parallels between African and Asian historical civilizations. She recently began a series comparing Ghanaian Ashanti kingdom architecture with Korean Joseon-era palaces. She uses AI-generated images as reference material and initial compositions that she then paints over digitally.

**Goals:**
- Access expertly crafted prompts for Korean historical architecture, daily life, and art
- Use generated images as base layers for her digital paintings
- Understand the historical context behind each scene to ensure respectful representation
- Find prompts organized by visual theme (architecture, textiles, ceremonies) across eras
- Commercial use rights for her artwork that incorporates AI-generated references

**Pain Points with Current Service:**
- Complete language barrier (no Korean knowledge)
- Payment infrastructure is problematic from Ghana (limited international payment options)
- Needs cultural sensitivity guidance -- she wants to represent Korean history respectfully
- Current category system does not match her cross-cultural comparison workflow
- No way to download high-resolution images suitable as painting references
- Internet connectivity in Accra can be inconsistent; needs lightweight pages

**Scenario:**
Amara is working on a commission comparing Ashanti and Joseon royal court ceremonies. She needs reference images of Joseon court rituals, royal attire, and throne room architecture. She finds the service through a digital art community but the all-Korean interface is an immediate blocker.

**Quote:**
*"I want to honor Korean history in my art, not appropriate it. I need to understand the historical significance of what I'm depicting."*

---

### Persona 7: "Prof. Kim Soojin" -- Korean Academic Researcher Abroad

| Attribute | Detail |
|-----------|--------|
| **Age** | 45 |
| **Location** | Berlin, Germany |
| **Occupation** | Professor of Korean Studies, Freie Universitat Berlin |
| **Languages** | Korean (native), German (fluent), English (fluent) |
| **Tech Comfort** | Moderate -- academic tools, basic AI familiarity, cautious about image generation |

**Background:**
Prof. Kim is a Korean national living in Germany. She teaches Korean history and culture to German and international students. She is comfortable reading the Korean UI but lives in a European financial ecosystem. She wants to use the service for creating lecture materials and for a digital humanities research project visualizing Korean historical events.

**Goals:**
- Create historically grounded visualizations for her digital humanities research
- Generate images for teaching materials used across German and international classrooms
- Evaluate prompts for historical accuracy (she has the expertise, needs the tools)
- Contribute corrections or suggestions if prompts contain historical inaccuracies
- Pay conveniently from Germany (EUR, SEPA transfer, or international credit cards)

**Pain Points with Current Service:**
- Can read Korean UI perfectly but cannot pay via Toss from Germany
- Her students (mostly German, international) cannot use the service at all
- No way to provide academic feedback on prompt accuracy
- No institutional/group licensing for classroom use
- Wants to recommend the service to students but the Korean-only barrier makes it impractical
- No export options suitable for academic publications (citation, metadata)

**Scenario:**
Prof. Kim wants to generate a series of images depicting the evolution of hanbok (Korean traditional clothing) from the Three Kingdoms period through Joseon for a comparative textiles seminar. She can use the Korean UI but cannot complete payment, and she cannot share the tool with her 30 German-speaking students.

**Quote:**
*"This is exactly what I need for my research and teaching, but I can't pay from Germany and my students can't read Korean. It's so close to being perfect."*

---

## 3. User Journey Mapping

### 3.1 Journey Stage Overview

```
DISCOVERY --> LANDING --> EXPLORATION --> REGISTRATION --> PURCHASE --> GENERATION --> MANAGEMENT --> RETURN/ADVOCATE
```

### 3.2 Detailed Journey Map

#### Stage 1: Discovery

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Search Engine | Searches "Korean history AI images" or "AI 한국사 이미지" | Korean-language meta title/description appears in results | Non-Korean speakers skip Korean-only search results entirely |
| Social Media | Sees shared image or link from another user | No Open Graph tags in English; link preview shows Korean text | Shared links appear alien to non-Korean-reading audiences |
| K-culture Community | Discovers via Reddit, Discord, or fan forum recommendation | Linked with context from recommender | Depends on community member explaining the site |
| Academic Reference | Professor or colleague recommends the tool | No institutional landing page or English overview | No way to evaluate the tool before committing time |

**Drop-off Risk:** VERY HIGH for non-Korean speakers. Estimated 90%+ bounce rate at discovery for global users due to Korean-only search presence and link previews.

**Recommended Interventions:**
- Add English (and other language) meta tags and Open Graph descriptions
- Create English-language landing page variant
- Produce English-language social media preview cards
- Submit to international AI tool directories and educational resource databases

---

#### Stage 2: Landing Page

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Hero Section | Reads value proposition | "한국사 프롬프트 사전 / 역사를 이미지로 만나다" -- entirely Korean | Non-Korean readers see meaningless text; no visual sample images |
| Feature Cards | Scans key features | Korean descriptions of Prompt Dictionary, AI Generation, Gallery | Features invisible to global users |
| Era Navigation | Browses historical eras | Korean era names with emoji icons (🏔️ 고조선, ⚔️ 삼국시대, etc.) | Era names untranslatable from visual cues alone |
| CTA Buttons | Decides to explore or register | "프롬프트 둘러보기" / "무료 회원가입" -- Korean CTAs | Global users cannot identify call-to-action purpose |

**Drop-off Risk:** CRITICAL. Even curious non-Korean visitors will leave within 10-15 seconds.

**Moments of Delight (if language barrier resolved):**
- Clean, modern UI design is universally appealing
- Era-based browsing with emoji visual cues is intuitive
- Free browsing proposition is attractive

**Recommended Interventions:**
- Language switcher in header (prominently placed)
- Hero section with sample generated images (visual value demonstration)
- Bilingual or auto-detected language display
- Universal visual cues beyond emoji (thumbnail images for eras)

---

#### Stage 3: Prompt Exploration

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Filter Bar | Filters by era and category | Korean-only filter labels (시대, 카테고리) and options | Unusable for non-Korean speakers |
| Search | Types search query | Korean placeholder "프롬프트 검색..." | Search only works with Korean terms |
| Prompt Cards | Browses prompt grid | Korean titles, Korean tags, usage counts in Korean format | Cannot evaluate prompt content |
| Prompt Detail | Views full prompt and considers generation | Korean prompt text, Korean action buttons | Cannot understand what image will be generated |

**Drop-off Risk:** HIGH. Even if users navigate to this page, they cannot meaningfully interact with content.

**Moments of Delight (if language barrier resolved):**
- Card-based visual browsing is engaging
- Thumbnail previews give visual sense of output
- Usage count provides social proof
- Copy-to-clipboard feature is convenient for power users

**Recommended Interventions:**
- Translated filter labels and category names
- Multi-language search capability
- Bilingual prompt cards (Korean + user's language)
- English descriptions of what each prompt generates (not just the raw prompt text)
- "Preview" or sample image for each prompt category

---

#### Stage 4: Registration

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Signup Page | Creates account | Korean form labels ("이메일", "비밀번호", "이름") | Non-Korean readers may guess from field types but labels are unclear |
| Google OAuth | Signs in with Google | Standard Google popup (auto-localized by Google) | This works globally -- lowest friction path |
| Post-Registration | Redirected to dashboard | Korean dashboard with credit balance and prompts | New user has 0 credits, Korean-only next steps |

**Drop-off Risk:** MODERATE. Google OAuth partially solves the registration barrier, but the email/password path is confusing in Korean. Post-registration onboarding is entirely in Korean.

**Moments of Delight:**
- Google OAuth is one-click and universally familiar
- Clean, simple registration form (when language is understood)
- Immediate access to dashboard after registration

**Recommended Interventions:**
- Translate form labels and validation messages
- Prioritize Google OAuth as primary method for global users (consider adding Apple, GitHub)
- Add a welcome/onboarding flow explaining how the service works
- Grant 3-5 free credits on registration to enable immediate first generation

---

#### Stage 5: Credit Purchase

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Purchase Page | Selects credit package | Korean labels, KRW pricing (1,000원 / 4,500원 / 8,000원) | Currency meaningless to non-Korean users; no conversion reference |
| Payment Widget | Enters payment details | Toss Payments widget (Korean payment methods only) | **COMPLETE BLOCKER** for non-Korean users -- no international cards, PayPal, or global methods |
| Confirmation | Payment processes | Korean confirmation/error messages | Cannot understand outcome |

**Drop-off Risk:** ABSOLUTE BLOCKER. 100% of non-Korean users (and many Korean users abroad) cannot complete purchase. This is the single most critical barrier to global adoption.

**Recommended Interventions:**
- Integrate Stripe (covers 135+ countries, 135+ currencies) as primary global payment provider
- Keep Toss as option for Korean domestic users
- Display prices in user's local currency (or at minimum USD/EUR/JPY alongside KRW)
- Add PayPal as alternative for markets where credit cards are less common
- Consider regional payment methods (WeChat Pay, Alipay for Chinese users; UPI for Indian users)

---

#### Stage 6: Image Generation

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Generate Button | Clicks "이미지 생성 (1 크레딧)" | Korean button label; loading state shows "생성 중..." | Global users may not understand the cost or action |
| Processing | Waits for image generation | Loading spinner, Korean status messages | No estimated wait time; Korean-only progress feedback |
| Result | Views generated image | Image appears in the prompt detail page | No option to regenerate with variations; no image editing |
| Download | Downloads image | Korean download link "다운로드" | File naming in Korean may cause issues on some systems |

**Drop-off Risk:** LOW (once users have credits, the visual nature of image generation transcends language). But getting to this point is the challenge.

**Moments of Delight:**
- Seeing a historically accurate Korean scene generated instantly is powerful
- The image appears inline, providing immediate gratification
- Download is simple and direct
- Credits are automatically refunded on generation failure (excellent UX)

**Recommended Interventions:**
- Show estimated generation time
- Add "Regenerate" / "Generate Variation" option
- Allow prompt modifications before generating
- Provide image metadata (resolution, prompt used, historical period)
- Enable batch generation (select multiple prompts)

---

#### Stage 7: Gallery Management

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Gallery View | Browses generated images | Grid layout with status badges, Korean dates | Korean status labels (완료, 실패, 처리 중) |
| Download | Downloads individual images | Per-image download links | No bulk download; no organization features |
| Management | Manages collection | Chronological list only | No folders, tags, favorites, or search within gallery |

**Drop-off Risk:** MODERATE for retention. Users who generate images successfully may not return if gallery management is too basic.

**Moments of Delight:**
- Visual grid gallery is immediately understandable
- Status indicators are clear (color-coded)
- Direct download from gallery is convenient

**Recommended Interventions:**
- Add favorites/collections for organizing images
- Enable bulk download (ZIP)
- Add sharing capabilities (direct link, embed code, social sharing)
- Enable re-generation from gallery (regenerate from the same prompt)
- Add image details panel (prompt used, era, date generated)

---

#### Stage 8: Return & Advocacy

| Touchpoint | User Action | Current Experience | Friction Points |
|-----------|-------------|-------------------|-----------------|
| Return Visit | Comes back for more generations | Dashboard shows recent work | No personalized recommendations or "new prompts" notifications |
| Sharing | Tells others about service | No built-in sharing features | Cannot easily share results or demonstrate the service to others |
| Feedback | Wants to suggest improvements | No feedback mechanism | No way to report issues, suggest prompts, or request features |

**Drop-off Risk:** HIGH for long-term retention. Without engagement loops, users may forget the service.

**Recommended Interventions:**
- Email notifications for new prompts in user's favorite eras/categories
- "Share your creation" social cards with attribution
- Community gallery (opt-in public showcase)
- Referral program (invite friends, earn credits)
- "New this week" or featured prompt highlights on dashboard

---

### 3.3 Journey Emotional Map

```
Emotion Level:

Excited  |              * (sees first image)
         |            /   \
Curious  |    *------*     *------- (gallery browsing)
         |   /                \
Neutral  |--*                  *--- (basic management)
         |                      \
Confused | * (Korean landing)    *- (no new content)
         |/                       \
Blocked  * (payment failure)       *--- (churn)
         |__________________________|
         Discovery  Generate  Manage  Return
```

---

## 4. Global User Needs Analysis

### 4.1 Language Barriers

**Severity: CRITICAL**

The current service is 100% Korean. This includes:

| Element | Current | Required for Global |
|---------|---------|-------------------|
| HTML lang attribute | `ko` | Dynamic based on user locale |
| Page titles & meta | Korean | Translated |
| Navigation labels | 프롬프트, 대시보드, 생성 갤러리, etc. | Translated |
| Form labels | 이메일, 비밀번호, etc. | Translated |
| Prompt titles | Korean | Bilingual (Korean + target language) |
| Prompt text (the actual AI prompt) | Korean | Keep Korean (it is the product) + provide English description of expected output |
| Era/Category names | Korean | Bilingual with English romanization |
| Error messages | Korean | Translated |
| Status labels | 완료, 실패, 처리 중 | Translated |
| Payment UI | Korean (Toss) | Multi-language payment flow |

**Key Insight:** The prompt text itself should remain in Korean because that is the core product value -- expertly crafted Korean-language prompts optimized for Imagen 3.0. However, every surrounding element (descriptions, UI, metadata) must be translated.

**Language Priority Ranking (by market size and interest):**

1. **English** -- universal second language, largest potential global audience
2. **Japanese** -- geographic proximity, deep cultural interest in Korean history, large gaming/art market
3. **Chinese (Simplified)** -- massive market, historical connections with Korean history
4. **Spanish** -- large global speaker population, growing K-culture interest in Latin America
5. **French** -- European/African reach, academic Korean studies programs
6. **German** -- strong Korean studies programs in German universities
7. **Vietnamese** -- historical connections, growing K-culture market
8. **Indonesian** -- largest K-culture fan base in Southeast Asia

### 4.2 Payment Preferences by Region

**Severity: CRITICAL (complete blocker)**

| Region | Preferred Methods | Current Support | Required |
|--------|-------------------|----------------|----------|
| **Korea** | Toss, Naver Pay, Kakao Pay, Korean cards | Toss (supported) | Keep Toss |
| **USA/Canada** | Credit/debit cards, Apple Pay, Google Pay | None | Stripe |
| **Europe** | SEPA, credit cards, iDEAL (NL), Bancontact (BE) | None | Stripe |
| **Japan** | Credit cards, convenience store payment, PayPay | None | Stripe + Konbini |
| **China** | WeChat Pay, Alipay | None | Stripe or direct integration |
| **Southeast Asia** | GrabPay, GCash, bank transfer, mobile wallets | None | Stripe + local methods |
| **Latin America** | PIX (Brazil), OXXO (Mexico), credit cards | None | Stripe + local methods |
| **Africa** | Mobile money (M-Pesa), bank transfer, cards | None | Stripe + Flutterwave |

**Recommended Solution:** Integrate **Stripe** as the primary global payment provider. Stripe supports 135+ currencies, dozens of local payment methods, and has a developer-friendly API compatible with Next.js. Keep Toss Payments as a Korean domestic option for its superior local UX.

**Pricing Strategy for Global Market:**

| Package | KRW (Korea) | USD (Global) | EUR (Europe) | JPY (Japan) |
|---------|-------------|-------------|-------------|-------------|
| 10 Credits | 1,000 | $0.99 | 0.89 | 150 |
| 50 Credits | 4,500 | $3.99 | 3.49 | 600 |
| 100 Credits | 8,000 | $6.99 | 6.49 | 1,050 |
| 500 Credits (new) | -- | $29.99 | 27.99 | 4,500 |

### 4.3 Cultural Sensitivity Considerations

**Severity: HIGH**

Korean history involves topics that require careful handling for a global audience:

| Topic | Sensitivity | Recommendation |
|-------|------------|----------------|
| **Japanese Colonial Period (일제강점기)** | Extremely sensitive in Korea-Japan relations | Provide factual historical context; avoid propagandistic depictions from either perspective; allow prompt text to focus on Korean resistance and suffering without demonizing modern Japan |
| **Korean War & Division** | Sensitive for both Koreas and involved nations (USA, China, USSR) | Present as historical tragedy; avoid taking political sides; focus on human experiences |
| **Three Kingdoms (inter-Korean conflict)** | Territorial disputes affect modern Korean-Chinese relations (Goguryeo controversy) | Present as Korean history per mainstream Korean historiography; note academic debates neutrally |
| **Comfort Women** | One of the most sensitive topics in East Asian relations | Handle with extreme care; focus on victims' humanity; avoid graphic depictions |
| **Joseon-era Class System** | Depicts slavery and rigid social hierarchy | Provide context about the system without glorifying it |
| **Buddhism vs. Confucianism conflicts** | Religious and philosophical tensions | Present historical context objectively |
| **Depiction of Historical Figures** | Cultural heroes may be offensive if depicted inaccurately | Note that all images are AI interpretations, not portraits |
| **Gender Roles** | Historical depictions may show patriarchal structures | Provide historical context; include prompts depicting women's contributions |

**Required Safeguards:**
- Add a disclaimer: "Images are AI-generated artistic interpretations based on historical research. They are not photographs or primary historical sources."
- Include historical context paragraphs explaining the significance and sensitivity of each topic
- Implement content moderation for generated images (Imagen 3.0 has built-in safety filters)
- Create an advisory board or credit subject matter experts who curate prompts
- Allow users to report historically inaccurate or culturally insensitive results

### 4.4 Accessibility Needs for Global Users

| Need | Current State | Required |
|------|--------------|----------|
| **Screen reader support** | No ARIA labels; Korean-only alt text | ARIA labels in user's language; descriptive alt text |
| **Keyboard navigation** | Partially functional (standard Next.js) | Full keyboard navigation, visible focus states |
| **Color contrast** | Generally good (blue/white scheme) | WCAG AA compliance audit needed |
| **Mobile responsiveness** | Tailwind responsive classes present | Test and optimize for global mobile-first markets |
| **Low bandwidth** | No image optimization; no lazy loading | Image compression, lazy loading, progressive enhancement |
| **Right-to-left (RTL)** | Not supported | Needed if Arabic or Hebrew support is planned (lower priority) |
| **Font support** | Geist font (Latin subset only) | Add CJK font loading for Korean/Japanese/Chinese display |

---

## 5. User Motivation Research

### 5.1 Why Would Non-Korean Speakers Use This Service?

**Primary Motivations by User Type:**

#### Intrinsic Motivations (Emotional/Personal)
1. **Cultural Fascination** -- K-drama, K-pop, and Korean pop culture have created a massive global audience hungry to explore deeper Korean culture. History is the next frontier after food, music, and entertainment.
2. **Heritage Connection** -- Korean diaspora (estimated 7.5 million worldwide) want to connect with ancestral history visually, especially younger generations who may not read Korean fluently.
3. **Artistic Inspiration** -- Digital artists worldwide seek diverse cultural references beyond Western and East Asian (Chinese/Japanese) tropes that dominate AI image generation.
4. **Intellectual Curiosity** -- World history enthusiasts and comparative history scholars find Korean history uniquely fascinating for its peninsular dynamics, cultural innovations, and geopolitical significance.

#### Extrinsic Motivations (Functional/Professional)
1. **Content Creation Need** -- YouTubers, bloggers, and social media creators need visual content for Korean history topics, and stock photo/illustration options are extremely limited.
2. **Educational Materials** -- Teachers and professors worldwide need quality visuals for lectures on Korean and Asian history.
3. **Game/Media Development** -- The Korean historical genre is underserved in gaming; developers need authentic reference materials.
4. **Academic Research** -- Digital humanities researchers increasingly use AI-generated visualizations to model historical scenarios.

### 5.2 Value Proposition vs. Generic AI Image Generators

| Dimension | Generic AI (Midjourney, DALL-E, etc.) | Korean History Prompt Dictionary |
|-----------|--------------------------------------|----------------------------------|
| **Historical Accuracy** | User must craft their own prompts; results often mix Chinese/Japanese/Korean elements incorrectly | Expert-curated prompts specifically designed for Korean historical accuracy |
| **Cultural Specificity** | "Korean palace" yields generic East Asian architecture | Specific prompts for Gyeongbokgung, Changdeokgung, Goryeo-era temples, etc. |
| **Effort Required** | Hours of prompt engineering to get acceptable Korean historical images | Browse, select, generate -- prompts are pre-written and optimized |
| **Educational Value** | No historical context provided | (Potential) Historical descriptions, era information, cultural significance |
| **Consistency** | Each generation requires re-prompting; inconsistent results | Same prompt produces thematically consistent results across generations |
| **Cost** | $10-60/month subscription (often underutilized) | Pay-per-use credit model ($0.07-0.10 per image) |
| **Prompt Quality** | Depends on user's prompt engineering skill | Professionally crafted prompts optimized for Imagen 3.0 |
| **Discoverability** | User must know what to search for | Organized by era and category; browseable like an encyclopedia |

**Core Value Statement:**
*"The only AI image service where Korean history experts write the prompts, so you get historically accurate results without being a prompt engineer or a Korean history scholar."*

### 5.3 Emotional and Functional Benefits

**Emotional Benefits:**
- **Wonder** -- "I can see what the Battle of Salsu might have looked like"
- **Connection** -- "I feel closer to my Korean heritage/the culture I admire"
- **Empowerment** -- "I can create Korean historical content without being an artist or a historian"
- **Discovery** -- "I'm learning about eras and events I never knew existed"
- **Pride** (for Korean diaspora) -- "I can share my ancestral history in a visually stunning way"

**Functional Benefits:**
- **Time Savings** -- No prompt engineering required; browse and generate in under 60 seconds
- **Accuracy Assurance** -- Expert-curated prompts reduce risk of cultural inaccuracy
- **Cost Efficiency** -- Pay only for what you generate vs. monthly AI subscriptions
- **Organization** -- Gallery system keeps all generated images in one place
- **Accessibility** -- No artistic skill or historical expertise required to get quality results

---

## 6. Recommended Features for Global Users

### 6.1 Multi-Language Support (Priority Tier System)

**Tier 1 -- Launch (Required for Global MVP):**
- English UI translation (all navigation, buttons, forms, error messages)
- English descriptions for every prompt (what the prompt generates, not a literal translation)
- English era and category names with Korean in parentheses
- Browser language auto-detection with manual language switcher

**Tier 2 -- Growth (3-6 months post-launch):**
- Japanese full translation
- Chinese (Simplified) full translation
- Spanish full translation
- Translated historical context descriptions

**Tier 3 -- Scale (6-12 months):**
- French, German, Vietnamese, Indonesian translations
- Community-contributed translations for additional languages
- User-contributed prompt translations (moderated)

**Technical Implementation Recommendation:**
- Adopt `next-intl` or `next-i18next` for internationalization
- Use locale-based routing (e.g., `/en/prompts`, `/ja/prompts`, `/ko/prompts`)
- Store translations in JSON files per locale
- Add `title_en`, `description_en`, etc. fields to the Firestore prompt documents
- Change `<html lang="ko">` to dynamic `<html lang={locale}>`

### 6.2 Educational Features

These features transform the service from a pure image generation tool into a Korean history learning platform, dramatically expanding the target audience:

**A. Historical Context Cards**
- For each prompt, provide a 100-200 word historical background
- Include: time period, key figures, significance, what is depicted
- Source citations from recognized Korean history references
- Available in user's selected language

**B. Era Overview Pages**
- Dedicated pages for each era (Prehistoric through Modern)
- Timeline visualization with key events
- Map showing territorial extent
- Links to related prompts within that era

**C. Guided Collections / Curated Paths**
- "Introduction to Korean History" -- 20 key scenes across all eras
- "Women in Korean History" -- prompts featuring female historical figures and women's roles
- "Korean Architecture Through the Ages" -- architectural evolution
- "Great Battles of Korean History" -- military history visual timeline
- "Everyday Life in Joseon" -- daily life and culture
- "Korean Art and Craft Heritage" -- traditional arts

**D. Glossary / Terms Reference**
- Korean historical terms with pronunciation, meaning, and context
- Linked to relevant prompts
- Helpful for both language learners and history students

### 6.3 Social and Sharing Features

**A. Image Sharing**
- One-click social sharing (Twitter/X, Instagram, Facebook, Pinterest, Reddit)
- Auto-generated share cards with attribution watermark
- Embed codes for blogs and websites
- Direct link sharing with preview

**B. Community Gallery**
- Opt-in public gallery where users can showcase their favorite generations
- Upvoting/favoriting community images
- "Most popular this week" showcase on landing page
- Collections curated by community members

**C. User Profiles**
- Public profile option showing user's shared gallery
- Badge system (history enthusiast levels, number of eras explored)
- "Collections" -- themed groups of generated images

**D. Collaboration**
- Share collections with specific users (for classroom use)
- Team accounts (for content creation teams)
- Instructor mode (professor creates assignments, students generate images)

### 6.4 API Access for Developers

**Target Users:** Game developers, app developers, educational platform builders, content automation

**A. REST API**
- `GET /api/v1/prompts` -- list prompts with filtering (era, category, tags)
- `GET /api/v1/prompts/:id` -- get prompt details
- `POST /api/v1/generate` -- generate image from prompt ID
- `GET /api/v1/generations/:id` -- check generation status and retrieve image
- `GET /api/v1/eras` -- list all eras with metadata
- `GET /api/v1/categories` -- list all categories

**B. API Pricing**
- Free tier: 10 API calls/day (prompt browsing only, no generation)
- Developer tier: $19.99/month -- 100 generations/month + unlimited browsing
- Business tier: $99.99/month -- 1,000 generations/month + priority queue + commercial license

**C. SDKs**
- JavaScript/TypeScript SDK (primary)
- Python SDK (for data science and research use)
- Unity plugin (for game developers)

**D. Webhook Support**
- Generation completion notifications
- New prompt availability notifications

### 6.5 Additional Global Features

**A. Prompt Customization**
- "Modify this prompt" -- allow users to adjust style, composition, and focus
- Style presets: "Academic illustration", "Dramatic cinematic", "Watercolor traditional", "Game concept art"
- Aspect ratio selection (16:9, 1:1, 9:16 for social media, 4:3 for presentations)

**B. Subscription Plans (alongside credits)**
- Free: Browse all prompts, 3 free generations per month
- Standard ($4.99/month): 50 generations/month, gallery, download
- Pro ($14.99/month): 200 generations/month, API access, batch generation, commercial license
- Educational ($9.99/month per institution): Classroom features, bulk accounts, presentation mode

**C. Advanced Search**
- Full-text search across translated descriptions
- Visual similarity search ("more like this")
- Filter by image style, aspect ratio, color palette
- Search by historical figure name
- Search by historical event name

**D. Export & Integration**
- Bulk download as ZIP with metadata CSV
- Google Slides integration (insert directly into presentation)
- PowerPoint export
- Notion embed support
- Canva integration

---

## 7. Priority Roadmap

### Phase 1: Global Foundation (Weeks 1-6)

**Goal:** Remove the two critical blockers -- language and payment.

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Integrate i18n framework (next-intl) | P0 | Large | Critical |
| English UI translation (all components) | P0 | Medium | Critical |
| Integrate Stripe for global payments | P0 | Large | Critical |
| Multi-currency pricing (USD, EUR, JPY) | P0 | Medium | Critical |
| Add English meta tags & Open Graph | P0 | Small | High |
| English prompt descriptions (start with top 50 prompts) | P0 | Medium | High |
| Welcome credits for new signups (3 free) | P1 | Small | High |
| Browser language auto-detection | P1 | Small | Medium |

### Phase 2: Global Growth (Weeks 7-14)

**Goal:** Make the service valuable and retainable for international users.

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Historical context for each prompt (English) | P0 | Large | High |
| Japanese full UI translation | P1 | Medium | High |
| Chinese (Simplified) full UI translation | P1 | Medium | High |
| Social sharing features | P1 | Medium | High |
| Era overview/educational pages | P1 | Large | Medium |
| Subscription plans | P1 | Large | Medium |
| Image regeneration / variation feature | P2 | Medium | Medium |
| Aspect ratio selection | P2 | Small | Medium |

### Phase 3: Platform Expansion (Weeks 15-24)

**Goal:** Build community, API, and advanced features.

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Community gallery (public showcase) | P1 | Large | High |
| REST API v1 | P1 | Large | High |
| Spanish full UI translation | P1 | Medium | Medium |
| Curated collections / guided paths | P2 | Medium | Medium |
| Classroom/team accounts | P2 | Large | Medium |
| Advanced search (visual similarity) | P2 | Large | Medium |
| Prompt customization (style presets) | P2 | Medium | Medium |
| Google Slides / PowerPoint integration | P3 | Medium | Low |
| JavaScript/Python SDKs | P3 | Large | Low |

---

## Appendix: Competitive Landscape

| Competitor | Strengths | Weaknesses vs. This Service |
|-----------|-----------|----------------------------|
| **Midjourney** | Best general image quality; large community | No Korean history expertise; generic prompts; expensive subscription |
| **DALL-E (ChatGPT)** | Easy to use; conversational interface | No curated historical prompts; accuracy depends on user's knowledge |
| **Stable Diffusion** | Free/open source; highly customizable | Requires technical skill; no historical prompt library |
| **Adobe Firefly** | Professional tool chain integration | No historical specialization; subscription-based |
| **Historical stock photo sites** | Actual photographs and paintings | Very limited Korean history coverage; expensive licensing; no AI generation |

**Competitive Advantage:** No competing service combines expert-curated Korean historical prompts with on-demand AI generation. The service occupies a unique niche at the intersection of Korean history education and AI image generation.

---

## Appendix: Key Metrics to Track

| Metric | Definition | Target |
|--------|-----------|--------|
| **Global Registration Rate** | Non-Korean signups / total signups | >40% within 6 months of English launch |
| **Language Distribution** | % users by UI language selection | Track to inform translation priorities |
| **Payment Conversion (Global)** | % of international registered users who purchase credits | >8% |
| **Generation Satisfaction** | User ratings of generated images (if implemented) | >4.0/5.0 |
| **Return Rate** | % users who generate images in 2+ separate sessions | >35% |
| **Prompt Browse-to-Generate Rate** | % of prompt views that lead to generation | >15% |
| **Share Rate** | % of generations shared socially (when sharing is implemented) | >10% |
| **Content Creator Acquisition** | # of YouTubers/bloggers using the service regularly | 50+ in first year |
| **Educational Adoption** | # of educational institutions using the service | 20+ in first year |
| **API Developer Signups** | # of developers using the API | 100+ in first year |
