/**
 * Migration script: Convert existing Firestore prompts to the new schema.
 *
 * Changes applied per document:
 * 1. era: Korean string → EraKey (e.g. '조선시대' → 'joseon')
 * 2. category: Korean string → CategoryKey (e.g. '건축' → 'architecture')
 * 3. title: string → { ko: title }
 * 4. keywords: copied from tags (lowercased)
 * 5. status: 'published' (default)
 * 6. isFeatured: false
 * 7. bookmarkCount: 0
 * 8. difficulty: 'beginner'
 * 9. storagePath added to generations (null for existing)
 *
 * Usage:
 *   npx tsx scripts/migrate-prompts.ts [--dry-run]
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin env vars.
 */

import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ---- Mappings (same as src/types/prompt.ts ERA_TO_KOREAN / CATEGORY_TO_KOREAN reversed) ----

const KOREAN_TO_ERA: Record<string, string> = {
  '전체': 'all',
  '선사시대': 'prehistoric',
  '고조선': 'gojoseon',
  '삼국시대': 'threeKingdoms',
  '남북국시대': 'northSouth',
  '고려시대': 'goryeo',
  '조선시대': 'joseon',
  '대한제국': 'koreanEmpire',
  '일제강점기': 'japaneseOccupation',
  '현대': 'modern',
};

const KOREAN_TO_CATEGORY: Record<string, string> = {
  '전체': 'all',
  '전쟁': 'war',
  '문화': 'culture',
  '인물': 'people',
  '건축': 'architecture',
  '예술': 'art',
  '생활': 'dailyLife',
  '정치': 'politics',
};

// ---- Init Firebase Admin ----

function initAdmin() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    initializeApp({ credential: applicationDefault(), projectId });
  }
}

// ---- Main ----

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('=== DRY RUN MODE (no writes) ===\n');
  }

  initAdmin();
  const db = getFirestore();

  // --- Migrate prompts ---
  console.log('Fetching all prompts...');
  const promptsSnap = await db.collection('prompts').get();
  console.log(`Found ${promptsSnap.size} prompts.\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  const batch = db.batch();
  let batchCount = 0;
  const MAX_BATCH = 500;

  for (const doc of promptsSnap.docs) {
    const data = doc.data();

    // Skip if already migrated (title is already a map)
    if (typeof data.title === 'object' && data.title !== null && !Array.isArray(data.title)) {
      console.log(`  SKIP ${doc.id} — already migrated`);
      skippedCount++;
      continue;
    }

    // Convert era
    const eraKey = KOREAN_TO_ERA[data.era] || data.era;
    if (!KOREAN_TO_ERA[data.era] && !Object.values(KOREAN_TO_ERA).includes(data.era)) {
      console.warn(`  WARN ${doc.id} — unknown era: "${data.era}", keeping as-is`);
    }

    // Convert category
    const categoryKey = KOREAN_TO_CATEGORY[data.category] || data.category;
    if (!KOREAN_TO_CATEGORY[data.category] && !Object.values(KOREAN_TO_CATEGORY).includes(data.category)) {
      console.warn(`  WARN ${doc.id} — unknown category: "${data.category}", keeping as-is`);
    }

    // Build update
    const update: Record<string, unknown> = {
      title: { ko: data.title },
      era: eraKey,
      category: categoryKey,
      keywords: (data.tags || []).map((t: string) => t.toLowerCase()),
      status: 'published',
      isFeatured: false,
      bookmarkCount: 0,
      difficulty: 'beginner',
    };

    console.log(`  MIGRATE ${doc.id}`);
    console.log(`    title: "${data.title}" → { ko: "${data.title}" }`);
    console.log(`    era: "${data.era}" → "${eraKey}"`);
    console.log(`    category: "${data.category}" → "${categoryKey}"`);
    console.log(`    keywords: [${update.keywords}]`);

    if (!dryRun) {
      batch.update(doc.ref, update);
      batchCount++;

      // Firestore batches limited to 500
      if (batchCount >= MAX_BATCH) {
        await batch.commit();
        console.log(`  Committed batch of ${batchCount} writes.`);
        batchCount = 0;
      }
    }

    migratedCount++;
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
    console.log(`  Committed final batch of ${batchCount} writes.`);
  }

  console.log(`\n--- Prompts summary ---`);
  console.log(`  Migrated: ${migratedCount}`);
  console.log(`  Skipped:  ${skippedCount}`);
  console.log(`  Total:    ${promptsSnap.size}`);

  // --- Migrate generations (add storagePath if missing) ---
  console.log('\nFetching generations without storagePath...');
  const gensSnap = await db.collection('generations').get();
  let genMigrated = 0;

  const genBatch = db.batch();
  let genBatchCount = 0;

  for (const doc of gensSnap.docs) {
    const data = doc.data();
    if (data.storagePath !== undefined) continue;

    if (!dryRun) {
      genBatch.update(doc.ref, { storagePath: null });
      genBatchCount++;

      if (genBatchCount >= MAX_BATCH) {
        await genBatch.commit();
        genBatchCount = 0;
      }
    }
    genMigrated++;
  }

  if (!dryRun && genBatchCount > 0) {
    await genBatch.commit();
  }

  console.log(`  Generations updated with storagePath: ${genMigrated}`);
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
