"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type SkillStat = {
  skillId: string;
  skillName: string;
  total: number;
  accuracy: number;
};

export default function SkillRadarChart({ data }: { data: SkillStat[] }) {
  const filtered = (data || [])
    .filter((s) => s.total >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8);

  if (filtered.length < 3) {
    return <p className="text-sm text-gray-500">資料不足，至少需要 3 個技能</p>;
  }

  const radarData = filtered.map((s) => ({
    skillName: s.skillName || s.skillId,
    score: Math.round(s.accuracy),
  }));

  const formatLabel = (value: string) => {
    if (!value) return "";
    return value.length > 6 ? `${value.slice(0, 6)}…` : value;
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skillName" tickFormatter={formatLabel} tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Radar dataKey="score" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

