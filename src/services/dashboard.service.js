import * as donationDao from '../daos/donation.dao.js';
import * as messageDao from '../daos/message.dao.js';
import * as galleryDao from '../daos/gallery.dao.js';
import * as leadershipDao from '../daos/leadership.dao.js';
import * as contentDao from '../daos/content.dao.js';
import * as auditDao from '../daos/audit.dao.js';
import { mapAuditLog } from './audit.service.js';
import { mapMessage } from './message.service.js';
import { formatCount, formatMoney, timeAgo } from '../utils/format.js';

/**
 * Build the live admin dashboard payload from real collections.
 * @returns {Promise<object>}
 */
export async function getDashboard() {
  const [donations, messagesRaw, gallery, leadership, content, auditRaw] =
    await Promise.all([
      safeList(() => donationDao.findAll(), []),
      safeList(() => messageDao.findAll(), []),
      safeList(() => galleryDao.findMany({ all: true }), []),
      safeList(() => leadershipDao.findAll(false), []),
      safeGet(() => contentDao.getDocument(), null),
      safeList(() => auditDao.findMany({ limit: 12, skip: 0 }), []),
    ]);

  const messages = messagesRaw.map(mapMessage);
  const successful = donations.filter((d) => d.status === 'success');
  const pending = donations.filter((d) => d.status === 'pending');
  const failed = donations.filter((d) => d.status === 'failed');
  const unread = messages.filter((m) => !m.read);
  const draftGallery = gallery.filter((g) => g.status === 'draft');
  const activeGallery = gallery.filter(
    (g) => g.status === 'active' || (!g.status && g.isActive !== false)
  );
  const publishedLeadership = leadership.filter(
    (m) => (m.status || 'published') === 'published'
  );

  const donationsTotal = successful.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0
  );
  const impactStats = content?.home?.impactStats || {};
  const livesImpacted = Number(impactStats.livesImpacted) || 0;

  const monthTrend = computePeriodTrend(successful, 'month');
  const unreadTrend = computeUnreadTrend(unread);

  const metrics = {
    donations: {
      label: 'Total Funds Raised',
      value: formatMoney(donationsTotal, successful[0]?.currency || 'NGN'),
      trend: monthTrend.label,
      trendPositive: monthTrend.positive,
      subtitle:
        successful.length === 0
          ? 'No successful gifts yet'
          : `${formatCount(successful.length)} successful gifts`,
    },
    livesImpacted: {
      label: 'Lives Impacted',
      value: formatCount(livesImpacted),
      trend: impactStats.outreaches
        ? `${formatCount(impactStats.outreaches)} outreaches`
        : undefined,
      trendPositive: true,
      subtitle: 'From published site impact stats',
    },
    gallery: {
      label: 'Gallery Assets',
      value: formatCount(gallery.length),
      trend:
        draftGallery.length > 0
          ? `${draftGallery.length} draft`
          : `${activeGallery.length} live`,
      trendPositive: draftGallery.length === 0,
      subtitle:
        gallery.length === 0
          ? 'No media uploaded yet'
          : `${activeGallery.length} active · ${draftGallery.length} draft`,
    },
    unreadMessages: {
      label: 'Inbox Attention',
      value: formatCount(unread.length),
      trend: unreadTrend.label,
      trendPositive: unreadTrend.positive,
      subtitle:
        unread.length === 0
          ? 'Inbox is clear'
          : `${unread.length} unread inqui${unread.length === 1 ? 'ry' : 'ries'}`,
    },
  };

  const chart = buildDonationCharts(successful);
  const donationStatus = buildDonationStatusBreakdown(
    successful,
    pending,
    failed,
    donationsTotal
  );
  const activity = buildActivity(auditRaw, successful);
  const alerts = buildAlerts({
    unread,
    failed,
    pending,
    draftGallery,
    publishedLeadership,
    leadership,
  });
  const recentDonations = donations.slice(0, 8).map(mapRecentDonation);

  const contentKeys = content
    ? Object.keys(content).filter((key) => key !== 'lastUpdatedAt').length
    : 0;

  return {
    metrics,
    chart,
    activity,
    donationStatus,
    alerts,
    recentDonations,
    counts: {
      donationsTotal,
      donationsCount: donations.length,
      donationsSuccessCount: successful.length,
      messagesUnread: unread.length,
      galleryCount: gallery.length,
      leadershipCount: leadership.length,
      contentKeys,
    },
  };
}

/**
 * @param {() => Promise<T>} fn
 * @param {T} fallback
 * @returns {Promise<T>}
 * @template T
 */
async function safeList(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.warn('[dashboard] list failed:', err.message);
    return fallback;
  }
}

/**
 * @param {() => Promise<T>} fn
 * @param {T} fallback
 * @returns {Promise<T>}
 * @template T
 */
async function safeGet(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.warn('[dashboard] get failed:', err.message);
    return fallback;
  }
}

/**
 * Month-over-month change for successful donation totals.
 * @param {object[]} successful
 * @param {'month'} _period
 */
function computePeriodTrend(successful, _period) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prev = new Date(thisYear, thisMonth - 1, 1);
  const prevMonth = prev.getMonth();
  const prevYear = prev.getFullYear();

  let current = 0;
  let previous = 0;
  for (const donation of successful) {
    const date = new Date(donation.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
      current += Number(donation.amount) || 0;
    } else if (
      date.getMonth() === prevMonth &&
      date.getFullYear() === prevYear
    ) {
      previous += Number(donation.amount) || 0;
    }
  }

  if (previous === 0 && current === 0) {
    return { label: undefined, positive: true };
  }
  if (previous === 0) {
    return { label: '↑ New this month', positive: true };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return {
    label: `${up ? '↑' : '↓'} ${Math.abs(pct)}% vs last month`,
    positive: up,
  };
}

/**
 * @param {object[]} unread
 */
function computeUnreadTrend(unread) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = unread.filter((m) => {
    const t = new Date(m.createdAt).getTime();
    return !Number.isNaN(t) && t >= dayAgo;
  }).length;
  if (recent === 0) {
    return { label: undefined, positive: true };
  }
  return {
    label: `${recent} new (24h)`,
    positive: false,
  };
}

/**
 * Build monthly (last 12) and yearly donation charts from successful gifts.
 * @param {object[]} successful
 */
function buildDonationCharts(successful) {
  const now = new Date();
  const monthly = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString('en-NG', { month: 'short' });
    const value = successful
      .filter((d) => {
        const created = new Date(d.createdAt);
        return (
          created.getFullYear() === date.getFullYear() &&
          created.getMonth() === date.getMonth()
        );
      })
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    monthly.push({ label, value });
  }

  const yearlyMap = new Map();
  for (const donation of successful) {
    const year = new Date(donation.createdAt).getFullYear();
    if (Number.isNaN(year)) continue;
    yearlyMap.set(year, (yearlyMap.get(year) || 0) + (Number(donation.amount) || 0));
  }
  const years = [...yearlyMap.keys()].sort((a, b) => a - b);
  const yearlyWindow =
    years.length > 0
      ? years.slice(-6)
      : [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];
  const yearly = yearlyWindow.map((year) => ({
    label: String(year),
    value: yearlyMap.get(year) || 0,
  }));

  return {
    monthly: markPeak(monthly),
    yearly: markPeak(yearly),
  };
}

/**
 * @param {Array<{ label: string, value: number }>} points
 */
function markPeak(points) {
  if (points.length === 0) return points;
  const max = Math.max(...points.map((p) => p.value));
  return points.map((point) => ({
    ...point,
    isPeak: point.value > 0 && point.value === max,
  }));
}

/**
 * @param {object[]} successful
 * @param {object[]} pending
 * @param {object[]} failed
 * @param {number} donationsTotal
 */
function buildDonationStatusBreakdown(successful, pending, failed, donationsTotal) {
  const pendingTotal = pending.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const failedTotal = failed.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const allAmount = donationsTotal + pendingTotal + failedTotal;
  const rows = [
    {
      id: 'success',
      label: 'Successful',
      amount: donationsTotal,
      count: successful.length,
      tone: 'accent',
    },
    {
      id: 'pending',
      label: 'Pending',
      amount: pendingTotal,
      count: pending.length,
      tone: 'warm',
    },
    {
      id: 'failed',
      label: 'Failed',
      amount: failedTotal,
      count: failed.length,
      tone: 'slate',
    },
  ];

  if (allAmount <= 0 && successful.length + pending.length + failed.length === 0) {
    return [];
  }

  const totalCount = successful.length + pending.length + failed.length || 1;
  return rows.map((row) => {
    const percent =
      allAmount > 0
        ? Math.round((row.amount / allAmount) * 100)
        : Math.round((row.count / totalCount) * 100);
    return {
      id: row.id,
      label: row.label,
      percent,
      amountLabel: `${formatMoney(row.amount)} · ${row.count}`,
      tone: row.tone,
    };
  });
}

/**
 * Merge recent audit events and successful donations into activity items.
 * @param {object[]} auditRaw
 * @param {object[]} successful
 */
function buildActivity(auditRaw, successful) {
  const fromAudit = auditRaw.map((doc) => {
    const entry = mapAuditLog(doc);

    if (entry.entity === 'auth') {
      const isLogin =
        entry.changes.includes('login') || entry.action === 'create';
      return {
        id: `audit-${entry.id}`,
        type: 'system',
        title: isLogin ? 'logged in' : 'logged out',
        timeAgo: timeAgo(entry.createdAt),
        actorName: entry.actor.name,
        createdAt: entry.createdAt,
      };
    }

    const action =
      entry.action === 'create'
        ? 'Created'
        : entry.action === 'delete'
          ? 'Deleted'
          : 'Updated';
    return {
      id: `audit-${entry.id}`,
      type: entry.action === 'create' ? 'story' : 'update',
      title: `${action} ${entry.entityTypeLabel.toLowerCase()}`,
      highlight: entry.entityLabel
        ? `“${entry.entityLabel}”`
        : entry.changes[0] || undefined,
      timeAgo: timeAgo(entry.createdAt),
      actorName: entry.actor.name,
      createdAt: entry.createdAt,
    };
  });

  const fromDonations = successful.slice(0, 6).map((donation) => {
    const id = String(donation._id || donation.id);
    const name = donation.isAnonymous
      ? 'Anonymous'
      : donation.donorName || 'Donor';
    return {
      id: `donation-${id}`,
      type: 'donation',
      title: 'completed a gift of',
      highlight: formatMoney(donation.amount, donation.currency || 'NGN'),
      timeAgo: timeAgo(donation.createdAt),
      actorName: name,
      createdAt:
        donation.createdAt instanceof Date
          ? donation.createdAt.toISOString()
          : donation.createdAt,
    };
  });

  return [...fromAudit, ...fromDonations]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8)
    .map(({ createdAt, ...item }) => item);
}

/**
 * @param {{
 *   unread: object[],
 *   failed: object[],
 *   pending: object[],
 *   draftGallery: object[],
 *   publishedLeadership: object[],
 *   leadership: object[],
 * }} input
 */
function buildAlerts(input) {
  const alerts = [];

  if (input.failed.length > 0) {
    alerts.push({
      id: 'failed-donations',
      severity: 'critical',
      title: `${input.failed.length} failed donation${input.failed.length === 1 ? '' : 's'}`,
      detail: 'Payment attempts did not complete. Review donor follow-up.',
      href: '/donations',
      actionLabel: 'Review donations',
    });
  }

  if (input.unread.length > 0) {
    alerts.push({
      id: 'unread-messages',
      severity: 'warning',
      title: `${input.unread.length} unread message${input.unread.length === 1 ? '' : 's'}`,
      detail: 'Contact inquiries are waiting in the inbox.',
      href: '/messages',
      actionLabel: 'Open inbox',
    });
  }

  if (input.pending.length > 0) {
    alerts.push({
      id: 'pending-donations',
      severity: 'info',
      title: `${input.pending.length} pending payment${input.pending.length === 1 ? '' : 's'}`,
      detail: 'Checkout started but not yet verified.',
      href: '/donations',
      actionLabel: 'View pending',
    });
  }

  if (input.draftGallery.length > 0) {
    alerts.push({
      id: 'draft-gallery',
      severity: 'info',
      title: `${input.draftGallery.length} draft gallery asset${input.draftGallery.length === 1 ? '' : 's'}`,
      detail: 'Media is saved but not published to the public site.',
      href: '/gallery',
      actionLabel: 'Review gallery',
    });
  }

  if (input.leadership.length > 0 && input.publishedLeadership.length === 0) {
    alerts.push({
      id: 'leadership-unpublished',
      severity: 'warning',
      title: 'No published leadership profiles',
      detail: 'The About page leadership section has no published members.',
      href: '/leadership',
      actionLabel: 'Manage leadership',
    });
  }

  return alerts.slice(0, 6);
}

/**
 * @param {object} donation
 */
function mapRecentDonation(donation) {
  return {
    id: String(donation._id || donation.id),
    donorName: donation.isAnonymous
      ? 'Anonymous'
      : donation.donorName || 'Donor',
    email: donation.email || '',
    amount: Number(donation.amount) || 0,
    currency: donation.currency || 'NGN',
    status: donation.status || 'pending',
    createdAt:
      donation.createdAt instanceof Date
        ? donation.createdAt.toISOString()
        : donation.createdAt,
  };
}
