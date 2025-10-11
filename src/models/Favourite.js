import mongoose, { Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    // The user who saved (favorited) the car
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The car that was saved by the user
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Ensure a user can favorite a specific car only once.
 * This powers the heart-button "toggle" logic cleanly.
 */
favoriteSchema.index({ userId: 1, carId: 1 }, { unique: true });

/**
 * Optional accelerators:
 * - Fast "My Saved Cars" listing sorted by recency
 * - Fast reporting: how many users saved a specific car
 */
// favoriteSchema.index({ userId: 1, createdAt: -1 });
// favoriteSchema.index({ carId: 1 });

export const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);

export default Favorite;
