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

dotenv.config();

const app = express();

// DB connect
await connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/", globalRoutes);
app.use("/user", isAuthenticated, isUser, userRoutes);
app.use("/admin", isAuthenticated, isAdmin, adminRoutes);
// app.use("/dealer", isAuthenticated, isDealer, dealerRoutes);

app.get("/", (_req, res) => res.send("Hello, World!"));

// Error handler
app.use(errorHandler);

export default app;
