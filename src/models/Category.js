import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const categorySchema = new Schema(
    {
        categoryName: { type: String, required: true, minlength: 2, maxlength: 100, trim: true },
        slug: { type: String, unique: true, trim: true },
        description: { type: String, maxlength: 500 },
        image: { type: String },
        parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
        status: { type: String, enum: ["active", "inactive",], default: "active" },
    },
    {
        timestamps: true
    }

);

// ✅ Apply the soft delete plugin
categorySchema.plugin(softDeletePlugin);

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;