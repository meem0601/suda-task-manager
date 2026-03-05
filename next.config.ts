import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // モバイル対応のためキャッシュを無効化
  generateBuildId: async () => {
    // ビルドIDにタイムスタンプを含めて毎回変更
    return `build-${Date.now()}`;
  },
  // ブラウザキャッシュを無効化
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
