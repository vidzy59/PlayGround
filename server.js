const express = require("express");
const cors = require("cors");
const path = require("path");
const { PHONES, NEWS, AFF, ADS } = require("./data");

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "256kb" }));
// API tidak boleh di-cache agar harga selalu segar
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
// Header keamanan dasar + cache statis agar tidak tabrakan render dan hemat bandwidth
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h", etag: true }));

// Favicon: 204 agar browser tidak menerima HTML sebagai ikon
app.get("/favicon.ico", (req, res) => res.status(204).end());
// Robots dasar untuk publish
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n");
});
app.get("/sitemap.xml", (req, res) => {
  const base = (req.protocol + "://" + req.get("host")).replace(/\/$/, "");
  const urls = ["/", "/#/phones", "/#/compare", "/#/news", "/#/favorites"]
    .concat(PHONES.map((p) => "/#/phone/" + p.id))
    .concat(NEWS.map((n) => "/#/news/" + n.id));
  res.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => "  <url><loc>" + base + "/" + u.replace(/^\/+/, "") + "</loc></url>").join("\n") +
    "\n</urlset>"
  );
});

/* Rating tampil dari dataset (skor redaksi per tipe, tanpa ulasan pembaca):
   tanpa form, tanpa file simpanan, tanpa moderasi. Nol beban operasional. */
function withRating(p) {
  return { ...p, ratingLive: p.rating, reviewCountLive: p.reviewCount };
}
function minPrice(p) {
  return Math.min(...p.prices.map((x) => x.harga));
}
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

app.get("/api/health", (req, res) => res.json({ ok: true, totalPhones: PHONES.length }));

app.get("/api/brands", (req, res) => {
  const map = {};
  PHONES.forEach((p) => { map[p.brand] = (map[p.brand] || 0) + 1; });
  res.json(Object.entries(map).map(([brand, count]) => ({ brand, count })).sort((a, b) => a.brand.localeCompare(b.brand)));
});

app.get("/api/phones", (req, res) => {
  try {
    let out = PHONES.map(withRating);
    const q = (req.query.search || "").toString().trim();
    const brand = (req.query.brand || "").toString().trim();
    const minP = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxP = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const ram = req.query.ram ? Number(req.query.ram) : null;
    const storage = req.query.storage ? Number(req.query.storage) : null;
    const only5G = req.query.only5G === "1" || req.query.only5G === "true";
    // Filter baru: baterai minimal (mAh) dan NFC. Untuk apa: baterai = daya tahan,
    // NFC = e-money/TapCash yang krusial di Indonesia. Ditaruh di finder + katalog.
    const minBat = req.query.minBattery ? Number(req.query.minBattery) : null;
    const onlyNFC = req.query.onlyNFC === "1" || req.query.onlyNFC === "true";
    // Wireless charging membedakan flagship + Note 40 Pro dari mayoritas (6 dari 24).
    const onlyWireless = req.query.onlyWireless === "1" || req.query.onlyWireless === "true";
    const sort = (req.query.sort || "populer").toString();

    if (q) {
      const re = new RegExp(escapeReg(q), "i");
      out = out.filter((p) => re.test(p.name) || re.test(p.brand) || re.test(p.platform.chipset));
    }
    if (brand && brand !== "Semua") out = out.filter((p) => p.brand === brand);
    if (minP !== null && !Number.isNaN(minP)) out = out.filter((p) => minPrice(p) >= minP);
    if (maxP !== null && !Number.isNaN(maxP)) out = out.filter((p) => minPrice(p) <= maxP);
    if (ram) out = out.filter((p) => p.memory.ramUtama >= ram);
    if (storage) out = out.filter((p) => p.memory.storageUtama >= storage);
    if (only5G) out = out.filter((p) => p.network.dukungan5G);
    if (minBat !== null && !Number.isNaN(minBat) && minBat > 0) out = out.filter((p) => p.battery.kapasitas >= minBat);
    if (onlyNFC) out = out.filter((p) => p.comms.nfc);
    if (onlyWireless) out = out.filter((p) => p.battery.wireless);

    const sorters = {
      populer: (a, b) => b.hits - a.hits,
      terbaru: (a, b) => new Date(b.released) - new Date(a.released),
      termurah: (a, b) => minPrice(a) - minPrice(b),
      termahal: (a, b) => minPrice(b) - minPrice(a),
      rating: (a, b) => b.ratingLive - a.ratingLive,
      nama: (a, b) => a.name.localeCompare(b.name)
    };
    out.sort(sorters[sort] || sorters.populer);

    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit || "9", 10) || 9));
    const total = out.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);
    const slice = out.slice((safePage - 1) * limit, safePage * limit).map((p) => ({
      ...p,
      hargaTermurah: minPrice(p)
    }));
    res.json({ data: slice, total, page: safePage, pages, limit });
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data ponsel." });
  }
});

app.get("/api/phones/:id", (req, res) => {
  const p = PHONES.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "HP tidak ditemukan." });
  const full = withRating(p);
  res.json({ ...full, hargaTermurah: minPrice(p) });
});

app.get("/api/phones/:id/similar", (req, res) => {
  const p = PHONES.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "HP tidak ditemukan." });
  const low = minPrice(p);
  const scored = PHONES.filter((x) => x.id !== p.id).map((x) => {
    let score = 0;
    if (x.brand === p.brand) score += 3;
    const diff = Math.abs(minPrice(x) - low) / low;
    score += Math.max(0, 3 - diff * 6);
    if (x.network.dukungan5G === p.network.dukungan5G) score += 1;
    if (Math.abs(x.memory.ramUtama - p.memory.ramUtama) <= 4) score += 1;
    return { phone: withRating(x), score, hargaTermurah: minPrice(x) };
  });
  scored.sort((a, b) => b.score - a.score);
  res.json(scored.slice(0, 4).map((s) => ({ ...s.phone, hargaTermurah: s.hargaTermurah })));
});

app.get("/api/compare", (req, res) => {
  /* Batas 12: halaman favorit memakai endpoint ini untuk menampilkan semua favorit,
     sedangkan UI perbandingan membatasi 3 HP di sisi frontend. */
  const ids = (req.query.ids || "").toString().split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);
  if (!ids.length) return res.status(400).json({ error: "Pilih minimal 1 HP." });
  const result = [];
  for (const id of ids) {
    const p = PHONES.find((x) => x.id === id);
    if (!p) return res.status(404).json({ error: "ID tidak valid: " + id });
    result.push({ ...withRating(p), hargaTermurah: minPrice(p) });
  }
  res.json(result);
});

app.get("/api/news", (req, res) => res.json(NEWS));

app.get("/api/news/:id", (req, res) => {
  const n = NEWS.find((x) => String(x.id) === String(req.params.id));
  if (!n) return res.status(404).json({ error: "Berita tidak ditemukan." });
  const terkait = (n.terkait || []).map((id) => PHONES.find((p) => p.id === id)).filter(Boolean).map((p) => ({ ...withRating(p), hargaTermurah: minPrice(p) }));
  res.json({ ...n, terkait });
});

// Config afiliasi + iklan untuk frontend (tanpa data sensitif lain).
app.get("/api/aff", (req, res) => res.json(AFF || { aktif: false }));
app.get("/api/ads", (req, res) => res.json(ADS || { aktif: false }));

// fallback SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Endpoint tidak ditemukan." });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Body JSON rusak harus balas JSON, bukan HTML bawaan Express
app.use((err, req, res, next) => {
  if (err && (err.type === "entity.parse.failed" || err.status === 400)) {
    return res.status(400).json({ error: "Format data tidak valid." });
  }
  next(err);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`SpekHP berjalan di http://localhost:${PORT}`));
}
module.exports = app;
