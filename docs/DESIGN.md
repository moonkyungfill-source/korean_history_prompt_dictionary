# Korean History Prompt Dictionary — Design Document

## 1. Service Overview

A multilingual web service that provides curated AI image-generation prompts based on Korean history. Users browse/copy prompts for free and spend credits to generate images via Google Imagen.

**Target audience**: Users across 7 locales (ko, en, ja, zh, vi, th, id).

**Tech stack**: Next.js 16 (App Router) + Firebase (Auth, Firestore, Storage) + next-intl + Tailwind CSS + TossPayments.

---

## 2. Architecture

```
Browser
  ├─ Next.js App Router (SSR + Client Components)
  │   ├─ [locale]/prompts       → prompt list (cursor pagination)
  │   ├─ [locale]/prompts/[id]  → prompt detail + image generation
  │   ├─ [locale]/generations   → user gallery (cursor pagination)
  │   ├─ [locale]/dashboard     → user stats
  │   └─ [locale]/credits/*     → credit purchase flow
  │
  ├─ API Routes (server-side, Firebase Admin SDK)
  │   ├─ /api/generate-image    → spend credits + call Imagen + store result
  │   ├─ /api/bookmarks         → add/remove bookmark
  │   ├─ /api/auth/create-user  → user creation (transactional)
  │   └─ /api/payments/*        → TossPayments integration
  │
  └─ Firebase
      ├─ Auth (email + Google)
      ├─ Firestore (data)
      └─ Storage (generated images)
```

---

## 3. Firestore Collection Schema

### 3.1 `prompts/{promptId}`

| Field          | Type                      | Description                                 |
|----------------|---------------------------|---------------------------------------------|
| id             | string                    | Document ID                                 |
| title          | map<string, string>       | Localized titles: `{ ko: "...", en: "..." }` |
| era            | string (EraKey)           | e.g. `'joseon'`, `'goryeo'`                 |
| category       | string (CategoryKey)      | e.g. `'architecture'`, `'war'`              |
| promptText     | string                    | The actual prompt text (English)            |
| thumbnailUrl   | string \| null            | Pre-generated thumbnail URL                 |
| tags           | string[]                  | Display tags                                |
| keywords       | string[]                  | Lowercased, for `array-contains` search     |
| usageCount     | number                    | Times used for generation                   |
| status         | `'draft'` \| `'published'` | Only published prompts are visible          |
| isFeatured     | boolean                   | Featured on homepage                        |
| bookmarkCount  | number                    | Total bookmarks                             |
| difficulty     | `'beginner'` \| `'intermediate'` \| `'advanced'` | Prompt complexity |
| createdAt      | Timestamp                 | Creation time                               |

### 3.2 `generations/{generationId}`

| Field          | Type                      | Description                                 |
|----------------|---------------------------|---------------------------------------------|
| id             | string                    | Document ID                                 |
| uid            | string                    | Owner user ID                               |
| promptId       | string                    | Source prompt                                |
| promptText     | string                    | Snapshot of prompt text at generation time   |
| status         | `'pending'` \| `'processing'` \| `'completed'` \| `'failed'` | |
| imageUrl       | string \| null            | Public URL of generated image               |
| storagePath    | string \| null            | Firebase Storage path                       |
| creditsCharged | number                    | Credits spent                               |
| createdAt      | Timestamp                 | When generation was requested               |
| completedAt    | Timestamp \| null         | When generation finished                    |

### 3.3 `users/{uid}`

| Field          | Type                      | Description                                 |
|----------------|---------------------------|---------------------------------------------|
| uid            | string                    | Firebase Auth UID                           |
| email          | string                    | User email                                  |
| displayName    | string \| null            | Display name                                |
| photoURL       | string \| null            | Profile photo URL                           |
| creditBalance  | number                    | Current credit balance                      |
| createdAt      | Timestamp                 | Account creation time                       |
| updatedAt      | Timestamp                 | Last update time                            |

### 3.4 `users/{uid}/transactions/{txId}`

| Field          | Type                      | Description                                 |
|----------------|---------------------------|---------------------------------------------|
| id             | string                    | Transaction ID                              |
| type           | `'purchase'` \| `'spend'` \| `'refund'` | Transaction type             |
| creditsBefore  | number                    | Balance before                              |
| creditsAfter   | number                    | Balance after                               |
| creditsDelta   | number                    | Change amount (+/-)                         |
| description    | string                    | Type code: `'credit_purchase'`, `'image_generation'`, `'welcome_bonus'`, `'generation_failed_refund'` |
| promptId?      | string                    | (spend only) Related prompt                 |
| generationId?  | string                    | (spend/refund) Related generation           |
| packageId?     | string                    | (purchase only) Credit package ID           |
| amountKRW?     | number                    | (purchase only) Payment amount              |
| paymentKey?    | string                    | (purchase only) TossPayments key            |
| orderId?       | string                    | (purchase only) Order ID                    |
| createdAt      | Timestamp                 | Transaction time                            |

### 3.5 `users/{uid}/bookmarks/{promptId}`

| Field          | Type                      | Description                                 |
|----------------|---------------------------|---------------------------------------------|
| promptId       | string                    | Bookmarked prompt ID                        |
| promptSnapshot | map                       | `{ title, era, thumbnailUrl }` snapshot     |
| createdAt      | Timestamp                 | When bookmarked                             |

### 3.6 `payments/{orderId}`

Server-only payment records (TossPayments integration).

---

## 4. Index Strategy

All prompt queries filter by `status == 'published'` first, then optionally by `era`, `category`, or `keywords` (array-contains), ordered by `usageCount DESC`.

**Composite indexes defined in `firestore.indexes.json`:**

| # | Fields                                              | Use case                           |
|---|-----------------------------------------------------|------------------------------------|
| 1 | `status` + `usageCount DESC`                        | All published, sorted              |
| 2 | `status` + `era` + `usageCount DESC`                | Filter by era                      |
| 3 | `status` + `category` + `usageCount DESC`           | Filter by category                 |
| 4 | `status` + `era` + `category` + `usageCount DESC`   | Filter by era + category           |
| 5 | `status` + `isFeatured` + `usageCount DESC`         | Featured prompts                   |
| 6 | `status` + `keywords` (array) + `usageCount DESC`   | Keyword search                     |
| 7 | `uid` + `createdAt DESC` (generations)               | User's generations list            |

---

## 5. Security Rules

```
prompts:     read if status == 'published'; write: server only
generations: read if auth.uid == resource.uid; write: server only
users:       read own only; write: server only
  /transactions: read own only; write: server only
  /bookmarks:    read own only; write: server only
payments:    server only
```

Key principle: **All write operations go through API routes** (Firebase Admin SDK), never from client. This prevents credit manipulation and ensures transactional consistency.

---

## 6. Query Patterns

### Prompt List (`/prompts`)
```
query(
  collection('prompts'),
  where('status', '==', 'published'),
  [where('era', '==', eraKey)],        // optional
  [where('category', '==', catKey)],    // optional
  [where('keywords', 'array-contains', keyword)], // optional
  orderBy('usageCount', 'desc'),
  limit(24),
  [startAfter(lastDoc)]                 // cursor pagination
)
```

### Prompt Detail (`/prompts/[id]`)
```
getDoc(doc('prompts', id))
// Client reads title[locale] || title['ko'] as fallback
```

### User Generations (`/generations`)
```
query(
  collection('generations'),
  where('uid', '==', uid),
  orderBy('createdAt', 'desc'),
  limit(20),
  [startAfter(lastDoc)]
)
```

### User Bookmarks
```
query(
  collection('users', uid, 'bookmarks'),
  orderBy('createdAt', 'desc'),
  limit(20)
)
```

---

## 7. Pagination Strategy

**Cursor-based pagination** using Firestore's `startAfter(lastDocumentSnapshot)`:

- Prompt list: 24 items per page
- Generation gallery: 20 items per page
- UI: "Load More" button appends next page to existing results
- Filter changes reset the cursor and reload from scratch

Advantages over offset-based:
- Consistent results as data changes
- O(1) Firestore reads (no skipping documents)
- No "page drift" when new documents are added

---

## 8. Internationalization (i18n) Strategy

### Locale Support
7 locales: `ko` (default), `en`, `ja`, `zh`, `vi`, `th`, `id`

### UI Strings
Handled by `next-intl` with per-locale JSON files in `messages/`.

### Prompt Titles
Stored as `Record<string, string>` in Firestore:
```json
{ "ko": "석굴암", "en": "Seokguram Grotto", "ja": "石窟庵" }
```
Client renders: `title[locale] || title['ko']` (Korean fallback).

### Era/Category Labels
Stored as **key strings** (`'joseon'`, `'architecture'`) in Firestore. Translated client-side via `useTranslations('eras')` / `useTranslations('categories')`.

### Transaction Descriptions
Stored as **type codes** (`'credit_purchase'`, `'image_generation'`). Translated client-side via `useTranslations('credits')`.

### Error Messages
API returns **error codes** (`'INSUFFICIENT_CREDITS'`, `'GENERATION_FAILED'`). Client maps to localized messages.

---

## 9. Payment / Credit Flow

```
User selects package → TossPayments widget → Payment confirmed
  → POST /api/payments/confirm
    → Verify with TossPayments API
    → grantCredits() in transaction:
        1. Read current balance
        2. Update balance
        3. Create transaction record
    → Return success

User generates image → POST /api/generate-image
  → Verify prompt exists & is published
  → spendCredits() in transaction:
      1. Read balance, check >= cost
      2. Deduct balance
      3. Create spend transaction
  → Call Imagen API
  → On success: upload to Storage, update generation doc
  → On failure: refundCredits() in transaction, update generation status
```

All credit operations use `runTransaction` to prevent race conditions.

---

## 10. Scalability Considerations

### Current Design (suitable for ~100K prompts, ~10K users)
- Cursor pagination prevents loading entire collections
- Composite indexes keep queries fast
- `bookmarkCount` denormalized on prompt for sort/display without aggregation

### Future Scaling Options
- **Full-text search**: Integrate Algolia/Typesense for multi-keyword, fuzzy search (Firestore `array-contains` is single-keyword only)
- **CDN caching**: Cache prompt list pages at edge for anonymous users
- **Cloud Functions**: Move image generation to async Cloud Function for longer timeouts
- **Sharding**: If write contention on popular prompts' `usageCount`, use distributed counters
- **Analytics**: Separate analytics collection for usage tracking (avoid hot documents)

---

## 11. Migration

Run `scripts/migrate-prompts.ts` to convert existing data:

```bash
# Dry run (no writes, shows what would change)
npx tsx scripts/migrate-prompts.ts --dry-run

# Execute migration
npx tsx scripts/migrate-prompts.ts
```

Changes applied:
- `era`: Korean string → EraKey
- `category`: Korean string → CategoryKey
- `title`: string → `{ ko: title }`
- `keywords`: copied from `tags` (lowercased)
- `status`: `'published'`
- `isFeatured`: `false`
- `bookmarkCount`: `0`
- `difficulty`: `'beginner'`
- `generations.storagePath`: `null` (for existing docs)
