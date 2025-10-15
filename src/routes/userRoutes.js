import express from "express";
import { createTicket } from "../controllers/ticketController.js";
import { getBrands } from "../controllers/brandController.js";
import {
  addFavorite,
  getCarFavoriteCount,
  getMyFavorites,
  isFavorited,
  removeFavorite,
  toggleFavorite,
} from "../controllers/favoriteController.js";
import { editProfile, resetUserPassword } from "../controllers/userProfileController.js";
// import {
//   createSubscriptionSession,
//   handleStripeWebhook,
// } from "../controllers/subscriptionController.js";

const userRoutes = express.Router();

// 🔒 Protected Route
userRoutes.get("/profile", (req, res) => {
  console.log(req.user);
  res.json({ message: "Welcome to your profile", user: req.user });
});

// user manage related Routes
userRoutes.put("/edit-profile", editProfile);
userRoutes.put("/reset-password", resetUserPassword);

// help & feedback related routes
userRoutes.post("/create-ticket", createTicket);

// brand related routes
userRoutes.get("/brands", getBrands);

// whishList related route
// Toggle favorite
userRoutes.post("/favorites/toggle", toggleFavorite);
// Add favorite (idempotent)
userRoutes.post("/favorites", addFavorite);
// Remove favorite
userRoutes.delete("/favorites/:carId", removeFavorite);
// My favorites list (paginated)
userRoutes.get("/favorites", getMyFavorites);
// Is this car favored by me?
userRoutes.get("/favorites/:carId/is-favorited", isFavorited);
// Count how many users favored this car
userRoutes.get("/cars/:carId/favorites/count", getCarFavoriteCount);

// // Create subscription session
// userRoutes.post("/subscription/create", createSubscriptionSession);

// // Stripe webhook
// userRoutes.post(
//   "/stripe/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

export default userRoutes;
