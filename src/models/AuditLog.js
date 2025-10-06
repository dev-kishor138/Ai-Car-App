import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    // The user who performed the action (refers to 'User' model)
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Type of action that was performed (e.g., 'create', 'update', 'delete', 'login')
    actionType: {
      type: String,
      enum: ["create", "update", "delete", "login", "logout", "other"],
      required: true,
    },

    // Entity on which the action was performed (e.g., 'User', 'Car', 'Dealership', etc.)
    entityType: { type: String, required: true },

    // The specific entity's ID that the action was performed on
    entityId: { type: Schema.Types.ObjectId, required: true },

    // A detailed description of what was done (e.g., "Updated car price", "Created new user")
    description: { type: String, required: true },

    // The IP address from which the action was performed
    ipAddress: { type: String },

    // The device/browser from which the action was performed
    userAgent: { type: String },

    // Date and time of the action
    actionTimestamp: { type: Date, default: Date.now },

    // Additional metadata, such as previous values or extra information
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

/**
 * Indexing on userId, entityType, and actionTimestamp for efficient querying
 * for audit reports or user activity tracking.
 */
auditLogSchema.index({ userId: 1, entityType: 1, actionTimestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
