import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ExchangeHistory from '@/components/home/ExchangeHistory';

const ERA_ITEMS_FULL = [
  { key: 'prehistoric', emoji: '🪨' },
  { key: 'gojoseon', emoji: '🏔️' },
  { key: 'threeKingdoms', emoji: '⚔️' },
  { key: 'northSouth', emoji: '🏯' },
  { key: 'goryeo', emoji: '👑' },
  { key: 'joseon', emoji: '📜' },
  { key: 'koreanEmpire', emoji: '🏗️' },
  { key: 'japaneseOccupation', emoji: '✊' },
  { key: 'modern', emoji: '🇰🇷' },
] as const;

export default function Home() {
  const t = useTranslations('home');
  const tEras = useTranslations('eras');

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4">
            {t('heroSubtitle')}
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto mb-10">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/prompts"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('browsePrompts')}
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {t('freeSignup')}
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('timelineTitle')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('timelineDesc')}
          </p>
          {/* Visual mini-timeline */}
          <div className="flex items-center justify-center gap-1 overflow-x-auto pb-4">
            {ERA_ITEMS_FULL.map(({ key, emoji }, index) => (
              <div key={key} className="flex items-center">
                <Link
                  href={`/prompts?era=${key}`}
                  className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors min-w-[80px]"
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{tEras(key)}</span>
                </Link>
                {index < ERA_ITEMS_FULL.length - 1 && (
                  <div className="w-6 h-0.5 bg-gray-300 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            {t('features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('featurePromptTitle')}
              </h3>
              <p className="text-gray-600">
                {t('featurePromptDesc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('featureImageTitle')}
              </h3>
              <p className="text-gray-600">
                {t('featureImageDesc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('featureGalleryTitle')}
              </h3>
              <p className="text-gray-600">
                {t('featureGalleryDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Era Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            {t('eraTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ERA_ITEMS_FULL.map(({ key, emoji }) => (
              <Link
                key={key}
                href={`/prompts?era=${key}`}
                className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl mb-2">{emoji}</span>
                <span className="text-sm font-medium text-gray-900 text-center">{tEras(key)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange History */}
      <ExchangeHistory />

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('ctaDesc')}
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </section>
    </div>
  );
}
