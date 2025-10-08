import express from "express";
import { loginUser, loginWithFirebase, refreshToken, registerUser, resetPassword, sendOTP, verifyOTP } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleLogin.js";
import { carList, debugPage, probeRapid } from "../controllers/carController.js";
import { verifyFirebaseIdToken } from "../middleware/firebaseAuth.js";

const globalRoutes = express.Router();

// Global Routes 
globalRoutes.post("/register", registerUser);
globalRoutes.post("/login", loginUser);
globalRoutes.post("/refresh-token", refreshToken);


globalRoutes.post("/auth/firebase-login", verifyFirebaseIdToken, loginWithFirebase);

// Route for sending OTP
globalRoutes.post("/forgot-password", sendOTP);

// Route for verifying OTP
globalRoutes.post("/verify-otp", verifyOTP);

// Route for resetting password
globalRoutes.post("/reset-password", resetPassword);

// google login route 
globalRoutes.post('/google-login', googleLogin);

// all car list
globalRoutes.get('/car-list', carList);
globalRoutes.get("/_debug/page", debugPage);
globalRoutes.get("/_debug/probe-rapid", probeRapid);


export default globalRoutes;