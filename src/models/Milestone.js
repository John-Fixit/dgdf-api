import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    year: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

milestoneSchema.index({ sortOrder: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;
