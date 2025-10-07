import express from "express";
import { editUser } from "../controllers/userController.js";
import { resetPassword } from "../controllers/authController.js";
import { createTicket } from "../controllers/ticketController.js";


const userRoutes = express.Router();

// 🔒 Protected Route
userRoutes.get("/profile", (req, res) => {
    console.log(req.user);
    res.json({ message: "Welcome to your profile", user: req.user });
});


// user manage related Routes
userRoutes.put('/edit-user/:userId', editUser);
userRoutes.put('/reset-password', resetPassword);

// help & feedback related routes 
userRoutes.post('/create-ticket', createTicket);

export default userRoutes;