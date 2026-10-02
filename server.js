/* PonselArena - fullstack server, zero dependencies (Node 18+) */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const PORT = process.env.PORT || 3000;

function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}
function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

let phones = readJSON(path.join(DATA_DIR, "phones.json"), []);
let news = readJSON(path.join(DATA_DIR, "news.json"), []);
let store = readJSON(path.join(DATA_DIR, "store.json"), { reviews: {}, ratings: {}, votes: {} });
if (!store.reviews) store.reviews = {};
if (!store.ratings) store.ratings = {};
if (!store.votes) store.votes = {};

function saveStore() {
  writeJSON(path.join(DATA_DIR, "store.json"), store);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function send(res, code, body, type = "application/json; charset=utf-8") {
  const data = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(code, { "Content-Type": type, "Access-Control-Allow-Origin": "*" });
  res.end(data);
}

function serveStatic(req, res) {
  let urlPath = new URL(req.url, "http://x").pathname;
  if (urlPath === "/") urlPath = "/index.html";
  // block direct access to internals
  if (urlPath.startsWith("/data/") || urlPath === "/server.js" || urlPath === "/data.js") {
    return send(res, 403, { error: "forbidden" });
  }
  const file = path.join(ROOT, decodeURIComponent(urlPath));
  if (!file.startsWith(ROOT)) return send(res, 403, { error: "forbidden" });
  fs.readFile(file, (err, buf) => {
    if (err) {
      // SPA fallback: unknown non-api route -> index.html
      if (!urlPath.startsWith("/api/")) {
        fs.readFile(path.join(ROOT, "index.html"), (e2, b2) => {
          if (e2) return send(res, 404, { error: "not found" });
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(b2);
        });
        return;
      }
      return send(res, 404, { error: "not found" });
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(buf);
  });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

function enrichPhone(p) {
  const id = p.id;
  const revs = store.reviews[id] || [];
  const ratings = store.ratings[id] || [];
  const votes = store.votes[id] || { hit: p.hits, miss: p.misses };
  const avg = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : p.rating;
  return { ...p, userReviews: revs, userRatingsCount: ratings.length, ratingAvg: avg, votes };
}

function filterSortPhones(params) {
  let list = [...phones];
  const brand = params.get("brand");
  const q = (params.get("q") || "").toLowerCase();
  const maxPrice = Number(params.get("maxPrice") || 0);
  const minBattery = Number(params.get("minBattery") || 0);
  const minRam = Number(params.get("minRam") || 0);
  const minCam = Number(params.get("minCam") || 0);
  const sort = params.get("sort") || "popularity";

  if (brand && brand !== "all") list = list.filter((p) => p.brand === brand);
  if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
  if (minBattery) list = list.filter((p) => p.battery >= minBattery);
  if (minRam) list = list.filter((p) => Math.max(...p.ram) >= minRam);
  if (minCam) list = list.filter((p) => p.rearMp >= minCam);
  if (q) list = list.filter((p) => `${p.name} ${p.brand} ${p.chipset}`.toLowerCase().includes(q));

  const by = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    antutu: (a, b) => b.antutu - a.antutu,
    battery: (a, b) => b.battery - a.battery,
    popularity: (a, b) => b.popularity - a.popularity,
  };
  list.sort(by[sort] || by.popularity);
  return list.map((p) => enrichPhone(p));
}

async function router(req, res) {
  const u = new URL(req.url, "http://x");
  const p = u.pathname;

  if (req.method === "GET" && p === "/api/health") return send(res, 200, { ok: true, phones: phones.length });
  if (req.method === "GET" && p === "/api/brands") {
    return send(res, 200, { brands: [...new Set(phones.map((x) => x.brand))].sort() });
  }
  if (req.method === "GET" && p === "/api/phones") return send(res, 200, { data: filterSortPhones(u.searchParams) });
  if (req.method === "GET" && p === "/api/news") return send(res, 200, { data: news });

  const mPhone = p.match(/^\/api\/phones\/([\w-]+)$/);
  if (req.method === "GET" && mPhone) {
    const found = phones.find((x) => x.id === mPhone[1]);
    if (!found) return send(res, 404, { error: "phone not found" });
    return send(res, 200, { data: enrichPhone(found) });
  }

  if (req.method === "GET" && p === "/api/compare") {
    const ids = (u.searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 3);
    const data = ids.map((id) => phones.find((x) => x.id === id)).filter(Boolean).map(enrichPhone);
    return send(res, 200, { data });
  }

  const mRev = p.match(/^\/api\/phones\/([\w-]+)\/reviews$/);
  if (mRev) {
    const id = mRev[1];
    if (!phones.find((x) => x.id === id)) return send(res, 404, { error: "phone not found" });
    if (req.method === "GET") return send(res, 200, { data: store.reviews[id] || [] });
    if (req.method === "POST") {
      const body = await parseBody(req);
      if (!body || !body.text || body.text.trim().length < 4)
        return send(res, 400, { error: "review text too short (min 4 chars)" });
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const item = {
        id: Date.now().toString(36),
        name: String(body.name || "Anonim").slice(0, 40),
        rating,
        text: String(body.text).slice(0, 1000),
        date: new Date().toISOString().slice(0, 10),
      };
      store.reviews[id] = store.reviews[id] || [];
      store.reviews[id].unshift(item);
      if (!store.ratings[id]) store.ratings[id] = [];
      store.ratings[id].push(rating);
      saveStore();
      return send(res, 201, { data: item });
    }
  }

  const mRate = p.match(/^\/api\/phones\/([\w-]+)\/rating$/);
  if (mRate && req.method === "POST") {
    const id = mRate[1];
    const body = await parseBody(req);
    const v = Number(body && body.value);
    if (!v || v < 1 || v > 5) return send(res, 400, { error: "value must be 1-5" });
    store.ratings[id] = store.ratings[id] || [];
    store.ratings[id].push(v);
    saveStore();
    return send(res, 201, { ok: true });
  }

  const mVote = p.match(/^\/api\/phones\/([\w-]+)\/vote$/);
  if (mVote && req.method === "POST") {
    const id = mVote[1];
    const phone = phones.find((x) => x.id === id);
    if (!phone) return send(res, 404, { error: "phone not found" });
    const body = await parseBody(req);
    if (!body || !["hit", "miss"].includes(body.type)) return send(res, 400, { error: "type must be hit|miss" });
    if (!store.votes[id]) store.votes[id] = { hit: phone.hits, miss: phone.misses };
    store.votes[id][body.type]++;
    saveStore();
    return send(res, 201, { data: store.votes[id] });
  }

  if (p.startsWith("/api/")) return send(res, 404, { error: "unknown api route" });
  return serveStatic(req, res);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }
  router(req, res).catch((e) => {
    console.error(e);
    send(res, 500, { error: "internal error" });
  });
});

server.listen(PORT, () => console.log(`PonselArena fullstack running on http://localhost:${PORT}`));
