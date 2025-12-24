import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // FHEVM Relayer SDK requires both COEP and COOP headers for Web Workers support
    // Using 'same-origin' as required by FHEVM SDK
    // Base Account SDK warning can be ignored if not directly used
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]);
  },
  webpack: (config, { isServer }) => {
    // Fix for minimatch export issue in Next.js 15
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
      };
    }
    
    return config;
  },
  // ESLint configuration
  // Note: minimatch export issue is a known compatibility issue between Next.js 15 and ESLint 9
  // Temporarily ignore ESLint during builds until the compatibility issue is resolved
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Let TypeScript errors fail the build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
