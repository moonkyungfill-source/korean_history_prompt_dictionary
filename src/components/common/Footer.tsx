import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            {t('tagline')}
          </div>
          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Korean History Prompt Dictionary. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
