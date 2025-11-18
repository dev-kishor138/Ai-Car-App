import axios from "axios";
import Car from "../models/Car.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import pusher from "../config/pusher.js";
const { Types } = mongoose;

const PYTHON_API_BASE = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
// console.log("PYTHON_API_BASE", PYTHON_API_BASE);

/**
 * Helper: basic URL validation
 */
function isValidHttpUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}

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

export const importScrapedCars = async (req, res, next) => {
  try {
    const cars = req.body.cars;
    console.log(
      "*****Cars payload length:",
      Array.isArray(cars) ? cars.length : 0
    );
    console.log("*****Cars payload", Array.isArray(cars) ? cars : null);

    if (!Array.isArray(cars)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid format" });
    }

    const imported = [];
    const MAX_IMAGES_PER_CAR = Number(process.env.MAX_IMAGES_PER_CAR) || 12;

    // Load recipients ONCE (admins + users). If you want different recipients (e.g., subscribers),
    // change this query accordingly.
    const recipients = await User.find({
      status: "active",
      role: { $in: ["admin", "user"] },
    }).select("_id name email");

    // Helper: send notifications for a newly created car
    const notifyRecipientsForNewCar = async (carDoc, mapped) => {
      if (!recipients || recipients.length === 0) return;

      const notifMessage = `🚗 New car listed: ${
        mapped.make || "Unknown Make"
      } ${mapped.model || ""} (${mapped.year || "Unknown Year"})`;

      const notifPromises = recipients.map(async (recipient) => {
        try {
          const notif = await Notification.create({
            userId: recipient._id,
            type: "alert",
            message: notifMessage,
            priority: "normal",
            status: "unread",
          });

          const channelName = `private-user-${recipient._id.toString()}`;
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
          console.error(
            "Failed to create notification for",
            recipient._id,
            err
          );
          return null;
        }
      });

      // Be resilient: wait for all attempts, but don't throw on partial failure
      await Promise.allSettled(notifPromises);
    };

    for (const scraped of cars) {
      // map basic fields
      const mapped = {
        dealerId: scraped.dealerId || scraped.dealerId || undefined, // optional
        sellerUserId: scraped.sellerUserId || undefined,
        title: scraped.title || "",
        make: scraped.make || scraped.brand || "",
        model: scraped.model || "",
        brand: scraped.brand || "",
        trim: scraped.trim || scraped.vehicleTrim || "",
        year:
          scraped.year_numeric || scraped.year
            ? Number(scraped.year || scraped.year_numeric)
            : undefined,
        price:
          scraped.price_numeric || scraped.price
            ? Number(scraped.price || scraped.price_numeric)
            : undefined,
        currency: scraped.currency || "USD",
        mileage:
          scraped.mileage_numeric || scraped.mileage
            ? Number(scraped.mileage || scraped.mileage_numeric)
            : undefined,
        condition: scraped.condition || undefined,
        fuelType: scraped.fuelType || undefined,
        transmission: scraped.transmission || undefined,
        bodyType: scraped.bodyType || undefined,
        driveType: scraped.driveType || undefined,
        color: scraped.color || undefined,
        features: Array.isArray(scraped.features)
          ? scraped.features
          : scraped.features
          ? [scraped.features]
          : [],
        specs: scraped.specs || {},
        description: scraped.description || scraped.raw_text || "",
        status: scraped.status || "published",
        source: {
          type: "scraped",
          sourceId: scraped.sourceId || scraped.url || null,
          importedAt: new Date(),
        },
        location: {
          city: scraped.city || "",
          country: scraped.country || "",
        },
        vin: scraped.vin || undefined,
        ai: scraped.ai || undefined,
      };

      // build upsert query: prefer VIN
      const query = mapped.vin
        ? { vin: mapped.vin }
        : { title: mapped.title, make: mapped.make, year: mapped.year };

      // Detect if document already exists (to decide whether to notify)
      const existing = await Car.findOne(query).select("_id");

      // upsert car doc
      let carDoc = await Car.findOneAndUpdate(
        query,
        { $set: mapped },
        { new: true, upsert: true }
      );

      // Ensure carDoc is a mongoose document (fallback if findOneAndUpdate returns raw object)
      if (!carDoc || !carDoc._id) {
        carDoc = await Car.findOne(query);
        if (!carDoc) {
          carDoc = await Car.create(mapped);
        }
      }

      // --- Media embed handling (no MediaAsset collection) ---
      const rawImages = Array.isArray(scraped.images) ? scraped.images : [];
      const imageUrls = rawImages
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter(Boolean)
        .filter((u) => isValidHttpUrl(u))
        .slice(0, MAX_IMAGES_PER_CAR);

      if (imageUrls.length > 0) {
        // Option: generate ObjectIds for coverId/galleryIds if you want ids (uncomment to enable)
        // const generatedIds = imageUrls.map(() => Types.ObjectId());
        // const coverId = generatedIds[0];

        // We will keep ids null (or you can uncomment above to set ObjectIds)
        const coverId = null; // or: generatedIds[0]
        const galleryIds = imageUrls.map(() => null); // or: generatedIds

        const coverObj = {
          _id: coverId,
          url: imageUrls[0] || null,
          mime: null,
          thumbUrl: null,
          width: null,
          height: null,
        };

        const galleryObjs = imageUrls.map((u, idx) => ({
          _id: galleryIds[idx] || null,
          url: u,
          mime: null,
          thumbUrl: null,
          width: null,
          height: null,
        }));

        // assign media subdocument
        carDoc.media = {
          coverId: coverId,
          cover: coverObj,
          galleryIds: galleryIds,
          gallery: galleryObjs,
        };

        await carDoc.save();
      }

      // push into imported result
      imported.push({
        carId: carDoc._id,
        title: carDoc.title,
        imagesCount: imageUrls.length,
      });

      // IF it was not existing before, it's a new created record -> notify
      if (!existing) {
        // Fire-and-forget but await to ensure we don't overload DB/pusher at once.
        try {
          await notifyRecipientsForNewCar(carDoc, mapped);
        } catch (notifyErr) {
          console.error(
            "Notification sending failed for car",
            carDoc._id,
            notifyErr
          );
          // continue without failing the whole import
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: imported.length,
      imported,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * importScrapedCars (embed media inside Car document; no MediaAsset collection)
 */
// export const importScrapedCars = async (req, res, next) => {
//   try {
//     const cars = req.body.cars;
//     console.log(
//       "*****Cars payload length:",
//       Array.isArray(cars) ? cars.length : 0
//     );
//     console.log("*****Cars payload", Array.isArray(cars) ? cars : null);

//     if (!Array.isArray(cars)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid format" });
//     }

//     const imported = [];
//     const MAX_IMAGES_PER_CAR = Number(process.env.MAX_IMAGES_PER_CAR) || 12;

//     for (const scraped of cars) {
//       // map basic fields
//       const mapped = {
//         dealerId: scraped.dealerId || scraped.dealerId || undefined, // optional
//         sellerUserId: scraped.sellerUserId || undefined,
//         title: scraped.title || "",
//         make: scraped.make || scraped.brand || "",
//         model: scraped.model || "",
//         trim: scraped.trim || scraped.vehicleTrim || "",
//         year:
//           scraped.year_numeric || scraped.year
//             ? Number(scraped.year || scraped.year_numeric)
//             : undefined,
//         price:
//           scraped.price_numeric || scraped.price
//             ? Number(scraped.price || scraped.price_numeric)
//             : undefined,
//         currency: scraped.currency || "USD",
//         mileage:
//           scraped.mileage_numeric || scraped.mileage
//             ? Number(scraped.mileage || scraped.mileage_numeric)
//             : undefined,
//         condition: scraped.condition || undefined,
//         fuelType: scraped.fuelType || undefined,
//         transmission: scraped.transmission || undefined,
//         bodyType: scraped.bodyType || undefined,
//         driveType: scraped.driveType || undefined,
//         color: scraped.color || undefined,
//         features: Array.isArray(scraped.features)
//           ? scraped.features
//           : scraped.features
//           ? [scraped.features]
//           : [],
//         specs: scraped.specs || {},
//         description: scraped.description || scraped.raw_text || "",
//         status: scraped.status || "published",
//         source: {
//           type: "scraped",
//           sourceId: scraped.sourceId || scraped.url || null,
//           importedAt: new Date(),
//         },
//         location: {
//           city: scraped.city || "",
//           country: scraped.country || "",
//         },
//         vin: scraped.vin || undefined,
//         ai: scraped.ai || undefined,
//       };

//       // build upsert query: prefer VIN
//       const query = mapped.vin
//         ? { vin: mapped.vin }
//         : { title: mapped.title, make: mapped.make, year: mapped.year };

//       // upsert car doc
//       let carDoc = await Car.findOneAndUpdate(
//         query,
//         { $set: mapped },
//         { new: true, upsert: true }
//       );

//       // --- Media embed handling (no MediaAsset collection) ---
//       const rawImages = Array.isArray(scraped.images) ? scraped.images : [];
//       const imageUrls = rawImages
//         .map((u) => (typeof u === "string" ? u.trim() : ""))
//         .filter(Boolean)
//         .filter((u) => isValidHttpUrl(u))
//         .slice(0, MAX_IMAGES_PER_CAR);

//       if (imageUrls.length > 0) {
//         // Option: generate ObjectIds for coverId/galleryIds if you want ids (uncomment to enable)
//         // const generatedIds = imageUrls.map(() => Types.ObjectId());
//         // const coverId = generatedIds[0];

//         // We will keep ids null (or you can uncomment above to set ObjectIds)
//         const coverId = null; // or: generatedIds[0]
//         const galleryIds = imageUrls.map(() => null); // or: generatedIds

//         const coverObj = {
//           _id: coverId,
//           url: imageUrls[0] || null,
//           mime: null,
//           thumbUrl: null,
//           width: null,
//           height: null,
//         };

//         const galleryObjs = imageUrls.map((u, idx) => ({
//           _id: galleryIds[idx] || null,
//           url: u,
//           mime: null,
//           thumbUrl: null,
//           width: null,
//           height: null,
//         }));

//         // assign media subdocument
//         carDoc.media = {
//           coverId: coverId,
//           cover: coverObj,
//           galleryIds: galleryIds,
//           gallery: galleryObjs,
//         };

//         await carDoc.save();
//       }

//       imported.push({
//         carId: carDoc._id,
//         title: carDoc.title,
//         imagesCount: imageUrls.length,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       count: imported.length,
//       imported,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// import Cars
// export const importScrapedCars = async (req, res, next) => {
//   try {
//     const cars = req.body.cars;
//     console.log("cars", cars);

//     if (!Array.isArray(cars)) {
//       return res.status(400).json({ message: "Invalid data format" });
//     }

//     const newCars = cars.map((car) => ({
//       dealerId: car.dealerId || null,
//       title: car.title || "",
//       make: car.make || "",
//       model: car.model || "",
//       year: car.year ? Number(car.year) : null,
//       price: car.price ? Number(car.price) : null,
//       mileage: car.mileage ? Number(car.mileage) : null,
//       currency: car.currency || "USD",
//       status: "published",
//       description: car.description || "",
//       source: { type: "scraped", importedAt: new Date() },
//       location: {
//         city: car.city || "",
//         country: car.country || "Unknown",
//       },
//     }));

//     // ✅ Insert or Update by VIN/Title
//     for (const car of newCars) {
//       await Car.updateOne(
//         { vin: car.vin || car.title },
//         { $set: car },
//         { upsert: true }
//       );

//       // const notifMessage = `🚗 New car listed: ${car.make} ${car.model} (${
//       //   car.year || "Unknown Year"
//       // })`;

//       // const recipients = await User.find({
//       //   status: "active",
//       //   role: { $in: ["admin", "user"] },
//       // }).select("_id name email");

//       // const notifPromises = recipients.map(async (recipient) => {
//       //   const notif = await Notification.create({
//       //     userId: recipient._id,
//       //     type: "alert",
//       //     message: notifMessage,
//       //     priority: "normal",
//       //     status: "unread",
//       //   });

//       //   // pusher private channel (যেমন private-user-{id})
//       //   const channelName = `private-user-${recipient._id.toString()}`;
//       //   await pusher.trigger(channelName, "new-notification", {
//       //     notificationId: notif._id,
//       //     title: "New Car Added",
//       //     message: notifMessage,
//       //     createdAt: notif.createdAt,
//       //   });

//       //   return notif;
//       // });

//       // await Promise.all(notifPromises);
//     }

//     res.status(200).json({
//       success: true,
//       message: "Cars imported successfully",
//       count: newCars.length,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
