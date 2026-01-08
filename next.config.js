/** @type {import('next').NextConfig} */
const nextConfig = {
  // 輸出設定
  output: 'standalone',
  
  // 實驗性功能
  experimental: {
    // 允許某些頁面動態渲染
  },
  
  // 圖片優化
  images: {
    domains: ['quickchart.io', 'supabase.co'],
    unoptimized: false,
  },
}

module.exports = nextConfig
