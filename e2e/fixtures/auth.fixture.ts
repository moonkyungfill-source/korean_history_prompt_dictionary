import { test as base, Page } from '@playwright/test';

const MOCK_USER = {
  uid: 'test-user-001',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  photoURL: null,
  creditBalance: 15,
};

async function injectFirebaseAuthMock(page: Page, user: typeof MOCK_USER | null) {
  await page.addInitScript((mockUser) => {
    // Mock Firebase Auth
    (window as any).__FIREBASE_AUTH_MOCK__ = mockUser;

    // Intercept Firebase Auth module
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url;

      // Mock create-user API call that AuthProvider makes
      if (url.includes('/api/auth/create-user') && mockUser) {
        return new Response(JSON.stringify({ message: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return originalFetch(input, init);
    };
  }, user);

  // Mock Firebase Auth onAuthStateChanged and related
  await page.addInitScript((mockUser) => {
    // Create mock user object matching Firebase User interface
    const createMockFirebaseUser = () => {
      if (!mockUser) return null;
      return {
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        emailVerified: mockUser.emailVerified,
        isAnonymous: mockUser.isAnonymous,
        photoURL: mockUser.photoURL,
        getIdToken: async () => 'mock-id-token-for-testing',
        getIdTokenResult: async () => ({
          token: 'mock-id-token-for-testing',
          claims: {},
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          expirationTime: new Date(Date.now() + 3600000).toISOString(),
          signInProvider: 'password',
        }),
        reload: async () => {},
        toJSON: () => mockUser,
        // Stubs for Firebase User interface
        metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
        providerData: [{ providerId: 'password', uid: mockUser.email, displayName: mockUser.displayName, email: mockUser.email, phoneNumber: null, photoURL: null }],
        providerId: 'firebase',
        refreshToken: 'mock-refresh-token',
        tenantId: null,
        delete: async () => {},
        phoneNumber: null,
      };
    };

    // Store for onAuthStateChanged callbacks
    (window as any).__FIREBASE_AUTH_CALLBACKS__ = [];
    (window as any).__FIREBASE_MOCK_USER__ = createMockFirebaseUser();

    // Override Firebase modules via module interception
    const originalDefineProperty = Object.defineProperty;
    let firebaseAuthModule: any = null;

    // Patch after Firebase loads
    const patchFirebase = () => {
      const user = (window as any).__FIREBASE_MOCK_USER__;

      // Override onAuthStateChanged
      if ((window as any).__patchedFirebaseAuth__) return;
      (window as any).__patchedFirebaseAuth__ = true;

      const origImport = (window as any).__importOriginal__;

      // Intercept all script modules to patch Firebase
      const observer = new MutationObserver((mutations) => {
        // Look for Firebase auth global
        if (typeof (window as any).firebase !== 'undefined') {
          const auth = (window as any).firebase.auth?.();
          if (auth && !auth.__mocked__) {
            auth.__mocked__ = true;
            const origOnAuthStateChanged = auth.onAuthStateChanged.bind(auth);
            auth.onAuthStateChanged = (callback: any) => {
              setTimeout(() => callback(user), 10);
              return () => {};
            };
          }
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    };

    // Run patch attempt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchFirebase);
    } else {
      patchFirebase();
    }
  }, user);

  // Route-level mocking for Firestore real-time listener (credit balance)
  if (user) {
    // Mock Firestore REST API calls for credit balance
    await page.route('**/google.firestore.v1.Firestore/Listen/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          targetChange: { targetChangeType: 'NO_CHANGE' },
        }),
      });
    });

    // Mock Firestore channel/RPC calls
    await page.route('**/google.firestore.v1.Firestore/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });
  }
}

export type AuthFixtures = {
  authenticatedPage: Page;
  unauthenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await injectFirebaseAuthMock(page, MOCK_USER);

    // Mock the Firebase Auth state at the network level
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [{
            localId: MOCK_USER.uid,
            email: MOCK_USER.email,
            displayName: MOCK_USER.displayName,
            emailVerified: true,
          }],
        }),
      });
    });

    // Mock Firestore document fetches for the user doc
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const url = route.request().url();
      if (url.includes(`users/${MOCK_USER.uid}`)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            fields: {
              uid: { stringValue: MOCK_USER.uid },
              email: { stringValue: MOCK_USER.email },
              displayName: { stringValue: MOCK_USER.displayName },
              creditBalance: { integerValue: String(MOCK_USER.creditBalance) },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    // Mock the token refresh endpoint
    await page.route('**/securetoken.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          expires_in: '3600',
          token_type: 'Bearer',
          refresh_token: 'mock-refresh-token',
          id_token: 'mock-id-token',
          user_id: MOCK_USER.uid,
          project_id: 'mock-project',
        }),
      });
    });

    await use(page);
  },

  unauthenticatedPage: async ({ page }, use) => {
    await injectFirebaseAuthMock(page, null);

    // Block Firebase auth endpoints to ensure no auth
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: [] }),
      });
    });

    await use(page);
  },
});

export { MOCK_USER };
export { expect } from '@playwright/test';
