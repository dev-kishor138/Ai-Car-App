import DevBuildError from "../lib/DevBuildError.js";
import Notification from "../models/Notification.js";

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
