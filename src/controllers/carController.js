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
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const perPage  = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip     = (pageNum - 1) * perPage;

    // ---------- Filter build ----------
    const filter = { };
    // soft-delete থাকলে: filter.isDeleted = { $ne: true };

    if (status) filter.status = status;

    // exact numeric filters
    if (year) filter.year = Number(year);

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // regex helpers (case-insensitive)
    const rx = (v) => (v ? new RegExp(String(v).trim(), "i") : undefined);

    if (title) filter.title = rx(title);
    if (brand || make) filter.make = rx(brand || make);
    if (model) filter.model = rx(model);

    // free-text q: two strategies
    // A) text index থাকলে $text
    // B) না থাকলে $or + regex
    let useText = false;
    if (q && q.trim()) {
      useText = true; // ধরলাম text index আছে; নিচে fallback-ও দিলাম
    }


    // ---------- Projection & Sort ----------
    let projection = {
      // client-এ যা লাগবে সেগুলো রাখুন
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
    };

    let sortSpec = {};
    if (sort === "relevance" && q) {
      // text score sort (text index থাকলে)
      projection = { ...projection, score: { $meta: "textScore" } };
      sortSpec = { score: { $meta: "textScore" } };
    } else {
      // parse generic sort: "-price" / "price" / "year" / "-publishedAt" etc.
      const s = String(sort).trim();
      if (s.startsWith("-")) {
        sortSpec[s.slice(1)] = -1;
      } else {
        sortSpec[s] = 1;
      }
    }

    // ---------- Query build ----------
    let query = Car.find(filter, projection);

    if (q && q.trim()) {
      // Try text search first
      try {
        query = Car.find(
          { ...filter, $text: { $search: q.trim() } },
          { ...projection, score: { $meta: "textScore" } }
        );
        if (sort === "relevance") sortSpec = { score: { $meta: "textScore" } };
      } catch {
        // Fallback: regex OR
        query = Car.find(
          {
            ...filter,
            $or: [
              { title: rx(q) },
              { make: rx(q) },
              { model: rx(q) },
              { description: rx(q) },
            ],
          },
          projection
        );
      }
    }

    // ---------- Exec ----------
    const [items, total] = await Promise.all([
      query
        .sort(sortSpec)
        .skip(skip)
        .limit(perPage)
        .collation({ locale: "en", strength: 2 }) // case-insensitive sort
        .lean(),
      Car.countDocuments(q && q.trim()
        ? query.getFilter() // count with same filter
        : filter
      ),
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
      return res.status(400).json({ message: "carA and carB must be different" });
    }

    const idA = asMongoIdOrString(carA);
    const idB = asMongoIdOrString(carB);

    const cars = await Car.find({ _id: { $in: [idA, idB] } }, pickProjection).lean();

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
      price: { a: a.price, b: b.price, delta: numDelta(a.price, b.price), currency: a.currency || b.currency || null },
      year: { a: a.year, b: b.year, delta: numDelta(a.year, b.year) },
      mileage: { a: a.mileage, b: b.mileage, delta: numDelta(a.mileage, b.mileage) },
      horsepower: { a: a.specs?.horsepower ?? null, b: b.specs?.horsepower ?? null, delta: numDelta(a.specs?.horsepower, b.specs?.horsepower) },
      torque: { a: a.specs?.torque ?? null, b: b.specs?.torque ?? null, delta: numDelta(a.specs?.torque, b.specs?.torque) },
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



// export const carList = async (req, res, next) => {
//     try {
//         const { make, model, zip, page, limit, mode, raw } = req.query;

//         if (mode === "page") {
//             const items = await autoscoutFromPage();
//             return res.json({
//                 ok: true,
//                 mode: "page",
//                 count: items.length,
//                 items: raw === "1" ? items.slice(0, 20) : items.slice(0, 40),
//             });
//         }

//         if (make || model) {
//             try {
//                 const items = await autoscoutSearch({ make, model, zip, page, limit });
//                 if (items.length > 0) {
//                     return res.json({ ok: true, mode: "search", count: items.length, items });
//                 }
//             } catch (e) {
//                 console.warn("search failed → fallback to page parse:", e?.response?.status || e.message);
//             }
//         }

//         const items = await autoscoutFromPage();
//         return res.json({ ok: true, mode: "default-page", count: items.length, items: items.slice(0, 40) });

//     } catch (error) {
//         next(error);
//     }
// };

// export const debugPage = async (req, res) => {
//     try {
//         const url = process.env.AUTOSCOUT_DEFAULT_URL;
//         const path = process.env.RAPIDAPI_PAGESOURCE_PATH;
//         const method = (process.env.RAPIDAPI_PAGESOURCE_METHOD || "GET").toUpperCase();

//         let r;
//         if (method === "POST") {
//             r = await rapid.post(path, null, { params: { url } });
//         } else {
//             r = await rapid.get(path, { params: { url } });
//         }

//         const html = r.data?.toString ? r.data.toString() : String(r.data || "");
//         res.json({ ok: true, status: r.status, length: html.length, preview: html.slice(0, 600) });
//     } catch (e) {
//         res.status(e?.response?.status || 500).json({ ok: false, error: e?.response?.data || e.message });
//     }
// };


// export const probeRapid = async (req, res) => {
//     const url = process.env.AUTOSCOUT_DEFAULT_URL;

//     // সম্ভাব্য path গুলো (সবচেয়ে কমন)
//     const paths = [
//         "/page-source", "/get_page_source", "/getPageSource",
//         "/page", "/html", "/fetch", "/scrape", "/scrape-page",
//         "/get-html", "/getPage", "/scraper"
//     ];

//     const tries = [];

//     for (const p of paths) {
//         // 1) GET with params
//         try {
//             const r = await rapid.get(p, { params: { url } });
//             if (r.status === 200) {
//                 const text = r.data?.toString ? r.data.toString() : String(r.data || "");
//                 return res.json({ ok: true, found: { method: "GET", path: p, mode: "params" }, length: text.length, preview: text.slice(0, 400) });
//             }
//         } catch (e) {
//             tries.push({ method: "GET", path: p, mode: "params", status: e?.response?.status, msg: e?.response?.data?.message || e.message });
//         }

//         // 2) POST with params (querystring style)
//         try {
//             const r = await rapid.post(p, null, { params: { url } });
//             if (r.status === 200) {
//                 const text = r.data?.toString ? r.data.toString() : String(r.data || "");
//                 return res.json({ ok: true, found: { method: "POST", path: p, mode: "params" }, length: text.length, preview: text.slice(0, 400) });
//             }
//         } catch (e) {
//             tries.push({ method: "POST", path: p, mode: "params", status: e?.response?.status, msg: e?.response?.data?.message || e.message });
//         }

//         // 3) POST with JSON body
//         try {
//             const r = await rapid.post(p, { url });
//             if (r.status === 200) {
//                 const text = r.data?.toString ? r.data.toString() : String(r.data || "");
//                 return res.json({ ok: true, found: { method: "POST", path: p, mode: "json-body" }, length: text.length, preview: text.slice(0, 400) });
//             }
//         } catch (e) {
//             tries.push({ method: "POST", path: p, mode: "json-body", status: e?.response?.status, msg: e?.response?.data?.message || e.message });
//         }
//     }

//     return res.status(404).json({ ok: false, reason: "No working endpoint found on this host with common patterns.", tried: tries });
// };