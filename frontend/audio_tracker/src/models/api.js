/**
 * API Service
 *
 * All calls go through Vite's proxy:  /api → http://localhost:5000/api
 * The JWT token is read from localStorage (key: ars_session) and
 * attached automatically to every authenticated request.
 *
 * LOCAL STORAGE layout (no database):
 *   ars_session        – { token, id, email, username }   (current user)
 *   ars_history_<email> – [ ...identificationResult ]     (per-user history)
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('ars_session') || 'null');
    return session?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Stores user + token in localStorage on success.
 */
export async function register({ name, email, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: name,
      email,
      password,
      confirmPassword: password,
    }),
  });
  const data = await handleResponse(res);
  // Persist session locally
  const session = {
    token: data.token,
    id: data.user.id,
    email: data.user.email,
    username: data.user.username,
    name: data.user.username,
  };
  localStorage.setItem('ars_session', JSON.stringify(session));
  return session;
}

/**
 * Log in an existing user.
 * Stores user + token in localStorage on success.
 */
export async function login({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  const session = {
    token: data.token,
    id: data.user.id,
    email: data.user.email,
    username: data.user.username,
    name: data.user.username,
  };
  localStorage.setItem('ars_session', JSON.stringify(session));
  return session;
}

/**
 * Log out – clears localStorage only (backend uses stateless JWT).
 */
export function logout() {
  localStorage.removeItem('ars_session');
}

/**
 * Fetch the current user's profile from the backend.
 */
export async function getProfile() {
  const res = await fetch(`${BASE}/auth/profile`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── SONGS ────────────────────────────────────────────────────────────────────

/**
 * Upload a reference song to the backend song database.
 * @param {File} file          – audio file
 * @param {string} title       – optional song title
 * @param {string} description – optional description
 */
export async function uploadSong(file, title = '', description = '') {
  const form = new FormData();
  form.append('songFile', file);
  if (title) form.append('title', title);
  if (description) form.append('description', description);

  const res = await fetch(`${BASE}/songs/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return handleResponse(res);
}

/**
 * Match a query audio clip against the backend song database.
 * Returns the best match result with confidence score.
 * @param {File} file  – audio file to identify
 * @param {number} topN – how many top matches to return (default 5)
 */
export async function matchSong(file, topN = 5) {
  const form = new FormData();
  form.append('queryFile', file);

  const res = await fetch(`${BASE}/songs/match?topN=${topN}`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return handleResponse(res);
}

/**
 * List all songs stored in the backend.
 */
export async function listSongs() {
  const res = await fetch(`${BASE}/songs`);
  return handleResponse(res);
}

/**
 * Delete a song from the backend by ID.
 */
export async function deleteSong(id) {
  const res = await fetch(`${BASE}/songs/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get backend statistics.
 */
export async function getStats() {
  const res = await fetch(`${BASE}/songs/stats/matching`);
  return handleResponse(res);
}

// ─── LOCAL HISTORY (localStorage only) ───────────────────────────────────────

/**
 * Save an identification result to the user's local history.
 */
export function saveToHistory(userEmail, result) {
  const key = `ars_history_${userEmail}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.unshift({ ...result, timestamp: Date.now() });
  localStorage.setItem(key, JSON.stringify(history));
}

/**
 * Get the user's local identification history.
 */
export function getHistory(userEmail) {
  const key = `ars_history_${userEmail}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Clear the user's local history.
 */
export function clearHistory(userEmail) {
  localStorage.removeItem(`ars_history_${userEmail}`);
}
