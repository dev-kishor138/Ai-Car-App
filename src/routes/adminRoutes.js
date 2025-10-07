import express from "express";
import { approvedUser, createUser, deleteUser, editUser, getAllUser } from "../controllers/userController.js";
import { resetPassword } from "../controllers/authController.js";



const adminRoutes = express.Router();

// Admin Only Route
adminRoutes.get("/profile", (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
});

// user manage related Routes
adminRoutes.post('/create-user', createUser);
adminRoutes.get('/user-list', getAllUser);
adminRoutes.put('/edit-user/:userId', editUser);
adminRoutes.delete('/delete-user/:userId', deleteUser);
adminRoutes.put('/reset-password', resetPassword);
adminRoutes.put('/approved-user/:userId', approvedUser);




export default adminRoutes;