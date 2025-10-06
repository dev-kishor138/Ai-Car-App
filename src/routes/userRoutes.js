import express from "express";


const userRoutes = express.Router();

// 🔒 Protected Route
userRoutes.get("/profile", (req, res) => {
    console.log(req.user);
    res.json({ message: "Welcome to your profile", user: req.user });
});



export default userRoutes;