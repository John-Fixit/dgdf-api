import mongoose from 'mongoose';

export const SITE_CONTENT_KEYS = [
  'vision',
  'mandate',
  'aboutText',
  'heroHeadline',
  'missionText',
];

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: SITE_CONTENT_KEYS,
      trim: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

export default SiteContent;
