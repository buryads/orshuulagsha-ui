import type { ReactNode } from 'react';

// Root layout is intentionally a pass-through.
// The real <html>/<body> live in app/[locale]/layout.tsx so we can set
// `lang={locale}` correctly per request.
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return children;
}
