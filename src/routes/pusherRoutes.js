import express from "express";
import pusher from "../config/pusher.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import Notification from "../models/Notification.js";

const pusherRoutes = express.Router();

pusherRoutes.post("/pusher/auth", isAuthenticated, isAdmin, (req, res) => {
  try {
    const { socket_id, channel_name } = req.body;
    const auth = pusher.authenticate(socket_id, channel_name);
    res.send(auth);
  } catch (err) {
    res.status(500).send({ error: "Pusher auth failed" });
  }
});

pusherRoutes.get("/notifications", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifs });
  } catch (err) {
    next(err);
  }
});


export default pusherRoutes;
