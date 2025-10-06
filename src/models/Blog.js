import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const blogSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        title: { type: String, required: true, minlength: 2, maxlength: 255, trim: true },
        slug: { type: String, unique: true, trim: true },
        description: { type: String, trim: true },
        image: { type: String },
        viewCount: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive", "draft"], default: "active" },
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
blogSchema.plugin(softDeletePlugin);

export const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;