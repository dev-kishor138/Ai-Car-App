import pusher from "../config/pusher.js";
import Notification from "../models/Notification.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

// ✅ Create Ticket
export const createTicket = async (req, res, next) => {
  try {
    const user = req.user;
    const { email, phone, message } = req.body;

    const newTicket = new Ticket({
      userId: user._id,
      email: email || user.email,
      phone: phone || user.phone,
      message,
    });

    await newTicket.save();

    // 2️⃣ সব active admin খুঁজুন
    const admins = await User.find({ role: "admin", status: "active" }).select(
      "_id name email"
    );

    if (admins.length > 0) {
      // 3️⃣ প্রত্যেক admin এর জন্য notification তৈরি ও push পাঠানো
      const notifPromises = admins.map(async (admin) => {
        const notif = await Notification.create({
          userId: admin._id,
          type: "ticket",
          message: `New support ticket from ${user.name || "User"} (${
            user.email
          })`,
          priority: "normal",
          status: "unread",
        });

        const channelName = `private-admin-${admin._id.toString()}`;
        await pusher.trigger(channelName, "new-notification", {
          notificationId: notif._id,
          title: "New Support Ticket",
          message: `New support ticket from ${user.name || "User"} (${
            user.email
          })`,
          createdAt: notif.createdAt,
        });
      });

      await Promise.all(notifPromises);
    }

    res.status(201).json({
      success: true,
      message: "Ticket created successfully and admins notified",
    });
  } catch (error) {
    console.error("Error creating Ticket:", error);
    next(error);
  }
};

// ✅ get all Ticket
export const getAllTicket = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    if (!tickets.length) {
      return res.status(404).json({ message: "No tickets found" });
    }

    res.status(200).json({
      success: true,
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching Tickets:", error);
    next(error);
  }
};
