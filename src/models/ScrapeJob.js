import mongoose, { Schema } from "mongoose";

const scrapeJobSchema = new Schema(
  {
    // The source from which this scraping job was initiated (refers to 'ScrapeSource' schema)
    sourceId: { type: Schema.Types.ObjectId, ref: "ScrapeSource", required: true },

    // The current status of the scrape job
    status: {
      type: String,
      enum: ["queued", "running", "success", "failed"],
      default: "queued",
      index: true,
    },

    // The date and time when the job started
    startedAt: { type: Date },

    // The date and time when the job finished
    finishedAt: { type: Date },

    // Number of records found by this job
    stats: {
      found: { type: Number, default: 0 }, // Number of records identified
      created: { type: Number, default: 0 }, // Number of new records created
      updated: { type: Number, default: 0 }, // Number of existing records updated
      skipped: { type: Number, default: 0 }, // Number of records skipped
      duplicates: { type: Number, default: 0 }, // Number of duplicate records
    },

    // The error message (if any) when the scraping failed
    error: { type: String },

    // User who initiated the scraping job (optional)
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Job-specific notes or additional details
    notes: { type: String },

  },
  { timestamps: true }
);

/**
 * Indexes:
 * - Index on sourceId for filtering by source and status of the scraping job
 * - Index on status and createdAt for quick retrieval of job status and history
 */
scrapeJobSchema.index({ sourceId: 1, status: 1 });
scrapeJobSchema.index({ status: 1, createdAt: -1 });

export const ScrapeJob =
  mongoose.models.ScrapeJob || mongoose.model("ScrapeJob", scrapeJobSchema);

export default ScrapeJob;
