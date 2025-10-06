import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const bookmarkSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
        folderId: { type: mongoose.Schema.Types.ObjectId, ref: "BookmarkFolder", required: true },
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
bookmarkSchema.plugin(softDeletePlugin);

export const Bookmark = mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;