import jwt from "jsonwebtoken";


// JWT Token Generate Function
export const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_TOKEN,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};


// export const generateTokens = (user, remember = false) => {
//   const accessToken = jwt.sign(
//     { id: user._id, email: user.email, role: user.role },
//     process.env.JWT_SECRET_TOKEN,
//     { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
//   );

//   // determine refresh expiry string
//   const refreshExpiry = remember ? "30d" : (process.env.JWT_REFRESH_EXPIRES_IN || "7d");

//   const refreshToken = jwt.sign(
//     { id: user._id },
//     process.env.JWT_REFRESH_TOKEN,
//     { expiresIn: refreshExpiry }
//   );

//   return { accessToken, refreshToken, refreshExpiry };
// };