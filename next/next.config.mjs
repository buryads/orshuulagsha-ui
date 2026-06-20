import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// PREVIEW-ONLY (ветка preview-integration, в master/next НЕ попадает):
// same-origin прокси /api/* → backend, чтобы фронт ходил на app-preview.dzik.email/api
// без отдельного api-тоннеля. NEXT_PUBLIC_API_BASE_URL оставляем пустым (same-origin).
const API_PROXY_TARGET = process.env.PREVIEW_API_PROXY ?? 'http://localhost:18080';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
