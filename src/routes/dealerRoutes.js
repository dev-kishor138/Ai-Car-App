import express from "express";



const dealerRoutes = express.Router();

// Delaer Only Route
dealerRoutes.get("/profile", (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
});



export default dealerRoutes;