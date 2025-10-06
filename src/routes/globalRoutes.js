import express from "express";
import { loginUser, refreshToken, registerUser, resetPassword, sendOTP, verifyOTP } from "../controllers/authController.js";

const globalRoutes = express.Router();

// Global Routes 
globalRoutes.post("/register", registerUser);
globalRoutes.post("/login", loginUser);
globalRoutes.post("/refresh-token", refreshToken);

// Route for sending OTP
globalRoutes.post("/forgot-password", sendOTP);

// Route for verifying OTP
globalRoutes.post("/verify-otp", verifyOTP);

// Route for resetting password
globalRoutes.post("/reset-password", resetPassword);


export default globalRoutes;