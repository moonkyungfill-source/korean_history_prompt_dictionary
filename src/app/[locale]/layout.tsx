import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import FirebaseAnalytics from '@/components/common/FirebaseAnalytics';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Korean History Prompt Dictionary | 한국사 프롬프트 사전',
    template: '%s | Korean History Prompt Dictionary',
  },
  description: 'Explore Korean history through AI-generated images. Browse curated prompts from Gojoseon to modern Korea. | 한국사 관련 AI 이미지 생성용 프롬프트를 제공하는 웹 서비스',
  keywords: ['Korean history', 'AI image generation', 'Korean culture', 'Joseon', 'Goryeo', 'Three Kingdoms', '한국사', 'AI 이미지', 'K-history'],
  openGraph: {
    title: 'Korean History Prompt Dictionary | 한국사 프롬프트 사전',
    description: 'Explore Korean history through AI-generated images. Curated prompts from prehistoric era to modern Korea.',
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: ['en_US', 'ja_JP', 'zh_CN', 'vi_VN', 'th_TH'],
    siteName: 'Korean History Prompt Dictionary',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Korean History Prompt Dictionary',
    description: 'Explore Korean history through AI-generated images.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <FirebaseAnalytics />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
