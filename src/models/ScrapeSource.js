import mongoose, { Schema } from "mongoose";

const scrapeSourceSchema = new Schema(
  {
    // Name of the source (e.g., "Autotrader", "Jumia", etc.)
    name: { type: String, required: true, index: true },

    // Type of the scraping source, e.g., "HTML scraping", "API", etc.
    type: { type: String, enum: ["html", "api"], required: true },

    // Base URL or endpoint for the scraping source
    baseUrl: { type: String, required: true },

    // Authentication details for the source, if any (e.g., API keys, OAuth tokens)
    auth: { 
      type: String, 
      required: false 
    },

    // Rate limit for the source (how many requests per minute/hour, etc.)
    rateLimit: { 
      type: Number, 
      default: 60 
    },

    // A list of selectors or mappings for scraping HTML content (if 'html' type)
    selectors: { 
      type: Map, 
      of: String 
    },

    // Mapping of fields (keys) from the source to your system (e.g., car's make, model, year, etc.)
    mapping: { 
      type: Map, 
      of: String 
    },

    // Additional configuration or custom settings (e.g., headers for API, cookies, etc.)
    customConfig: {
      type: Map, 
      of: Schema.Types.Mixed 
    },

    // Whether the source is currently active or not (can be deactivated for maintenance or other reasons)
    enabled: { type: Boolean, default: true },

    // The last time this source was scraped
    lastScraped: { type: Date },

    // Any notes or additional information regarding the source
    notes: { type: String },
  },
  { timestamps: true }
);

/**
 * Index on name to quickly search for sources by name.
 */
scrapeSourceSchema.index({ name: 1 });

export const ScrapeSource =
  mongoose.models.ScrapeSource || mongoose.model("ScrapeSource", scrapeSourceSchema);

export default ScrapeSource;
