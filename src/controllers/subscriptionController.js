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

// ✅ Step 1: Create Checkout Session
export const createSubscriptionSession = async (req, res, next) => {
  try {
    const user = req.user;
    // console.log("user", user);
    // Check trial
    if (user.trialEnd && user.trialEnd > new Date()) {
      return res.status(400).json({ message: "Trial is still active." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `drivest://subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `drivest://subscription-cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

// ✅ Step 2: Webhook to handle payment success
export const handleStripeWebhook = async (req, res) => {
  // console.log("This is from my /stripe/webhook ****");
  const sig = req.headers["stripe-signature"];
  // Debug logs (remove or comment out later)
  // console.log('stripe-signature header present:', !!sig);
  // console.log('typeof req.body:', typeof req.body);
  // console.log('req.body is Buffer:', req.body instanceof Buffer);
  // console.log('req.rawBody exists:', !!req.rawBody);
  // console.log('req.rawBody is Buffer:', req.rawBody instanceof Buffer);
  // if (req.rawBody) console.log('req.rawBody length:', req.rawBody.length);

  if (!sig) {
    console.error("Missing stripe-signature header");
    return res.status(400).send("Missing stripe-signature header");
  }

  // Ensure we have raw buffer
  const payload = req.rawBody;
  if (!payload || !Buffer.isBuffer(payload)) {
    console.error("No raw body buffer available for Stripe verification");
    return res.status(400).send("No raw body available for webhook verification");
  }

  let event;
  // console.log("env ", process.env.STRIPE_WEBHOOK_SECRET)

  try {
    // IMPORTANT: pass the raw Buffer (or raw string) to constructEvent
    event = stripe.webhooks.constructEvent(
      payload, // <-- raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Error From Subscription: ", err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // console.log("✅ stripe event verified:", event.type);


  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // 1️⃣ Find user
      const user = await User.findOne({ email: session.customer_email });

      // 2️⃣ Create subscription document
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

      // 3️⃣ Create invoice document
      const invoice = await Invoice.create({
        userId: user._id,
        subscriptionId: subscription._id,
        // planId: subscription.planId,
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


      // console.log("user", user)
      // 4️⃣ Update user subscription fields (THIS IS THE NEW PART)
      user.hasActiveSubscription = true;                     // schema field you already have
      user.subscriptionId = subscription._id;                // reference to subscription
      user.subscriptionStart = subscription.startDate;      // optional new field
      user.subscriptionEnd = subscription.endDate;          // optional new field
      user.subscriptionPlanName = subscription.planName;    // optional for quick UI display
      user.subscriptionStatus = subscription.status;        // mirror status
      user.lastSubscriptionPaymentAt = invoice.paidAt;      // optional useful field
      user.stripeCustomerId = subscription.stripeCustomerId; // optional convenience
      // If you had trial fields, mark trial used / clear trial
      user.isTrialUsed = true;
      user.trialEnd = null;
      await user.save();

      // 5️⃣ Send email to user
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
