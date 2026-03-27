'use server';

import {
  buildLeadsExport,
  buildLeadsFilename,
  exportLeadsToCSV,
  exportLeadsToXLSX,
} from '@/lib/export/leads-export';
import {
  buildSessionsExport,
  buildSessionsFilename,
  exportSessionsToCSV,
  exportSessionsToXLSX,
} from '@/lib/export/sessions-export';

export async function exportLeadsAction(formData: FormData) {
  const format = String(formData.get('format') || 'xlsx');
  const rows = await buildLeadsExport({
    status: String(formData.get('status') || ''),
    created_from: String(formData.get('created_from') || ''),
    created_to: String(formData.get('created_to') || ''),
  });

  if (format === 'csv') {
    const csv = exportLeadsToCSV(rows);
    return {
      ok: true,
      filename: buildLeadsFilename('csv'),
      mime: 'text/csv',
      base64: Buffer.from(csv, 'utf-8').toString('base64'),
    };
  }

  const buffer = exportLeadsToXLSX(rows);
  return {
    ok: true,
    filename: buildLeadsFilename('xlsx'),
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    base64: Buffer.from(buffer).toString('base64'),
  };
}

export async function exportSessionsAction(formData: FormData) {
  const format = String(formData.get('format') || 'xlsx');
  const rows = await buildSessionsExport({
    completed: String(formData.get('completed') || ''),
    overall_level: String(formData.get('overall_level') || ''),
  });

  if (format === 'csv') {
    const csv = exportSessionsToCSV(rows);
    return {
      ok: true,
      filename: buildSessionsFilename('csv'),
      mime: 'text/csv',
      base64: Buffer.from(csv, 'utf-8').toString('base64'),
    };
  }

  const buffer = exportSessionsToXLSX(rows);
  return {
    ok: true,
    filename: buildSessionsFilename('xlsx'),
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    base64: Buffer.from(buffer).toString('base64'),
  };
}


