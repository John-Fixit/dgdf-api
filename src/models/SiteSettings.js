import mongoose from 'mongoose';

/**
 * Global site settings singleton (org identity, contact, social).
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      trim: true,
    },
    organization: {
      name: { type: String, default: '' },
      tagline: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      logoPublicId: { type: String, default: '' },
    },
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      officeHours: { type: String, default: '' },
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
export const SETTINGS_SECTIONS = ['organization', 'contact', 'social'];
