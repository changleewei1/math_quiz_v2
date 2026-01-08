/**
 * 圖表生成與上傳邏輯
 */

import { supabaseServer } from './supabaseServer';
import type { TypeStatistics } from './analysis';

const QUICKCHART_URL = 'https://quickchart.io/chart';

/**
 * 生成正確率長條圖並上傳到 Supabase Storage
 */
export async function generateAndUploadChart(
  typeStatistics: TypeStatistics[],
  studentId: string | null,
  sessionId: string
): Promise<string> {
  // 1. 準備圖表資料
  const labels = typeStatistics.map((s) => s.typeCode || s.typeName);
  const data = typeStatistics.map((s) => Math.round(s.accuracy * 10) / 10); // 保留一位小數

  // 2. 生成 Chart.js 配置
  const chartConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '正確率 (%)',
          data,
          backgroundColor: data.map((acc) => {
            if (acc >= 80) return '#00C851';
            if (acc >= 60) return '#FFBB33';
            return '#FF4444';
          }),
          borderColor: data.map((acc) => {
            if (acc >= 80) return '#00C851';
            if (acc >= 60) return '#FFBB33';
            return '#FF4444';
          }),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '各題型正確率分析',
          font: {
            size: 18,
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value: any) {
              return value + '%';
            },
          },
        },
      },
    },
  };

  // 3. 呼叫 QuickChart API 取得 PNG
  const chartUrl = `${QUICKCHART_URL}?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=800&height=400`;
  
  const chartResponse = await fetch(chartUrl);
  if (!chartResponse.ok) {
    throw new Error('生成圖表失敗');
  }

  const chartBuffer = await chartResponse.arrayBuffer();
  const chartBlob = new Blob([chartBuffer], { type: 'image/png' });

  // 4. 上傳到 Supabase Storage
  const supabase = supabaseServer();
  const studentIdForPath = studentId || 'anonymous';
  const filePath = `${studentIdForPath}/${sessionId}/accuracy.png`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('reports')
    .upload(filePath, chartBlob, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`上傳圖表失敗: ${uploadError.message}`);
  }

  // 5. 取得公開 URL
  const { data: urlData } = supabase.storage
    .from('reports')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

