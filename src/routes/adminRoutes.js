import express from "express";
import {
  approvedUser,
  createUser,
  deleteUser,
  editUser,
  getAllUser,
  rejectUser,
  statusUpdate,
} from "../controllers/userController.js";
import { resetPassword } from "../controllers/authController.js";
import { getAllTicket } from "../controllers/ticketController.js";
import { getAllCar, searchCars } from "../controllers/carController.js";
import { deleteNotification } from "../controllers/notificationController.js";
import parser from "../storage/imageParser.js";
import { editProfile, resetUserPassword } from "../controllers/userProfileController.js";
import { getAllInvoices } from "../controllers/subscriptionController.js";

const adminRoutes = express.Router();

// Admin Only Route
adminRoutes.get("/profile", (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

// profile manage related Routes
adminRoutes.put("/edit-profile", parser.single("image"), editProfile);
adminRoutes.put("/change-password", resetUserPassword);

// user manage related Routes
adminRoutes.post("/create-user", createUser);
adminRoutes.get("/user-list", getAllUser);
adminRoutes.put("/edit-user/:userId", editUser);
adminRoutes.delete("/delete-user/:userId", deleteUser);
adminRoutes.put("/reset-password", resetPassword);
adminRoutes.put("/approved-user/:userId", approvedUser);
adminRoutes.put("/reject-user/:userId", rejectUser);
adminRoutes.put("/status-update/:userId", statusUpdate);

// ticket related routes
adminRoutes.get("/tickets", getAllTicket);

// car related routes
adminRoutes.get("/cars", searchCars);

// Notification delete routes
adminRoutes.delete("/notification/:id", deleteNotification);

userRoutes.get("/invoices", getAllInvoices);

export default adminRoutes;
