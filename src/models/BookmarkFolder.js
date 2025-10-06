import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const bookmarkFolderSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        folderName: { type: String, required: true, minlength: 2, maxlength: 255, trim: true },
        slug: { type: String, unique: true, trim: true },
        status: { type: String, enum: ["active", "inactive",], default: "active" },
      
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
bookmarkFolderSchema.plugin(softDeletePlugin);

export const BookmarkFolder = mongoose.models.BookmarkFolder || mongoose.model("BookmarkFolder", bookmarkFolderSchema);

export default BookmarkFolder;