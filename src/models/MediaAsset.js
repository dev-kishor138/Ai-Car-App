import mongoose, { Schema } from "mongoose";

const mediaAssetSchema = new Schema(
  {
    ownerType: { type: String, enum: ["car", "user", "dealership"], required: true }, // What entity owns this media (Car/User/Dealership)
    ownerId: { type: Schema.Types.ObjectId, refPath: "ownerType", required: true }, // The ID of the owner
    type: { type: String, enum: ["image", "video"], required: true }, // Type of the media (Image/Video)
    provider: { type: String, enum: ["s3", "cloudinary", "local"], required: true }, // Provider for media storage
    url: { type: String, required: true }, // The URL to access the media
    thumbUrl: { type: String }, // Optional thumbnail URL for images
    width: { type: Number }, // Width of the media (for images)
    height: { type: Number }, // Height of the media (for images)
    createdAt: { type: Date, default: Date.now }, // Media file creation timestamp
  },
  { timestamps: true }
);

/**
 * Index on ownerType and ownerId for fast access to media for specific entities (car, user, dealership).
 */
mediaAssetSchema.index({ ownerType: 1, ownerId: 1 });

export const MediaAsset =
  mongoose.models.MediaAsset || mongoose.model("MediaAsset", mediaAssetSchema);

export default MediaAsset;
