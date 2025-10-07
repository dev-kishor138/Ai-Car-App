import DevBuildError from "../lib/DevBuildError.js";
import { generateTokens } from "../lib/generateToken.js";
import OtpCode from "../models/OtpCode.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";




// ✅ User Registration
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, image } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // return res.status(400).json({ message: "Email already exists" });
            throw new DevBuildError("Email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log("hashedPassword", hashedPassword);
        const user = new User({ name, email, password: hashedPassword, phone, image });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error('Error creating category:', error);
        // res.status(400).json({ error: error.message });
        next(error);
    }
};


// ✅ User Login with JWT
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // console.log("📌 Login Request:", email, password);

        // const user = await User.findOne({ email });
        const user = await User.findOne({ email }).select('password');

        // console.log("Password (input):", password);
        // console.log("Hashed Password (db):", user.password);

        if (!user) {
            throw new DevBuildError("User not found", 400);
            // return res.status(400).json({ message: "User not found" });
        }

        // Password Matching
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // return res.status(400).json({ message: "Invalid credentials" });
            throw new DevBuildError("Invalid credentials", 400);
        }

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(200).json({ message: "Login successful", accessToken, refreshToken });

    } catch (error) {
        // res.status(500).json({ error: error.message });
        next(error);
    }
};


// ✅ Refresh Token API
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        // if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });
        if (!refreshToken) throw new DevBuildError("Refresh token required", 401);

        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded) => {
            // if (err) return res.status(403).json({ message: "Invalid refresh token" });
            if (err) throw new DevBuildError("Invalid refresh token", 403);

            const accessToken = jwt.sign(
                { id: decoded.id },
                process.env.JWT_SECRET_TOKEN,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(200).json({ accessToken });
        });

    } catch (error) {
        // res.status(500).json({ error: error.message });
        next(error);
    }
};


// ✅ Send OTP to User's Email
export const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        // Generate OTP (6 digit random number)
        const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
        const otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes


        // Store OTP and its expiration in the user document (you can store in database or memory)
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send OTP to user's email using Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",  // Or use another email service
            auth: {
                user: process.env.EMAIL_USER,  // Your email (must be set in .env)
                pass: process.env.EMAIL_PASSWORD,  // Your email password (must be set in .env)
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return next(new DevBuildError("Failed to send OTP", 500));
            }
            res.status(200).json({ message: "OTP sent successfully!" });
        });
    } catch (error) {
        next(error);
    }
};


// ✅ Verify OTP
export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        // Check if OTP exists and is valid
        if (!user.otp || user.otpExpiration < Date.now()) {
            throw new DevBuildError("Invalid or expired OTP", 400);
        }

        // Compare the OTP
        if (user.otp !== otp) {
            throw new DevBuildError("Invalid OTP", 400);
        }

        // OTP verified, return success message
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
};


// ✅ Reset Password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new DevBuildError("User not found", 404);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        user.otp = undefined;  // Clear OTP
        user.otpExpiration = undefined;  // Clear OTP expiration time
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        next(error);
    }
};


