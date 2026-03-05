/**
 * src/lib/backend.js
 *
 * Server-side FastAPI client — used exclusively in Next.js route handlers.
 * Never import this in client components.
 *
 * Error shape returned on failure:
 * {
 *   code:    string   — machine-readable error code
 *   message: string   — Korean user-facing message
 *   fields?: { field: string, message: string }[]  — validation errors only
 *   status:  number   — HTTP status from FastAPI
 * }
 */

const BACKEND_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000'
    : process.env.BACKEND_URL ?? 'https://prop-logic-engine-v2.onrender.com';

// ─────────────────────────────────────────────────────────────────────────────
// Internal: normalize FastAPI error responses
// ─────────────────────────────────────────────────────────────────────────────

async function parseBackendError(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    return {
      code: 'PARSE_ERROR',
      message: '서버 응답을 파싱할 수 없습니다',
      status: response.status,
    };
  }

  // FastAPI Pydantic validation error (422)
  if (response.status === 422 && Array.isArray(body.detail)) {
    const fields = body.detail.map((e) => ({
      field: e.loc?.slice(1).join('.') ?? 'unknown',
      message: e.msg,
    }));
    return {
      code: 'VALIDATION_ERROR',
      message: '입력값이 올바르지 않습니다',
      fields,
      status: 422,
    };
  }

  if (response.status === 403) {
    return { code: 'FORBIDDEN', message: '접근 권한이 없습니다', status: 403 };
  }

  if (response.status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      status: 429,
    };
  }

  const detail =
    typeof body.detail === 'string'
      ? body.detail
      : 'PDF 생성 중 오류가 발생했습니다';

  return { code: 'BACKEND_ERROR', message: detail, status: response.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST a JSON payload to a FastAPI PDF endpoint.
 *
 * Returns the response ArrayBuffer on success.
 * Throws a structured error object on failure.
 *
 * @param {string} endpoint  — e.g. "/v1/member-report"
 * @param {object} payload   — request body (matches MemberReportRequest)
 * @param {string} origin    — forwarded Origin header from browser request
 * @returns {Promise<ArrayBuffer>}
 */
/**
 * POST a JSON payload to a FastAPI JSON endpoint.
 *
 * Returns the parsed response object on success.
 * Throws a structured error object on failure.
 *
 * @param {string} endpoint  — e.g. "/v1/shock-calc"
 * @param {object} payload   — request body
 * @param {string} origin    — forwarded Origin header from browser request
 * @returns {Promise<object>}
 */
export async function fetchJsonFromBackend(endpoint, payload, origin) {
  let response;

  try {
    response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    throw {
      code: 'NETWORK_ERROR',
      message: '백엔드 서버에 연결할 수 없습니다',
      status: 503,
    };
  }

  if (!response.ok) {
    throw await parseBackendError(response);
  }

  return response.json();
}

export async function fetchPdfFromBackend(endpoint, payload, origin) {
  let response;

  try {
    response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    throw {
      code: 'NETWORK_ERROR',
      message: '백엔드 서버에 연결할 수 없습니다',
      status: 503,
    };
  }

  if (!response.ok) {
    throw await parseBackendError(response);
  }

  return response.arrayBuffer();
}
