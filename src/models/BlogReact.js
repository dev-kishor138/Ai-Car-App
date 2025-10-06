import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const blogReactSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
        react: { type: String, enum: ["like", "love", "care", "funny", "sad", "default"], default: "like" },

    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
blogReactSchema.plugin(softDeletePlugin);

export const BlogReact = mongoose.models.BlogReact || mongoose.model("BlogReact", blogReactSchema);

export default BlogReact;