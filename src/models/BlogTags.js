import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const blogTagsSchema = new Schema(
    {
        blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
        tagId: { type: mongoose.Schema.Types.ObjectId, ref: "Tags", required: true },
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
blogTagsSchema.plugin(softDeletePlugin);

export const BlogTags = mongoose.models.BlogTags || mongoose.model("BlogTags", blogTagsSchema);

export default BlogTags;