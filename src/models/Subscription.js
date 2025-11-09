import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    // Reference to the Plan this subscription is based on
    planId: { type: Schema.Types.ObjectId, ref: "Plan" },

    // Reference to the user or dealership that has subscribed to this plan
    subscriberId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Stripe integration
    stripeSubscriptionId: { type: String }, // e.g. "sub_12345"
    stripeCustomerId: { type: String }, // e.g. "cus_12345"

    // Subscription status: active, suspended, cancelled, etc.
    status: {
      type: String,
      enum: ["active", "suspended", "cancelled"],
      default: "active",
    },

    // Subscription start date
    startDate: { type: Date, required: true },

    // Subscription end date (or next billing date)
    endDate: { type: Date, required: true },
    nextBillingDate: { type: Date },

    // Usage snapshot at subscription start
    limits: {
      maxListings: Number,
      aiCredits: Number,
      teamMembers: Number,
    },
    renewAutomatically: { type: Boolean, default: true },

    // Usage snapshot at subscription start
    limits: {
      maxListings: Number,
      aiCredits: Number,
      teamMembers: Number,
    },

    // Additional notes for the subscription (e.g., custom terms)
    notes: { type: String },

    // Payment details (optional)
    payment: {
      lastPaidAt: { type: Date },
      method: {
        type: String,
        enum: ["stripe", "paypal", "manual"],
        default: "stripe",
      },
      lastInvoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    },
  },
  { timestamps: true }
);

/**
 * Indexing for quick subscription lookup based on user and plan.
 * Additionally, indexing by status to filter active or expired subscriptions.
 */
subscriptionSchema.index({ subscriberId: 1, planId: 1 });
subscriptionSchema.index({ status: 1, startDate: -1 });

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
