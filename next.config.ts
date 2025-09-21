// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Ignore TypeScript build errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
