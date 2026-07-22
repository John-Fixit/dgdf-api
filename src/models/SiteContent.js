import mongoose from 'mongoose';

/**
 * Nested CMS document for the public site (singleton by slug).
 * Replaces the legacy flat key/value SiteContent shape.
 */
const siteContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      trim: true,
    },
    home: { type: mongoose.Schema.Types.Mixed, required: true },
    about: { type: mongoose.Schema.Types.Mixed, required: true },
    founder: { type: mongoose.Schema.Types.Mixed, required: true },
    gallery: { type: mongoose.Schema.Types.Mixed, required: true },
    donate: { type: mongoose.Schema.Types.Mixed, required: true },
    contact: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

export default SiteContent;
export const CONTENT_PAGES = [
  'home',
  'about',
  'founder',
  'gallery',
  'donate',
  'contact',
];
