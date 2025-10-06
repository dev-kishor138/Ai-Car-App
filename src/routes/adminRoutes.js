import express from "express";
import { createUser, deleteUser, editUser, getAllUser } from "../controllers/userController.js";



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




export default adminRoutes;