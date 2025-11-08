import axios from "axios";

const PYTHON_API_BASE = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

// analyze Cars
export const analyzeCars = async (req, res, next) => {
  try {
    const response = await axios.post(
      `${PYTHON_API_BASE}/analyze-cars/`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

// compare Cars
export const compareCarsAI = async (req, res, next) => {
  try {
    const response = await axios.post(
      `${PYTHON_API_BASE}/compare-cars/`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

// Ai Suggest
export const aiSuggest = async (req, res, next) => {
  try {
    const response = await axios.post(
      `${PYTHON_API_BASE}/ai-suggest/`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

// import Cars
export const importScrapedCars = async (req, res, next) => {
  try {
    const cars = req.body.cars;

    if (!Array.isArray(cars)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const newCars = cars.map((car) => ({
      dealerId: car.dealerId || null,
      title: car.title || "",
      make: car.make || "",
      model: car.model || "",
      year: car.year ? Number(car.year) : null,
      price: car.price ? Number(car.price) : null,
      mileage: car.mileage ? Number(car.mileage) : null,
      currency: car.currency || "USD",
      status: "published",
      description: car.description || "",
      source: { type: "scraped", importedAt: new Date() },
      location: {
        city: car.city || "",
        country: car.country || "Unknown",
      },
    }));

    // ✅ Insert or Update by VIN/Title
    for (const car of newCars) {
      await Car.updateOne(
        { vin: car.vin || car.title },
        { $set: car },
        { upsert: true }
      );

      // const notifMessage = `🚗 New car listed: ${car.make} ${car.model} (${
      //   car.year || "Unknown Year"
      // })`;

      // const recipients = await User.find({
      //   status: "active",
      //   role: { $in: ["admin", "user"] },
      // }).select("_id name email");

      // const notifPromises = recipients.map(async (recipient) => {
      //   const notif = await Notification.create({
      //     userId: recipient._id,
      //     type: "alert",
      //     message: notifMessage,
      //     priority: "normal",
      //     status: "unread",
      //   });

      //   // pusher private channel (যেমন private-user-{id})
      //   const channelName = `private-user-${recipient._id.toString()}`;
      //   await pusher.trigger(channelName, "new-notification", {
      //     notificationId: notif._id,
      //     title: "New Car Added",
      //     message: notifMessage,
      //     createdAt: notif.createdAt,
      //   });

      //   return notif;
      // });

      // await Promise.all(notifPromises);
    }

    res.status(200).json({
      success: true,
      message: "Cars imported successfully",
      count: newCars.length,
    });
  } catch (error) {
    next(error);
  }
};
