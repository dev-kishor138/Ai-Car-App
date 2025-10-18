import express from "express";
import pusher from "../config/pusher.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

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

export default pusherRoutes;
