async function apiGet(action, params = {}) {
  const url = new URL(CONFIG.GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  const response = await fetch(url);
  return response.json();
}

async function apiPost(action, payload = {}) {
  const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload })
  });
  return response.json();
}
