import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const tagsSchema = new Schema(
    {
        tag: { type: String, required: true, minlength: 2, maxlength: 255, trim: true },
        slug: { type: String, unique: true, trim: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
tagsSchema.plugin(softDeletePlugin);

export const Tags = mongoose.models.Tags || mongoose.model("Tags", tagsSchema);

export default Tags;