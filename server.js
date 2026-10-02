const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { PHONES, NEWS } = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "256kb" }));
// Header keamanan dasar + cache statis agar tidak tabrakan render dan hemat bandwidth
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h", etag: true }));

// ---- storage ulasan (file JSON sederhana, full-stack persistence) ----
const REVIEWS_FILE = path.join(__dirname, "reviews.json");
let reviewsStore = {};
try {
  if (fs.existsSync(REVIEWS_FILE)) {
    reviewsStore = JSON.parse(fs.readFileSync(REVIEWS_FILE, "utf8") || "{}");
  }
} catch (e) {
  reviewsStore = {};
}
function saveReviews() {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviewsStore, null, 2));
  } catch (e) { /* abaikan agar server tetap jalan */ }
}
// seed 2 ulasan per HP populer bila kosong
const SEED_REVIEWS = {
  "samsung-galaxy-s24-ultra": [
    { nama: "Andi Pratama", rating: 5, judul: "Kamera zoom gila", isi: "Zoom 5x masih tajam banget, S Pen responsif. Baterai seharian penuh aman.", tanggal: "2026-08-10" },
    { nama: "Sinta Dewi", rating: 4, judul: "Berat tapi puas", isi: "Agak berat 232g, tapi layar dan speaker terbaik yang pernah saya pakai.", tanggal: "2026-08-22" }
  ],
  "iphone-15-pro-max": [
    { nama: "Rizky Ramadhan", rating: 5, judul: "Video sinematik juara", isi: "Pindah dari Android, hasil video ProRes jauh lebih stabil untuk kerja.", tanggal: "2026-07-15" }
  ],
  "xiaomi-redmi-note-13-pro": [
    { nama: "Budi Santoso", rating: 5, judul: "Value terbaik 4 jutaan", isi: "Layar AMOLED 1.5K di harga segini tidak ada lawan. Charging 67W cepat.", tanggal: "2026-09-01" }
  ]
};
for (const [id, arr] of Object.entries(SEED_REVIEWS)) {
  if (!reviewsStore[id]) reviewsStore[id] = arr;
}

function getReviews(id) {
  return Array.isArray(reviewsStore[id]) ? reviewsStore[id] : [];
}
function phoneRating(phone) {
  const r = getReviews(phone.id);
  if (!r.length) return { rating: phone.rating, count: phone.reviewCount };
  const avgUser = r.reduce((a, b) => a + b.rating, 0) / r.length;
  const blended = Math.round(((phone.rating * 0.7 + avgUser * 0.3) * 10)) / 10;
  return { rating: blended, count: phone.reviewCount + r.length };
}
function withRating(p) {
  const { rating, count } = phoneRating(p);
  return { ...p, ratingLive: rating, reviewCountLive: count, userReviews: getReviews(p.id).length };
}
function minPrice(p) {
  return Math.min(...p.prices.map((x) => x.harga));
}
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
// Riwayat harga deterministik 6 bulan (gaya Kimovil): tren turun + noise dari hash id.
// Untuk apa: memberi konteks "murah sekarang atau tunggu". Ditaruh di detail.
// Akibat jika tidak ada: user hanya lihat harga sesaat, tidak bisa menilai momentum.
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); }
const BULAN_LABEL = ["Apr 2026", "Mei 2026", "Jun 2026", "Jul 2026", "Agu 2026", "Sep 2026"];
function priceHistory(p) {
  const kini = minPrice(p);
  const h = hashStr(p.id);
  const dropTotal = 0.06 + ((h % 13) / 100); // total penurunan 6-18% selama 6 bulan
  const pts = [];
  for (let i = 5; i >= 0; i--) {
    const f = i / 5; // 1 = 6 bulan lalu, 0 = kini
    const noise = (((h >> (i * 2)) % 7) - 3) / 400; // +-0.75%
    const val = Math.round((kini * (1 + dropTotal * f) * (1 + noise)) / 1000) * 1000;
    pts.push({ bulan: BULAN_LABEL[5 - i], harga: val });
  }
  pts[5].harga = kini;
  const awal = pts[0].harga;
  return { points: pts, awal, kini, selisih: awal - kini, persen: Math.round(((awal - kini) / awal) * 1000) / 10 };
}

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
  res.json({ ...full, hargaTermurah: minPrice(p), ulasan: getReviews(p.id) });
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

app.post("/api/phones/:id/reviews", (req, res) => {
  const p = PHONES.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "HP tidak ditemukan." });
  const nama = (req.body.nama || "").toString().trim().slice(0, 40);
  const judul = (req.body.judul || "").toString().trim().slice(0, 80);
  const isi = (req.body.isi || "").toString().trim().slice(0, 1000);
  const rating = Number(req.body.rating);
  if (!nama || !isi) return res.status(400).json({ error: "Nama dan isi ulasan wajib diisi." });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating harus 1 sampai 5." });
  if (!judul) return res.status(400).json({ error: "Judul ulasan wajib diisi." });
  const entry = { nama, rating, judul, isi, tanggal: new Date().toISOString().slice(0, 10) };
  if (!Array.isArray(reviewsStore[p.id])) reviewsStore[p.id] = [];
  reviewsStore[p.id].unshift(entry);
  saveReviews();
  const { rating: r, count } = phoneRating(p);
  res.status(201).json({ ok: true, ulasan: entry, ratingLive: r, reviewCountLive: count });
});

app.get("/api/compare", (req, res) => {
  const ids = (req.query.ids || "").toString().split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
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

// Riwayat harga per HP (Kimovil-style)
app.get("/api/phones/:id/price-history", (req, res) => {
  const p = PHONES.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "HP tidak ditemukan." });
  res.json({ id: p.id, name: p.name, ...priceHistory(p) });
});

// Penurunan harga terbesar (untuk blok beranda). Diurutkan by persen turun.
app.get("/api/drops", (req, res) => {
  const limit = Math.min(8, Math.max(1, parseInt(req.query.limit || "5", 10) || 5));
  const rows = PHONES.map((p) => {
    const h = priceHistory(p);
    return { ...withRating(p), hargaTermurah: minPrice(p), turunRp: h.selisih, turunPersen: h.persen };
  }).sort((a, b) => b.turunPersen - a.turunPersen).slice(0, limit);
  res.json(rows);
});

// Statistik database untuk masthead dan blok beranda
app.get("/api/stats", (req, res) => {
  const mins = PHONES.map(minPrice);
  const sum = mins.reduce((a, b) => a + b, 0);
  const nfc = PHONES.filter((p) => p.comms.nfc).length;
  const g5 = PHONES.filter((p) => p.network.dukungan5G).length;
  res.json({
    total: PHONES.length,
    brands: new Set(PHONES.map((p) => p.brand)).size,
    termurah: Math.min(...mins),
    termahal: Math.max(...mins),
    rerata: Math.round(sum / mins.length),
    denganNFC: nfc,
    dengan5G: g5
  });
});

// fallback SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Endpoint tidak ditemukan." });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`SpekHP berjalan di http://localhost:${PORT}`));
}
module.exports = app;
