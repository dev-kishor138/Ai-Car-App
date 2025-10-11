import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const userSchema = new Schema(
    {
        name: { type: String, required: true, minlength: 2, maxlength: 250 },

        email: {
            type: String,
            required: true,
            // unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        firebaseUid: { type: String },

        password: { type: String, minlength: 6, select: false },

        role: { type: String, enum: ["admin", "dealer", "user"], index: true, default: "user", },

        phone: {
            type: String,
            default: null,
            trim: true,
            match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"],
        },
        aaddress: { type: String },
        dob: { type: Date },
        image: { type: String, default: null },
        otp: { type: String },
        otpExpiration: { type: Date },
        status: {
            type: String,
            enum: ["active", "inactive", "banned", 'pending'],
            default: "pending",
            index: true,
        },

        isEmailVerified: { type: Boolean, default: false },
        lastLoginAt: { type: Date },
        loginAttempts: { type: Number, default: 0 },
        dealershipId: { type: Schema.Types.ObjectId, ref: "Dealership" },
        preferences: { language: String, notifications: Schema.Types.Mixed },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

userSchema.plugin(softDeletePlugin);


userSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { deletedAt: null } }
);

// userSchema.index(
//     { phone: 1 },
//     { unique: true, partialFilterExpression: { deletedAt: null } }
// );


userSchema.index({ role: 1, status: 1 });
userSchema.index({ dealershipId: 1, role: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
