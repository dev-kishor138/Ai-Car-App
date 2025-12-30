import DevBuildError from "../lib/DevBuildError.js";
import {
  otpEmailTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate,
} from "../lib/emailTemplates.js";
import { generateTokens } from "../lib/generateToken.js";
import { sendEmail } from "../lib/mailer.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Notification from "../models/Notification.js";
import pusher from "../config/pusher.js";

// ✅ User Registration
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, image } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new DevBuildError("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 👉 Step 1: Create user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      image,
    });

    // 👉 Step 2: Assign free trial (only if not already used)
    if (!user.isTrialUsed) {
      const now = new Date();
      user.trialStart = now;
      user.trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
      user.isTrialUsed = true;
    }
    user.status = 'active';

    // 👉 Step 3: Save user
    await user.save();

    // --- find all active admins ---
    const admins = await User.find({ role: "admin", status: "active" }).select(
      "_id name email"
    );
    // console.log("admins", admins);

    // --- create notification for each admin & trigger pusher per admin private channel ---
    const notifPromises = admins.map(async (admin) => {
      // create per-admin notification (so admin can mark read/dismiss)
      const notif = await Notification.create({
        userId: admin._id, // receiver admin id
        type: "info",
        message: `New user registered: ${user.name} (${user.email})`,
        priority: "normal",
        status: "unread",
      });

      // trigger private channel for that admin
      // channel name convention: private-admin-{adminId}
      const channelName = `private-admin-${admin._id.toString()}`;
      await pusher.trigger(channelName, "new-notification", {
        notificationId: notif._id,
        title: "New User Registered",
        message: `New user registered: ${user.name} (${user.email})`,
        createdAt: notif.createdAt,
      });

      return notif;
    });

    await Promise.all(notifPromises);

    // 👉 Step 4: Send Welcome Email
    await sendEmail(
      {
        to: email,
        subject: "🎉 Welcome to Drivest!",
        html: welcomeEmailTemplate(name),
      },
      next
    );

    res.status(201).json({
      message: "User registered successfully with 7-day free trial",
      trialStart: user.trialStart,
      trialEnd: user.trialEnd,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select(
        "name email role status trialEnd hasActiveSubscription subscriptionId +password"
      )
      .populate({
        path: "subscriptionId",
        select: "status endDate",
      })
      .lean();

    if (!user) {
      throw new DevBuildError("User not found", 400);
    }

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new DevBuildError("Invalid credentials", 400);
    }

    // Normalize role
    const role = (user.role || "").toString().toLowerCase();
    const isAdmin = role === "admin" || role.includes("admin");
    const { accessToken, refreshToken } = generateTokens(user);
    // -----------------------------------------
    // ⭐ ADMIN → No status check, no subscription check, nothing.
    // -----------------------------------------
    if (isAdmin) {
      return res.status(200).json({
        message: "Admin login successful",
        accessToken,
        refreshToken,
      });
    }

    // -----------------------------------------
    // ⭐ NON-ADMIN USERS → Status Check
    // -----------------------------------------
    const status = (user.status || "").toLowerCase();

    if (status === "inactive" || status === "deactivated") {
      return res.status(403).json({
        message: "You are a deactivated user.",
        code: "USER_DEACTIVATED",
      });
    }

    if (status === "pending") {
      return res.status(403).json({
        message: "Your account is pending admin approval.",
        code: "USER_PENDING",
      });
    }

    // -----------------------------------------
    // ⭐ NON-ADMIN USERS → Subscription / Trial Check
    // -----------------------------------------
    const now = new Date();

    const hasActiveSub =
      !!user.hasActiveSubscription ||
      !!(
        user.subscriptionId &&
        user.subscriptionId.status === "active" &&
        user.subscriptionId.endDate &&
        new Date(user.subscriptionId.endDate) >= now
      );

    const trialValid = !!(user.trialEnd && new Date(user.trialEnd) >= now);

    if (!hasActiveSub && !trialValid) {
      return res.status(403).json({
        message:
          "Access denied. Your trial expired and no active subscription found.",
        trialExpired: true,
        code: "NO_ACTIVE_SUBSCRIPTION",
        accessToken,
        refreshToken,
      });
    }

    // -----------------------------------------
    // ⭐ Everything OK → Generate tokens
    // -----------------------------------------

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
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


// // ✅ Access Token Check
// export const checkToken = async (req, res, next) => {
//   try {
//     const { refreshToken } = req.body;
//     // if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });
//     if (!refreshToken) throw new DevBuildError("Refresh token required", 401);

//     jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded) => {
//       // if (err) return res.status(403).json({ message: "Invalid refresh token" });
//       if (err) throw new DevBuildError("Invalid refresh token", 403);

//       const accessToken = jwt.sign(
//         { id: decoded.id },
//         process.env.JWT_SECRET_TOKEN,
//         { expiresIn: process.env.JWT_EXPIRES_IN }
//       );

//       res.status(200).json({ accessToken });
//     });
//   } catch (error) {
//     // res.status(500).json({ error: error.message });
//     next(error);
//   }
// };


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

    // 👉 Step 4: Send OTP Email
    const mailSendResponse = await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: otpEmailTemplate(user?.name, otp),
    });

    // console.log(mailSendResponse);

    // 👉 Step 5: Send response
    res.status(200).json({ message: "OTP sent successfully!" });
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

    const user = await User.findOne({ email });
    if (!user) {
      throw new DevBuildError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: passwordResetTemplate(user.name),
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

export const loginWithFirebase = async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.firebaseUser;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || "User",
        image: picture || null,
        authProvider: "firebase",
      });
    } else {
      if (!user.image && picture) user.image = picture;
      if (!user.name && name) user.name = name;
      await user.save();
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role || "user" },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      ok: true,
      message: "Login via Firebase successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      accessToken,
    });
  } catch (e) {
    next(e);
  }
};
