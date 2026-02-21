import { Page } from '@playwright/test';

export interface ApiMockOptions {
  generateImage?: 'success' | 'insufficient_credits' | 'failed' | 'prompt_not_published';
  confirmPayment?: 'success' | 'error';
  createOrder?: 'success' | 'error';
}

export async function setupApiMocks(page: Page, options: ApiMockOptions = {}) {
  // Mock create-user endpoint
  await page.route('**/api/auth/create-user', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'User document ready' }),
    });
  });

  // Mock generate-image endpoint
  await page.route('**/api/generate-image', (route) => {
    const scenario = options.generateImage || 'success';

    switch (scenario) {
      case 'success':
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            generationId: 'gen-test-001',
            imageUrl: 'https://placehold.co/512x512/png?text=Generated+Image',
            status: 'completed',
          }),
        });
        break;
      case 'insufficient_credits':
        route.fulfill({
          status: 402,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'INSUFFICIENT_CREDITS' }),
        });
        break;
      case 'failed':
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'GENERATION_FAILED' }),
        });
        break;
      case 'prompt_not_published':
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'PROMPT_NOT_PUBLISHED' }),
        });
        break;
    }
  });

  // Mock create-order endpoint
  await page.route('**/api/payments/create-order', (route) => {
    const scenario = options.createOrder || 'success';

    if (scenario === 'success') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 'order-test-001',
          amount: 1000,
          orderName: '10 크레딧 패키지',
        }),
      });
    } else {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Order creation failed' }),
      });
    }
  });

  // Mock confirm payment endpoint
  await page.route('**/api/payments/confirm', (route) => {
    const scenario = options.confirmPayment || 'success';

    if (scenario === 'success') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Payment confirmed',
          credits: 10,
        }),
      });
    } else {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Payment confirmation failed' }),
      });
    }
  });

  // Mock bookmarks endpoint
  await page.route('**/api/bookmarks', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'ok' }),
    });
  });
}

export async function mockFirestorePrompts(page: Page, prompts: any[]) {
  // Mock Firestore REST calls for prompts collection
  await page.route('**/firestore.googleapis.com/**/prompts**', (route) => {
    const documents = prompts.map((p) => ({
      name: `projects/mock/databases/(default)/documents/prompts/${p.id}`,
      fields: {
        title: {
          mapValue: {
            fields: Object.fromEntries(
              Object.entries(p.title).map(([k, v]) => [k, { stringValue: v }])
            ),
          },
        },
        era: { stringValue: p.era },
        category: { stringValue: p.category },
        promptText: { stringValue: p.promptText },
        tags: { arrayValue: { values: p.tags.map((t: string) => ({ stringValue: t })) } },
        keywords: { arrayValue: { values: (p.keywords || []).map((k: string) => ({ stringValue: k })) } },
        usageCount: { integerValue: String(p.usageCount) },
        thumbnailUrl: p.thumbnailUrl ? { stringValue: p.thumbnailUrl } : { nullValue: null },
        status: { stringValue: p.status || 'published' },
        isFeatured: { booleanValue: p.isFeatured || false },
        bookmarkCount: { integerValue: String(p.bookmarkCount || 0) },
      },
      createTime: '2025-01-01T00:00:00Z',
      updateTime: '2025-01-01T00:00:00Z',
    }));

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents }),
    });
  });
}

export async function mockFirestoreGenerations(page: Page, generations: any[]) {
  await page.route('**/firestore.googleapis.com/**/generations**', (route) => {
    const documents = generations.map((g) => ({
      name: `projects/mock/databases/(default)/documents/generations/${g.id}`,
      fields: {
        uid: { stringValue: g.uid },
        promptId: { stringValue: g.promptId },
        promptText: { stringValue: g.promptText },
        status: { stringValue: g.status },
        imageUrl: g.imageUrl ? { stringValue: g.imageUrl } : { nullValue: null },
        creditsCharged: { integerValue: String(g.creditsCharged) },
        createdAt: { timestampValue: new Date(g.createdAt.seconds * 1000).toISOString() },
      },
    }));

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents }),
    });
  });
}

export async function mockFirestoreTransactions(page: Page, transactions: any[]) {
  await page.route('**/firestore.googleapis.com/**/transactions**', (route) => {
    const documents = transactions.map((t) => ({
      name: `projects/mock/databases/(default)/documents/users/test-user-001/transactions/${t.id}`,
      fields: {
        type: { stringValue: t.type },
        creditsBefore: { integerValue: String(t.creditsBefore) },
        creditsAfter: { integerValue: String(t.creditsAfter) },
        creditsDelta: { integerValue: String(t.creditsDelta) },
        description: { stringValue: t.description },
        createdAt: { timestampValue: new Date(t.createdAt.seconds * 1000).toISOString() },
      },
    }));

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents }),
    });
  });
}
