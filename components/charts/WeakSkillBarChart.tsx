'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type WeakSkillItem = {
  skillId: string;
  skillName: string;
  accuracy: number;
};

export default function WeakSkillBarChart({ data }: { data: WeakSkillItem[] }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">資料不足，請多練習</p>;
  }

  const chartData = data.map((item) => ({
    name: item.skillName || item.skillId,
    accuracy: Math.round(item.accuracy),
  }));

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 36 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`${value}%`, '正確率']} />
          <Bar dataKey="accuracy" fill="#60A5FA" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

