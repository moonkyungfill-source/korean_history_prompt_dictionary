/**
 * Centralized selectors for E2E tests.
 * Maps semantic names to Playwright locator strategies.
 */

export const header = {
  logo: 'header a[href="/"]',
  promptsLink: 'header nav >> text=',  // append translated text
  dashboardLink: 'header nav >> text=',
  galleryLink: 'header nav >> text=',
  loginLink: 'header >> text=',
  signupLink: 'header >> text=',
  userMenuButton: 'button[aria-label="User menu"]',
  userMenu: '[role="menu"]',
  logoutButton: '[role="menuitem"]:has-text("")',  // append translated text
  creditBadge: 'header a[href*="/credits"]',
  localeSwitcher: 'button[aria-label="Change language"]',
  localeDropdown: 'button[aria-label="Change language"] + div',
  hamburgerButton: 'button[aria-label="Toggle menu"]',
  mobileMenu: 'header .md\\:hidden nav',
} as const;

export const auth = {
  emailInput: '#email',
  passwordInput: '#password',
  confirmPasswordInput: '#confirmPassword',
  displayNameInput: '#displayName',
  submitButton: 'button[type="submit"]',
  googleButton: 'button:has(svg)',
  errorMessage: '.bg-red-50',
  signupLink: 'a[href*="/signup"]',
  loginLink: 'a[href*="/login"]',
} as const;

export const prompts = {
  grid: '.grid',
  card: 'a[href*="/prompts/"]',
  searchInput: 'input[type="text"]',
  loadMoreButton: 'button:has-text("")',  // append translated text
  noResults: '.text-center',
  eraBadge: '.bg-blue-100',
  categoryBadge: '.bg-purple-100',
} as const;

export const promptDetail = {
  title: 'h1',
  eraBadge: '.bg-blue-100',
  categoryBadge: '.bg-purple-100',
  promptText: '.font-mono',
  copyButton: 'button:has-text("")',  // append translated text
  generateButton: 'button:has-text("")',
  confirmDialog: '.bg-blue-50',
  confirmButton: '.bg-blue-50 button.bg-blue-600',
  cancelButton: '.bg-blue-50 button:not(.bg-blue-600)',
  errorMessage: '.bg-red-50',
  purchaseLink: 'a[href*="/credits/purchase"]',
  generatedImage: 'img[alt]',
  downloadLink: 'a[download]',
} as const;

export const gallery = {
  grid: '.grid',
  card: '.bg-white.rounded-xl',
  statusBadge: '.rounded-full',
  statusCompleted: '.bg-green-100',
  statusFailed: '.bg-red-100',
  statusProcessing: '.bg-yellow-100',
  downloadLink: 'a:has-text("")',
  emptyState: '.text-center',
  loadMoreButton: 'button',
} as const;

export const credits = {
  balanceCard: '.bg-gradient-to-r',
  balanceAmount: '.text-4xl',
  purchaseButton: 'a[href*="/credits/purchase"]',
  transactionHistory: 'h2',
} as const;

export const purchase = {
  packageCard: '.border',
  selectedPackage: '.border-blue-500',
  paymentWidget: '#payment-widget',
  payButton: 'button:not([type="submit"])',
  errorMessage: '.bg-red-50',
} as const;

export const payment = {
  successIcon: '.bg-green-100',
  failIcon: '.bg-red-100',
  title: 'h1',
  promptsLink: 'a[href*="/prompts"]',
  dashboardLink: 'a[href*="/dashboard"]',
  retryLink: 'a[href*="/credits/purchase"]',
} as const;
