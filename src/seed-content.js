/**
 * Replace CMS content, site settings, and leadership with current defaults.
 * Run with: npm run seed:content
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import {
  DEFAULT_CMS_DOCUMENT,
  DEFAULT_LEADERSHIP,
  DEFAULT_SITE_SETTINGS,
} from './data/defaults.js';
import Leadership from './models/Leadership.js';
import SiteContent from './models/SiteContent.js';
import SiteSettings from './models/SiteSettings.js';

async function seedContent() {
  const connected = await connectDB();
  if (!connected) {
    console.error('[seed:content] Could not connect to MongoDB');
    process.exit(1);
  }

  const now = new Date();

  await SiteContent.findOneAndUpdate(
    { slug: 'default' },
    {
      slug: 'default',
      ...structuredClone(DEFAULT_CMS_DOCUMENT),
      lastUpdatedAt: now,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('[seed:content] Site content updated');

  await SiteSettings.findOneAndUpdate(
    { slug: 'default' },
    {
      slug: 'default',
      ...structuredClone(DEFAULT_SITE_SETTINGS),
      lastUpdatedAt: now,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('[seed:content] Site settings updated');

  await Leadership.deleteMany({});
  await Leadership.insertMany(
    DEFAULT_LEADERSHIP.map((member) => ({
      ...member,
      createdAt: now,
      updatedAt: now,
    }))
  );
  console.log(
    `[seed:content] Leadership replaced (${DEFAULT_LEADERSHIP.length} members)`
  );

  await mongoose.disconnect();
  console.log('[seed:content] Done');
}

seedContent().catch(async (err) => {
  console.error('[seed:content] Failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
