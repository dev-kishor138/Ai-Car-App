import rapid from "../config/rapidClient.js";
import { autoscoutFromPage, autoscoutSearch } from "../service/autoscoutService.js";




export const carList = async (req, res, next) => {
    try {
        const { make, model, zip, page, limit, mode, raw } = req.query;

        if (mode === "page") {
            const items = await autoscoutFromPage();
            return res.json({
                ok: true,
                mode: "page",
                count: items.length,
                items: raw === "1" ? items.slice(0, 20) : items.slice(0, 40),
            });
        }

        if (make || model) {
            try {
                const items = await autoscoutSearch({ make, model, zip, page, limit });
                if (items.length > 0) {
                    return res.json({ ok: true, mode: "search", count: items.length, items });
                }
            } catch (e) {
                console.warn("search failed → fallback to page parse:", e?.response?.status || e.message);
            }
        }

        const items = await autoscoutFromPage();
        return res.json({ ok: true, mode: "default-page", count: items.length, items: items.slice(0, 40) });

    } catch (error) {
        next(error);
    }
};

export const debugPage = async (req, res) => {
    try {
        const url = process.env.AUTOSCOUT_DEFAULT_URL;
        const path = process.env.RAPIDAPI_PAGESOURCE_PATH;
        const method = (process.env.RAPIDAPI_PAGESOURCE_METHOD || "GET").toUpperCase();

        let r;
        if (method === "POST") {
            r = await rapid.post(path, null, { params: { url } });
        } else {
            r = await rapid.get(path, { params: { url } });
        }

        const html = r.data?.toString ? r.data.toString() : String(r.data || "");
        res.json({ ok: true, status: r.status, length: html.length, preview: html.slice(0, 600) });
    } catch (e) {
        res.status(e?.response?.status || 500).json({ ok: false, error: e?.response?.data || e.message });
    }
};


export const probeRapid = async (req, res) => {
    const url = process.env.AUTOSCOUT_DEFAULT_URL;

    // সম্ভাব্য path গুলো (সবচেয়ে কমন)
    const paths = [
        "/page-source", "/get_page_source", "/getPageSource",
        "/page", "/html", "/fetch", "/scrape", "/scrape-page",
        "/get-html", "/getPage", "/scraper"
    ];

    const tries = [];

    for (const p of paths) {
        // 1) GET with params
        try {
            const r = await rapid.get(p, { params: { url } });
            if (r.status === 200) {
                const text = r.data?.toString ? r.data.toString() : String(r.data || "");
                return res.json({ ok: true, found: { method: "GET", path: p, mode: "params" }, length: text.length, preview: text.slice(0, 400) });
            }
        } catch (e) {
            tries.push({ method: "GET", path: p, mode: "params", status: e?.response?.status, msg: e?.response?.data?.message || e.message });
        }

        // 2) POST with params (querystring style)
        try {
            const r = await rapid.post(p, null, { params: { url } });
            if (r.status === 200) {
                const text = r.data?.toString ? r.data.toString() : String(r.data || "");
                return res.json({ ok: true, found: { method: "POST", path: p, mode: "params" }, length: text.length, preview: text.slice(0, 400) });
            }
        } catch (e) {
            tries.push({ method: "POST", path: p, mode: "params", status: e?.response?.status, msg: e?.response?.data?.message || e.message });
        }

        // 3) POST with JSON body
        try {
            const r = await rapid.post(p, { url });
            if (r.status === 200) {
                const text = r.data?.toString ? r.data.toString() : String(r.data || "");
                return res.json({ ok: true, found: { method: "POST", path: p, mode: "json-body" }, length: text.length, preview: text.slice(0, 400) });
            }
        } catch (e) {
            tries.push({ method: "POST", path: p, mode: "json-body", status: e?.response?.status, msg: e?.response?.data?.message || e.message });
        }
    }

    return res.status(404).json({ ok: false, reason: "No working endpoint found on this host with common patterns.", tried: tries });
};