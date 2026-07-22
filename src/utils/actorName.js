/**
 * Derive a display name from an email local-part.
 * @param {string} [email]
 * @returns {string}
 */
export function nameFromEmail(email = '') {
  const local = String(email).split('@')[0] || 'Admin';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}
