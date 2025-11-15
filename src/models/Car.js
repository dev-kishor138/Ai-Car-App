import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const carSchema = new Schema(
  {
    // Ownership
    dealerId: { type: Schema.Types.ObjectId, ref: "Dealership",  index: true },
    sellerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },

    // Lifecycle state of the listing
    status: {
      type: String,
      enum: ["draft", "published", "archived", "sold"],
      default: "draft",
      index: true,
    },

    // VIN: partially unique for non-deleted docs (see index below)
    vin: { type: String, trim: true },

    // Listing content
    title: { type: String, trim: true },
    description: { type: String, trim: true },

    // Core identity
    make: { type: String, index: true },
    model: { type: String, index: true },
    trim: { type: String },
    year: { type: Number, index: true },

    // Pricing
    price: { type: Number, index: true },
    currency: { type: String, default: "USD" },

    // Vehicle condition and usage
    mileage: { type: Number, index: true },
    condition: { type: String, enum: ["new", "used", "certified"] },

    // Technical attributes
    fuelType: { type: String, index: true },
    transmission: { type: String, index: true },
    bodyType: { type: String, index: true },
    driveType: { type: String, index: true },
    color: { type: String, index: true },

    // Free-form features for filters (e.g., sunroof, bluetooth)
    features: [{ type: String }],

    // Structured specifications
    specs: {
      engineCC: Number,
      horsepower: Number,
      torque: Number,
      doors: Number,
      seats: Number,
      // add more as needed
    },

    // Location for filtering and geospatial search
    location: {
      city: { type: String, index: true },
      country: { type: String, index: true },
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
      },
    },

    // Media references (e.g., media_assets collection)
    media: {
      coverId: { type: Schema.Types.ObjectId, ref: "MediaAsset" },
      galleryIds: [{ type: Schema.Types.ObjectId, ref: "MediaAsset" }],
    },

    // Source/provenance of the listing
    source: {
      type: { type: String, enum: ["manual", "scraped", "api"], default: "manual" },
      sourceId: { type: String, trim: true },
      importedAt: { type: Date },
    },

    // AI enrichments
    ai: {
      normalized: Schema.Types.Mixed, // normalized make/model/year/specs, etc.
      valuation: {
        priceMin: Number,
        priceMax: Number,
        confidence: Number,
      },
      embeddingId: { type: Schema.Types.ObjectId, ref: "AiEnrichment" },
    },

    // Denormalized metrics (for fast counters/sorting)
    metrics: {
      views: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      leadCount: { type: Number, default: 0 },
    },

    // Important timeline fields
    publishedAt: { type: Date },
    soldAt: { type: Date },
  },
  { timestamps: true }
);

// Apply soft delete plugin (adds isDeleted, deletedAt, pre-find filters, etc.)
carSchema.plugin(softDeletePlugin);

/**
 * Soft-delete compatible unique VIN:
 * uniqueness applies only to active (non-deleted) documents.
 */
carSchema.index(
  { vin: 1 },
  { unique: true, sparse: true, partialFilterExpression: { isDeleted: false } }
);

/**
 * Common listing feeds and filters:
 * - recent published cars
 * - dealer-level published inventories
 */
carSchema.index({ status: 1, publishedAt: -1 });
carSchema.index({ dealerId: 1, status: 1, publishedAt: -1 });

/**
 * Compound index for common filters:
 * Make/model/year/price is a frequent filter set.
 */
carSchema.index({ make: 1, model: 1, year: -1, price: 1 });

/**
 * Keyword search support:
 * Text index on key fields (title/description/make/model).
 * Note: Text indexes are single per collection; tune fields as needed.
 */
carSchema.index({ title: "text", description: "text", make: "text", model: "text" });

/**
 * Geospatial search:
 * 2dsphere index defined above on location.geo.coordinates
 * enables $near queries for "cars near me".
 */

/**
 * Additional accelerators (optional):
 * - Fast filtering by technical attributes in inventory pages
 */
carSchema.index({ bodyType: 1, transmission: 1, fuelType: 1 });
carSchema.index({ country: 1, city: 1, make: 1, model: 1, year: -1 });

export const Car = mongoose.models.Car || mongoose.model("Car", carSchema);
export default Car;
