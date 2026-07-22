import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete'],
      index: true,
    },
    entity: {
      type: String,
      required: true,
      enum: [
        'gallery',
        'leadership',
        'content',
        'settings',
        'message',
        'donation',
        'admin',
        'auth',
      ],
      index: true,
    },
    entityId: {
      type: String,
      default: '',
      trim: true,
    },
    entityLabel: {
      type: String,
      default: '',
      trim: true,
    },
    actorId: {
      type: String,
      default: '',
      index: true,
    },
    actorEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    actorName: {
      type: String,
      default: '',
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    adminName: {
      type: String,
      default: '',
      trim: true,
    },
    adminRole: {
      type: String,
      default: '',
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['auth', 'gallery', 'content', 'donation', 'message', 'admin'],
      default: 'admin',
      index: true,
    },
    changes: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1, entity: 1 });
auditLogSchema.index({ adminName: 1 });
auditLogSchema.index({ details: 'text', actorName: 'text', entityLabel: 'text' });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
