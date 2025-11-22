import DevBuildError from "../lib/DevBuildError.js";
import Notification from "../models/Notification.js";

// ✅ Get Notification
export const getNotification = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifs });
  } catch (err) {
    next(err);
  }
};

// ✅ Notification Delete
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      throw new DevBuildError("Notification not found", 404);
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ✅ Mark Multiple Notifications as Read
export const markNotificationsAsRead = async (req, res, next) => {
  try {
    const { ids } = req.body; // array of notification IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new DevBuildError("No notification IDs provided", 400);
    }

    const result = await Notification.updateMany(
      { _id: { $in: ids }, userId: req.user._id },
      { $set: { status: "read", seenAt: new Date() } }
    );

    res.json({
      success: true,
      message: "Notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};


// ✅ Mark Ass as Read
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, status: "unread" },
      { $set: { status: "read", seenAt: new Date() } }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};
