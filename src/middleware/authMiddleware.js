import jwt from "jsonwebtoken";
import User from "../models/User.js";


// export const isAuthenticated = async (req, res, next) => {
//   const token = req.headers["authorization"]?.replace("Bearer ", "");
//   // console.log("Received Token:", token);
//   // console.log("JWT Secret from Env:", process.env.JWT_SECRET_TOKEN);  // Log secret from env

//   if (!token) {
//     return res
//       .status(403)
//       .json({ message: "No token provided, access denied." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN); // Verify using the correct secret key
//     // console.log("Decoded Token:", decoded);  // Log decoded token for debugging
//     req.user = await User.findById(decoded.id); // Ensure you are passing the correct user ID
//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     console.error("Error in token verification:", error); // Log error details
//     return res.status(401).json({ message: "Invalid token." });
//   }
// };


export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or bad format." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided, access denied." });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    } catch (error) {
      console.error("Error in token verification:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired, please log in again." });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Malformed or invalid token." });
      } else {
        return res.status(500).json({ message: "Token verification failed." });
      }
    }

    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Unexpected auth middleware error:", err);
    return res.status(500).json({ message: "Server error in authentication." });
  }
};
