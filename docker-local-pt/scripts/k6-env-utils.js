// Shared k6 env helpers for local Docker mock runners.
export function parsePositiveIntEnv(name, fallback) {
  const raw = String(__ENV[name] || '').trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function resolveVuCount() {
  const k6Users = parsePositiveIntEnv('K6_USERS', NaN);
  if (Number.isFinite(k6Users)) return k6Users;

  const userCount = parsePositiveIntEnv('USER_COUNT', NaN);
  if (Number.isFinite(userCount)) return userCount;

  const rawUser = String(__ENV.USER || '').trim();
  const legacyUser = Number.parseInt(rawUser, 10);
  if (Number.isFinite(legacyUser) && legacyUser > 0) return legacyUser;

  if (rawUser && rawUser !== '1') {
    console.warn(`[LOCAL-PT] Ignoring non-numeric USER=${rawUser}; defaulting VUs to 1`);
  }
  return 1;
}

export function clampLocalVuCount(vus) {
  if (__ENV.ALLOW_HIGH_LOCAL_LOAD === 'true') return vus;
  return Math.min(vus, 10);
}
