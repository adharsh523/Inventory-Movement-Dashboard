
const BASE_URL = process.env.REACT_APP_API_URL || '';

export async function fetchMovements(filters = {}) {
  const params = new URLSearchParams();
  if (filters.from)      params.set('from',      filters.from);
  if (filters.to)        params.set('to',        filters.to);
  if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
  if (filters.warehouse && filters.warehouse !== 'ALL') params.set('warehouse', filters.warehouse);

  const response = await fetch(`${BASE_URL}/api/movements?${params.toString()}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}


export async function verifyAndUploadFile(file, sha256) {
  const formData = new FormData();
  formData.append('file',   file);
  formData.append('sha256', sha256);

  const response = await fetch(`${BASE_URL}/api/verify-file`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data;
}


export async function fetchWarehouses() {
  const response = await fetch(`${BASE_URL}/api/warehouses`);
  if (!response.ok) return [];
  return response.json();
}
