import mongoose from 'mongoose';

const leadershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, default: '', trim: true },
    photoUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
    isFounder: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

leadershipSchema.index({ sortOrder: 1 });

const Leadership = mongoose.model('Leadership', leadershipSchema);

export default Leadership;
