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
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
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
    timestamps: false,
  }
);

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
