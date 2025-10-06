import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
import { generateTokens } from "../lib/generateToken.js";
import DevBuildError from "../lib/DevBuildError.js";

// dotenv.config();

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
        console.log("📌 Login Request:", email, password);
        const user = await User.findOne({ email });

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

// ✅ get all users
// export const getAllUser = async (req, res) => {
//     try {
//         const users = await User.find();  // Get all users from database
//         res.status(200).json(users);      // Return the list of users
//     } catch (error) {
//         res.status(400).json({ error: error.message }); // Error handling
//     }
// }