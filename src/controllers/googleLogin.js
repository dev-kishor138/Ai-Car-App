import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import jwt from 'jsonwebtoken';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Sign-In Authentication
export const googleLogin = async (req, res, next) => {
  try {
    const { tokenId } = req.body;

    // Verify the token ID with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,  // Verify the client ID
    });

    const payload = ticket.getPayload();

    // Check if the user already exists in the database
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        name: payload.name,
        email: payload.email,
        image: payload.picture,
        password: "Google_Sign_In_Password", // Set a placeholder password for Google users
      });

      await user.save();
    }

    // Generate JWT Token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ message: "Google login successful", accessToken });
  } catch (error) {
    console.error("Google login failed:", error);
    next(error);
  }
};