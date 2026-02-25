/** @type {import('next').NextConfig} */
const nextConfig = {
  // 輸出設定
  output: 'standalone',
  
  // 實驗性功能
  experimental: {
    // 允許某些頁面動態渲染
  },

  turbopack: {
    root: __dirname,
  },
  
  // 圖片優化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quickchart.io',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    unoptimized: false,
  },
}

module.exports = nextConfig
