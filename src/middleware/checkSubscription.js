import User from "../models/User.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("subscriptionId");

    // 1️⃣ Admin role always allowed
    if (user.role === "admin") return next();

    const now = new Date();

    // 2️⃣ Check active paid subscription
    if (user.hasActiveSubscription && user.subscriptionId) {
      const sub = user.subscriptionId;
      if (sub.status === "active" && sub.endDate > now) {
        return next(); // ✅ Subscription active
      }
    }

    // 3️⃣ Check free trial
    if (user.trialEnd && now <= user.trialEnd) {
      return next(); // ✅ Still in free trial
    }

    // 4️⃣ Trial expired and no subscription
    return res.status(403).json({
      message: "Your free trial has expired. Please subscribe to continue.",
      trialExpired: true,
    });
  } catch (err) {
    console.error("Subscription check failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};