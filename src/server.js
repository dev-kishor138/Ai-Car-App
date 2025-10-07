import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import globalRoutes from "./routes/globalRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import dealerRoutes from "./routes/dealerRoutes.js";
import { isAuthenticated } from "./middleware/authMiddleware.js";
import { isAdmin, isDealer, isUser } from "./middleware/roleMiddleware.js";

dotenv.config();
const app = express();
connectDB();
// Enable CORS for all routes
app.use(cors());
// Middleware to parse JSON
app.use(express.json());

// ✅ Global routes
app.use("/", globalRoutes);
// ✅ user related routes 
app.use("/user", isAuthenticated, isUser, userRoutes);
// ✅ admin related routes 
app.use("/admin", isAuthenticated, isAdmin, adminRoutes);
// ✅ Dealer related routes 
// app.use("/dealer", isAuthenticated, isDealer, dealerRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// ✅ Error Handling Middleware 
app.use(errorHandler);


// ===================================
// 🟢 SOCKET.IO CONFIGURATION STARTS
// ===================================

const httpServer = createServer(app);

// initialize Socket.io 
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("user connected: ", socket.id);

    socket.on("disconnect", () => {
        console.log("user disconnected: ", socket.id)
    })
})


app.set("io", io);

// ===================================
// 🟢 SOCKET.IO CONFIGURATION ENDS
// ===================================

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

httpServer.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})