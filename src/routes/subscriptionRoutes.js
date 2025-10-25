import express from "express";
import {
  createSubscriptionSession,
  handleStripeWebhook,
} from "../controllers/subscriptionController.js";

const subscriptionRoutes = express.Router();

// Create subscription session
subscriptionRoutes.post("/create", createSubscriptionSession);

// Stripe webhook
subscriptionRoutes.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default subscriptionRoutes;
