import express from "express";
import {
  loginUser,
  refreshToken,
  registerUser,
  resetPassword,
  sendOTP,
  verifyOTP,
} from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleLogin.js";
import { getUserFavorites } from "../controllers/globalController.js";

const globalRoutes = express.Router();

// Global Routes
globalRoutes.post("/register", registerUser);
globalRoutes.post("/login", loginUser);
globalRoutes.post("/refresh-token", refreshToken);

// globalRoutes.get("/check-token", checkToken);

// globalRoutes.post("/firebase-login", verifyFirebaseIdToken, loginWithFirebase);

// Route for sending OTP
globalRoutes.post("/forgot-password", sendOTP);

// Route for verifying OTP
globalRoutes.post("/verify-otp", verifyOTP);

// Route for resetting password
globalRoutes.post("/reset-password", resetPassword);

// google login route
globalRoutes.post("/google-login", googleLogin);

// all car list
// globalRoutes.get('/cars', getAllCar);

globalRoutes.get("/user-favorites/:id", getUserFavorites);

export default globalRoutes;
