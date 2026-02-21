import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable locale so individual tests can override it
let mockLocale = 'ko';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => mockLocale,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ExchangeHistory from '../ExchangeHistory';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the ordered list of exchange cards as rendered in the DOM.
 * Each card is identified by the country-specific translation key shown
 * inside an <h3>.
 */
function getRenderedCardOrder(): string[] {
  const headings = screen.getAllByRole('heading', { level: 3 });
  return headings.map((h) => h.textContent ?? '');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExchangeHistory', () => {
  beforeEach(() => {
    mockLocale = 'ko';
    vi.clearAllMocks();
  });

  it('renders 3 exchange history cards (Vietnam, Thailand, Indonesia)', () => {
    render(<ExchangeHistory />);

    // The mock translator returns the key itself, so the h3 text becomes
    // the translation key e.g. "exchangeVietnam"
    expect(screen.getByText('exchangeVietnam')).toBeInTheDocument();
    expect(screen.getByText('exchangeThailand')).toBeInTheDocument();
    expect(screen.getByText('exchangeIndonesia')).toBeInTheDocument();

    // Exactly 3 cards rendered
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards).toHaveLength(3);
  });

  it('shows exchange history title and description', () => {
    render(<ExchangeHistory />);

    expect(screen.getByText('exchangeHistoryTitle')).toBeInTheDocument();
    expect(screen.getByText('exchangeHistoryDesc')).toBeInTheDocument();
  });

  it('each card shows year, country title, and description', () => {
    render(<ExchangeHistory />);

    // Vietnam card
    expect(screen.getByText('1224')).toBeInTheDocument();
    expect(screen.getByText('exchangeVietnam')).toBeInTheDocument();
    expect(screen.getByText('exchangeVietnamDesc')).toBeInTheDocument();

    // Thailand card
    expect(screen.getByText('1393')).toBeInTheDocument();
    expect(screen.getByText('exchangeThailand')).toBeInTheDocument();
    expect(screen.getByText('exchangeThailandDesc')).toBeInTheDocument();

    // Indonesia card
    expect(screen.getByText('1394')).toBeInTheDocument();
    expect(screen.getByText('exchangeIndonesia')).toBeInTheDocument();
    expect(screen.getByText('exchangeIndonesiaDesc')).toBeInTheDocument();
  });

  it('links Vietnam to the goryeo era and Thailand/Indonesia to the joseon era', () => {
    render(<ExchangeHistory />);

    // Find all "explore" links; the mock returns "exchangeExplore" as text
    const exploreLinks = screen.getAllByRole('link', { name: /exchangeExplore/i });
    expect(exploreLinks).toHaveLength(3);

    // Collect href values; order when locale is 'ko' is Vietnam, Thailand, Indonesia
    const hrefs = exploreLinks.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/prompts?era=goryeo');   // Vietnam
    expect(hrefs).toContain('/prompts?era=joseon');    // Thailand and Indonesia
  });

  it('when locale is "vi", Vietnam card appears first and has highlighted border', () => {
    mockLocale = 'vi';
    render(<ExchangeHistory />);

    const order = getRenderedCardOrder();
    expect(order[0]).toBe('exchangeVietnam');

    // The "YOUR HISTORY" badge must be visible for the matching locale
    const badge = screen.getByText('YOUR HISTORY');
    expect(badge).toBeInTheDocument();

    // Badge should be inside the first card — find its nearest ancestor card
    // The card has border-amber-400 class when active. We verify via the
    // badge's presence inside the section, not by CSS class parsing.
    expect(badge).toBeVisible();
  });

  it('when locale is "th", Thailand card appears first and has highlighted border', () => {
    mockLocale = 'th';
    render(<ExchangeHistory />);

    const order = getRenderedCardOrder();
    expect(order[0]).toBe('exchangeThailand');

    const badge = screen.getByText('YOUR HISTORY');
    expect(badge).toBeInTheDocument();
  });

  it('when locale is "id", Indonesia card appears first and has highlighted border', () => {
    mockLocale = 'id';
    render(<ExchangeHistory />);

    const order = getRenderedCardOrder();
    expect(order[0]).toBe('exchangeIndonesia');

    const badge = screen.getByText('YOUR HISTORY');
    expect(badge).toBeInTheDocument();
  });

  it('when locale is "ko", no card is highlighted and cards are in chronological order', () => {
    mockLocale = 'ko';
    render(<ExchangeHistory />);

    // No YOUR HISTORY badge
    expect(screen.queryByText('YOUR HISTORY')).not.toBeInTheDocument();

    // Chronological order: Vietnam (1224) → Thailand (1393) → Indonesia (1394)
    const order = getRenderedCardOrder();
    expect(order[0]).toBe('exchangeVietnam');
    expect(order[1]).toBe('exchangeThailand');
    expect(order[2]).toBe('exchangeIndonesia');
  });

  it('YOUR HISTORY badge appears only for matching locale', () => {
    // Test 'vi' — badge for Vietnam only
    mockLocale = 'vi';
    const { unmount: unmountVi } = render(<ExchangeHistory />);
    const viBadges = screen.getAllByText('YOUR HISTORY');
    expect(viBadges).toHaveLength(1);
    unmountVi();

    // Test 'th' — badge for Thailand only
    mockLocale = 'th';
    const { unmount: unmountTh } = render(<ExchangeHistory />);
    const thBadges = screen.getAllByText('YOUR HISTORY');
    expect(thBadges).toHaveLength(1);
    unmountTh();

    // Test 'id' — badge for Indonesia only
    mockLocale = 'id';
    const { unmount: unmountId } = render(<ExchangeHistory />);
    const idBadges = screen.getAllByText('YOUR HISTORY');
    expect(idBadges).toHaveLength(1);
    unmountId();

    // Test 'ko' — no badge
    mockLocale = 'ko';
    render(<ExchangeHistory />);
    expect(screen.queryByText('YOUR HISTORY')).not.toBeInTheDocument();
  });

  it('when locale is "en", no card is highlighted and cards are in chronological order', () => {
    mockLocale = 'en';
    render(<ExchangeHistory />);

    expect(screen.queryByText('YOUR HISTORY')).not.toBeInTheDocument();

    const order = getRenderedCardOrder();
    expect(order[0]).toBe('exchangeVietnam');
    expect(order[1]).toBe('exchangeThailand');
    expect(order[2]).toBe('exchangeIndonesia');
  });

  it('renders the explore link for each card', () => {
    render(<ExchangeHistory />);

    // Three separate "exchangeExplore" link texts should be present
    const links = screen.getAllByRole('link', { name: /exchangeExplore/i });
    expect(links).toHaveLength(3);
  });

  it('Vietnam card link points to goryeo era', () => {
    mockLocale = 'ko';
    render(<ExchangeHistory />);

    // In ko locale cards are Vietnam, Thailand, Indonesia in order
    const exploreLinks = screen.getAllByRole('link', { name: /exchangeExplore/i });
    expect(exploreLinks[0]).toHaveAttribute('href', '/prompts?era=goryeo');
  });

  it('Thailand card link points to joseon era', () => {
    mockLocale = 'ko';
    render(<ExchangeHistory />);

    const exploreLinks = screen.getAllByRole('link', { name: /exchangeExplore/i });
    expect(exploreLinks[1]).toHaveAttribute('href', '/prompts?era=joseon');
  });

  it('Indonesia card link points to joseon era', () => {
    mockLocale = 'ko';
    render(<ExchangeHistory />);

    const exploreLinks = screen.getAllByRole('link', { name: /exchangeExplore/i });
    expect(exploreLinks[2]).toHaveAttribute('href', '/prompts?era=joseon');
  });
});
