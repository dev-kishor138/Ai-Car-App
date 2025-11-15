import Notification from "../models/Notification.js";

export const notifyRecipientsForNewCar = async (carDoc, mapped, recipients) => {
  if (!recipients || recipients.length === 0) return;

  const notifMessage = `🚗 New car listed: ${mapped.make || "Unknown Make"} ${
    mapped.model || ""
  } (${mapped.year || "Unknown Year"})`;

  const notifPromises = recipients.map(async (recipient) => {
    try {
      // Create notification record
      const notif = await Notification.create({
        userId: recipient._id,
        type: "alert",
        message: notifMessage,
        priority: "normal",
        status: "unread",
      });

      // Pusher channel name
      const channelName = `private-user-${recipient._id.toString()}`;

      // Pusher trigger
      try {
        await pusher.trigger(channelName, "new-notification", {
          notificationId: notif._id,
          title: "New Car Added",
          message: notifMessage,
          createdAt: notif.createdAt,
          carId: carDoc._id,
        });
      } catch (pushErr) {
        console.error("Pusher trigger failed for", recipient._id, pushErr);
      }

      return notif;
    } catch (err) {
      console.error("Failed to create notification for", recipient._id, err);
      return null;
    }
  });

  // Wait for all notification attempts (never throws)
  await Promise.allSettled(notifPromises);
};
