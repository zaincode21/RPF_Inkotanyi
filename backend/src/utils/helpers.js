export function stripPassword(user) {
  if (!user) return user;
  const { password, twoFactorCode, ...safe } = user;
  return safe;
}

export function toPage(items, total, page, size) {
  const totalPages = size > 0 ? Math.ceil(total / size) : 0;
  return {
    content: items,
    totalElements: total,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: items.length === 0,
    numberOfElements: items.length,
  };
}

export function parsePageParams(query) {
  const page = Math.max(0, Number(query.page) || 0);
  const size = Math.min(1000, Math.max(1, Number(query.size) || 20));
  return { page, size, skip: page * size, take: size };
}

export function parseBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

export function isLeader(role) {
  return String(role || '').toLowerCase() === 'leader';
}
