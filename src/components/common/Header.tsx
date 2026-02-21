'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import CreditBadge from '@/components/credits/CreditBadge';
import LocaleSwitcher from '@/components/common/LocaleSwitcher';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from '@/i18n/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {t('siteName')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/prompts"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {tNav('prompts')}
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {tNav('dashboard')}
                </Link>
                <Link
                  href="/generations"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {tNav('gallery')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {loading ? (
              <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
            ) : user ? (
              <>
                <CreditBadge />
                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="User menu"
                    aria-expanded={menuOpen}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50" role="menu">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b truncate">
                        {user.email}
                      </div>
                      <Link
                        href="/credits"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                      >
                        {tNav('credits')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        role="menuitem"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/signup"
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('signup')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            <Link
              href="/prompts"
              className="block px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {tNav('prompts')}
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav('dashboard')}
                </Link>
                <Link
                  href="/generations"
                  className="block px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav('gallery')}
                </Link>
                <Link
                  href="/credits"
                  className="block px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tNav('credits')}
                </Link>
                <div className="border-t border-gray-100 my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-base text-red-600 hover:bg-gray-50 rounded-lg"
                >
                  {t('logout')}
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2.5 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2.5 text-base text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('signup')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
