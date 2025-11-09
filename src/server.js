import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import globalRoutes from "./routes/globalRoutes.js";
import dealerRoutes from "./routes/dealerRoutes.js";
import { isAuthenticated } from "./middleware/authMiddleware.js";
import { isAdmin, isDealer, isUser } from "./middleware/roleMiddleware.js";
import { checkSubscription } from "./middleware/checkSubscription.js";
import pusherRoutes from "./routes/pusherRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { handleStripeWebhook } from "./controllers/subscriptionController.js";

dotenv.config();
const app = express();
await connectDB();



// app.post(
//   "/stripe/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// // Enable CORS for all routes
// app.use(cors());
// // Middleware to parse JSON
// app.use(express.json());

app.use(cors());
app.use(express.json({
  verify: (req, _res, buf) => {
    // only save raw body if content-type looks like JSON (optional)
    // You can always save for everything, but skip for huge uploads if needed.
    req.rawBody = buf;
  }
}));

app.post("/stripe/webhook", handleStripeWebhook);

// ✅ Global routes
app.use("/", globalRoutes);
// ✅ user related routes
app.use("/user", isAuthenticated, isUser, checkSubscription, userRoutes);
// ✅ admin related routes
app.use("/admin", isAuthenticated, isAdmin, adminRoutes);
// ✅ Dealer related routes
// app.use("/dealer", isAuthenticated, isDealer, dealerRoutes);
app.use("/api", pusherRoutes);
app.use("/subscription", isAuthenticated, isUser, subscriptionRoutes);

app.use("/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Request From Server");
});

// ✅ Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
