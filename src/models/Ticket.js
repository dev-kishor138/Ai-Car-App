import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../lib/softDeletePlugin.js";


const ticketSchema = new Schema(
    {
        ticketId: {
            type: String,
            required: true,
            unique: true,
                default: function () {
                const date = new Date();
                const formattedDate = date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
                const randomId = Math.floor(1000 + Math.random() * 9000); // Random number for uniqueness
                return `TKT-${formattedDate}-${randomId}`;
            },
            match: [/^TKT-\d{8}-\d{4}$/, 'Invalid ticket ID format'],  // Example pattern "TKT-YYYYMMDD-XXXX"
        },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        phone: {
            type: String,
            trim: true,
            required: true,
            match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"],
        },
        message: {
            type: String
        },
        status: { type: String, enum: ["pending", "replied"], default: "pending" },
        attachments: [{ type: String }],
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

ticketSchema.plugin(softDeletePlugin);

export const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
export default Ticket;