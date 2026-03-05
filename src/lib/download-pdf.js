/**
 * src/lib/download-pdf.js
 *
 * Client-side PDF download utility.
 * Calls a Next.js route handler, handles both PDF success and JSON error.
 *
 * Usage:
 *   import { downloadPdf } from '@/lib/download-pdf';
 *
 *   try {
 *     await downloadPdf('/api/member-report', payload, 'M-DEENO_기본리포트.pdf');
 *   } catch (err) {
 *     // err.code, err.message, err.fields (validation only)
 *   }
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code
 * @property {string} message
 * @property {{ field: string, message: string }[]} [fields]
 * @property {number} status
 */

/**
 * POST payload to a Next.js API route, trigger browser PDF download on success.
 *
 * @param {string} apiPath   — Next.js route, e.g. "/api/member-report"
 * @param {object} payload   — request body (MemberReportRequest fields)
 * @param {string} filename  — downloaded file name
 * @returns {Promise<string|null>} report_id from X-Report-Id header, or null if not present
 * @throws {ApiError}
 */
export async function downloadPdf(apiPath, payload, filename) {
  const res = await fetch(apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorBody;
    try {
      errorBody = await res.json();
    } catch {
      throw { code: 'DOWNLOAD_ERROR', message: 'PDF 다운로드에 실패했습니다', status: res.status };
    }
    // Route handlers return { error: { code, message, fields?, status } }
    throw errorBody.error ?? { code: 'DOWNLOAD_ERROR', message: 'PDF 다운로드에 실패했습니다', status: res.status };
  }

  const reportId = res.headers.get('X-Report-Id') ?? null;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return reportId;
}
