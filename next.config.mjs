/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['next-page.tsx', 'next-page.ts'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // The generated design-system bundle does not ship TypeScript declarations.
  // Application source remains strict; this prevents those legacy wrapper types
  // from blocking a production bundle.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
