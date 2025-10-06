import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const dealershipSchema = new Schema(
    {
        name: { type: String, required: true, index: true },
        slug: { type: String, unique: true, trim: true }, // will be made soft-delete compatible below
        ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        contact: {
            phone: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
        },

        location: {
            city: { type: String, index: true },
            country: { type: String, index: true },
            geo: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
            },
        },

        branding: { logoUrl: String, theme: Schema.Types.Mixed },

        planId: { type: Schema.Types.ObjectId, ref: "Plan", index: true },

        limits: {
            maxListings: { type: Number, default: 50 },
            aiCredits: { type: Number, default: 1000 },
        },

        // Operational status of the dealership
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
            index: true,
        },
    },
    { timestamps: true }
);

// Apply soft delete plugin (adds isDeleted, deletedAt, etc.)
dealershipSchema.plugin(softDeletePlugin);

/**
 * Soft-delete compatible unique indexes
 * These ensure uniqueness only for non-deleted documents (isDeleted: false).
 */
dealershipSchema.index(
    { slug: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Prevent duplicate dealership names under the same owner
dealershipSchema.index(
    { ownerUserId: 1, name: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);


/**
 * Query performance indexes
 * These improve filtering and sorting speed for dashboard and search operations.
 */
dealershipSchema.index({ status: 1, createdAt: -1 }); // For list/filter + recent sort
dealershipSchema.index({ country: 1, city: 1, status: 1 }); // For location-based filtering
dealershipSchema.index({ planId: 1, status: 1 }); // For plan-based reporting
// Note: 2dsphere index for geo.coordinates is already defined above.

export const Dealership =
    mongoose.models.Dealership || mongoose.model("Dealership", dealershipSchema);

export default Dealership;
