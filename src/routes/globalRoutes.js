import express from "express";
import { loginUser, refreshToken, registerUser } from "../controllers/userController.js";
import { getAllBlog, getSingleBlog } from "../controllers/blogController.js";

const globalRoutes = express.Router();

//🔗 Global Routes 
globalRoutes.post("/register", registerUser);
globalRoutes.post("/login", loginUser);
globalRoutes.post("/refresh-token", refreshToken);

// blogs 
globalRoutes.get("/blogs", getAllBlog);
globalRoutes.get("/blog/:slug", getSingleBlog);


export default globalRoutes;