const express = require("express");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");
const path = require("path");
const { PHONES, NEWS, AFF, ADS } = require("./data");

/* Arsitektur berlapis: Konfigurasi > Middleware (jejak + pengaman) >
   Validasi > Toko data (indeks) > Presenter > Rute > Penanganan galat.
   Satu file agar deploy tetap sederhana, tiap lapis punya batas tegas. */
const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

/* Jejak permintaan ringan: ID unik per respons untuk lacak log/proxy. */
let reqSeq = 0;
app.use((req, res, next) => {
  reqSeq += 1;
  res.setHeader("X-Request-Id", "sp" + Date.now().toString(36) + "-" + reqSeq);
  next();
});

app.use(cors());
app.use(compression({ level: 6 }));
app.use(express.json({ limit: "256kb" }));
/* Cache API pendek (bukan no-store total): harga berubah hitungan jam,
   bukan detik. Daftar/brand boleh dicache 60 dtk, detail 30 dtk —
   hemat bandwidth dan render lebih cepat tanpa harga basi. */
function cacheDetik(res, n) {
  res.setHeader("Cache-Control", "public, max-age=" + n + ", must-revalidate");
}
function noCache(res) {
  res.setHeader("Cache-Control", "no-store");
}
// Header keamanan dasar + cache statis agar tidak tabrakan render dan hemat bandwidth
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
/* Cache statis berlapis: HTML selalu revalidasi (agar deploy baru langsung
   terlihat), aset berversi (?v=N) immutable 1 tahun, sisanya 1 jam + ETag. */
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "1h", etag: true,
  setHeaders: function (res, filePath) {
    if (/\.html$/.test(filePath)) {
      res.setHeader("Cache-Control", "no-cache");
    } else if (res.req && res.req.query && res.req.query.v) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
}));

// Favicon: 204 agar browser tidak menerima HTML sebagai ikon
app.get("/favicon.ico", (req, res) => res.status(204).end());
// Robots dasar untuk publish
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n");
});
app.get("/sitemap.xml", (req, res) => {
  const base = (req.protocol + "://" + req.get("host")).replace(/\/$/, "");
  const item = (u, lastmod) => "  <url><loc>" + base + "/" + u.replace(/^\/+/, "") + "</loc>" + (lastmod ? "<lastmod>" + lastmod + "</lastmod>" : "") + "</url>";
  const urls = [
    item("/", null),
    item("/#/phones", null),
    item("/#/compare", null),
    item("/#/news", null),
    item("/#/favorites", null)
  ]
    .concat(PHONES.map((p) => item("/#/phone/" + p.id, p.released || null)))
    .concat(NEWS.map((n) => item("/#/news/" + n.id, n.tanggal || null)));
  res.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
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
function isId(s) { return /^[a-z0-9-]{3,60}$/.test(String(s || "")); }
function cleanSearch(s) { return String(s || "").trim().slice(0, 80); }
function kirimGalat(res, kode, pesan) { return res.status(kode).json({ error: pesan, code: kode }); }
/* Toko data berindeks: cari ID O(1), daftar merek dihitung sekali.
   Dataset kecil (24 HP) tapi pola ini siap saat katalog membesar. */
const TokoHP = {
  byId: new Map(PHONES.map((p) => [p.id, p])),
  daftarMerek: null,
  merek() {
    if (!this.daftarMerek) {
      const map = {};
      PHONES.forEach((p) => { map[p.brand] = (map[p.brand] || 0) + 1; });
      this.daftarMerek = Object.entries(map)
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => a.brand.localeCompare(b.brand));
    }
    return this.daftarMerek;
  },
  ambil(id) { return this.byId.get(id) || null; },
  adaMerek(b) { return this.merek().some((m) => m.brand === b); }
};
/* Daftar ringkas: untuk tray compare, autocomplete, dan baris daftar.
   Full object ~4KB/HP (pros/cons/detail/sensor); ringkas ~1KB.
   24 HP = hemat ~70KB per muat compare. Detail/similar/compare tetap full. */
function ringkasHP(p) {
  const full = withRating(p);
  return {
    id: full.id, name: full.name, brand: full.brand, released: full.released,
    launch: { rilis: (full.launch && full.launch.rilis) || full.released },
    rating: full.rating, reviewCount: full.reviewCount,
    ratingLive: full.ratingLive, reviewCountLive: full.reviewCountLive,
    hits: full.hits, antutu: full.antutu,
    colors: full.colors, colorHex: full.colorHex,
    network: { dukungan5G: !!(full.network && full.network.dukungan5G) },
    body: { berat: (full.body && full.body.berat) || "-" },
    display: { ukuran: (full.display && full.display.ukuran) || "-", tipe: (full.display && full.display.tipe) || "-" },
    platform: { chipset: (full.platform && full.platform.chipset) || "-" },
    memory: { ramUtama: full.memory.ramUtama, storageUtama: full.memory.storageUtama },
    battery: { kapasitas: full.battery.kapasitas },
    prices: full.prices, hargaTermurah: minPrice(full)
  };
}

app.get("/api/health", (req, res) => { cacheDetik(res, 300); res.json({ ok: true, totalPhones: PHONES.length }); });

app.get("/api/stats", (req, res) => {
  cacheDetik(res, 300);
  const map = {};
  PHONES.forEach((p) => { map[p.brand] = (map[p.brand] || 0) + 1; });
  res.json({ ok: true, totalPhones: PHONES.length, totalNews: NEWS.length, totalBrands: Object.keys(map).length });
});

app.get("/api/brands", (req, res) => {
  cacheDetik(res, 300);
  res.json(TokoHP.merek());
});

app.get("/api/phones", (req, res) => {
  try {
    cacheDetik(res, 60);
    let out = PHONES.map(withRating);
    const q = cleanSearch(req.query.search);
    const brand = (req.query.brand || "").toString().trim().slice(0, 40);
    const minP = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxP = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const ram = req.query.ram ? Number(req.query.ram) : null;
    const storage = req.query.storage ? Number(req.query.storage) : null;
    // Validasi angka: tolak negatif/gila agar filter tak menghasilkan kosong misterius
    if ((minP !== null && (Number.isNaN(minP) || minP < 0 || minP > 999999999)) ||
        (maxP !== null && (Number.isNaN(maxP) || maxP < 0 || maxP > 999999999))) {
      return kirimGalat(res, 400, "Rentang harga tidak valid.");
    }
    if (minP !== null && maxP !== null && minP > maxP) {
      return kirimGalat(res, 400, "Harga minimum lebih besar dari maksimum.");
    }
    if ((ram !== null && (Number.isNaN(ram) || ram < 0 || ram > 64)) ||
        (storage !== null && (Number.isNaN(storage) || storage < 0 || storage > 2048))) {
      return kirimGalat(res, 400, "Filter memori tidak valid.");
    }
    if (brand && brand !== "Semua" && !TokoHP.adaMerek(brand)) {
      return kirimGalat(res, 400, "Merek tidak dikenal.");
    }
    const ringkas = req.query.ringkas === "1" || req.query.ringkas === "true";
    const only5G = req.query.only5G === "1" || req.query.only5G === "true";
    // Filter baru: baterai minimal (mAh) dan NFC. Untuk apa: baterai = daya tahan,
    // NFC = e-money/TapCash yang krusial di Indonesia. Ditaruh di finder + katalog.
    const minBat = req.query.minBattery ? Number(req.query.minBattery) : null;
    const onlyNFC = req.query.onlyNFC === "1" || req.query.onlyNFC === "true";
    // Wireless charging membedakan flagship + Note 40 Pro dari mayoritas (6 dari 24).
    const onlyWireless = req.query.onlyWireless === "1" || req.query.onlyWireless === "true";
    const sort = (req.query.sort || "populer").toString();

    let peringkat = null;
    if (q) {
      const re = new RegExp(escapeReg(q), "i");
      const ql = q.toLowerCase();
      out = out.filter((p) => re.test(p.name) || re.test(p.brand) || re.test(p.platform.chipset));
      /* Relevansi pencarian (penting untuk autocomplete limit-6): nama persis >
         awalan nama > kata cocok > merek > chipset > sisanya. */
      const skor = (p) => {
        const nama = String(p.name).toLowerCase(), merek = String(p.brand).toLowerCase();
        const chip = String(p.platform.chipset).toLowerCase();
        if (nama === ql) return 0;
        if (nama.startsWith(ql)) return 1;
        if (nama.split(/[\s-]+/).some((w) => w.startsWith(ql))) return 2;
        if (merek === ql || merek.startsWith(ql)) return 3;
        if (chip.includes(ql)) return 4;
        return 5;
      };
      peringkat = new Map();
      out.forEach((p) => peringkat.set(p.id, skor(p)));
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
      /* Nilai-uang: AnTuTu per rupiah. Untuk pembeli yang tanya
         "paling worth it apa?" tanpa buka satu-satu. */
      nilai: (a, b) => (b.antutu / minPrice(b)) - (a.antutu / minPrice(a)),
      rating: (a, b) => b.ratingLive - a.ratingLive,
      nama: (a, b) => a.name.localeCompare(b.name)
    };
    /* Bila mencari, relevansi menang atas urutan katalog; sorter katalog
       jadi penentu seri agar hasil tetap stabil. */
    const dasar = sorters[sort] || sorters.populer;
    if (peringkat) out.sort((a, b) => (peringkat.get(a.id) - peringkat.get(b.id)) || dasar(a, b));
    else out.sort(dasar);

    const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit || "9", 10) || 9));
    const total = out.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);
    const slice = out.slice((safePage - 1) * limit, safePage * limit).map((p) => (
      ringkas ? ringkasHP(p) : { ...p, hargaTermurah: minPrice(p) }
    ));
    res.json({ data: slice, total, page: safePage, pages, limit });
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data ponsel." });
  }
});

app.get("/api/phones/:id", (req, res) => {
  if (!isId(req.params.id)) return kirimGalat(res, 400, "ID perangkat tidak valid.");
  const p = TokoHP.ambil(req.params.id);
  if (!p) return kirimGalat(res, 404, "Perangkat tidak ditemukan.");
  cacheDetik(res, 30);
  const full = withRating(p);
  res.json({ ...full, hargaTermurah: minPrice(p) });
});

app.get("/api/phones/:id/similar", (req, res) => {
  if (!isId(req.params.id)) return kirimGalat(res, 400, "ID perangkat tidak valid.");
  const p = TokoHP.ambil(req.params.id);
  if (!p) return kirimGalat(res, 404, "Perangkat tidak ditemukan.");
  cacheDetik(res, 60);
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
  const mentah = (req.query.ids || "").toString().split(",").map((s) => s.trim()).filter(Boolean);
  const ids = [...new Set(mentah)].slice(0, 12);
  if (!ids.length) return kirimGalat(res, 400, "Pilih minimal 1 perangkat.");
  for (const id of ids) {
    if (!isId(id)) return kirimGalat(res, 400, "ID tidak valid: " + id);
  }
  const result = [];
  for (const id of ids) {
    const p = TokoHP.ambil(id);
    if (!p) return kirimGalat(res, 404, "ID tidak valid: " + id);
    result.push({ ...withRating(p), hargaTermurah: minPrice(p) });
  }
  cacheDetik(res, 30);
  res.json(result);
});

app.get("/api/news", (req, res) => { cacheDetik(res, 300); res.json(NEWS); });

app.get("/api/news/:id", (req, res) => {
  const n = NEWS.find((x) => String(x.id) === String(req.params.id));
  if (!n) return res.status(404).json({ error: "Berita tidak ditemukan." });
  cacheDetik(res, 300);
  const terkait = (n.terkait || []).map((id) => PHONES.find((p) => p.id === id)).filter(Boolean).map((p) => ({ ...withRating(p), hargaTermurah: minPrice(p) }));
  res.json({ ...n, terkait });
});

/* Ulasan pengunjung per perangkat: simpan file JSON lokal (tanpa akun).
   Aturan main: nama 2-40 huruf, bintang 1-5 bulat, komentar 4-500 huruf,
   tanpa tautan (anti-spam), maks 5 kiriman per IP per 10 menit,
   maks 200 ulasan per HP. Render selalu lolos esc() di frontend. */
const FILE_ULASAN = path.join(__dirname, "reviews.json");
let ulasan = {};
try {
  const mentah = JSON.parse(fs.readFileSync(FILE_ULASAN, "utf8"));
  if (mentah && typeof mentah === "object") ulasan = mentah;
} catch (e) { ulasan = {}; }
let antreTulis = Promise.resolve();
function simpanUlasan() {
  const data = JSON.stringify(ulasan);
  antreTulis = antreTulis
    .then(() => fs.promises.writeFile(FILE_ULASAN + ".tmp", data))
    .then(() => fs.promises.rename(FILE_ULASAN + ".tmp", FILE_ULASAN))
    .catch((e) => console.error("gagal simpan ulasan:", e.message));
}
const batasUlasan = new Map();
function bolehUlas(ip) {
  const kini = Date.now();
  const riwayat = (batasUlasan.get(ip) || []).filter((t) => kini - t < 10 * 60 * 1000);
  if (riwayat.length >= 5) return false;
  riwayat.push(kini);
  batasUlasan.set(ip, riwayat);
  if (batasUlasan.size > 2000) batasUlasan.clear();
  return true;
}
function ringkasUlasan(id) {
  const list = (ulasan[id] || []).slice().reverse();
  const count = list.length;
  const avg = count ? Math.round((list.reduce((a, r) => a + r.rating, 0) / count) * 10) / 10 : 0;
  return { avg, count, list: list.slice(0, 50) };
}
app.get("/api/phones/:id/reviews", (req, res) => {
  if (!isId(req.params.id)) return kirimGalat(res, 400, "ID perangkat tidak valid.");
  if (!TokoHP.ambil(req.params.id)) return kirimGalat(res, 404, "Perangkat tidak ditemukan.");
  cacheDetik(res, 15);
  res.json(ringkasUlasan(req.params.id));
});
app.post("/api/phones/:id/reviews", (req, res) => {
  if (!isId(req.params.id)) return kirimGalat(res, 400, "ID perangkat tidak valid.");
  if (!TokoHP.ambil(req.params.id)) return kirimGalat(res, 404, "Perangkat tidak ditemukan.");
  const body = req.body || {};
  const nama = String(body.nama || "").trim().slice(0, 40);
  const komentar = String(body.komentar || "").trim().slice(0, 500);
  const rating = Number(body.rating);
  if (nama.length < 2) return kirimGalat(res, 400, "Nama minimal 2 huruf.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return kirimGalat(res, 400, "Peringkat harus 1 sampai 5.");
  if (komentar.length < 4) return kirimGalat(res, 400, "Komentar minimal 4 huruf.");
  if (/https?:\/\/|www\./i.test(nama + " " + komentar)) return kirimGalat(res, 400, "Tautan tidak diizinkan di ulasan.");
  const ip = String((req.headers["x-forwarded-for"] || req.ip || "?")).split(",")[0].trim();
  if (!bolehUlas(ip)) return kirimGalat(res, 429, "Terlalu sering mengirim. Coba lagi nanti.");
  const id = req.params.id;
  if (!ulasan[id]) ulasan[id] = [];
  ulasan[id].push({ nama, rating, komentar, ts: Date.now() });
  if (ulasan[id].length > 200) ulasan[id] = ulasan[id].slice(-200);
  simpanUlasan();
  noCache(res);
  const hasil = ringkasUlasan(id);
  res.status(201).json({ ok: true, avg: hasil.avg, count: hasil.count });
});

// Config afiliasi + iklan untuk frontend (tanpa data sensitif lain).
app.get("/api/aff", (req, res) => { cacheDetik(res, 300); res.json(AFF || { aktif: false }); });
app.get("/api/ads", (req, res) => { cacheDetik(res, 300); res.json(ADS || { aktif: false }); });

// fallback SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return kirimGalat(res, 404, "Endpoint tidak ditemukan.");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Body JSON rusak harus balas JSON, bukan HTML bawaan Express
app.use((err, req, res, next) => {
  if (err && (err.type === "entity.parse.failed" || err.status === 400)) {
    return kirimGalat(res, 400, "Format data tidak valid.");
  }
  next(err);
});

// Penjaga terakhir: galat tak terduga selalu JSON konsisten, bukan HTML
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[" + res.getHeader("X-Request-Id") + "]", err && err.stack ? err.stack : err);
  if (res.headersSent) return;
  kirimGalat(res, 500, "Terjadi gangguan server.");
});

if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`SpekHP berjalan di http://localhost:${PORT} (${PHONES.length} HP, ${NEWS.length} berita)`));
  /* Mati bersih saat deploy ulang: jangan putus respons yang sedang jalan. */
  const tutup = (sinyal) => {
    console.log("Menerima " + sinyal + ", menutup server...");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", () => tutup("SIGTERM"));
  process.on("SIGINT", () => tutup("SIGINT"));
}
module.exports = app;
