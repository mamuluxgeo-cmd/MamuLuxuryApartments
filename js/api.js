const API_TIMEOUT_MS = 25000;

function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  return fetch(url, Object.assign({}, options, { signal: controller.signal }))
    .finally(function () {
      clearTimeout(timeoutId);
    });
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error('HTTP ' + response.status + ': ' + text.slice(0, 180));
  }

  if (!text) {
    throw new Error('ცარიელი პასუხი სერვერიდან');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('სერვერმა არასწორი JSON დააბრუნა');
  }
}

function normalizeApiError(error) {
  if (error && error.name === 'AbortError') {
    return 'სერვერი დიდხანს პასუხობს. სცადე თავიდან ან განაახლე Apps Script-ის deployment.';
  }

  return (error && error.message) ? error.message : 'სერვერთან კავშირი ვერ მოხერხდა';
}

async function apiGet(action, params = {}) {
  const url = new URL(CONFIG.GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('_ts', Date.now());

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  try {
    const response = await fetchWithTimeout(url.toString(), { cache: 'no-store' });
    return await readJsonResponse(response);
  } catch (error) {
    return { success: false, error: normalizeApiError(error) };
  }
}

async function apiPostViaGet(action, payload = {}, originalError) {
  const url = new URL(CONFIG.GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('payload', JSON.stringify({ action, ...payload }));
  url.searchParams.set('_ts', Date.now());

  try {
    const response = await fetchWithTimeout(url.toString(), { cache: 'no-store' });
    const result = await readJsonResponse(response);

    if (!result.success && result.error === 'Unknown action' && originalError) {
      return { success: false, error: normalizeApiError(originalError) };
    }

    return result;
  } catch (error) {
    return { success: false, error: normalizeApiError(originalError || error) };
  }
}

async function apiPost(action, payload = {}) {
  try {
    const response = await fetchWithTimeout(CONFIG.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      cache: 'no-store'
    });

    return await readJsonResponse(response);
  } catch (error) {
    return apiPostViaGet(action, payload, error);
  }
}