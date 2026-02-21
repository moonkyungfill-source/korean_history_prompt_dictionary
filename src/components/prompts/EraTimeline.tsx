'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { EraKey } from '@/types/prompt';

// Usage:
// <EraTimeline currentEra="joseon" />
// <EraTimeline /> // renders without any active era

interface EraTimelineProps {
  currentEra?: EraKey;
}

const ERA_ORDER = [
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

type TimelineEraKey = (typeof ERA_ORDER)[number];

const ERA_YEARS: Record<TimelineEraKey, string> = {
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

export default function EraTimeline({ currentEra }: EraTimelineProps) {
  const t = useTranslations('eras');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // On mount and when currentEra changes, scroll the active era into view
  // centered within the horizontal scroll container on mobile
  useEffect(() => {
    if (!activeItemRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const activeItem = activeItemRef.current;

    const containerWidth = container.offsetWidth;
    const itemOffsetLeft = activeItem.offsetLeft;
    const itemWidth = activeItem.offsetWidth;

    const scrollTarget = itemOffsetLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [currentEra]);

  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-5"
      role="navigation"
      aria-label="Korean historical era timeline"
    >
      {/* Outer scroll wrapper: horizontally scrollable on mobile */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Inner flex row — min-width prevents wrapping on mobile */}
        <div className="relative flex items-start min-w-max">

          {/* Connecting line drawn behind the dots */}
          <div
            aria-hidden="true"
            className="absolute top-[10px] left-0 right-0 h-px bg-gray-200"
          />

          {ERA_ORDER.map((eraKey, index) => {
            const isActive = eraKey === currentEra;
            const isFirst = index === 0;
            const isLast = index === ERA_ORDER.length - 1;

            return (
              <div
                key={eraKey}
                ref={isActive ? activeItemRef : undefined}
                // Equal flex columns; padding creates gap between dots
                className={[
                  'relative flex flex-col items-center',
                  // Horizontal padding creates visual spacing between eras.
                  // Reduce outer padding on first/last so the line starts at the
                  // leftmost dot and ends at the rightmost dot.
                  isFirst ? 'pr-5 pl-0' : isLast ? 'pl-5 pr-0' : 'px-5',
                ].join(' ')}
              >
                {/* Dot / node on the timeline line */}
                <Link
                  href={`/prompts?era=${eraKey}`}
                  aria-label={t(eraKey)}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative z-10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full"
                >
                  <span
                    className={[
                      'rounded-full border-2 transition-all duration-200',
                      isActive
                        ? 'w-5 h-5 bg-blue-600 border-blue-600 shadow-md shadow-blue-200'
                        : 'w-3 h-3 bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50',
                    ].join(' ')}
                  />
                </Link>

                {/* Era name */}
                <Link
                  href={`/prompts?era=${eraKey}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={[
                    'mt-2 text-center whitespace-nowrap transition-colors duration-200 leading-tight',
                    isActive
                      ? 'text-xs font-bold text-blue-700'
                      : 'text-xs font-normal text-gray-500 hover:text-gray-800',
                  ].join(' ')}
                >
                  {t(eraKey)}
                </Link>

                {/* Year range */}
                <span
                  className={[
                    'mt-0.5 text-center whitespace-nowrap leading-tight',
                    isActive
                      ? 'text-[10px] font-medium text-blue-500'
                      : 'text-[10px] font-normal text-gray-400',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {ERA_YEARS[eraKey]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
