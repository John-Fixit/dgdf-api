import { BetaAnalyticsDataClient } from '@google-analytics/data';


const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const PROPERTY_ID = `properties/${process.env.GA_PROPERTY_ID}`;


export async function analyticsSummary(req, res){
  try {
    const [response] = await analyticsDataClient.runReport({
      property: PROPERTY_ID,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
      ],
    });

    const row = response.rows?.[0]?.metricValues || [];
    res.json({
      activeUsers: row[0]?.value || 0,
      pageViews: row[1]?.value || 0,
      sessions: row[2]?.value || 0,
    });
  } catch (err) {
    console.error('GA4 fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

/** Converts a GA4 YYYYMMDD date string into YYYY-MM-DD. */
function formatGaDate(value) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

export async function analyticsDaily(req, res){
  try {
    const [response] = await analyticsDataClient.runReport({
      property: PROPERTY_ID,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    const daily = (response.rows || []).map((row) => ({
      date: formatGaDate(row.dimensionValues[0].value),
      activeUsers: Number(row.metricValues[0].value) || 0,
    }));

    res.json(daily);
  } catch (err) {
    console.error('GA4 fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}