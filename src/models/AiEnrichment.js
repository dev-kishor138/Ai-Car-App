import mongoose, { Schema } from "mongoose";

const aiEnrichmentSchema = new Schema(
    {
        // The car this enrichment is applied to
        carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },

        // Type of AI enrichment (e.g., "normalize", "valuation", "dedup", "embed")
        jobType: {
            type: String,
            enum: ["normalize", "valuation", "dedupe", "embed"],
            required: true
        },

        // Input data to the AI job (e.g., raw data before enrichment)
        input: { type: Schema.Types.Mixed, required: true },

        // Output after AI enrichment (processed data)
        output: { type: Schema.Types.Mixed },

        // AI model used for the enrichment (e.g., GPT, custom ML model, etc.)
        model: { type: String },

        // The confidence level of the AI output (higher values indicate more confidence)
        confidence: { type: Number },

        // ID of the embedding if using vector embeddings (e.g., FAISS, ChromaDB)
        embeddingId: { type: Schema.Types.ObjectId, ref: "Embedding" },

        // Status of the enrichment job (e.g., "pending", "completed", "failed")
        status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },

        // Timestamp when this enrichment was created
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

/**
 * Indexing to allow quick access by carId and jobType, and to filter based on status
 */
aiEnrichmentSchema.index({ carId: 1, jobType: 1 });
aiEnrichmentSchema.index({ status: 1, createdAt: -1 });

export const AiEnrichment =
    mongoose.models.AiEnrichment || mongoose.model("AiEnrichment", aiEnrichmentSchema);

export default AiEnrichment;
