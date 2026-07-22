import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    /** @deprecated Prefer title — kept for older records */
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    fileSize: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      default: '',
    },
    /** Legacy boolean — synced from status for older clients */
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

gallerySchema.pre('save', function syncActive(next) {
  this.isActive = this.status === 'active';
  if (!this.title && this.caption) {
    this.title = this.caption;
  }
  next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
