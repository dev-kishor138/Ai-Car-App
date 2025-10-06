import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    // The user or dealer who will receive the notification
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Type of notification (e.g., 'system', 'promotion', 'alert', etc.)
    type: {
      type: String,
      enum: ["system", "promotion", "alert", "transaction", "info"],
      required: true,
    },

    // The content of the notification (message body)
    message: { type: String, required: true },

    // The status of the notification (unread, read, or dismissed)
    status: {
      type: String,
      enum: ["unread", "read", "dismissed"],
      default: "unread",
    },

    // Link to the resource associated with the notification (if any)
    resourceLink: { type: String },

    // A timestamp when the notification was created
    createdAt: { type: Date, default: Date.now },

    // Optional field to set the priority of the notification (e.g., 'high', 'low', 'normal')
    priority: { type: String, enum: ["high", "low", "normal"], default: "normal" },

    // Optional: If the notification was seen by the user
    seenAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * Indexing to filter notifications based on userId and status
 * - Quick retrieval of notifications by user and their read status.
 */
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ status: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
