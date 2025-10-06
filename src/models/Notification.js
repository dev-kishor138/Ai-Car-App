import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // যে পাঠাচ্ছে
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // যাকে পাঠাচ্ছে
    type: { type: String, enum: ["blog", "comment", "like"], required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
