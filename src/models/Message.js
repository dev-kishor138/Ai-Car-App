import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";

const messageSchema = new Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, trim: true, required: true },
        attachmentUrl: { type: String, trim: true },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);


// ✅ Apply the soft delete plugin
messageSchema.plugin(softDeletePlugin);

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;