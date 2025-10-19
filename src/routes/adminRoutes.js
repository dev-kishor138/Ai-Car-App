import express from "express";
import {
  approvedUser,
  createUser,
  deleteUser,
  editUser,
  getAllUser,
  rejectUser,
} from "../controllers/userController.js";
import { resetPassword } from "../controllers/authController.js";
import { getAllTicket } from "../controllers/ticketController.js";
import { getAllCar, searchCars } from "../controllers/carController.js";
import { deleteNotification } from "../controllers/notificationController.js";

const adminRoutes = express.Router();

// Admin Only Route
adminRoutes.get("/profile", (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

// user manage related Routes
adminRoutes.post("/create-user", createUser);
adminRoutes.get("/user-list", getAllUser);
adminRoutes.put("/edit-user/:userId", editUser);
adminRoutes.delete("/delete-user/:userId", deleteUser);
adminRoutes.put("/reset-password", resetPassword);
adminRoutes.put("/approved-user/:userId", approvedUser);
adminRoutes.put("/approved-user/:userId", approvedUser);
adminRoutes.put("/reject-user/:userId", rejectUser);

// ticket related routes
adminRoutes.get("/tickets", getAllTicket);

// car related routes
adminRoutes.get("/cars", searchCars);

// Notification delete routes
adminRoutes.delete("/notification/:id", deleteNotification);

export default adminRoutes;
