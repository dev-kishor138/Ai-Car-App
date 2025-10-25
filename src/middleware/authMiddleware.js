import jwt from "jsonwebtoken";
import User from "../models/User.js";

// export const isAuthenticated = async (req, res, next) => {
//     const token = req.headers["authorization"];

//     console.log("Received Token:", token);
//     console.log("JWT Token:", process.env.JWT_SECRET_TOKEN);
//     // let test = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
//     // console.log("test", test);

//     if (!token) {
//         return res.status(403).json({ message: "No token provided, access denied." });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
//         console.log(decoded);
//         req.user = await User.findById(decoded.userId);
//         next();
//     } catch (error) {
//          console.error("Error in token verification:", error);
//         return res.status(401).json({ message: "Invalid token." });
//     }
// };

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  // console.log("Received Token:", token);
  // console.log("JWT Secret from Env:", process.env.JWT_SECRET_TOKEN);  // Log secret from env

  if (!token) {
    return res
      .status(403)
      .json({ message: "No token provided, access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN); // Verify using the correct secret key
    // console.log("Decoded Token:", decoded);  // Log decoded token for debugging
    console.log("isAuthenticate :", req.user);
    req.user = await User.findById(decoded.id); // Ensure you are passing the correct user ID
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in token verification:", error); // Log error details
    return res.status(401).json({ message: "Invalid token." });
  }
};
