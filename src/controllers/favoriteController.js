import mongoose from "mongoose";
import Car from "../models/Car.js";
import Favorite from "../models/Favourite.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Toggle favorite (add if not exists, remove if exists)
export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { carId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!carId || !isValidId(carId)) return res.status(400).json({ message: "Invalid carId" });

    const car = await Car.findById(carId).select("_id");
    if (!car) return res.status(404).json({ message: "Car not found" });

    const found = await Favorite.findOne({ userId, carId });
    if (found) {
      await Favorite.deleteOne({ _id: found._id });
      return res.status(200).json({ message: "Removed from favorites", favored: false });
    } else {
      await Favorite.create({ userId, carId });
      return res.status(201).json({ message: "Added to favorites", favored: true });
    }
  } catch (err) {
    next(err);
  }
};

// ✅ Add favorite (idempotent)
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { carId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!carId || !isValidId(carId)) return res.status(400).json({ message: "Invalid carId" });

    const car = await Car.findById(carId).select("_id");
    if (!car) return res.status(404).json({ message: "Car not found" });

    await Favorite.updateOne({ userId, carId }, { $setOnInsert: { userId, carId } }, { upsert: true });
    return res.status(201).json({ message: "Added to favorites", favored: true });
  } catch (err) {
    next(err);
  }
};

// ✅ Remove favorite
export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { carId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!carId || !isValidId(carId)) return res.status(400).json({ message: "Invalid carId" });

    await Favorite.deleteOne({ userId, carId });
    return res.status(200).json({ message: "Removed from favorites", favored: false });
  } catch (err) {
    next(err);
  }
};

// ✅ My favorites (paginated + car populate)
export const getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Favorite.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "carId", select: "_id title brand model price year images status" })
        .lean(),
      Favorite.countDocuments({ userId }),
    ]);

    // Normalize output
    const data = items.map((f) => ({
      _id: f._id,
      car: f.carId,
      savedAt: f.createdAt,
    }));

    res.status(200).json({
      message: "Favorites retrieved",
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Is favorited?
export const isFavorited = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { carId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!carId || !isValidId(carId)) return res.status(400).json({ message: "Invalid carId" });

    const exists = await Favorite.exists({ userId, carId });
    res.status(200).json({ favored: Boolean(exists) });
  } catch (err) {
    next(err);
  }
};

// ✅ Count favorites of a car
export const getCarFavoriteCount = async (req, res, next) => {
  try {
    const { carId } = req.params;
    if (!carId || !isValidId(carId)) return res.status(400).json({ message: "Invalid carId" });

    const count = await Favorite.countDocuments({ carId });
    res.status(200).json({ carId, count });
  } catch (err) {
    next(err);
  }
};
