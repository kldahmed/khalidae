// ExcelWorkbookSpec Validator
import { ExcelWorkbookSpec } from './types';

export function validateWorkbookSpec(spec: ExcelWorkbookSpec): { ok: boolean; error?: string } {
  if (!spec.title || !spec.sheets?.length) return { ok: false, error: 'Missing title or sheets' };
  for (const sheet of spec.sheets) {
    if (!sheet.name || !sheet.columns?.length) return { ok: false, error: 'Sheet missing name or columns' };
    if (!Array.isArray(sheet.rows)) return { ok: false, error: 'Sheet rows must be array' };
  }
  return { ok: true };
}
