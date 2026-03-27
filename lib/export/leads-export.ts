import * as XLSX from 'xlsx';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export interface LeadsExportFilters {
  status?: string;
  created_from?: string;
  created_to?: string;
}

export async function buildLeadsExport(filters: LeadsExportFilters) {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('leads')
    .select('student_name, parent_name, phone, line_id, elementary_school, junior_high_school, status, assigned_to, last_contacted_at, next_follow_up_at, created_at, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (filters.status) {
    query.eq('status', filters.status);
  }
  if (filters.created_from) {
    query.gte('created_at', filters.created_from);
  }
  if (filters.created_to) {
    query.lte('created_at', filters.created_to);
  }

  const { data } = await query;
  const rows = (data ?? []).map((lead: any) => ({
    學生姓名: lead.student_name,
    家長姓名: lead.parent_name,
    電話: lead.phone,
    LINE_ID: lead.line_id ?? '',
    畢業國小: lead.elementary_school,
    即將就讀國中: lead.junior_high_school ?? '',
    狀態: lead.status,
    指派人員: lead.profiles?.full_name ?? '',
    最近聯絡時間: lead.last_contacted_at ?? '',
    下次追蹤時間: lead.next_follow_up_at ?? '',
    建立時間: lead.created_at ?? '',
  }));

  return rows;
}

export function exportLeadsToCSV(rows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function exportLeadsToXLSX(rows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function buildLeadsFilename(ext: 'csv' | 'xlsx') {
  return `leads_export_${format(new Date(), 'yyyy-MM-dd')}.${ext}`;
}


