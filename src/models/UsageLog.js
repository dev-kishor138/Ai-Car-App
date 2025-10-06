import mongoose, { Schema } from "mongoose";

const usageLogSchema = new Schema(
  {
    // Reference to the user or dealership using the feature
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Reference to the plan associated with the user (for limit-based tracking)
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },

    // Type of usage, such as "listing", "ai_usage", "scraping", etc.
    usageType: {
      type: String,
      enum: ["listing", "ai_usage", "scraping", "other"],
      required: true,
    },

    // Detailed description of the usage (e.g., "Created a new car listing", "Used AI credits")
    description: { type: String, required: true },

    // The number of resources used in the current action (e.g., 10 listings created, 50 AI credits used)
    amount: { type: Number, required: true },

    // Timestamp when this usage was recorded
    usedAt: { type: Date, default: Date.now },

    // Any related object or resource ID (e.g., carId for listing usage, scraping job ID, etc.)
    relatedId: { type: Schema.Types.ObjectId, ref: "Car" },

    // Status of the usage log (used to track if it's processed, pending, etc.)
    status: { type: String, enum: ["processed", "pending"], default: "processed" },
  },
  { timestamps: true }
);

/**
 * Index on userId and planId to quickly filter usage logs by user or plan.
 * Indexing by usageType and usedAt for quick retrieval of specific usage type and timeline.
 */
usageLogSchema.index({ userId: 1, planId: 1 });
usageLogSchema.index({ usageType: 1, usedAt: -1 });

export const UsageLog =
  mongoose.models.UsageLog || mongoose.model("UsageLog", usageLogSchema);

export default UsageLog;
