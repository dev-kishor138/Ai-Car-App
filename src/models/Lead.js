import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const leadSchema = new Schema(
  {
    // The car associated with this lead
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: true, index: true },

    // The dealer handling this lead
    dealerId: { type: Schema.Types.ObjectId, ref: "Dealership", required: true, index: true },

    // The user who is interested (optional, guest leads may not have userId)
    buyerId: { type: Schema.Types.ObjectId, ref: "User" },

    // Contact details of the potential buyer or the lead source
    contact: {
      name: { type: String, required: true },
      email: { type: String, trim: true, lowercase: true, required: true },
      phone: { type: String, required: true },
    },

    // Message from the lead (optional)
    message: { type: String },

    // Lead source (web, app, whatsapp, call, etc.)
    source: { type: String, enum: ["web", "app", "whatsapp", "call"], default: "web" },

    // Status of the lead (e.g., whether it's a new lead or already contacted, etc.)
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
      index: true,
    },

    // Follow-up and additional tracking information (optional)
    followUpDate: { type: Date },
    salesRepId: { type: Schema.Types.ObjectId, ref: "User" }, // sales representative assigned to the lead

    // Timestamp for when the lead was created
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Optional: Soft delete plugin (adds isDeleted, deletedAt fields)
// Comment out this line if you don't want SoftDelete in your leads schema
leadSchema.plugin(softDeletePlugin);

/**
 * Indexes for faster filtering and sorting
 * - Index on status and createdAt for efficient lead listing and prioritization
 */
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ dealerId: 1, status: 1, createdAt: -1 });

/**
 * Index on carId and dealerId to quickly find all leads related to a car or dealer
 */
leadSchema.index({ carId: 1, dealerId: 1 });

export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;
