import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ko',
}));

// Mock @/i18n/navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import EraTimeline from '../EraTimeline';

// jsdom does not implement Element.prototype.scrollTo.
// The EraTimeline useEffect calls container.scrollTo() when a currentEra is
// active. We stub it globally so tests that pass currentEra do not throw.
if (typeof HTMLElement.prototype.scrollTo !== 'function') {
  HTMLElement.prototype.scrollTo = vi.fn();
}

// The 9 era keys the component renders (excludes 'all')
const ERA_KEYS = [
  'prehistoric',
  'gojoseon',
  'threeKingdoms',
  'northSouth',
  'goryeo',
  'joseon',
  'koreanEmpire',
  'japaneseOccupation',
  'modern',
] as const;

// Year ranges rendered by the component for each era
const ERA_YEARS: Record<string, string> = {
  prehistoric: '~BC 2333',
  gojoseon: 'BC 2333~108',
  threeKingdoms: 'BC 57~676',
  northSouth: '676~935',
  goryeo: '918~1392',
  joseon: '1392~1897',
  koreanEmpire: '1897~1910',
  japaneseOccupation: '1910~1945',
  modern: '1945~',
};

describe('EraTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 9 era items (not "all")', () => {
    render(<EraTimeline />);

    // The component translates each era key to itself via the mock (key => key).
    // The dot/node link uses aria-label={t(eraKey)}, so each era produces
    // a link with aria-label equal to its key.
    ERA_KEYS.forEach((key) => {
      expect(screen.getByRole('link', { name: key })).toBeInTheDocument();
    });

    // 'all' must not appear as a navigation node
    const allLinks = screen.queryAllByRole('link', { name: 'all' });
    expect(allLinks).toHaveLength(0);
  });

  it('renders era names in chronological order (prehistoric first, modern last)', () => {
    render(<EraTimeline />);

    // Collect all links with aria-label matching known era keys, in DOM order
    const eraLinks = ERA_KEYS.map((key) =>
      screen.getByRole('link', { name: key })
    );

    // Verify DOM order is preserved: each link appears before the next
    for (let i = 0; i < eraLinks.length - 1; i++) {
      const position =
        eraLinks[i].compareDocumentPosition(eraLinks[i + 1]);
      // DOCUMENT_POSITION_FOLLOWING = 4 means next sibling/descendant comes after
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }

    // Explicitly verify first and last
    expect(eraLinks[0]).toHaveAttribute('aria-label', 'prehistoric');
    expect(eraLinks[eraLinks.length - 1]).toHaveAttribute('aria-label', 'modern');
  });

  it('highlights the current era with aria-current="page" on the active era link', () => {
    render(<EraTimeline currentEra="goryeo" />);

    const activeLink = screen.getByRole('link', { name: 'goryeo' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on eras that are not current', () => {
    render(<EraTimeline currentEra="goryeo" />);

    const inactiveEras = ERA_KEYS.filter((key) => key !== 'goryeo');
    inactiveEras.forEach((key) => {
      const link = screen.getByRole('link', { name: key });
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  it('renders year ranges for each era', () => {
    render(<EraTimeline />);

    Object.values(ERA_YEARS).forEach((yearRange) => {
      expect(screen.getByText(yearRange)).toBeInTheDocument();
    });
  });

  it('renders without currentEra prop and no era is highlighted', () => {
    render(<EraTimeline />);

    ERA_KEYS.forEach((key) => {
      const link = screen.getByRole('link', { name: key });
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  it('provides an accessible navigation role with an aria-label', () => {
    render(<EraTimeline />);

    const nav = screen.getByRole('navigation', {
      name: 'Korean historical era timeline',
    });
    expect(nav).toBeInTheDocument();
  });

  it('links each era to /prompts?era={key}', () => {
    render(<EraTimeline />);

    ERA_KEYS.forEach((key) => {
      // The dot node link has the accessible label
      const link = screen.getByRole('link', { name: key });
      expect(link).toHaveAttribute('href', `/prompts?era=${key}`);
    });
  });

  it('highlights joseon era when currentEra is joseon', () => {
    render(<EraTimeline currentEra="joseon" />);

    const activeLink = screen.getByRole('link', { name: 'joseon' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');

    // All other eras must not be current
    ERA_KEYS.filter((k) => k !== 'joseon').forEach((key) => {
      expect(screen.getByRole('link', { name: key })).not.toHaveAttribute(
        'aria-current'
      );
    });
  });

  it('highlights prehistoric era when currentEra is prehistoric', () => {
    render(<EraTimeline currentEra="prehistoric" />);

    const activeLink = screen.getByRole('link', { name: 'prehistoric' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights modern era when currentEra is modern', () => {
    render(<EraTimeline currentEra="modern" />);

    const activeLink = screen.getByRole('link', { name: 'modern' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });
});
