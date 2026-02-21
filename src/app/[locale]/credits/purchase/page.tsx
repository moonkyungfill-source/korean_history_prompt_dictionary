'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { CREDIT_PACKAGES, CreditPackage } from '@/lib/constants/creditPackages';
import PackageCard from '@/components/credits/PackageCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { auth } from '@/lib/firebase/client';

export default function PurchasePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('credits');
  const tPayment = useTranslations('payment');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tossWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const initWidget = async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey || !user) return;

      try {
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey: user.uid });
        tossWidgetRef.current = widgets;
      } catch (err) {
        console.error('Failed to initialize Toss widget:', err);
      }
    };

    if (user) {
      initWidget();
    }
  }, [user]);

  const handleSelectPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setError('');

    if (tossWidgetRef.current) {
      try {
        await tossWidgetRef.current.setAmount({
          currency: 'KRW',
          value: pkg.priceKRW,
        });

        if (widgetRef.current) {
          widgetRef.current.innerHTML = '';
          await tossWidgetRef.current.renderPaymentMethods({
            selector: '#payment-widget',
            variantKey: 'DEFAULT',
          });
        }
      } catch (err) {
        console.error('Failed to render payment widget:', err);
      }
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !user || !tossWidgetRef.current) return;

    setProcessing(true);
    setError('');

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError(tPayment('confirmError'));
        setProcessing(false);
        return;
      }

      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      });

      if (!orderResponse.ok) {
        throw new Error(tPayment('orderFailed'));
      }

      const { orderId, orderName } = await orderResponse.json();

      // Request payment via Toss widget
      await tossWidgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/credits/purchase/success`,
        failUrl: `${window.location.origin}/credits/purchase/fail`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : tPayment('paymentFailed'));
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const packages = Object.values(CREDIT_PACKAGES);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('purchaseTitle')}</h1>
      <p className="text-gray-600 mb-8">
        {t('purchaseDesc')}
      </p>

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedPackage?.id === pkg.id}
            onSelect={handleSelectPackage}
          />
        ))}
      </div>

      {/* Payment Widget */}
      {selectedPackage && (
        <div className="mb-6">
          <div
            id="payment-widget"
            ref={widgetRef}
            className="border border-gray-200 rounded-lg p-4 min-h-[200px]"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Purchase Button */}
      {selectedPackage && (
        <button
          onClick={handlePurchase}
          disabled={processing}
          className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? t('processing') : t('payButton', { price: selectedPackage.priceKRW.toLocaleString() })}
        </button>
      )}
    </div>
  );
}
