import mongoose, { Schema } from "mongoose";

const planSchema = new Schema(
  {
    // Plan name (e.g., Basic, Premium, Enterprise)
    name: { type: String, required: true, unique: true },

    // Plan description for the users to understand what features they will get
    description: { type: String, required: true },

    // Price of the plan in your chosen currency (e.g., USD, EUR)
    price: { type: Number, required: true },

    // Currency in which the price is set (USD, EUR, etc.)
    currency: { type: String, default: "USD" },

    // Billing cycle (e.g., "monthly", "yearly")
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },

    // Limits associated with this plan (e.g., max listings, AI credits)
    limits: {
      maxListings: { type: Number, default: 50 },
      aiCredits: { type: Number, default: 1000 },
      maxUsers: { type: Number, default: 1 },
    },

    // Features associated with this plan (like premium support, additional tools)
    features: { type: [String], default: [] },

    // Indicates if the plan is currently active or disabled
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Index to search for plans by their status (active or inactive)
planSchema.index({ status: 1 });

export const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);
export default Plan;
