import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
  planId: { type: Schema.Types.ObjectId, ref: "Plan" },

  invoiceNumber: { type: String, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  status: { type: String, enum: ["paid", "unpaid", "failed", "refunded"], default: "unpaid" },

  // Stripe / payment gateway info
  paymentIntentId: { type: String },
  stripeInvoiceId: { type: String },
  paymentMethod: { type: String, enum: ["card", "paypal", "bank", "manual"], default: "card" },

  paidAt: { type: Date },
  periodStart: { type: Date },
  periodEnd: { type: Date },

  pdfUrl: { type: String }, // Stripe invoice PDF link
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ paymentIntentId: 1 });

export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;