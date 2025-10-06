import mongoose, { Schema } from "mongoose";

const otpCodeSchema = new Schema(
  {
    // The user for whom the OTP is generated
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // The OTP code that was sent to the user (usually numeric or alphanumeric)
    otp: { type: String, required: true },

    // Type of OTP (e.g., 'login', 'reset_password', 'email_verification', etc.)
    otpType: { 
      type: String, 
      enum: ["login", "reset_password", "email_verification", "phone_verification", "other"], 
      required: true 
    },

    // Date and time when the OTP was generated
    createdAt: { type: Date, default: Date.now },

    // Expiry time for the OTP (usually valid for a short time, like 5-10 minutes)
    expiresAt: { type: Date, required: true },

    // The IP address or device from where the OTP request was made (optional)
    ipAddress: { type: String },

    // Status of the OTP (e.g., 'used', 'expired', 'pending')
    status: { 
      type: String, 
      enum: ["used", "expired", "pending"], 
      default: "pending" 
    },

    // Additional notes or information related to the OTP request (e.g., failure reason)
    notes: { type: String },
  },
  { timestamps: true }
);

/**
 * Indexing:
 * - Index on userId and otpType to quickly fetch OTPs for specific users and action types
 * - Index on status and expiresAt for filtering expired OTPs or checking the status
 */
otpCodeSchema.index({ userId: 1, otpType: 1 });
otpCodeSchema.index({ status: 1, expiresAt: -1 });

export const OtpCode =
  mongoose.models.OtpCode || mongoose.model("OtpCode", otpCodeSchema);

export default OtpCode;
