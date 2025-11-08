import dotenv from "dotenv";
import Stripe from "stripe";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import { sendEmail } from "../lib/mailer.js";
import { subscriptionSuccessTemplate } from "../lib/emailTemplates.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Step 1: Create Checkout Session
export const createSubscriptionSession = async (req, res, next) => {
  try {
    const user = req.user;
    console.log("user", user);
    // Check trial
    if (user.trialEnd && user.trialEnd > new Date()) {
      return res.status(400).json({ message: "Trial is still active." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

// Step 2: Webhook to handle payment success
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // Find user
      const user = await User.findOne({ email: session.customer_email });

      // Create subscription document
      const subscription = await Subscription.create({
        subscriberId: user._id,
        planName: "Pro Plan", // manually fixed name
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: "active",
        limits: {
          maxListings: 50,
          aiCredits: 1000,
          teamMembers: 1,
        },
      });

      // Create invoice document
      await Invoice.create({
        userId: user._id,
        subscriptionId: subscription._id,
        planId: subscription.planId,
        invoiceNumber: `INV-${Date.now()}`,
        amount: session.amount_total / 100,
        totalAmount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        status: "paid",
        paymentIntentId: session.payment_intent,
        stripeInvoiceId: session.subscription,
        paymentMethod: "card",
        paidAt: new Date(),
        periodStart: new Date(),
        periodEnd: subscription.endDate,
      });

      // Update user subscription
      user.subscriptionActive = true;
      user.subscriptionId = subscription._id;
      await user.save();

      // Send email to user
      await sendEmail(
        user.email,
        "Subscription Successful!",
        subscriptionSuccessTemplate(user.name)
      );

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
