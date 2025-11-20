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

// inport cars
export const importScrapedCars = async (req, res, next) => {
  console.time("IMPORT_SCRAPED_CARS");
  try {
    const cars = req.body.cars;

    console.log(
      "*****Cars payload length:",
      Array.isArray(cars) ? cars.length : 0
    );
    console.log("*****Cars payload", Array.isArray(cars) ? cars : null);

    if (!Array.isArray(cars)) {
      console.timeEnd("IMPORT_SCRAPED_CARS");
      return res
        .status(400)
        .json({ success: false, message: "Invalid format" });
    }

    const imported = [];

    // Recipients একবারই লোড করব (active admins + users)
    const recipients = await User.find({
      status: "active",
      role: { $in: ["admin", "user"] },
    }).select("_id name email");

    // helper: নতুন car তৈরি হলে notification পাঠানোর জন্য
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

      await Promise.allSettled(notifPromises);
    };

    // এখানে আমরা notification গুলো পরে চালানোর জন্য queue তে রাখব
    const notificationTasks = [];

    // ===== মূল import loop =====
    for (const scraped of cars) {
      // basic mapping
      const mapped = {
        dealerId: scraped.dealerId || undefined,
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

      // upsert query: VIN থাকলে VIN দিয়ে, না থাকলে fallback
      const query = mapped.vin
        ? { vin: mapped.vin }
        : { title: mapped.title, make: mapped.make, year: mapped.year };

      // আগে থেকে ছিল কিনা detect করার জন্য
      const existing = await Car.findOne(query).select("_id");

      // upsert
      let carDoc = await Car.findOneAndUpdate(
        query,
        { $set: mapped },
        { new: true, upsert: true }
      );

      // safety
      if (!carDoc || !carDoc._id) {
        carDoc = await Car.findOne(query);
        if (!carDoc) {
          carDoc = await Car.create(mapped);
        }
      }

      // ======= SIMPLE IMAGE HANDLE (just one image field) =======
      // priority: scraped.images[0] -> scraped.image_url -> scraped.imageUrl
      const rawImage =
        (Array.isArray(scraped.images) && scraped.images[0]) ||
        scraped.image_url ||
        scraped.imageUrl ||
        null;

      let imageUrl = typeof rawImage === "string" ? rawImage.trim() : "";

      if (imageUrl && !isValidHttpUrl(imageUrl)) {
        imageUrl = "";
      }

      if (imageUrl) {
        // এখানে "image" ফিল্ড ধরেছি; যদি তোমার schema তে অন্য নাম হয়
        // যেমন: imageUrl, thumbnail ইত্যাদি, তাহলে নিচের লাইনটা সেই অনুযায়ী বদলাবে
        carDoc.image = imageUrl;
        await carDoc.save();
      }

      // imported summary
      imported.push({
        carId: carDoc._id,
        title: carDoc.title,
        // শুধু info এর জন্য; আসলে একটাই image আছে
        imagesCount: imageUrl ? 1 : 0,
      });

      // নতুন car (existing ছিল না) হলে notification task queue তে রেখে দিচ্ছি
      if (!existing) {
        notificationTasks.push(
          notifyRecipientsForNewCar(carDoc, mapped).catch((notifyErr) => {
            console.error(
              "Notification sending failed for car",
              carDoc._id,
              notifyErr
            );
          })
        );
      }
    }

    // এখানে আমরা দ্রুত response পাঠিয়ে দিচ্ছি
    console.timeEnd("IMPORT_SCRAPED_CARS");
    res.status(200).json({
      success: true,
      count: imported.length,
      imported,
    });

    // ==========================
    // Background এ notifications
    // ==========================
    if (notificationTasks.length > 0) {
      Promise.allSettled(notificationTasks)
        .then((results) => {
          const fulfilled = results.filter(
            (r) => r.status === "fulfilled"
          ).length;
          const rejected = results.length - fulfilled;
          console.log(
            `[IMPORT_SCRAPED_CARS] Notifications processed. success=${fulfilled}, failed=${rejected}`
          );
        })
        .catch((err) => {
          console.error(
            "[IMPORT_SCRAPED_CARS] Error while processing notifications:",
            err
          );
        });
    }
  } catch (error) {
    console.timeEnd("IMPORT_SCRAPED_CARS");
    next(error);
  }
};

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

//     // Load recipients ONCE (admins + users). If you want different recipients (e.g., subscribers),
//     // change this query accordingly.
//     const recipients = await User.find({
//       status: "active",
//       role: { $in: ["admin", "user"] },
//     }).select("_id name email");

//     // Helper: send notifications for a newly created car
//     const notifyRecipientsForNewCar = async (carDoc, mapped) => {
//       if (!recipients || recipients.length === 0) return;

//       const notifMessage = `🚗 New car listed: ${
//         mapped.make || "Unknown Make"
//       } ${mapped.model || ""} (${mapped.year || "Unknown Year"})`;

//       const notifPromises = recipients.map(async (recipient) => {
//         try {
//           const notif = await Notification.create({
//             userId: recipient._id,
//             type: "alert",
//             message: notifMessage,
//             priority: "normal",
//             status: "unread",
//           });

//           const channelName = `private-user-${recipient._id.toString()}`;
//           try {
//             await pusher.trigger(channelName, "new-notification", {
//               notificationId: notif._id,
//               title: "New Car Added",
//               message: notifMessage,
//               createdAt: notif.createdAt,
//               carId: carDoc._id,
//             });
//           } catch (pushErr) {
//             console.error("Pusher trigger failed for", recipient._id, pushErr);
//           }

//           return notif;
//         } catch (err) {
//           console.error(
//             "Failed to create notification for",
//             recipient._id,
//             err
//           );
//           return null;
//         }
//       });

//       // Be resilient: wait for all attempts, but don't throw on partial failure
//       await Promise.allSettled(notifPromises);
//     };

//     for (const scraped of cars) {
//       // map basic fields
//       const mapped = {
//         dealerId: scraped.dealerId || scraped.dealerId || undefined, // optional
//         sellerUserId: scraped.sellerUserId || undefined,
//         title: scraped.title || "",
//         make: scraped.make || scraped.brand || "",
//         model: scraped.model || "",
//         brand: scraped.brand || "",
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

//       // Detect if document already exists (to decide whether to notify)
//       const existing = await Car.findOne(query).select("_id");

//       // upsert car doc
//       let carDoc = await Car.findOneAndUpdate(
//         query,
//         { $set: mapped },
//         { new: true, upsert: true }
//       );

//       // Ensure carDoc is a mongoose document (fallback if findOneAndUpdate returns raw object)
//       if (!carDoc || !carDoc._id) {
//         carDoc = await Car.findOne(query);
//         if (!carDoc) {
//           carDoc = await Car.create(mapped);
//         }
//       }

//       // --- Media embed handling (no MediaAsset collection) ---
//       const rawImages = Array.isArray(scraped.images)
//         ? scraped.images
//         : scraped.image_url
//         ? [scraped.image_url]
//         : scraped.imageUrl
//         ? [scraped.imageUrl]
//         : [];

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

//       // push into imported result
//       imported.push({
//         carId: carDoc._id,
//         title: carDoc.title,
//         imagesCount: imageUrls.length,
//       });

//       // IF it was not existing before, it's a new created record -> notify
//       if (!existing) {
//         // Fire-and-forget but await to ensure we don't overload DB/pusher at once.
//         try {
//           await notifyRecipientsForNewCar(carDoc, mapped);
//         } catch (notifyErr) {
//           console.error(
//             "Notification sending failed for car",
//             carDoc._id,
//             notifyErr
//           );
//           // continue without failing the whole import
//         }
//       }
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
