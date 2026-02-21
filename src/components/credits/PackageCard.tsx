'use client';

import { useTranslations } from 'next-intl';
import { CreditPackage } from '@/lib/constants/creditPackages';

interface PackageCardProps {
  pkg: CreditPackage;
  selected: boolean;
  onSelect: (pkg: CreditPackage) => void;
}

export default function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  const t = useTranslations('credits');
  const pricePerCredit = Math.round(pkg.priceKRW / pkg.credits);

  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="text-2xl font-bold text-gray-900">{t('packageLabel', { credits: pkg.credits })}</div>
      <div className="mt-2 text-3xl font-bold text-blue-600">
        {t('priceDisplay', { price: pkg.priceKRW.toLocaleString() })}
      </div>
      <div className="mt-1 text-sm text-gray-500">
        {t('perCredit', { price: pricePerCredit })}
      </div>
      {pkg.credits >= 50 && (
        <div className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          {pkg.credits >= 100 ? t('discount20') : t('discount10')}
        </div>
      )}
    </button>
  );
}
