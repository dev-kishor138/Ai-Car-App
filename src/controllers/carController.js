// import rapid from "../config/rapidClient.js";
// import { autoscoutFromPage, autoscoutSearch } from "../service/autoscoutService.js";
// import fs from "fs";
// import path from "path";
import mongoose from "mongoose";
import Car from "../models/Car.js";

// getallCar from bd json
export const getAllCar = async (req, res, next) => {
  try {
    const cars = await Car.find({});

    if (!cars) {
      throw new Error("No cars found");
    }

    res.status(200).json({
      success: true,
      total: cars.length,
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};

export const searchCars = async (req, res, next) => {
  try {
    const {
      q,
      title,
      brand,
      make,
      model,
      year,
      minPrice,
      maxPrice,
      status,
      page = 1,
      limit = 10,
      sort = "-publishedAt",
      initial, // <-- new flag: ?initial=true will return ALL matching items (no skip/limit)
      full, // <-- alias: ?full=true also works
    } = req.query;

    const isInitial = String(initial || full || "").toLowerCase() === "true";

    const pageNum = Math.max(1, parseInt(page) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * perPage;

    // ---------- Filter build ----------
    const filter = {};
    // if you have soft-delete: filter.isDeleted = { $ne: true };

    if (status) filter.status = status;
    if (year) filter.year = Number(year);

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const rx = (v) => (v ? new RegExp(String(v).trim(), "i") : undefined);

    if (title) filter.title = rx(title);
    if (brand || make) filter.make = rx(brand || make);
    if (model) filter.model = rx(model);

    let useText = false;
    if (q && q.trim()) useText = true;

    // ---------- Projection & Sort ----------
    let projection = {
      title: 1,
      make: 1,
      model: 1,
      year: 1,
      price: 1,
      currency: 1,
      mileage: 1,
      bodyType: 1,
      fuelType: 1,
      transmission: 1,
      driveType: 1,
      color: 1,
      status: 1,
      "media.cover.url": 1,
      publishedAt: 1,
      createdAt: 1,
      updatedAt: 1,
      "location.city": 1,
      "location.country": 1,
    };

    let sortSpec = {};
    if (sort === "relevance" && q) {
      projection = { ...projection, score: { $meta: "textScore" } };
      sortSpec = { score: { $meta: "textScore" } };
    } else {
      const s = String(sort).trim();
      if (s.startsWith("-")) {
        sortSpec[s.slice(1)] = -1;
      } else {
        sortSpec[s] = 1;
      }
    }

    // ---------- Query build ----------
    let baseFilter = { ...filter };
    let query = Car.find(baseFilter, projection);

    if (q && q.trim()) {
      try {
        // try text search
        baseFilter = { ...filter, $text: { $search: q.trim() } };
        query = Car.find(baseFilter, {
          ...projection,
          score: { $meta: "textScore" },
        });
        if (sort === "relevance") sortSpec = { score: { $meta: "textScore" } };
      } catch {
        // fallback regex OR
        baseFilter = {
          ...filter,
          $or: [
            { title: rx(q) },
            { make: rx(q) },
            { model: rx(q) },
            { description: rx(q) },
          ],
        };
        query = Car.find(baseFilter, projection);
      }
    }

    // ---------- Exec ----------
    if (isInitial) {
      // return ALL matching documents (no skip/limit)
      const items = await query
        .sort(sortSpec)
        .collation({ locale: "en", strength: 2 })
        .lean();
      const total = items.length;
      return res.status(200).json({
        success: true,
        message: "All cars retrieved (initial=true)",
        data: items,
        meta: {
          page: 1,
          limit: total,
          total,
          totalPages: 1,
          sort,
          initial: true,
        },
      });
    }

    // normal paginated response
    const [items, total] = await Promise.all([
      query
        .sort(sortSpec)
        .skip(skip)
        .limit(perPage)
        .collation({ locale: "en", strength: 2 })
        .lean(),
      Car.countDocuments(baseFilter),
    ]);

    res.status(200).json({
      success: true,
      message: "Cars retrieved successfully",
      data: items,
      meta: {
        page: pageNum,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        sort,
        initial: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

const asMongoIdOrString = (id) => {
  if (!id) return null;
  const s = String(id).trim();
  return mongoose.Types.ObjectId.isValid(s)
    ? new mongoose.Types.ObjectId(s)
    : s;
};

const pickProjection = {
  title: 1,
  make: 1,
  model: 1,
  trim: 1,
  year: 1,
  price: 1,
  currency: 1,
  mileage: 1,
  condition: 1,
  fuelType: 1,
  transmission: 1,
  bodyType: 1,
  driveType: 1,
  color: 1,
  features: 1,
  specs: 1,
  "media.cover.url": 1,
  publishedAt: 1,
};

const toSafe = (doc) => {
  if (!doc) return null;
  return {
    _id: doc._id,
    title: doc.title,
    make: doc.make,
    model: doc.model,
    trim: doc.trim ?? null,
    year: doc.year ?? null,
    price: doc.price ?? null,
    currency: doc.currency ?? null,
    mileage: doc.mileage ?? null,
    condition: doc.condition ?? null,
    fuelType: doc.fuelType ?? null,
    transmission: doc.transmission ?? null,
    bodyType: doc.bodyType ?? null,
    driveType: doc.driveType ?? null,
    color: doc.color ?? null,
    features: Array.isArray(doc.features) ? doc.features : [],
    specs: doc.specs ?? {},
    coverUrl: doc?.media?.cover?.url ?? null,
    publishedAt: doc.publishedAt ?? null,
  };
};

// ✅ Compare two cars — GET /cars/compare?carA=<id>&carB=<id>
export const compareCars = async (req, res, next) => {
  try {
    const { carA, carB } = req.query;

    if (!carA || !carB) {
      return res.status(400).json({ message: "carA and carB are required" });
    }

    if (String(carA) === String(carB)) {
      return res
        .status(400)
        .json({ message: "carA and carB must be different" });
    }

    const idA = asMongoIdOrString(carA);
    const idB = asMongoIdOrString(carB);

    const cars = await Car.find(
      { _id: { $in: [idA, idB] } },
      pickProjection
    ).lean();

    const docA = cars.find((c) => String(c._id) === String(idA));
    const docB = cars.find((c) => String(c._id) === String(idB));

    if (!docA || !docB) {
      return res.status(404).json({
        message: "One or both cars not found",
        found: { carA: Boolean(docA), carB: Boolean(docB) },
      });
    }

    const a = toSafe(docA);
    const b = toSafe(docB);

    const numDelta = (x, y) =>
      typeof x === "number" && typeof y === "number" ? y - x : null;

    const diff = {
      price: {
        a: a.price,
        b: b.price,
        delta: numDelta(a.price, b.price),
        currency: a.currency || b.currency || null,
      },
      year: { a: a.year, b: b.year, delta: numDelta(a.year, b.year) },
      mileage: {
        a: a.mileage,
        b: b.mileage,
        delta: numDelta(a.mileage, b.mileage),
      },
      horsepower: {
        a: a.specs?.horsepower ?? null,
        b: b.specs?.horsepower ?? null,
        delta: numDelta(a.specs?.horsepower, b.specs?.horsepower),
      },
      torque: {
        a: a.specs?.torque ?? null,
        b: b.specs?.torque ?? null,
        delta: numDelta(a.specs?.torque, b.specs?.torque),
      },
    };

    res.status(200).json({
      success: true,
      message: "Comparison ready",
      data: { carA: a, carB: b, diff },
    });
  } catch (err) {
    next(err);
  }
};

export const getCarDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Car ID is required" });
    }

    // Check if valid MongoID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Car ID" });
    }

    // car খোঁজা
    const car = await Car.findById(id)
      .select({
        title: 1,
        make: 1,
        model: 1,
        trim: 1,
        year: 1,
        price: 1,
        currency: 1,
        mileage: 1,
        condition: 1,
        fuelType: 1,
        transmission: 1,
        bodyType: 1,
        driveType: 1,
        color: 1,
        features: 1,
        specs: 1,
        description: 1,
        // location: 1,
        status: 1,
        "media.images": 1,
        "media.cover.url": 1,
        publishedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        "location.city": 1,
        "location.country": 1,
      })
      .lean();

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.status(200).json({
      success: true,
      message: "Car details fetched successfully",
      data: car,
    });
  } catch (error) {
    next(error);
  }
};
