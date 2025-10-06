import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User associated with this session
    device: { type: String, required: true }, // Device info (e.g., 'Mobile', 'Desktop')
    ip: { type: String, required: true }, // IP address from which the session was created
    tokenId: { type: String, required: true }, // Session's authentication token (JWT)
    expiresAt: { type: Date, required: true }, // Expiration date/time of the session
  },
  { timestamps: true }
);

/**
 * Index on userId + expiresAt for quick lookup and expiration filtering
 * - Expiring sessions (auto-delete) for efficient resource management.
 */
sessionSchema.index({ userId: 1, expiresAt: 1 });

export const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
