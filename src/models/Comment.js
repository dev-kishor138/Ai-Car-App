import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const commentSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
        parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
        message: { type: String, trim: true },
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
commentSchema.plugin(softDeletePlugin);

export const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;