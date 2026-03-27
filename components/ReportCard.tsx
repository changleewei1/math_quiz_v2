'use client';

import { useEffect, useMemo, useState } from 'react';
import { DIMENSION_LABEL, type Dimension } from '@/lib/questions';
import { enrichMvpReport, type MvpAnalysisResult } from '@/lib/analysis';
import { getMvpRegister, getMvpResult } from '@/lib/mvp/client-storage';
import PageContainer from '@/components/layout/PageContainer';
import ReportHeaderCard from '@/components/recruitment/report/ReportHeaderCard';
import RadarChartCard from '@/components/recruitment/report/RadarChartCard';
import DimensionAnalysisCard from '@/components/recruitment/report/DimensionAnalysisCard';
import WeaknessSummaryCard from '@/components/recruitment/report/WeaknessSummaryCard';
import StudyOrderCard from '@/components/recruitment/report/StudyOrderCard';
import StudySuggestionsCard from '@/components/recruitment/report/StudySuggestionsCard';
import ParentAdviceCard from '@/components/recruitment/report/ParentAdviceCard';
import RecommendedCoursesCard from '@/components/recruitment/report/RecommendedCoursesCard';
import EnrollmentCTASection from '@/components/recruitment/report/EnrollmentCTASection';
import ReportActionsBar from '@/components/recruitment/report/ReportActionsBar';
import VideoSection from '@/components/VideoSection';

const DIMENSION_ORDER: Dimension[] = [
  'number_sense',
  'algebra_logic',
  'word_problem',
  'geometry',
  'data_reasoning',
];

function sortDetails<T extends { dimension: Dimension }>(details: T[]): T[] {
  const order = new Map(DIMENSION_ORDER.map((d, i) => [d, i]));
  return [...details].sort((a, b) => (order.get(a.dimension) ?? 99) - (order.get(b.dimension) ?? 99));
}

export default function ReportCard({
  sessionId,
  initialReport = null,
  leadId = null,
}: {
  sessionId: string;
  /** 由伺服器從 Supabase 讀取之完整報告（已 enrich） */
  initialReport?: MvpAnalysisResult | null;
  /** 試聽預約表單 hidden `lead_id` 用 */
  leadId?: string | null;
}) {
  const [result, setResult] = useState<MvpAnalysisResult | null>(() => initialReport ?? null);

  useEffect(() => {
    if (initialReport) {
      setResult(initialReport);
      return;
    }
    const rawResult = getMvpResult(sessionId);
    if (!rawResult) {
      setResult(null);
      return;
    }
    try {
      const parsed = JSON.parse(rawResult) as MvpAnalysisResult;
      let studentName = parsed.studentName?.trim();
      if (!studentName) {
        const rawRegister = getMvpRegister(sessionId);
        if (rawRegister) {
          const data = JSON.parse(rawRegister) as { student_name?: string };
          if (data.student_name?.trim()) studentName = data.student_name.trim();
        }
      }
      const merged: MvpAnalysisResult = { ...parsed, ...(studentName ? { studentName } : {}) };
      setResult(enrichMvpReport(merged));
    } catch {
      setResult(null);
    }
  }, [sessionId, initialReport]);

  const displayName = result?.studentName?.trim() || '孩子';

  const radarData = useMemo(() => {
    if (!result) return [];
    return result.dimensionScores.map((item) => ({
      subject: DIMENSION_LABEL[item.dimension],
      value: item.percentage,
    }));
  }, [result]);

  const bookingHref = useMemo(() => {
    if (!result) return '/booking';
    const weakKeys = result.weakDimensionKeys ?? result.weaknesses.map((w) => w.dimension);
    const fc = result.recommendedCoursesV2?.[0];
    const p = new URLSearchParams();
    p.set('level', result.overallLevel);
    p.set('studentName', displayName);
    p.set('weak', weakKeys.join(','));
    if (fc?.id) p.set('course', fc.id);
    p.set('sessionId', sessionId);
    if (leadId?.trim()) p.set('leadId', leadId.trim());
    return `/booking?${p.toString()}`;
  }, [result, displayName, sessionId, leadId]);

  useEffect(() => {
    if (!result) return;
    const weakKeys = result.weakDimensionKeys ?? result.weaknesses.map((w) => w.dimension);
    const fc = result.recommendedCoursesV2?.[0];
    try {
      sessionStorage.setItem(
        'mvp-booking-prefill',
        JSON.stringify({
          studentName: displayName,
          level: result.overallLevel,
          weakRaw: weakKeys.join(','),
          courseId: fc?.id ?? '',
          sessionId,
          leadId: leadId?.trim() ?? '',
        })
      );
    } catch {
      /* ignore */
    }
  }, [result, displayName, sessionId, leadId]);

  const weaknessesForVideo = useMemo(() => {
    const records = result?.mistakeRecords ?? [];
    const map = new Map<
      string,
      { concept_tag: string; dimension: Dimension; mistake_type: string; count: number }
    >();
    for (const r of records) {
      const key = `${r.dimension}__${r.concept_tag}__${r.mistake_type}`;
      const prev = map.get(key);
      if (prev) prev.count += 1;
      else
        map.set(key, {
          concept_tag: r.concept_tag,
          dimension: r.dimension,
          mistake_type: r.mistake_type,
          count: 1,
        });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [result]);

  if (!result) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">找不到報告資料</h1>
          <p className="mt-3 text-sm text-slate-600">請先完成檢測後再查看報告，或返回填寫資料重新開始。</p>
        </div>
      </PageContainer>
    );
  }

  const details = sortDetails(result.dimensionDetails ?? []);
  const executive =
    result.executiveSummary ??
    '從本次檢測結果來看，建議您搭配下方各向度說明，與孩子討論暑假的補強優先順序。';
  const weaknessPara =
    result.weaknessSummaryParagraph ??
    '本次檢測結果已彙整於下方各向度卡片，建議優先閱讀標示為「需加強」的項目。';
  const studySuggestions = result.studySuggestions ?? result.suggestions ?? [];
  const studyOrder = result.studyOrderSteps ?? [];
  const parentAdvice = result.parentAdviceParagraphs ?? [];
  const courses = result.recommendedCoursesV2 ?? [];
  const stableNote = result.radarStableNote ?? '請參考各向度分數與下方說明。';
  const priorityNote = result.radarPriorityNote ?? '建議優先處理分數較低或標示需加強的面向。';

  return (
    <PageContainer className="space-y-8 sm:space-y-10">
      <ReportHeaderCard
        studentName={displayName}
        reportDate={result.reportDate}
        totalScore={result.totalScore}
        overallLevel={result.overallLevel}
        executiveSummary={executive}
      />

      <RadarChartCard data={radarData} stableNote={stableNote} priorityNote={priorityNote} />

      <section className="space-y-4">
        <div className="px-1">
          <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900 sm:text-2xl">
            各向度分析
          </h2>
          <p className="mt-2 text-sm text-slate-600">每一面向皆附家長可讀說明與補強重點，方便對照雷達圖理解。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {details.map((d) => (
            <DimensionAnalysisCard
              key={d.dimension}
              label={d.label}
              percentage={d.percentage}
              status={d.status}
              explanation={d.explanation}
              strengthenFocus={d.strengthenFocus}
            />
          ))}
        </div>
      </section>

      <WeaknessSummaryCard paragraph={weaknessPara} />

      {weaknessesForVideo.length > 0 ? <VideoSection weaknesses={weaknessesForVideo} /> : null}

      <StudyOrderCard steps={studyOrder} />

      <StudySuggestionsCard items={studySuggestions} />

      {parentAdvice.length > 0 ? <ParentAdviceCard paragraphs={parentAdvice} /> : null}

      {courses.length > 0 ? <RecommendedCoursesCard courses={courses} bookingHref={bookingHref} /> : null}

      <EnrollmentCTASection bookingHref={bookingHref} />

      <ReportActionsBar />
    </PageContainer>
  );
}
