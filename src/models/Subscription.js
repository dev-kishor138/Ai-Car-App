import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        // Reference to the Plan this subscription is based on
        planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },

        // Reference to the user or dealership that has subscribed to this plan
        subscriberId: { type: Schema.Types.ObjectId, ref: "User", required: true },

        // Subscription status: active, suspended, cancelled, etc.
        status: { type: String, enum: ["active", "suspended", "cancelled"], default: "active" },

        // Subscription start date
        startDate: { type: Date, required: true },

        // Subscription end date (or next billing date)
        endDate: { type: Date, required: true },

        // Number of users allowed for this subscription
        usersLimit: { type: Number, default: 1 },

        // Number of available listings
        listingsLimit: { type: Number, default: 50 },

        // Number of AI credits allocated
        aiCreditsLimit: { type: Number, default: 1000 },

        // Additional notes for the subscription (e.g., custom terms)
        notes: { type: String },

        // Payment details (optional)
        payment: {
            method: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], required: true },
            status: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
            transactionId: { type: String },
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
    mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
