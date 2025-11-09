// src/app.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import globalRoutes from "./routes/globalRoutes.js";
// import dealerRoutes from "./routes/dealerRoutes.js";
import { isAuthenticated } from "./middleware/authMiddleware.js";
import { isAdmin, isDealer, isUser } from "./middleware/roleMiddleware.js";
import pusherRoutes from "./routes/pusherRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import { handleStripeWebhook } from "./controllers/subscriptionController.js";

dotenv.config();

const app = express();

// DB connect
await connectDB();
app.use(cors());
app.use(express.json({
  verify: (req, _res, buf) => {
    // only save raw body if content-type looks like JSON (optional)
    // You can always save for everything, but skip for huge uploads if needed.
    req.rawBody = buf;
  }
}));

app.post("/stripe/webhook", handleStripeWebhook);



// Routes
app.use("/", globalRoutes);
app.use("/user", isAuthenticated, isUser, userRoutes);
app.use("/admin", isAuthenticated, isAdmin, adminRoutes);
// app.use("/dealer", isAuthenticated, isDealer, dealerRoutes);
app.use("/api", pusherRoutes);

app.use("/subscription", isAuthenticated, isUser, subscriptionRoutes);

app.get("/", (_req, res) => res.send("Hello, World!"));

// Error handler
app.use(errorHandler);

export default app;
