import { load } from "cheerio";
import rapid from "../config/rapidClient.js";

const SEARCH_PATH = process.env.RAPIDAPI_SEARCH_PATH;          // optional
const PAGESOURCE_PATH = process.env.RAPIDAPI_PAGESOURCE_PATH;  // required
const DEFAULT_LIST_URL = process.env.AUTOSCOUT_DEFAULT_URL;

// 1) JSON search (থাকলে)
export async function autoscoutSearch(params) {
  if (!SEARCH_PATH) {
    throw new Error("SEARCH_PATH not set. Set RAPIDAPI_SEARCH_PATH in .env or skip JSON search.");
  }
  const { make, model, zip = "10115", page, limit } = params;
  const q = {};
  if (make) q.make = make;
  if (model) q.model = model;
  if (zip) q.zip = zip;
  if (page) q.page = page;
  if (limit) q.limit = limit;

  const r = await rapid.get(SEARCH_PATH, { params: q });
  const data = r.data;
  const list = toArray(data);
  return list.map(normalizeItem);
}

// 2) HTML page-source → Cheerio parse
export async function autoscoutFromPage(url = DEFAULT_LIST_URL) {
  if (!PAGESOURCE_PATH) {
    throw new Error("PAGESOURCE_PATH not set. Set RAPIDAPI_PAGESOURCE_PATH in .env");
  }

  // ⚠️ provider doc দেখা জরুরি: GET নাকি POST?
  // ধরি provider GET দেয়; যদি Code Snippet-এ POST দেখায় তবে নিচের লাইন বদলাও:
  // const r = await rapid.post(PAGESOURCE_PATH, null, { params: { url } });
  const r = await rapid.get(PAGESOURCE_PATH, { params: { url } });

  const html = r.data?.toString ? r.data.toString() : String(r.data || "");

  if (process.env.DEBUG_AUTOSCOUT === "true") {
    // console.log("[AUTOSCOUT:REQUEST]", { path: PAGESOURCE_PATH, url });
    // console.log("[AUTOSCOUT:STATUS]", r.status);
    // console.log("[AUTOSCOUT:LENGTH]", html.length);
  }

  const $ = load(html);
  const items = [];

  // TODO: সিলেক্টরগুলো DOM দেখে টিউন করবে
  $(".cl-list-element, [data-item-id]").each((_, el) => {
    const title =
      $(el).find("h2, .title, [data-testid='result-title']").first().text().trim()
      || $(el).find("a").first().text().trim();

    const priceText =
      $(el).find(".price, [data-testid='result-price']").first().text().trim();

    const image =
      $(el).find("img").attr("src")
      || $(el).find("img").attr("data-src")
      || null;

    const rel = $(el).find("a").attr("href") || null;

    items.push({
      id: rel || title || image || Math.random().toString(36).slice(2),
      title: title || null,
      price: priceText || null,
      image,
      url: rel && rel.startsWith("http") ? rel : (rel ? `https://www.autoscout24.de${rel}` : null),
      source: "autoscout_page",
    });
  });

  return items;
}

// Helpers
function toArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.listings)) return data.listings;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (data.results?.items && Array.isArray(data.results.items)) return data.results.items;
  if (data.data?.items && Array.isArray(data.data.items)) return data.data.items;
  return [];
}

function normalizeItem(raw) {
  return {
    id: raw?.id || raw?.listingId || raw?.ad_id || raw?.url
      || `${raw?.make}-${raw?.model}-${raw?.price}-${raw?.mileage}`,
    title: raw?.title || `${raw?.make || ""} ${raw?.model || ""}`.trim() || null,
    make: raw?.make || raw?.brand || null,
    model: raw?.model || null,
    year: raw?.year || raw?.first_registration_year || null,
    price: raw?.price?.value ?? raw?.price ?? raw?.pricing ?? null,
    currency: raw?.price?.currency || raw?.currency || "EUR",
    mileage: raw?.mileage ?? raw?.km ?? raw?.odometer ?? null,
    fuelType: raw?.fuel || raw?.fuel_type || null,
    transmission: raw?.gearbox || raw?.transmission || null,
    image: Array.isArray(raw?.images) ? raw.images[0] : (raw?.image || raw?.thumbnail || null),
    location: raw?.location || raw?.city || raw?.region || null,
    url: raw?.url || raw?.detailUrl || null,
    source: "autoscout_scraper",
  };
}
