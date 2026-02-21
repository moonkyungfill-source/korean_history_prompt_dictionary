import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Root layout delegates to [locale]/layout.tsx for html/body rendering.
// next-intl middleware ensures all routes go through [locale].
export default function RootLayout({ children }: Props) {
  return children;
}
