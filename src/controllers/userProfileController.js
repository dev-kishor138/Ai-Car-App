import DevBuildError from "../lib/DevBuildError.js";
import { passwordResetTemplate } from "../lib/emailTemplates.js";
import { sendEmail } from "../lib/mailer.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// ✅ User profile Edit (Update)
export const editProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email, phone, image, dob, address } = req.body;

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      throw new DevBuildError("User not found", 404);
    }

    userProfile.name = name || user.name;
    userProfile.email = email || user.email;
    userProfile.phone = phone || user.phone;
    userProfile.image = image || user.image;
    userProfile.dob = dob || user.dob;
    userProfile.address = address || user.address;

    await userProfile.save();

    res.status(200).json({ message: "User updated successfully", userProfile });
  } catch (error) {
    next(error);
  }
};

// ✅ Reset Password
export const resetUserPassword = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new DevBuildError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
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
