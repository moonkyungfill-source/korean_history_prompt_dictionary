'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/navigation';

export default function CreditBadge() {
  const { user, creditBalance } = useAuth();

  if (!user) return null;

  return (
    <Link
      href="/credits"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors"
    >
      <svg
        className="w-4 h-4 text-yellow-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.95 5.95 0 01-.4-.821h2.564a1 1 0 000-2H8.063a7.343 7.343 0 010-1h3.037a1 1 0 000-2H8.336c.12-.292.264-.567.4-.821z" />
      </svg>
      <span className="text-sm font-medium text-yellow-800">
        {creditBalance.toLocaleString()}
      </span>
    </Link>
  );
}
