import express from "express";
import { editUser } from "../controllers/userController.js";
import { resetPassword } from "../controllers/authController.js";



const dealerRoutes = express.Router();

// Delaer Only Route
dealerRoutes.get("/profile", (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
});


// user manage related Routes
dealerRoutes.put('/edit-user/:userId', editUser);
dealerRoutes.put('/reset-password', resetPassword);

// help & feedback related routes 




export default dealerRoutes;