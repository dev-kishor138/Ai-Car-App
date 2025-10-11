import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const brandSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Brand name is required"],
            minlength: 2,
            maxlength: 250,
            trim: true,
            index: true,
        },

        image: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt auto add হবে
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

// ✅ Soft delete plugin (optional)
brandSchema.plugin(softDeletePlugin);



// ✅ Export model
const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
export default Brand;