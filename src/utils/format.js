/**
 * Format a number as NGN currency for admin displays.
 * @param {number} amount
 * @param {string} [currency='NGN']
 * @returns {string}
 */
export function formatMoney(amount, currency = 'NGN') {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch {
    return `₦${Math.round(Number(amount) || 0).toLocaleString('en-NG')}`;
  }
}

/**
 * Compact number formatting (e.g. 12402 → "12,402").
 * @param {number} value
 * @returns {string}
 */
export function formatCount(value) {
  return new Intl.NumberFormat('en-NG').format(Number(value) || 0);
}

/**
 * Relative time label for activity feeds.
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function timeAgo(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}
