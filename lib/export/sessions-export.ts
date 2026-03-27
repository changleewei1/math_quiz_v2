import * as XLSX from 'xlsx';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { QUESTION_DIMENSIONS } from '@/lib/constants/status';

export interface SessionsExportFilters {
  completed?: string;
  overall_level?: string;
}

export async function buildSessionsExport(filters: SessionsExportFilters) {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('quiz_sessions')
    .select('started_at, completed_at, total_score, overall_level, dimension_scores, weakness_summary, leads(student_name)')
    .order('started_at', { ascending: false });

  if (filters.overall_level) {
    query.eq('overall_level', filters.overall_level);
  }
  if (filters.completed === 'true') {
    query.not('completed_at', 'is', null);
  }
  if (filters.completed === 'false') {
    query.is('completed_at', null);
  }

  const { data } = await query;
  const rows = (data ?? []).map((session: any) => {
    const scores = session.dimension_scores || {};
    const flattened = QUESTION_DIMENSIONS.reduce((acc, dimension) => {
      acc[dimension] = scores[dimension] ?? '';
      return acc;
    }, {} as Record<string, any>);

    return {
      學生姓名: session.leads?.student_name ?? '',
      測驗開始時間: session.started_at ?? '',
      完成時間: session.completed_at ?? '',
      總分: session.total_score ?? '',
      整體程度: session.overall_level ?? '',
      數感與計算: flattened.number_sense,
      代數與邏輯: flattened.algebra_logic,
      文字題理解: flattened.word_problem,
      幾何與圖形: flattened.geometry,
      資料判讀: flattened.data_reasoning,
      弱點摘要: session.weakness_summary ?? '',
    };
  });

  return rows;
}

export function exportSessionsToCSV(rows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function exportSessionsToXLSX(rows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function buildSessionsFilename(ext: 'csv' | 'xlsx') {
  return `sessions_export_${format(new Date(), 'yyyy-MM-dd')}.${ext}`;
}


