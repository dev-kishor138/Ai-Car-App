import DevBuildError from "../lib/DevBuildError.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const isProd = process.env.NODE_ENV === "production";

  // ডিফল্ট
  let status = err.statusCode || 500;
  let message = err.message || "Unknown error";

  // কাস্টম বিজনেস এরর
  if (err instanceof DevBuildError) {
    status = err.statusCode || status;
    message = err.message || message;
  }

  // কমন এরর ম্যাপিং (ঐচ্ছিক কিন্তু কাজে লাগে)
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  }
  if (err.code === 11000) { // Mongo duplicate key
    status = 409;
    const fields = Object.keys(err.keyValue || {});
    message = `Duplicate value for: ${fields.join(", ") || "unknown field"}`;
  }
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // লগ রাখা (ডিবাগিংয়ে কাজে দেবে)
  console.error("🔥 Error:", {
    method: req.method,
    url: req.originalUrl,
    status,
    message,
    stack: err.stack,
  });

  // রেসপন্স—প্রোডে stack লুকাও, ডেভে দেখাও
  const payload = { success: false, message };
  if (!isProd && err.stack) payload.stack = err.stack;

  return res.status(status).json(payload);
};

export default errorHandler;
