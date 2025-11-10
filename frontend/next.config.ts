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
  }
};

export default nextConfig;
