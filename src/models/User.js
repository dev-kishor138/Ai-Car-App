import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const userSchema = new Schema(
    {
        name: { type: String, required: true, minlength: 2, maxlength: 50 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },
        password: { type: String, required: true, minlength: 6 },
        role: {
            type: String,
            enum: ["user", "admin", "moderator"],
            default: "user"
        },
        phone: { type: String, minlength: 11, maxlength: 15 },
        image: { type: String },
        status: {
            type: String,
            enum: ["active", "inactive", "banned"],
            default: "active"
        },
    },
    { timestamps: true } 
);


// ✅ Apply the soft delete plugin
userSchema.plugin(softDeletePlugin);


export const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;