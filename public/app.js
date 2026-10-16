/* SpekHP Arena - frontend arsip, gaya GSMArena/Kimovil */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var inputGlobal = document.getElementById("cariGlobal");
  var autoBox = document.getElementById("autoBox");
  var btnCari = document.getElementById("cariBtn");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  /* Cache format + harga + SVG: daftar me-render harga dan thumb yang sama
     berulang (katalog, rail, tray, tabel). toLocaleString dan rakit SVG
     mahal bila dipanggil ratusan kali per render. */
  var fmtIDRCache = {}, fmtIDRN = 0;
  function formatIDR(n) {
    var k = "rp" + n;
    if (fmtIDRCache[k]) return fmtIDRCache[k];
    var out;
    try { out = "Rp " + Number(n).toLocaleString("id-ID"); }
    catch (e) { out = "Rp " + n; }
    if (fmtIDRN < 500) { fmtIDRCache[k] = out; fmtIDRN++; }
    return out;
  }
  /* Angka besar (jumlah penilaian, dilihat) diberi pemisah ribuan id-ID
     supaya terbaca seperti situs sungguhan: 5.871, bukan 5871. */
  function fmtJml(n) {
    try { return Number(n || 0).toLocaleString("id-ID"); }
    catch (e) { return String(n || 0); }
  }
  function escId(id) {
    id = String(id == null ? "" : id).trim().slice(0, 60);
    return /^[a-z0-9-]{3,60}$/.test(id) ? id : "";
  }
  function formatTanggal(id) {
    var nama = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var p = String(id).split("-");
    if (p.length < 3) return esc(id);
    return p[2].replace(/^0/, "") + " " + nama[Number(p[1]) - 1] + " " + p[0];
  }
  function bulanTahun(id) {
    var nama = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var p = String(id).split("-");
    if (p.length < 2) return esc(id);
    return nama[Number(p[1]) - 1] + " " + p[0];
  }
  function kelasRate(r) {
    r = Number(r);
    if (r >= 4.5) return "";
    if (r >= 4.2) return " sedang";
    return " rendah";
  }
  function bintangTeks(r) {
    r = Number(r);
    var penuh = Math.floor(r + 0.25), out = "";
    for (var i = 1; i <= 5; i++) out += (i <= penuh) ? "&#9733;" : "&#9734;";
    return '<span class="bintang" title="' + esc(r) + '/5">' + out + "</span>";
  }
  var favListCache = null;
function favList() {
    if (favListCache !== null) return favListCache;
    try { 
      var l = JSON.parse(localStorage.getItem("spekhp_fav") || "[]"); 
      favListCache = l; 
      return l; 
    } catch (e) { favListCache = []; return []; }
  }
  function isFav(id) { return favList().indexOf(id) !== -1; }
  /* Bintang interaktif untuk form ulasan (tanpa lib, tanpa emoji). */
  function bintangPilih(nilai) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<button class="rate-btn' + (i <= nilai ? " isi" : "") + '" data-bintang="' + i + '" type="button" aria-label="' + i + ' dari 5 bintang">' + (i <= nilai ? "★" : "☆") + "</button>";
    }
    return out;
  }
  function toggleFav(id) {
    var l = favList(), i = l.indexOf(id);
    if (i === -1) l.push(id); else l.splice(i, 1);
    try { localStorage.setItem("spekhp_fav", JSON.stringify(l)); favListCache = l; } catch (e) {}
    return i === -1;
  }
  /* Ilustrasi datar dua sisi. Depan: bingkai + layar + kamera (pill untuk iPhone, titik untuk lainnya).
     Belakang: modul kamera per keluarga desain (bukan satu bentuk generik).
     Untuk apa: daftar butuh depan (pengenalan), galeri detail butuh belakang (pembeda desain).
     Flat, tanpa gradasi, agar mirip sketsa arsip bukan render AI. */
  function lensa(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0b0c0e" stroke="#3c4046" stroke-width="1"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.52).toFixed(1) + '" fill="#2a3d55"/>' +
      '<circle cx="' + (cx - r * 0.2).toFixed(1) + '" cy="' + (cy - r * 0.2).toFixed(1) + '" r="' + (r * 0.16).toFixed(1) + '" fill="#9fc3e0"/>';
  }
  function lampu(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#f5e9c8" stroke="#8a7a3a" stroke-width="0.8"/>';
  }
  function modulBelakang(p) {
    var id = p.id || "", brand = p.brand || "";
    if (id === "iphone-15-pro-max") {
      return '<rect x="12" y="5" width="22" height="22" rx="6" fill="#202226"/>' +
        lensa(18.5, 11.5, 3.6) + lensa(27.5, 11.5, 3.6) + lensa(23, 19.5, 3.6) + lampu(28.5, 19.5, 1.6);
    }
    if (id === "iphone-13") {
      return '<rect x="12" y="5" width="20" height="20" rx="5" fill="#202226"/>' +
        lensa(18, 11, 3.4) + lensa(26, 19, 3.4) + lampu(26.5, 10, 1.4);
    }
    if (brand === "Google") {
      return '<rect x="8" y="8" width="38" height="10" fill="#141518"/>' +
        lensa(20, 13, 3.2) + lensa(28, 13, 3.2) + (id === "google-pixel-8-pro" ? lensa(35, 13, 3.2) : lampu(35.5, 13, 1.5));
    }
    if (id === "samsung-galaxy-z-flip-5") {
      return '<rect x="12" y="4" width="30" height="20" rx="3" fill="#141518"/>' +
        '<rect x="15" y="8" width="16" height="8" fill="#2a3d55"/>' +
        lensa(36, 10, 2.6) + lensa(36, 17, 2.6);
    }
    if (brand === "OnePlus") {
      return '<circle cx="27" cy="15" r="11" fill="#141518"/>' +
        '<circle cx="27" cy="15" r="11" fill="none" stroke="#3c4046" stroke-width="1"/>' +
        lensa(23, 12, 3.2) + lensa(31, 12, 3.2) + lensa(27, 19.5, 3.2) + lampu(33.5, 21, 1.3);
    }
    if (brand === "Oppo" || brand === "Vivo" || id === "realme-11-pro-plus") {
      return '<rect x="14" y="4" width="18" height="28" rx="9" fill="#141518"/>' +
        lensa(23, 12, 3.8) + lensa(23, 22, 3.8) + lampu(30.5, 17, 1.4);
    }
    // Samsung non-lipat, Xiaomi, POCO, Redmi, Infinix, Realme C, Pixel non-visor: modul persegi vertikal
    return '<rect x="12" y="4" width="17" height="27" rx="4" fill="#141518"/>' +
      lensa(20.5, 11, 3.6) + lensa(20.5, 20, 3.6) + lampu(20.5, 27, 1.5);
  }
  var artCache = {}, artN = 0;
  function phoneArt(p, w, h, idx, view) {
    w = w || 54; h = h || 72; idx = idx || 0; view = view || "depan";
    var ck = (p.id || p.name) + "|" + w + "x" + h + "|" + idx + "|" + view;
    if (artCache[ck]) return artCache[ck];
    var aksen = (p.colorHex && p.colorHex[idx]) || "#9aa0a6";
    var nama = esc(p.name);
    if (view === "belakang") {
      var svgB = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 54 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tampak belakang ' + nama + '">' +
        '<rect x="8" y="1" width="38" height="70" rx="6" fill="' + esc(aksen) + '" stroke="#141518" stroke-width="1.5"/>' +
        '<rect x="10.5" y="3.5" width="33" height="65" rx="4" fill="none" stroke="#000" opacity="0.15"/>' +
        modulBelakang(p) +
        '<circle cx="27" cy="58" r="3" fill="none" stroke="#000" opacity="0.25"/>' +
        "</svg>";
      if (artN < 300) { artCache[ck] = svgB; artN++; }
      return svgB;
    }
    var notch = (p.brand === "Apple")
      ? '<rect x="20" y="7.5" width="14" height="4" rx="2" fill="#141518"/>'
      : '<circle cx="27" cy="9.5" r="1.8" fill="#141518"/>';
    var svgD = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 54 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tampak depan ' + nama + '">' +
      '<rect x="8" y="1" width="38" height="70" rx="6" fill="#141518"/>' +
      '<rect x="10.5" y="6" width="33" height="57" rx="3" fill="#f2f4f6"/>' + notch +
      '<rect x="10.5" y="6" width="33" height="9" rx="3" fill="' + esc(aksen) + '"/>' +
      '<rect x="14" y="19" width="20" height="3" fill="#c6ccd2"/>' +
      '<rect x="14" y="24" width="26" height="2.4" fill="#d8dde2"/>' +
      '<rect x="14" y="28" width="18" height="2.4" fill="#d8dde2"/>' +
      '<rect x="14" y="36" width="26" height="12" fill="#dde6ef" stroke="#b9c6d4" stroke-width="1"/>' +
      '<rect x="14" y="50" width="12" height="8" fill="#0d5cb6"/>' +
      '<rect x="28" y="50" width="12" height="8" fill="#e8590c"/>' +
      '<rect x="22" y="65" width="10" height="2.4" rx="1.2" fill="#3a3d42"/>' +
      "</svg>";
    if (artN < 300) { artCache[ck] = svgD; artN++; }
    return svgD;
  }
  /* Cache GET 30 detik: katalog/compare/detail sering memanggil URL sama
     (brands, daftar ringkas, health) saat pindah hash. Tanpa ini tiap
     pindah halaman = fetch ulang + spinner. POST/tanpa-cache tetap lewat. */
  var apiCache = {}, apiN = 0;
  function api(url, opts) {
    var m = !opts || !opts.method || opts.method === "GET";
    var now = Date.now();
    if (m && apiCache[url] && now - apiCache[url].t < 30000) return Promise.resolve(apiCache[url].d);
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error) || ("Gagal memuat data (" + r.status + ")"));
        if (m && apiN < 80) { apiCache[url] = { t: now, d: j }; apiN++; }
        return j;
      });
    });
  }
  function setNav(kunci) {
    document.querySelectorAll("#navUtama a").forEach(function (a) {
      var on = a.getAttribute("data-nav") === kunci;
      a.classList.toggle("aktif", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  /* Glosarium profesional: satu sumber istilah baku Indonesia.
     GSMArena = "spesifikasi/pembanding", Kimovil = "harga/penawaran",
     Versus = "pemenang/keunggulan". Tanpa singkatan kasual. */
  var COPY = {
    bandingkan: "Bandingkan", /* dipakai: "+ Bandingkan" di tiap baris daftar */
    perbandingan: "Perbandingan",
    tandaiBeda: "Tandai perbedaan",
    hanyaBeda: "Tampilkan perbedaan saja",
    nilaiUang: "Nilai terbaik",
    duel: "Perbandingan populer",
    salinTautan: "Salin tautan",
    aturUlang: "Atur ulang",
    tambahPerangkat: "Tambah HP",
    hasil: "Hasil filter",
    semuaPerangkat: "Semua HP",
    spesifikasi: "Spesifikasi"
  };
  /* Breadcrumb baku: Beranda / Bagian / Judul. Satu format di semua rute
     agar alur navigasi konsisten dan mudah dipindai. */
  function crumb(items) {
    return '<nav class="crumbs" aria-label="Navigasi halaman">' +
      items.map(function (it, i) {
        var last = i === items.length - 1;
        var isi = it.href && !last
          ? '<a href="' + esc(it.href) + '">' + esc(it.teks) + "</a>"
          : "<b>" + esc(it.teks) + "</b>";
        return (i ? '<span class="pemisah">/</span>' : "") + isi;
      }).join("") + "</nav>";
  }
  /* Lapisan layanan data: halaman memanggil PhoneService, bukan URL mentah.
     Normalisasi + cache terpusat di sini; tampilan hanya merender. */
  var PhoneService = {
    daftar: function (params) {
      var q = Object.keys(params || {}).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      }).join("&");
      return api("/api/phones" + (q ? "?" + q : ""));
    },
    detail: function (id) { return api("/api/phones/" + encodeURIComponent(id)); },
    sejenis: function (id) { return api("/api/phones/" + encodeURIComponent(id) + "/similar"); },
    banding: function (ids) { return api("/api/compare?ids=" + ids.map(encodeURIComponent).join(",")); },
    merek: function () { return api("/api/brands"); },
    berita: function () { return api("/api/news"); },
    artikel: function (id) { return api("/api/news/" + encodeURIComponent(id)); },
    statistik: function () { return api("/api/stats"); }
  };
  /* Toast: konfirmasi aksi tanpa pindah halaman. Satu elemen global, dibuat sekali. */
  var toastEl = document.createElement("div");
  toastEl.id = "toast";
  toastEl.setAttribute("role", "status");
  document.body.appendChild(toastEl);
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("tampil");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("tampil"); }, 2000);
  }
  /* Config afiliasi + iklan dari server (satu kali, sebelum render pertama). */
  var affCfg = { aktif: false, toko: [], fallback: null };
  var adsCfg = { aktif: false, client: "", slot: {} };
  var cfgSiapCache = null;
  function cfgSiap() {
    if (cfgSiapCache) return Promise.resolve();
    return Promise.all([
      api("/api/aff").then(function (j) { if (j) affCfg = j; }).catch(function () {}),
      api("/api/ads").then(function (j) { if (j) adsCfg = j; }).catch(function () {})
    ]).then(function () { cfgSiapCache = true; });
  }
  /* Link belanja: toko dipetakan ke marketplace-nya + nama HP. Template {q}/{tag}
     berasal dari server (data.js AFF) sehingga ID afiliasi cukup diisi sekali. */
  function linkBelanja(toko, namaHP) {
    var t = String(toko || "").toLowerCase(), q = encodeURIComponent(namaHP || "");
    var daftar = (affCfg && affCfg.toko) || [];
    for (var i = 0; i < daftar.length; i++) {
      var m = daftar[i] || {}, kunci = m.kunci || [];
      for (var k = 0; k < kunci.length; k++) {
        if (kunci[k] && t.indexOf(kunci[k]) !== -1) {
          return { url: String(m.url).split("{q}").join(q).split("{tag}").join(encodeURIComponent(m.tag || "")), nama: m.nama || "Marketplace" };
        }
      }
    }
    var f = (affCfg && affCfg.fallback) || { nama: "Shopee", tag: "", url: "https://shopee.co.id/search?keyword={q}" };
    return { url: String(f.url).split("{q}").join(q).split("{tag}").join(encodeURIComponent(f.tag || "")), nama: f.nama || "Shopee" };
  }
  function tombolBeli(toko, namaHP, mini) {
    if (!affCfg || affCfg.aktif === false) return "";
    var l = linkBelanja(toko, namaHP);
    return '<a class="tombol tombol-primer' + (mini ? " tombol-mini" : "") + '" href="' + esc(l.url) + '" target="_blank" rel="sponsored nofollow noopener" title="Cek harga di ' + esc(l.nama) + ' (tautan afiliasi)">BELI</a>';
  }
  var DISKLAIMER_AFF = "Tautan BELI mengarah ke marketplace (tautan afiliasi) - harga sama untuk pembeli, kami dapat komisi dari toko.";
  /* Slot iklan: AdSense bila client+slot terisi, else kotak house yang menjual space. */
  var adsLibDimuat = false;
  function muatLibIklan() {
    if (adsLibDimuat || !adsCfg.client) return;
    adsLibDimuat = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(adsCfg.client);
    s.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(s);
  }
  /* Script di innerHTML tidak dieksekusi, jadi push AdSense dipicu manual
     tiap selesai render. Tanpa client, fungsi ini no-op. */
  function prosesIklan() {
    if (!adsCfg.client) return;
    muatLibIklan();
    app.querySelectorAll("ins.adsbygoogle:not([data-ok])").forEach(function (el) {
      el.setAttribute("data-ok", "1");
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }
  function iklanHTML(slot) {
    if (!adsCfg || adsCfg.aktif === false) return "";
    var sid = adsCfg.slot && adsCfg.slot[slot];
    var isi;
    if (adsCfg.client && sid) {
      isi = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + esc(adsCfg.client) + '" data-ad-slot="' + esc(sid) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    } else {
      isi = '<div class="iklan-kosong">Ruang iklan tersedia<br><small>Hubungi redaksi untuk beriklan di sini</small></div>';
    }
    return '<div class="iklan" role="complementary" aria-label="Iklan"><span class="iklan-label">IKLAN</span>' + isi + "</div>";
  }
  /* Tombol ke atas: hanya muncul setelah user scroll jauh (halaman spek panjang). */
  var keAtas = document.createElement("button");
  keAtas.id = "keAtas";
  keAtas.type = "button";
  keAtas.textContent = "ATAS";
  keAtas.setAttribute("aria-label", "Kembali ke atas");
  document.body.appendChild(keAtas);
  function gerakSkrol() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "auto";
    } catch (e) {}
    return "smooth";
  }
  keAtas.onclick = function () { window.scrollTo({ top: 0, behavior: gerakSkrol() }); };
  /* Hanya tampil saat menggulir naik: tombol fixed takkan menutupi konten
     yang sedang dibaca (tabel, form, grafik). */
  var posTerakhir = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY, naik = y < posTerakhir;
    posTerakhir = y;
    keAtas.classList.toggle("tampil", y > 600 && naik);
  }, { passive: true });
  /* Judul tab per halaman: penting untuk publish (bookmark, riwayat, pembaca layar). */
  var JUDUL_DASAR = "SpekHP Arena - Spesifikasi, Harga dan Komparasi HP";
  function setJudul(t) {
    document.title = t ? (t + " - SpekHP Arena") : JUDUL_DASAR;
  }

  try {
    var d = new Date();
    var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()];
    var bl = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][d.getMonth()];
    document.getElementById("utilTanggal").textContent = hari + ", " + d.getDate() + " " + bl + " " + d.getFullYear() + " - Database HP Indonesia, harga IDR";
  } catch (e) {}
  PhoneService.statistik().then(function (h) {
    document.getElementById("mastStat").innerHTML = "<b>" + esc(h.totalPhones) + "</b><span>model HP</span>";
  }).catch(function () {
    api("/api/health").then(function (h) {
      document.getElementById("mastStat").innerHTML = "<b>" + esc(h.totalPhones) + "</b><span>model HP</span>";
    }).catch(function () {});
  });

  var hargaMinCache = {}, hargaMinN = 0;
  function hargaMin(p) {
    if (p.hargaTermurah != null) return p.hargaTermurah;
    var ck = p.id || p.name;
    if (ck && hargaMinCache[ck] != null) return hargaMinCache[ck];
    var out = p.priceIDR;
    if (p.prices) out = Math.min.apply(null, p.prices.map(function (x) { return x.harga; }));
    if (ck && hargaMinN < 200) { hargaMinCache[ck] = out; hargaMinN++; }
    return out;
  }
  function rateLive(p) { return p.ratingLive != null ? p.ratingLive : p.rating; }
  function countLive(p) { return p.reviewCountLive != null ? p.reviewCountLive : p.reviewCount; }
  function antuRingkas(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + " jt";
    if (n >= 1000) return Math.round(n / 1000) + " rb";
    return String(n);
  }
  /* Harga ringkas untuk chip toko: "Rp 23,75 jt". Koma desimal id-ID. */
  function rpRingkas(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(2).replace(/0+$/, "").replace(/[.,]$/, "").replace(".", ",") + " jt";
    return formatIDR(n);
  }
  /* Nama toko pendek untuk chip: "Tokopedia - GadgetHub" -> "Tokopedia". */
  function tokoPendek(t) {
    t = String(t || "").split(" - ")[0].trim();
    if (t.length > 18) t = t.slice(0, 17).replace(/\s+\S*$/, "") + "…";
    return t || "Toko";
  }

  /* Kartu ala Tokopedia/iPrice/Gmarket: judul + rating di atas, spek kunci
     di bawah judul, diversitas merchant terlihat (value prop komparasi harga),
     hierarki CTA primer > sekunder > ikon. Tanpa klaim diskon/hemat: harga
     yang tampil murni angka toko, bukan promosi. */
  function barisHP(p) {
    var h = hargaMin(p), r = rateLive(p);
    var urs = [];
    try { urs = (p.prices || []).slice().sort(function (a, b) { return a.harga - b.harga; }); } catch (e) {}
    var chips = urs.slice(0, 2).map(function (x) {
      return '<span class="toko-chip"><b>' + esc(tokoPendek(x.toko)) + "</b> " + esc(rpRingkas(x.harga)) + "</span>";
    }).join("");
    var lebih = urs.length > 2 ? '<a class="toko-lebih" href="#/phone/' + esc(p.id) + '">+' + (urs.length - 2) + " toko</a>" : "";
    return '<article class="baris-hp" data-href="#/phone/' + esc(p.id) + '">' +
      '<a class="thumb" href="#/phone/' + esc(p.id) + '" tabindex="-1" aria-hidden="true">' + phoneArt(p) + "</a>" +
      '<div class="min0"><a class="baris-nama" href="#/phone/' + esc(p.id) + '">' + esc(p.name) + "</a>" +
      (p.network && p.network.dukungan5G ? '<span class="tag5g">5G</span>' : "") +
      '<div class="skor-kecil"><span class="rate-num' + kelasRate(r) + '">' + esc(r) + '</span> ' + bintangTeks(r) + " " + esc(fmtJml(countLive(p))) + " penilaian · AnTuTu " + esc(antuRingkas(p.antutu)) + "</div>" +
      '<div class="baris-spek">' + esc(p.display.ukuran) + " · " + esc(p.platform.chipset.split("(")[0].trim()) + " · " + esc(p.memory.ramUtama) + "/" + esc(p.memory.storageUtama) + "GB · " + esc(p.battery.kapasitas) + " mAh</div>" +
      '<div class="baris-sub">' + esc(p.brand) + " · " + esc(p.launch ? p.launch.rilis : p.released) + "</div></div>" +
      '<div class="baris-kanan"><div class="harga-merah">' + formatIDR(h) + "</div>" +
      ((chips || lebih) ? '<div class="toko-chips">' + chips + lebih + "</div>" : "") +
      '<div class="aksi-baris"><a class="tombol tombol-primer tombol-mini cta-utama" href="#/phone/' + esc(p.id) + '">Lihat harga</a>' +
      '<button class="banding-link" data-compare="' + esc(p.id) + '" type="button">+ ' + COPY.bandingkan + "</button>" +
      '<button class="bintang-fav' + (isFav(p.id) ? " suka" : "") + '" data-fav="' + esc(p.id) + '" type="button" title="Simpan ke favorit" aria-label="Simpan ' + esc(p.name) + ' ke favorit" aria-pressed="' + (isFav(p.id) ? "true" : "false") + '">' + (isFav(p.id) ? "★" : "☆") + "</button></div>" +
      "</div></article>";
  }

  function beritaBaris(n) {
    return '<div class="berita-baris" data-href="#/news/' + esc(n.id) + '"><div class="berita-tgl"><b>' + esc(n.tanggal.slice(8, 10)) + "</b>" + bulanTahun(n.tanggal) + '</div><div class="min0"><span class="tag">' + esc(n.kategori) + '</span> <a class="berita-judul" href="#/news/' + esc(n.id) + '">' + esc(n.judul) + '</a><div class="berita-ringkas">' + esc(n.ringkasan) + "</div></div></div>";
  }

  function blokJudul(judul, linkTeks, linkHash) {
    return '<div class="judul-blok">' + esc(judul) +
      (linkTeks ? ' <a href="' + esc(linkHash) + '">' + esc(linkTeks) + '</a>' : "") + '</div>';
  }
  function finderHTML(brands, state, compact) {
    state = state || {};
    var optBrand = '<option value="Semua">Semua merek</option>' + brands.map(function (b) {
      return '<option value="' + esc(b.brand) + '"' + (state.brand === b.brand ? " selected" : "") + ">" + esc(b.brand) + " (" + b.count + ")</option>";
    }).join("");
    return '<div class="finder-judul">Pencari HP</div><div class="finder-grup">' +
      '<label>Kata kunci</label><input type="text" id="fSearch" value="' + esc(state.search || "") + '" placeholder="Nama / chipset">' +
      '<label>Merek</label><select id="fBrand">' + optBrand + "</select>" +
      '<label>Harga min (Rp)</label><input type="number" id="fMin" min="0" step="100000" value="' + esc(state.minPrice || "") + '" placeholder="Min. harga">' +
      '<label>Harga maks (Rp)</label><input type="number" id="fMax" min="0" step="100000" value="' + esc(state.maxPrice || "") + '" placeholder="Maks. harga">' +
      '<label>RAM min</label><select id="fRam"><option value="">Semua</option>' +
      [4, 6, 8, 12, 16].map(function (v) { return '<option value="' + v + '"' + (String(state.ram || "") === String(v) ? " selected" : "") + ">" + v + " GB+</option>"; }).join("") + "</select>" +
      '<label>Memori min</label><select id="fStorage"><option value="">Semua</option>' +
      [128, 256, 512, 1024].map(function (v) { return '<option value="' + v + '"' + (String(state.storage || "") === String(v) ? " selected" : "") + ">" + v + " GB+</option>"; }).join("") + "</select>" +
      '<label>Baterai min</label><select id="fBat"><option value="">Semua</option>' +
      [[4000, "4000 mAh+"], [4500, "4500 mAh+"], [5000, "5000 mAh+"]].map(function (o) { return '<option value="' + o[0] + '"' + (String(state.minBattery || "") === String(o[0]) ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>" +
      '<label class="finder-cek polos"><input type="checkbox" id="f5g" class="cekbox"' + (state.only5G ? " checked" : "") + "> Hanya 5G</label>" +
      '<label class="finder-cek polos"><input type="checkbox" id="fWls" class="cekbox"' + (state.onlyWireless ? " checked" : "") + "> Ada wireless charging</label>" +
      '<button class="tombol tombol-primer tombol" id="fTerapkan" type="button">Terapkan</button>' +
      (compact ? "" : '<button class="tombol tombol-blok" id="fReset" type="button">' + COPY.aturUlang + "</button>") +
      "</div>";
  }
  function railKananHTML(populer, turun) {
    return '<div class="blok">' + blokJudul("Paling dilihat") +
      '<ol class="ol-pop pad68">' + populer.slice(0, 7).map(function (p, i) {
        return '<li><span class="no">' + (i + 1) + '.</span><span class="min0"><a href="#/phone/' + esc(p.id) + '">' + esc(p.name) + "</a><small>" + esc(Number(p.hits).toLocaleString("id-ID")) + " dilihat - " + formatIDR(hargaMin(p)) + "</small></span></li>";
      }).join("") + "</ol></div>" +
      iklanHTML("rail", "box") +
      '<div class="blok">' + blokJudul("Harga terbaik 4 jutaan") +
      '<div class="pad68 teks12">' + turun.map(function (p) {
        return '<div class="baris-titik"><a href="#/phone/' + esc(p.id) + '"><b>' + esc(p.name) + "</b></a><br><span class=\"harga-merah\">" + formatIDR(hargaMin(p)) + "</span> <span class=\"harga-kecil\">" + esc(p.memory.ramUtama) + "GB RAM</span></div>";
      }).join("") + "</div></div>";
  }

  /* ---------- ROUTER ---------- */
  function parseHash() {
    var h = location.hash || "#/";
    var raw = h.replace(/^#/, ""), parts = raw.split("?"), path = parts[0] || "/";
    var query = {};
    if (parts[1]) parts[1].split("&").forEach(function (kv) {
      var kvp = kv.split("=");
      if (kvp[0]) query[decodeURIComponent(kvp[0])] = decodeURIComponent(kvp[1] || "");
    });
    return { path: path, query: query };
  }
  function tidakDikenal(judul) {
    setJudul(judul || "Halaman tidak ditemukan");
    app.innerHTML = '<div class="kosong"><h3>' + esc(judul || "Halaman tidak ditemukan") + '</h3><p><a href="#/">Kembali ke beranda</a></p></div>';
  }
  function route() {
    var r = parseHash();
    window.scrollTo(0, 0);
    if (r.path === "/" || r.path === "") return renderHome();
    if (r.path === "/phones") return renderCatalog(r.query);
    if (r.path.indexOf("/phone/") === 0) {
      var pid = escId(decodeURIComponent(r.path.split("/")[2] || ""));
      if (!pid) return tidakDikenal("HP tidak dikenal");
      return renderDetail(pid);
    }
    if (r.path === "/compare") return renderCompare(r.query);
    if (r.path.indexOf("/news/") === 0) return renderNewsDetail(r.path.split("/")[2]);
    if (r.path === "/news") return renderNews();
    if (r.path === "/favorites") return renderFavorites();
    setJudul("Halaman tidak ditemukan");
    app.innerHTML = '<div class="kosong"><h3>Halaman tidak ditemukan</h3><p><a href="#/">Kembali ke beranda</a></p></div>';
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("click", function (e) {
    /* Klik di luar kolom tambah menutup panel saran (tanpa ini panel mengambang). */
    if (!e.target.closest(".tambah-wrap") && window.__tutupPanel) window.__tutupPanel();
    /* Gulir dalam halaman TANPA mengubah hash: href="#bagian-x" menabrak router
       dan melempar user ke "Halaman tidak ditemukan". Tombol ini solusinya. */
    var g = e.target.closest("[data-goto]");
    if (g) {
      var t = document.getElementById(g.getAttribute("data-goto"));
      if (t) {
        if (t.scrollIntoView) t.scrollIntoView({ behavior: gerakSkrol(), block: "start" });
        else t.scrollIntoView();
      }
      return;
    }
    var f = e.target.closest("[data-fav]");
    if (f) {
      e.preventDefault();
      var added = toggleFav(f.getAttribute("data-fav"));
      document.querySelectorAll('[data-fav="' + f.getAttribute("data-fav") + '"]').forEach(function (b) {
        b.classList.toggle("suka", added);
        if (b.classList.contains("bintang-fav")) {
          b.textContent = added ? "★" : "☆";
          b.setAttribute("aria-pressed", added ? "true" : "false");
        } else if (b.classList.contains("fav-mini")) b.textContent = added ? "★ TERSIMPAN" : "☆ SIMPAN";
      });
      toast(added ? "Tersimpan di favorit" : "Dihapus dari favorit");
      if ((location.hash || "").indexOf("#/favorites") === 0) renderFavorites();
      return;
    }
    var c = e.target.closest("[data-compare]");
    if (c) {
      var cid = escId(c.getAttribute("data-compare"));
      if (!cid) { toast("HP tidak dikenal"); return; }
      location.hash = "#/compare?ids=" + encodeURIComponent(cid);
      return;
    }
    /* Kartu bisa diklik: seluruh baris daftar, kartu duel, dan baris berita
       membuka halaman detail. Tombol/tautan di dalamnya tetap menang
       (ditangani di atas), dan blok teks yang diseleksi tidak ikut pindah. */
    var kh = e.target.closest("[data-href]");
    if (kh && !e.target.closest("a,button,input,select,textarea")) {
      try {
        if (window.getSelection && String(window.getSelection()).trim()) return;
      } catch (se) {}
      location.hash = kh.getAttribute("data-href");
    }
  });
  function kirimCari(v) {
    v = String(v == null ? "" : v).trim().slice(0, 80);
    if (!v) return;
    location.hash = "#/phones?search=" + encodeURIComponent(v);
  }
  btnCari.addEventListener("click", function () {
    if (inputGlobal.value.trim()) {
      var v = inputGlobal.value.trim(); inputGlobal.value = "";
      autoBox.classList.remove("tampil");
      kirimCari(v);
    }
  });
  var acTimer = null, acAktif = -1, acSeq = 0;
  function acItems() { return autoBox.querySelectorAll("[data-go],[data-go-search]"); }
  function acSorot() {
    var items = acItems();
    items.forEach(function (b, i) { b.classList.toggle("ac-aktif", i === acAktif); });
  }
  inputGlobal.addEventListener("input", function () {
    clearTimeout(acTimer);
    var v = inputGlobal.value.trim();
    acAktif = -1;
    if (v.length < 2) { autoBox.classList.remove("tampil"); autoBox.innerHTML = ""; return; }
    acTimer = setTimeout(function () {
      var q = v.slice(0, 80), mySeq = ++acSeq;
      PhoneService.daftar({ search: q, limit: 6, ringkas: 1 }).then(function (res) {
        if (mySeq !== acSeq) return;
        autoBox.innerHTML = res.data.length ? res.data.map(function (p) {
          return '<button type="button" data-go="' + esc(p.id) + '"><span class="min0"><b>' + esc(p.name) + '</b><br><span class="harga-kecil">' + esc(p.platform.chipset.split("(")[0]) + "</span></span>" + '<span class="ac-harga">' + formatIDR(p.hargaTermurah) + "</span></button>";
        }).join("") : '<button type="button" data-go-search="' + esc(q) + '">Tidak ada yang pas. Lihat hasil filter untuk "' + esc(q) + '" &raquo;</button>';
        acAktif = -1;
        autoBox.classList.add("tampil");
      }).catch(function () { if (mySeq === acSeq) autoBox.classList.remove("tampil"); });
    }, 200);
  });
  autoBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]");
    if (b) { autoBox.classList.remove("tampil"); inputGlobal.value = ""; location.hash = "#/phone/" + b.getAttribute("data-go"); return; }
    var s = e.target.closest("[data-go-search]");
    if (s) { autoBox.classList.remove("tampil"); inputGlobal.value = ""; kirimCari(s.getAttribute("data-go-search")); }
  });
  /* Navigasi keyboard: panah atas/bawah memilih, Enter membuka, Esc menutup. */
  inputGlobal.addEventListener("keydown", function (e) {
    var terbuka = autoBox.classList.contains("tampil");
    if (terbuka && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      var n = acItems().length;
      if (!n) return;
      acAktif = e.key === "ArrowDown" ? (acAktif + 1) % n : (acAktif - 1 + n) % n;
      acSorot();
      return;
    }
    if (terbuka && e.key === "Escape") { autoBox.classList.remove("tampil"); acAktif = -1; return; }
    if (e.key === "Enter") {
      if (terbuka && acAktif >= 0) {
        e.preventDefault();
        var items = acItems(), pil = items[acAktif];
        if (!pil) return;
        autoBox.classList.remove("tampil");
        inputGlobal.value = "";
        acAktif = -1;
        if (pil.hasAttribute("data-go")) location.hash = "#/phone/" + pil.getAttribute("data-go");
        else kirimCari(pil.getAttribute("data-go-search"));
        return;
      }
      if (inputGlobal.value.trim()) {
        autoBox.classList.remove("tampil");
        var v = inputGlobal.value.trim(); inputGlobal.value = "";
        kirimCari(v);
      }
    }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".searchbar")) autoBox.classList.remove("tampil");
  });

  /* ---------- HOME ---------- */
  function renderHome() {
    setNav("home");
    setJudul("");
    app.innerHTML = '<div class="loading">Memuat beranda...</div>';
    Promise.all([
      PhoneService.merek(),
      PhoneService.daftar({ sort: "populer", limit: 12, ringkas: 1 }),
      PhoneService.daftar({ sort: "terbaru", limit: 6, ringkas: 1 }),
      PhoneService.berita()
    ]).then(function (res) {
      var brands = res[0], populer = res[1], terbaru = res[2], news = res[3];
      var murah = populer.data.filter(function (p) { return hargaMin(p) < 5000000; }).slice(0, 4);
      var turun = murah.length ? murah : populer.data.slice(0, 4);
      /* Hero + Phone Finder quiz (pola 91mobiles/Android Help-me-choose):
         mayoritas pembeli mulai dari budget + kebutuhan, bukan merek. */
      var heroHTML =
        '<div class="hero"><div class="hero-teks"><h1>Cari HP yang pas, bukan yang ramai.</h1>' +
        '<p>Bandingkan spesifikasi, harga toko Indonesia, dan nilai performa-harga dalam satu tempat.</p>' +
        '<div class="hero-cta"><a class="tombol tombol-primer" href="#/phones">Jelajahi katalog</a> ' +
        '<a class="tombol" href="#/compare">Bandingkan HP</a></div></div>' +
        '<div class="hero-quiz"><div class="hero-quiz-judul">Phone Finder: jawab 2 langkah</div>' +
        '<label>Budget</label><select id="qBudget"><option value="">Semua budget</option>' +
        '<option value="2000000">Di bawah Rp 2 jt</option><option value="3500000">Di bawah Rp 3,5 jt</option>' +
        '<option value="6000000">Di bawah Rp 6 jt</option><option value="999999999">Flagship 10 jt+</option></select>' +
        '<label>Kebutuhan utama</label><select id="qButuh"><option value="populer">Seimbang / harian</option>' +
        '<option value="nilai">Gaming (nilai performa-harga)</option><option value="baterai">Baterai awet</option>' +
        '<option value="rating">Rating tertinggi</option><option value="terbaru">Rilis terbaru</option></select>' +
        '<button class="tombol tombol-primer tombol-blok" id="qCari" type="button">Tampilkan rekomendasi</button></div></div>' +
        '<div class="butuh-grid">' +
        '<a href="#/phones?sort=nilai"><b>Gaming</b><span>AnTuTu per rupiah tertinggi</span></a>' +
        '<a href="#/phones?minBattery=5000"><b>Baterai awet</b><span>5000 mAh ke atas</span></a>' +
        '<a href="#/phones?only5G=1"><b>Siap 5G</b><span>Jaringan masa depan</span></a>' +
        '<a href="#/phones?maxPrice=2500000"><b>Budget</b><span>Di bawah 2,5 jt</span></a>' +
        "</div>";
      app.innerHTML = heroHTML +
        '<div class="kolom-home"><aside class="rail-kiri rail-nempel" id="finderHome">' + finderHTML(brands, {}, true) +
        '<div class="mt10">' + blokJudul("Merek") + '<div class="merek-box">' +
        brands.map(function (b) {
          return '<div class="merek-baris"><a href="#/phones?brand=' + encodeURIComponent(b.brand) + '">' + esc(b.brand) + "</a> <span class=\"harga-kecil\">(" + b.count + ")</span></div>";
        }).join("") + "</div></div></aside>" +
        '<div class="badan">' +
        '<button class="tombol tombol-mini filter-toggle" id="filterToggle" type="button" aria-expanded="false" aria-controls="finderHome">Filter</button>' +
        '<div class="blok">' + blokJudul("HP terbaru", "Indeks lengkap", "#/phones?sort=terbaru") +
        terbaru.data.map(barisHP).join("") + "</div>" +
        '<div class="blok">' + blokJudul("HP terpopuler", "Semua populer", "#/phones?sort=populer") +
        populer.data.slice(0, 6).map(barisHP).join("") + "</div>" +
        // Pintasan budget: untuk apa: mayoritas pembeli Indonesia mulai dari budget, bukan merek.
        '<div class="blok">' + blokJudul("Cari berdasarkan harga") +
        '<div class="budget-grid">' +
        '<a href="#/phones?maxPrice=2000000"><b>Di bawah 2 jt</b><span>HP kedua dan pelajar</span></a>' +
        '<a href="#/phones?maxPrice=3500000"><b>Di bawah 3,5 jt</b><span>NFC dan 90Hz+ paling laris</span></a>' +
        '<a href="#/phones?maxPrice=6000000"><b>Di bawah 6 jt</b><span>Gaming dan kamera OIS</span></a>' +
        '<a href="#/phones?minPrice=10000000"><b>Flagship 10 jt+</b><span>200MP, titanium, ProRes</span></a>' +
        "</div></div>" +
        '<div class="blok">' + blokJudul(COPY.duel) +
        '<div class="pad8 teks125">' +
        '<div class="baris-titik"><a href="#/compare?ids=poco-x6-pro,xiaomi-redmi-note-13-pro"><b>POCO X6 Pro vs Redmi Note 13 Pro 5G</b></a> <span class="harga-kecil">- Beda Rp 500 ribu, beda kelas performa</span></div>' +
        '<div class="baris-titik"><a href="#/compare?ids=samsung-galaxy-s24-ultra,iphone-15-pro-max"><b>Galaxy S24 Ultra vs iPhone 15 Pro Max</b></a> <span class="harga-kecil">- Duel flagship 200MP vs 48MP</span></div>' +
        '<div class="baris-padat"><a href="#/compare?ids=infinix-note-40-pro,samsung-galaxy-a54"><b>Infinix Note 40 Pro vs Galaxy A54</b></a> <span class="harga-kecil">- 3 jutaan wireless charging vs IP67</span></div>' +
        "</div></div>" +
        iklanHTML("home_feed") +
        '<div class="dua-isi">' +
        '<div class="blok">' + blokJudul("Berita dan panduan", "Semua berita", "#/news") +
        news.slice(0, 4).map(beritaBaris).join("") + "</div>" +
        '<div class="blok">' + railKananHTML(populer.data, turun) + "</div>" +
        "</div>" +
        "</div></div>";
      ikatFinder({}, brands);
      ikatFilterToggle("finderHome", false);
      var qBtn = document.getElementById("qCari");
      if (qBtn) qBtn.onclick = function () {
        var b = (document.getElementById("qBudget") || {}).value || "";
        var n = (document.getElementById("qButuh") || {}).value || "populer";
        var p = [];
        if (b === "999999999") p.push("minPrice=10000000");
        else if (b) p.push("maxPrice=" + encodeURIComponent(b));
        if (n === "baterai") p.push("minBattery=5000");
        else if (n === "rating") p.push("sort=rating");
        else if (n === "terbaru") p.push("sort=terbaru");
        else if (n === "nilai") p.push("sort=nilai");
        location.hash = "#/phones" + (p.length ? "?" + p.join("&") : "");
      };
      prosesIklan();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">Gagal memuat beranda: ' + esc(err.message) + "</div>";
    });
  }
  function bacaFinder() {
    return {
      search: (document.getElementById("fSearch") || { value: "" }).value.trim().slice(0, 80),
      brand: (document.getElementById("fBrand") || { value: "Semua" }).value,
      minPrice: (document.getElementById("fMin") || { value: "" }).value.trim(),
      maxPrice: (document.getElementById("fMax") || { value: "" }).value.trim(),
      ram: (document.getElementById("fRam") || { value: "" }).value,
      storage: (document.getElementById("fStorage") || { value: "" }).value,
      minBattery: (document.getElementById("fBat") || { value: "" }).value,
      only5G: !!(document.getElementById("f5g") || { checked: false }).checked,
      onlyWireless: !!(document.getElementById("fWls") || { checked: false }).checked
    };
  }
  function ikatFinder(stateAwal, brands) {
    var t = document.getElementById("fTerapkan");
    if (t) t.onclick = function () {
      var s = bacaFinder(), p = [];
      if (s.search) p.push("search=" + encodeURIComponent(s.search));
      if (s.brand && s.brand !== "Semua") p.push("brand=" + encodeURIComponent(s.brand));
      if (s.minPrice) p.push("minPrice=" + encodeURIComponent(s.minPrice));
      if (s.maxPrice) p.push("maxPrice=" + encodeURIComponent(s.maxPrice));
      if (s.ram) p.push("ram=" + encodeURIComponent(s.ram));
      if (s.storage) p.push("storage=" + encodeURIComponent(s.storage));
      if (s.minBattery) p.push("minBattery=" + encodeURIComponent(s.minBattery));
      if (s.only5G) p.push("only5G=1");
      if (s.onlyWireless) p.push("onlyWireless=1");
      location.hash = "#/phones" + (p.length ? "?" + p.join("&") : "");
    };
    var fs = document.getElementById("fSearch");
    if (fs) fs.onkeydown = function (e) { if (e.key === "Enter" && t) t.click(); };
  }
  /* Toggle filter di layar kecil: hasil tampil dulu, form lipat.
     Desktop: tombol disembunyikan CSS, aside selalu terlihat. */
  function ikatFilterToggle(asideId, bukaAwal) {
    var btn = document.getElementById("filterToggle");
    var aside = asideId ? document.getElementById(asideId) : null;
    if (!btn || !aside) return;
    var kecil = false;
    try { kecil = window.matchMedia && window.matchMedia("(max-width:720px)").matches; } catch (e) {}
    var buka = kecil ? !!bukaAwal : true;
    aside.classList.toggle("buka", buka);
    btn.setAttribute("aria-expanded", buka ? "true" : "false");
    btn.onclick = function () {
      var sk = aside.classList.toggle("buka");
      btn.setAttribute("aria-expanded", sk ? "true" : "false");
    };
  }

  /* ---------- KATALOG ---------- */
  function renderCatalog(q) {
    setNav("phones");
    setJudul("Katalog HP");
    var state = {
      search: q.search || "", brand: q.brand || "Semua", minPrice: q.minPrice || "",
      maxPrice: q.maxPrice || "", ram: q.ram || "", storage: q.storage || "",
      minBattery: q.minBattery || "", onlyWireless: q.onlyWireless === "1",
      sort: q.sort || "populer", page: parseInt(q.page || "1", 10) || 1, only5G: q.only5G === "1", limit: 8
    };
    app.innerHTML = '<div class="loading">Memuat katalog...</div>';
    Promise.all([PhoneService.merek()]).then(function (r) {
      var brands = r[0];
      var adaFilter = state.search || state.brand !== "Semua" || state.minPrice || state.maxPrice || state.ram || state.storage || state.only5G || state.minBattery || state.onlyWireless;
      var judulKatalog = adaFilter ? COPY.hasil : COPY.semuaPerangkat;
      // Chip filter aktif: untuk apa: user tahu apa yang menyaring + hapus per item tanpa reset semua.
      function chipFilter() {
        var c = [];
        if (state.search) c.push({ k: "search", t: 'Cari: "' + state.search + '"' });
        if (state.brand !== "Semua") c.push({ k: "brand", t: state.brand });
        if (state.minPrice) c.push({ k: "minPrice", t: "Min " + formatIDR(state.minPrice) });
        if (state.maxPrice) c.push({ k: "maxPrice", t: "Maks " + formatIDR(state.maxPrice) });
        if (state.ram) c.push({ k: "ram", t: "RAM " + state.ram + "GB+" });
        if (state.storage) c.push({ k: "storage", t: "Memori " + state.storage + "GB+" });
        if (state.minBattery) c.push({ k: "minBattery", t: "Baterai " + state.minBattery + "mAh+" });
        if (state.only5G) c.push({ k: "only5G", t: "5G" });
        if (state.onlyWireless) c.push({ k: "onlyWireless", t: "Wireless charging" });
        if (!c.length) return "";
        return '<div class="chip-wrap">' + c.map(function (x) {
          return '<span class="chip">' + esc(x.t) + ' <button type="button" data-chip="' + x.k + '" aria-label="Hapus filter ' + esc(x.t) + '">x</button></span>';
        }).join("") + "</div>";
      }
      app.innerHTML = crumb([{ teks: "Beranda", href: "#/" }, { teks: "Katalog" }].concat(
        state.brand !== "Semua" ? [{ teks: state.brand }] : [],
        state.search ? [{ teks: 'Pencarian "' + state.search + '"' }] : []
      )) +
        '<div class="kolom-2"><aside class="rail-kiri" id="finderKatalog">' + finderHTML(brands, state) +
        '<div class="mt10">' + blokJudul("Merek") + '<div class="merek-box">' +
        brands.map(function (b) {
          return '<div class="merek-baris"><a href="#/phones?brand=' + encodeURIComponent(b.brand) + '">' + esc(b.brand) + "</a> <span class=\"harga-kecil\">(" + b.count + ")</span></div>";
        }).join("") + "</div></div></aside>" +
        '<div class="badan">' +
        '<button class="tombol tombol-mini filter-toggle" id="filterToggle" type="button" aria-expanded="false" aria-controls="finderKatalog">Filter</button>' +
        '<div class="blok">' + blokJudul(judulKatalog) +
        iklanHTML("katalog_atas") +
        '<div id="chipBox">' + chipFilter() + "</div>" +
        '<div class="toolbar-finder"><span class="hasil-info" id="hasilInfo"></span><span class="ml-auto"></span>' +
        '<label class="hasil-info" for="fSort">Urutkan:</label><select id="fSort">' +
        [["populer", "Paling dilihat"], ["terbaru", "Rilis terbaru"], ["termurah", "Harga terendah"], ["termahal", "Harga tertinggi"], ["nilai", COPY.nilaiUang], ["rating", "Rating tertinggi"], ["nama", "Nama A-Z"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (state.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
        }).join("") + "</select></div>" +
        '<div id="hasilHP"></div><div class="paginasi" id="paginasi"></div></div></div></div>';
      ikatFinder(state, brands);
      ikatFilterToggle("finderKatalog", !!adaFilter);
      var rst = document.getElementById("fReset");
      if (rst) rst.onclick = function () { location.hash = "#/phones"; };
      document.getElementById("fSort").onchange = function (e) {
        state.sort = e.target.value; state.page = 1; dorongHash(); muat();
      };
      function dorongHash() {
        var p = [];
        if (state.search) p.push("search=" + encodeURIComponent(state.search));
        if (state.brand !== "Semua") p.push("brand=" + encodeURIComponent(state.brand));
        if (state.minPrice) p.push("minPrice=" + encodeURIComponent(state.minPrice));
        if (state.maxPrice) p.push("maxPrice=" + encodeURIComponent(state.maxPrice));
        if (state.ram) p.push("ram=" + encodeURIComponent(state.ram));
        if (state.storage) p.push("storage=" + encodeURIComponent(state.storage));
        if (state.minBattery) p.push("minBattery=" + encodeURIComponent(state.minBattery));
        if (state.sort !== "populer") p.push("sort=" + encodeURIComponent(state.sort));
        if (state.only5G) p.push("only5G=1");
        if (state.onlyWireless) p.push("onlyWireless=1");
        if (state.page > 1) p.push("page=" + state.page);
        var target = "#/phones" + (p.length ? "?" + p.join("&") : "");
        if (location.hash !== target) { location.hash = target; return true; }
        return false;
      }
      document.getElementById("fTerapkan").onclick = function () {
        var s = bacaFinder();
        state.search = s.search; state.brand = s.brand; state.minPrice = s.minPrice;
        state.maxPrice = s.maxPrice; state.ram = s.ram; state.storage = s.storage;
        state.minBattery = s.minBattery; state.onlyWireless = s.onlyWireless;
        state.only5G = s.only5G; state.page = 1;
        if (!dorongHash()) { document.getElementById("chipBox").innerHTML = chipFilter(); ikatChip(); muat(); }
      };
      function ikatChip() {
        var box = document.getElementById("chipBox");
        if (!box) return;
        box.querySelectorAll("[data-chip]").forEach(function (b) {
          b.onclick = function () {
            var k = b.getAttribute("data-chip");
            if (k === "search") state.search = "";
            if (k === "brand") state.brand = "Semua";
            if (k === "minPrice") state.minPrice = "";
            if (k === "maxPrice") state.maxPrice = "";
            if (k === "ram") state.ram = "";
            if (k === "storage") state.storage = "";
            if (k === "minBattery") state.minBattery = "";
            if (k === "only5G") state.only5G = false;
            if (k === "onlyWireless") state.onlyWireless = false;
            state.page = 1;
            if (!dorongHash()) { document.getElementById("chipBox").innerHTML = chipFilter(); ikatChip(); muat(); }
            else route();
          };
        });
      }
      ikatChip();
      function muat() {
        var p = ["limit=" + state.limit, "page=" + state.page, "sort=" + encodeURIComponent(state.sort), "ringkas=1"];
        if (state.search) p.push("search=" + encodeURIComponent(state.search));
        if (state.brand !== "Semua") p.push("brand=" + encodeURIComponent(state.brand));
        if (state.minPrice) p.push("minPrice=" + encodeURIComponent(state.minPrice));
        if (state.maxPrice) p.push("maxPrice=" + encodeURIComponent(state.maxPrice));
        if (state.ram) p.push("ram=" + encodeURIComponent(state.ram));
        if (state.storage) p.push("storage=" + encodeURIComponent(state.storage));
        if (state.minBattery) p.push("minBattery=" + encodeURIComponent(state.minBattery));
        if (state.only5G) p.push("only5G=1");
        if (state.onlyWireless) p.push("onlyWireless=1");
        document.getElementById("hasilHP").innerHTML = '<div class="loading">Memuat hasil...</div>';
        PhoneService.daftar(Object.fromEntries(p.map(function (kv) {
          var i = kv.indexOf("=");
          return [decodeURIComponent(kv.slice(0, i)), decodeURIComponent(kv.slice(i + 1))];
        }))).then(function (res) {
          document.getElementById("hasilInfo").textContent = res.total + " HP ditemukan \u00b7 hal. " + res.page + "/" + res.pages;
          document.getElementById("hasilHP").innerHTML = res.data.length ? res.data.map(barisHP).join("") :
            '<div class="kosong"><b>Tidak ada HP yang cocok.</b><br>Longgarkan filter harga atau kata kunci.</div>';
          var pg = document.getElementById("paginasi"), btns = "";
          btns += '<button data-pg="prev"' + (res.page <= 1 ? " disabled" : "") + ">&laquo; Sebelum</button>";
          for (var i = 1; i <= res.pages; i++) {
            if (res.pages > 7 && Math.abs(i - res.page) > 2 && i !== 1 && i !== res.pages) continue;
            btns += '<button data-pg="' + i + '"' + (i === res.page ? ' class="aktif"' : "") + ">" + i + "</button>";
          }
          btns += '<button data-pg="next"' + (res.page >= res.pages ? " disabled" : "") + ">Sesudah &raquo;</button>";
          pg.innerHTML = btns;
          pg.querySelectorAll("button[data-pg]").forEach(function (b) {
            b.onclick = function () {
              var v = b.getAttribute("data-pg");
              if (v === "prev") state.page = Math.max(1, res.page - 1);
              else if (v === "next") state.page = Math.min(res.pages, res.page + 1);
              else state.page = parseInt(v, 10);
              if (!dorongHash()) muat();
            };
          });
        }).catch(function (err) {
          document.getElementById("hasilHP").innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
        });
      }
      muat();
      prosesIklan();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
    });
  }

  /* ---------- DETAIL ---------- */
  function renderDetail(id) {
    setNav("phones");
    setJudul("Spesifikasi HP");
    app.innerHTML = '<div class="loading">Memuat spesifikasi...</div>';
    Promise.all([PhoneService.detail(id), PhoneService.sejenis(id)])
      .then(function (res) {
        var p = res[0], similar = res[1];
        setJudul(p.name + " - Spesifikasi dan Harga");
        var hmin = Math.min.apply(null, p.prices.map(function (x) { return x.harga; }));
        var hminToko = p.prices.slice().sort(function (a, b) { return a.harga - b.harga; })[0].toko;
        var fav = isFav(p.id);
        var galWarna = 0, galView = "depan";
        function gambarGaleri() {
          document.getElementById("galeriUtama").innerHTML = phoneArt(p, 150, 200, galWarna, galView);
          document.getElementById("warnaNama").textContent = p.colors[galWarna] + " - tampak " + galView;
          var btns = app.querySelectorAll("[data-view]");
          for (var bi = 0; bi < btns.length; bi++) {
            var aktif = btns[bi].getAttribute("data-view") === galView;
            btns[bi].classList.toggle("pilih-view", aktif);
            btns[bi].setAttribute("aria-pressed", aktif ? "true" : "false");
          }
        }
        function grup(judul, baris) {
          return '<div class="spek-judul">' + esc(judul) + '</div><table class="spek"><tbody>' +
            baris.map(function (r) {
              if (!r[1]) return '<tr><td colspan="2">' + esc(r[0]) + "</td></tr>";
              return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>";
            }).join("") + "</tbody></table>";
        }
        app.innerHTML =
          crumb([{ teks: "Beranda", href: "#/" }, { teks: "Katalog", href: "#/phones" }, { teks: p.brand, href: "#/phones?brand=" + encodeURIComponent(p.brand) }, { teks: p.name }]) +
          '<div class="judul-hp"><h1>' + esc(p.brand) + " " + esc(p.name.replace(p.brand, "").trim() || p.name) +
          ' <button class="bintang-fav judul-fav' + (fav ? " suka" : "") + '" data-fav="' + esc(p.id) + '" type="button" title="Simpan ke favorit" aria-label="Simpan ' + esc(p.name) + ' ke favorit" aria-pressed="' + (fav ? "true" : "false") + '">' + (fav ? "★" : "☆") + "</button></h1>" +
          '<div class="sub">Diumumkan ' + esc(p.launch.diumumkan) + " - Rilis " + esc(p.launch.rilis) + " - Dilihat " + esc(Number(p.hits).toLocaleString("id-ID")) + "x - AnTuTu " + esc(Number(p.antutu).toLocaleString("id-ID")) + "</div></div>" +
          '<div class="jangkar" role="navigation" aria-label="Lompat ke bagian"><button type="button" data-goto="bagian-spek">SPESIFIKASI</button><button type="button" data-goto="bagian-harga">HARGA (' + p.prices.length + ' TOKO)</button><button type="button" data-goto="bagian-nilai">PENILAIAN</button><button type="button" data-goto="bagian-plusminus">PLUS MINUS</button></div>' +
          '<div class="detail-atas"><div class="galeri"><div class="lihat-toggle"><button type="button" data-view="depan" class="pilih-view">DEPAN</button><button type="button" data-view="belakang">BELAKANG</button></div><div class="galeri-utama" id="galeriUtama">' + phoneArt(p, 150, 200, 0, "depan") + "</div>" +
          '<div class="warna-pilih">' + p.colors.map(function (c, i) {
            return '<button class="warna-dot' + (i === 0 ? " pilih" : "") + '" data-warna="' + i + '" title="' + esc(c) + '" style="background:' + esc(p.colorHex[i] || "#888") + '" aria-label="' + esc(c) + '"></button>';
          }).join("") + '</div><div class="warna-nama" id="warnaNama">' + esc(p.colors[0]) + " - tampak depan</div>" +
          '<div class="tombol-tumpuk"><button class="tombol tombol-primer" id="btnBanding" type="button">Bandingkan HP ini</button>' +
          '<button class="link-bersih salin-link" id="btnSalin" type="button">Salin tautan HP ini</button></div></div>' +
          '<div class="ringkasan"><div class="judul-blok">Spesifikasi utama</div>' +
          '<table class="kunci-tabel"><tbody>' +
          "<tr><td class=\"k\">Jaringan</td><td>" + esc(p.network.teknologi) + " - " + esc(p.network.sim) + "</td></tr>" +
          "<tr><td class=\"k\">Layar</td><td><b>" + esc(p.display.ukuran) + "</b>, " + esc(p.display.tipe) + " - " + esc(p.display.resolusi) + "</td></tr>" +
          "<tr><td class=\"k\">Chipset</td><td><b>" + esc(p.platform.chipset) + "</b> - " + esc(p.platform.cpu) + "</td></tr>" +
          "<tr><td class=\"k\">Memori</td><td><b>" + esc(p.memory.ramUtama) + "GB RAM</b>, " + esc(p.memory.storageUtama) + "GB (" + esc(p.memory.tipe) + ") - slot: " + esc(p.memory.slotKartu) + "</td></tr>" +
          "<tr><td class=\"k\">Kamera</td><td>" + esc(p.mainCamera.konfigurasi) + "</td></tr>" +
          "<tr><td class=\"k\">Baterai</td><td><b>" + esc(p.battery.kapasitas) + " mAh</b> - " + esc(p.battery.charging) + "</td></tr>" +
          "<tr><td class=\"k\">Skor</td><td><span class=\"rate-num" + kelasRate(p.ratingLive) + "\">" + esc(p.ratingLive) + "</span> " + bintangTeks(p.ratingLive) + " dari " + esc(fmtJml(p.reviewCountLive)) + " penilaian</td></tr>" +
          "</tbody></table>" +
          '<div class="harga-utama"><span class="ket">Harga termurah:</span><span class="besar">' + formatIDR(hmin) + '</span><span class="ket">dari ' + p.prices.length + ' toko - <button class="link-kecil link-bersih" type="button" data-goto="bagian-harga">lihat semua</button></span>' + tombolBeli(hminToko, p.name, true) + "</div>" +
          "</div></div>" +
          '<div class="pad1012" id="bagian-spek"><div class="judul-blok">Spesifikasi lengkap ' + esc(p.name) + "</div>" +
          grup("Jaringan", [["Teknologi", p.network.teknologi], ["SIM", p.network.sim], ["5G", p.network.dukungan5G ? "Ya" : "Tidak"]]) +
          grup("Peluncuran", [["Diumumkan", p.launch.diumumkan], ["Rilis", p.launch.rilis], ["Status", p.launch.status]]) +
          grup("Bodi", [["Dimensi", p.body.dimensi], ["Berat", p.body.berat], ["Material", p.body.material], ["SIM", p.body.simDetail], ["Tahan air", p.body.tahanAir], ["Lainnya", p.body.tambahan]]) +
          grup("Layar", [["Tipe", p.display.tipe], ["Ukuran", p.display.ukuran], ["Resolusi", p.display.resolusi], ["Kecerahan", p.display.kecerahan], ["Proteksi", p.display.proteksi], ["Refresh rate", p.display.refreshRate + " Hz"]]) +
          grup("Dapur pacu", [["OS", p.platform.os], ["Chipset", p.platform.chipset], ["CPU", p.platform.cpu], ["GPU", p.platform.gpu]]) +
          grup("Memori", [["Slot kartu", p.memory.slotKartu], ["Pilihan RAM", p.memory.ram.join(" / ") + " GB"], ["Pilihan memori", p.memory.internal.join(" / ") + " GB"], ["Tipe", p.memory.tipe]]) +
          grup("Kamera belakang", [["Konfigurasi", p.mainCamera.konfigurasi], ["Detail", p.mainCamera.detail], ["Fitur", p.mainCamera.fitur], ["Video", p.mainCamera.video]]) +
          grup("Kamera depan", [["Resolusi", p.selfieCamera.resolusi], ["Fitur", p.selfieCamera.fitur], ["Video", p.selfieCamera.video]]) +
          grup("Suara", [["Pengeras", p.sound.pengeras], ["Jack 3.5mm", p.sound.jack], ["Tambahan", p.sound.tambahan]]) +
          grup("Konektivitas", [["WiFi", p.comms.wifi], ["Bluetooth", p.comms.bluetooth], ["NFC", p.comms.nfc ? "Ya" : "Tidak"], ["Infrared", p.comms.infrared ? "Ya" : "Tidak"], ["USB", p.comms.usb], ["GPS", p.comms.gps], ["UWB", p.comms.uwb ? "Ya" : "Tidak"]]) +
          grup("Sensor", [[p.sensors.join(", "), ""]]) +
          grup("Baterai", [["Kapasitas", p.battery.kapasitas + " mAh (" + p.battery.tipe + ")"], ["Pengisian", p.battery.charging], ["Wireless", p.battery.wireless ? "Ya" : "Tidak"]]) +
          grup("Lainnya", [["Warna", p.colors.join(", ")], ["Skor AnTuTu", Number(p.antutu).toLocaleString("id-ID")]]) +
          "</div>" +
          '<div class="pad012" id="bagian-harga"><div class="judul-blok">Harga ' + esc(p.name) + " di Indonesia</div>" +
          '<p class="hasil-info">' + esc(DISKLAIMER_AFF) + "</p>" +
          '<div class="scroll-x"><table class="harga"><thead><tr><th>Toko</th><th>Harga</th><th>Rating</th><th>Beli</th></tr></thead><tbody>' +
          p.prices.slice().sort(function (a, b) { return a.harga - b.harga; }).map(function (x, i) {
            return '<tr' + (i === 0 ? ' class="termurah"' : "") + "><td><b>" + esc(x.toko) + "</b>" + (i === 0 ? ' <span class="lencana">TERMURAH</span>' : "") + "</td><td><b>" + formatIDR(x.harga) + "</b></td><td>" + esc(x.ratingToko) + "/5</td><td>" + tombolBeli(x.toko, p.name, true) + "</td></tr>";
          }).join("") +           "</tbody></table></div>" + iklanHTML("detail_tengah") + "</div>" +
          '<div class="pad1012" id="bagian-nilai"><div class="judul-blok">Penilaian</div>' +
          '<div class="opini-ringkas"><span class="opini-skor">' + esc(p.ratingLive) + "</span><span>" + bintangTeks(p.ratingLive) + '<br><span class="hasil-info">' + esc(fmtJml(p.reviewCountLive)) + " penilaian</span></span></div>" +
          '<div class="ulasan-wrap"><div class="judul-blok">Penilaian pengunjung <span class="hasil-info" id="ulasanInfo"></span></div>' +
          '<div id="ulasanDaftar"><div class="loading">Memuat ulasan...</div></div>' +
          '<form class="ulasan-form" id="ulasanForm"><div class="judul-blok">Tulis penilaianmu</div>' +
          '<label for="ulasanNama">Nama</label><input id="ulasanNama" maxlength="40" placeholder="Nama samaran" autocomplete="off">' +
          '<label>Peringkat</label><div class="rate-pilih rate-besar" id="ulasanBintang">' + bintangPilih(0) + "</div>" +
          '<input type="hidden" id="ulasanNilai" value="0">' +
          '<label for="ulasanKomentar">Komentar</label><textarea id="ulasanKomentar" rows="3" maxlength="500" placeholder="Ceritakan pengalamanmu memakai HP ini (tanpa tautan)"></textarea>' +
          '<button class="tombol tombol-primer" type="submit" id="ulasanKirim">Kirim ulasan</button></form>' +
          "</div></div>" +
          '<div class="pad01212" id="bagian-plusminus"><div class="judul-blok">Plus minus</div>' +
          '<div class="prokontra mt8"><div class="pk-pro"><h4>Kelebihan</h4><ul>' + p.pros.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div><div class="pk-kontra"><h4>Kekurangan</h4><ul>' + p.cons.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div></div>" +
          '<div class="pad01214"><div class="judul-blok">HP sejenis</div>' + similar.map(barisHP).join("") + "</div>";

        document.getElementById("btnBanding").onclick = function () {
          location.hash = "#/compare?ids=" + encodeURIComponent(p.id);
        };
        document.getElementById("btnSalin").onclick = function (e) {
          var url = location.origin + location.pathname + "#/phone/" + p.id;
          function done(ok) {
            toast(ok === false ? "Gagal menyalin" : "Tautan HP tersalin");
            e.target.textContent = "Tautan tersalin"; setTimeout(function () { e.target.textContent = "Salin tautan HP ini"; }, 2000);
          }
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
          else { try { var t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); done(true); } catch (err) { done(false); } }
        };
        app.querySelectorAll("[data-view]").forEach(function (b) {
          b.onclick = function () { galView = b.getAttribute("data-view"); gambarGaleri(); };
        });
        app.querySelectorAll("[data-warna]").forEach(function (d) {
          d.onclick = function () {
            app.querySelectorAll("[data-warna]").forEach(function (x) { x.classList.remove("pilih"); });
            d.classList.add("pilih");
            galWarna = parseInt(d.getAttribute("data-warna"), 10);
            gambarGaleri();
          };
        });
        /* Ulasan pengunjung: daftar + form. Semua teks lolos esc() saat render. */
        (function ulasan() {
          var box = document.getElementById("ulasanDaftar");
          var info = document.getElementById("ulasanInfo");
          if (!box) return;
          function gambarUlasan(j) {
            if (info) info.textContent = j.count ? ("rata-rata " + j.avg + "/5 dari " + j.count + " ulasan") : "belum ada ulasan";
            box.innerHTML = j.list.length ? j.list.map(function (u) {
              var tgl = "";
              try { tgl = new Date(u.ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); } catch (e) {}
              return '<div class="ulasan-item"><div class="ulasan-kepala"><b>' + esc(u.nama) + '</b> ' + bintangTeks(u.rating) + '<span class="hasil-info"> · ' + esc(tgl) + "</span></div>" +
                '<div class="ulasan-isi">' + esc(u.komentar).replace(/\n/g, "<br>") + "</div></div>";
            }).join("") : '<div class="kosong kosong-polos">Belum ada ulasan. Jadilah yang pertama menilai HP ini.</div>';
          }
          api("/api/phones/" + encodeURIComponent(p.id) + "/reviews").then(gambarUlasan).catch(function () {
            box.innerHTML = '<div class="error-box">Gagal memuat ulasan.</div>';
          });
          var form = document.getElementById("ulasanForm");
          var bintangBox = document.getElementById("ulasanBintang");
          var nilaiEl = document.getElementById("ulasanNilai");
          if (bintangBox) bintangBox.addEventListener("click", function (e) {
            var b = e.target.closest("[data-bintang]");
            if (!b) return;
            var n = parseInt(b.getAttribute("data-bintang"), 10);
            nilaiEl.value = String(n);
            bintangBox.querySelectorAll("[data-bintang]").forEach(function (x) {
              var isi = parseInt(x.getAttribute("data-bintang"), 10) <= n;
              x.classList.toggle("isi", isi);
              x.textContent = isi ? "★" : "☆";
            });
          });
          if (form) form.addEventListener("submit", function (e) {
            e.preventDefault();
            var kirim = document.getElementById("ulasanKirim");
            var payload = {
              nama: document.getElementById("ulasanNama").value,
              rating: parseInt(nilaiEl.value, 10),
              komentar: document.getElementById("ulasanKomentar").value
            };
            if (!payload.rating) { toast("Pilih peringkat bintang 1-5 dulu"); return; }
            kirim.disabled = true;
            api("/api/phones/" + encodeURIComponent(p.id) + "/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }).then(function () {
              toast("Ulasan terkirim. Terima kasih!");
              form.reset();
              nilaiEl.value = "0";
              bintangBox.querySelectorAll("[data-bintang]").forEach(function (x) { x.classList.remove("isi"); x.textContent = "☆"; });
              /* ?segar= mem-bypass cache depan+belakang agar ulasan barusan langsung tampil. */
              return api("/api/phones/" + encodeURIComponent(p.id) + "/reviews?segar=" + Date.now());
            }).then(gambarUlasan).catch(function (err) {
              toast(err.message || "Gagal mengirim ulasan");
            }).then(function () { kirim.disabled = false; });
          });
        })();
        prosesIklan();
      })
      .catch(function (err) {
        app.innerHTML = '<div class="error-box">Gagal memuat detail: ' + esc(err.message) + '</div><p class="pad012"><a href="#/phones">Kembali ke katalog</a></p>';
      });
  }

  /* ---------- COMPARE ---------- */
  function renderCompare(query) {
    setNav("compare");
    setJudul("Perbandingan HP");
    var ids = (query.ids || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 3);
    app.innerHTML = '<div class="loading">Memuat perbandingan...</div>';
    PhoneService.daftar({ limit: 24, sort: "nama", ringkas: 1 }).then(function (semua) {
      var semuaHP = semua.data;
      var byId = {};
      semuaHP.forEach(function (x) { byId[x.id] = x; });
      ids = ids.filter(function (id) { return byId[id]; }).slice(0, 3);
      /* Duplikat di URL (ids=a,a) = bandingkan HP dengan dirinya: buang diam-diam. */
      ids = ids.filter(function (id, i) { return ids.indexOf(id) === i; });
      /* Halaman dibuka kosong: tidak ada produk terpilih sampai user memilih.
         Duel populer tersedia sebagai tombol di bawah, bukan pilihan paksa. */
      /* Sorot beda aktif bawaan: beda adalah inti perbandingan. sorot=0 mematikan. */
      var sorot = query.sorot !== "0";
      /* Sembunyikan yang sama: mati bawaan (user harus sadar datanya
         lengkap dulu), sama=1 menyalakan. Tanpa fetch ulang. */
      var sembunyiSama = query.sama === "1";
      /* Cegah balapan fetch: ganti cepat berurutan, hasil basi dibuang. */
      var reqSeq = 0;
      /* Seksi yang dilipat user: disimpan per halaman agar tidak terbuka lagi tiap muat. */
      var sekTutup = {};
      /* Tray terpilih (maks 3, tanpa slot kosong): tambah lewat satu kolom cari,
         hapus lewat tombol Hapus di tiap kartu. Urutan tray = urutan kolom. */
      function daftarAktif() { return ids.filter(Boolean); }
      function syncURL() {
        /* replaceState: URL tetap bisa dibagikan, tapi tanpa hashchange berarti
           tanpa render ulang, tanpa lompat scroll, tanpa menumpuk riwayat Back.
           Param sorot+sama selalu ditulis agar tautan dibuka dengan tampilan sama. */
        var aktif = daftarAktif();
        var h = aktif.length ? "#/compare?ids=" + aktif.map(encodeURIComponent).join(",") : "#/compare";
        h += (aktif.length ? "&" : "?") + (sorot ? "sorot=1" : "sorot=0") + "&sama=" + (sembunyiSama ? "1" : "0");
        try { history.replaceState(null, "", h); } catch (e) {}
      }
      /* Nama pendek untuk ruang sempit. Jika sisa setelah buang merek terlalu
         pendek ("13T") atau kosong, pakai nama penuh agar tidak membingungkan. */
      function namaPendek(r) {
        var sisa = String(r.name).replace(String(r.brand), "").trim();
        if (!sisa || sisa.length <= 4) return r.name;
        return sisa;
      }
      app.innerHTML = '<div class="halaman-banding">' +
        crumb([{ teks: "Beranda", href: "#/" }, { teks: COPY.perbandingan }]) +
        '<div class="pad1012"><div class="judul-blok">' + COPY.perbandingan + '</div>' +
        '<div class="legenda" aria-label="Keterangan tanda perbandingan"><span><i class="lg-menang"></i>Pemenang tunggal</span><span><b class="lg-beda">Tebal</b> nilai berbeda</span><span><i class="lg-juara"></i>Kolom juara umum</span></div>' +
        '<div class="tambah-wrap"><label for="tambahCari">' + COPY.tambahPerangkat + "</label>" +
        '<input class="tambah-cari" id="tambahCari" placeholder="Ketik nama HP, merek, atau chipset…" autocomplete="off" aria-label="Cari HP untuk dibandingkan" aria-expanded="false" aria-controls="tambahDaftar">' +
        '<div class="tambah-panel" id="tambahPanel" hidden><div class="slot-daftar" id="tambahDaftar" role="listbox"></div></div></div>' +
        '<div class="tray-dipilih" id="trayDipilih"></div>' +
        '<div class="cmp-actions"><label class="hasil-info"><input type="checkbox" id="cekBeda"' + (sorot ? " checked" : "") + "> " + COPY.tandaiBeda + "</label>" +
        '<label class="hasil-info"><input type="checkbox" id="cekSama"' + (sembunyiSama ? " checked" : "") + "> " + COPY.hanyaBeda + "</label>" +
        '<button class="tombol tombol-mini" id="btnSalinBanding" type="button">' + COPY.salinTautan + "</button>" +
        '<button class="link-bersih" id="btnResetBanding" type="button">Atur ulang</button></div>' +
        iklanHTML("banding_atas") +
        '<div id="hasilBanding" class="mt10"></div></div></div>';
      /* Kolom tambah ala "Add to compare" Kimovil: satu input + dropdown maks 6
         saran (yang sudah dipilih tidak ditawarkan lagi). Pilih = masuk tray. */
      var tambahBuka = false, tambahAktif = 0;
      window.__tutupPanel = tutupTambah;
      var inputTambah = document.getElementById("tambahCari");
      function cocokTambah() {
        var q = (inputTambah ? inputTambah.value : "").toLowerCase().trim();
        var hasil = semuaHP.filter(function (x) {
          if (ids.indexOf(x.id) !== -1) return false;
          if (!q) return true;
          return x.name.toLowerCase().indexOf(q) !== -1 ||
            x.brand.toLowerCase().indexOf(q) !== -1 ||
            String(x.platform.chipset || "").toLowerCase().indexOf(q) !== -1;
        });
        /* Tanpa kata kunci: yang paling dicari dulu, bukan abjad. Maks 6 saran. */
        if (!q) hasil = hasil.slice().sort(function (a, b) { return (b.hits || 0) - (a.hits || 0); });
        return hasil.slice(0, 6);
      }
      function gambarTambah() {
        var box = document.getElementById("tambahDaftar");
        if (!box) return;
        var hasil = cocokTambah();
        if (tambahAktif >= hasil.length) tambahAktif = 0;
        box.innerHTML = hasil.length ? hasil.map(function (x, n) {
          return '<button class="slot-item' + (n === tambahAktif ? " aktif" : "") + '" data-item="' + esc(x.id) + '" type="button" role="option">' + phoneArt(x, 30, 40, 0) + '<span class="min0"><b>' + esc(x.name) + "</b><br><small>" + esc(x.platform.chipset.split("(")[0]) + " - " + esc(x.memory.ramUtama) + "GB</small></span>" + '<span class="ac-harga">' + formatIDR(hargaMin(x)) + "</span></button>";
        }).join("") : '<div class="kosong kosong-polos">Tidak ada HP yang cocok — coba kata kunci lain.</div>';
        box.querySelectorAll("[data-item]").forEach(function (b) {
          b.onclick = function (ev) {
            ev.stopPropagation();
            tambahHP(b.getAttribute("data-item"));
          };
        });
      }
      function bukaTambah() {
        tambahBuka = true; tambahAktif = 0;
        var p = document.getElementById("tambahPanel");
        if (p) p.hidden = false;
        if (inputTambah) inputTambah.setAttribute("aria-expanded", "true");
        gambarTambah();
      }
      function tutupTambah() {
        if (!tambahBuka) return;
        tambahBuka = false;
        var p = document.getElementById("tambahPanel");
        if (p) p.hidden = true;
        if (inputTambah) inputTambah.setAttribute("aria-expanded", "false");
      }
      function tambahHP(id) {
        if (!id || !byId[id]) return;
        if (ids.indexOf(id) !== -1) { toast("HP tersebut sudah ada di perbandingan"); return; }
        if (ids.length >= 3) { toast("Sudah 3 HP — hapus satu dulu untuk mengganti"); return; }
        ids.push(id);
        tutupTambah();
        if (inputTambah) inputTambah.value = "";
        syncURL(); gambarTray(); muat();
      }
      /* Status tray ramping: kartu HP tampil sekali saja di duel-head
         (nama, spek, harga + tombol ×), jadi tray hanya baris status. */
      function gambarTray() {
        var tray = document.getElementById("trayDipilih");
        if (!tray) return;
        var aktif = daftarAktif();
        tray.innerHTML = aktif.length
          ? '<div class="hasil-info">Dibandingkan (' + aktif.length + "/3)</div>"
          : '<div class="hasil-info">Belum ada HP dipilih.</div>';
      }
      if (inputTambah) {
        inputTambah.addEventListener("focus", function () { bukaTambah(); });
        inputTambah.addEventListener("input", function () { tambahAktif = 0; if (!tambahBuka) bukaTambah(); else gambarTambah(); });
        inputTambah.addEventListener("keydown", function (e) {
          var daftar = document.getElementById("tambahDaftar");
          var semua = daftar ? daftar.querySelectorAll("[data-item]") : [];
          if (e.key === "Escape") { tutupTambah(); return; }
          if (e.key === "Enter") {
            e.preventDefault();
            if (!tambahBuka) { bukaTambah(); return; }
            var pil = daftar ? daftar.querySelectorAll("[data-item]")[tambahAktif] : null;
            if (pil) pil.click();
            return;
          }
          if (!semua.length) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            tambahAktif = (tambahAktif + (e.key === "ArrowDown" ? 1 : -1) + semua.length) % semua.length;
            gambarTambah();
            var el = document.getElementById("tambahDaftar").querySelectorAll("[data-item]")[tambahAktif];
            if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
          }
        });
      }
      document.getElementById("btnResetBanding").onclick = function () {
        /* Di tempat: tanpa reload agar posisi scroll dan fokus tidak hilang. */
        ids = [];
        if (inputTambah) inputTambah.value = "";
        tutupTambah();
        syncURL(); gambarTray(); muat();
        toast("Perbandingan dikosongkan");
      };
      document.getElementById("btnSalinBanding").onclick = function (e) {
        var url = location.href;
          function done() { toast("Tautan perbandingan tersalin"); e.target.textContent = "Tersalin"; setTimeout(function () { e.target.textContent = COPY.salinTautan; }, 2000); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
        else done();
      };
      var cek = document.getElementById("cekBeda");
      if (cek) cek.onchange = function () { sorot = cek.checked; syncURL(); muat(); };
      var cekS = document.getElementById("cekSama");
      if (cekS) cekS.onchange = function () { sembunyiSama = cekS.checked; syncURL(); terapSama(); };
      gambarTray();
      syncURL();
      function duelButtons() {
        return '<a class="tombol" href="#/compare?ids=poco-x6-pro,xiaomi-redmi-note-13-pro">POCO X6 Pro vs Redmi Note 13 Pro</a> ' +
          '<a class="tombol" href="#/compare?ids=samsung-galaxy-s24-ultra,iphone-15-pro-max">S24 Ultra vs iPhone 15 Pro Max</a> ' +
          '<a class="tombol" href="#/compare?ids=infinix-note-40-pro,samsung-galaxy-a54">Note 40 Pro vs Galaxy A54</a>';
      }
      /* Satu HP: butuh satu lawan. Pilih di slot yang masih kosong atau duel populer. */
      function renderTunggal(box, id) {
        var p = byId[id];
        if (!p) { box.innerHTML = '<div class="error-box">HP tidak dikenal.</div>'; return; }
        box.innerHTML = '<div class="tunggal"><div class="min0"><b>' + esc(p.name) + "</b><br><span class=\"hasil-info\">" + formatIDR(hargaMin(p)) + " · AnTuTu " + Number(p.antutu).toLocaleString("id-ID") + " · " + esc(p.memory.ramUtama) + "GB RAM</span></div></div>" +
          '<div class="kosong kosong-tunggal"><b>Pilih satu HP lagi</b> lewat kolom tambah di atas, atau buka duel populer:<br><br>' + duelButtons() + "</div>";
      }
      /* Sembunyikan baris yang sama: murni CSS + hitung ulang angka seksi.
         Tanpa fetch ulang. Seksi yang kosong total ikut dilipat. */
      function terapSama() {
        var box = document.getElementById("hasilBanding");
        if (!box) return;
        var cmp = box.querySelector(".cmp");
        if (cmp) cmp.classList.toggle("tutup-sama", !!sembunyiSama);
        box.querySelectorAll("[data-toggle]").forEach(function (btn) {
          var key = btn.getAttribute("data-toggle");
          var vis = box.querySelectorAll('div[data-sek="' + key + '"].cmp-baris:not(.sama)').length;
          var head = btn.closest(".cmp-sek");
          if (head) head.classList.toggle("tutup-sek", !!sembunyiSama && vis === 0);
          btn.innerHTML = (sekTutup[key] ? "&#9656; " : "&#9662; ") + esc(btn.getAttribute("data-judul")) + ' <span class="hasil-info">(' + (sembunyiSama ? vis : btn.getAttribute("data-jml")) + ")</span>";
        });
      }
      function muat() {
        var list = daftarAktif();
        var box = document.getElementById("hasilBanding");
        if (!box) return;
        if (list.length === 1) { renderTunggal(box, list[0]); prosesIklan(); return; }
        if (!list.length) {
          box.innerHTML = '<div class="kosong"><b>Belum ada HP dipilih.</b><br>Ketik di kolom tambah di atas, atau buka duel populer:<br><br>' + duelButtons() + "</div>";
          prosesIklan();
          return;
        }
        box.innerHTML = '<div class="loading">Membandingkan...</div>';
        var myReq = ++reqSeq;
        PhoneService.banding(list).then(function (rows) {
          if (myReq !== reqSeq) return;
          function watt(ch) { var m = String(ch).match(/(\d+)\s*W/); return m ? parseInt(m[1], 10) : 0; }
          var hargaVals = rows.map(function (r) { return r.hargaTermurah; });
          var rateVals = rows.map(function (r) { return r.ratingLive; });
          var batVals = rows.map(function (r) { return r.battery.kapasitas; });
          var antuVals = rows.map(function (r) { return r.antutu; });
          var ramVals = rows.map(function (r) { return r.memory.ramUtama; });
          var storVals = rows.map(function (r) { return r.memory.storageUtama; });
          var refVals = rows.map(function (r) { return r.display.refreshRate; });
          var wattVals = rows.map(function (r) { return watt(r.battery.charging); });
          /* Indeks pemenang, atau -1 bila seri. Seri bukan kemenangan. */
          function pemenang(vals, cariMin) {
            var t = cariMin ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
            var n = 0, idx = -1;
            for (var i = 0; i < vals.length; i++) if (vals[i] === t) { n++; idx = i; }
            return n === 1 ? idx : -1;
          }
          var wHarga = pemenang(hargaVals, true), wRate = pemenang(rateVals), wBat = pemenang(batVals),
            wAntu = pemenang(antuVals), wRam = pemenang(ramVals), wStor = pemenang(storVals),
            wRef = pemenang(refVals), wWatt = pemenang(wattVals);
          var antuMax = Math.max.apply(null, antuVals), batMax = Math.max.apply(null, batVals), wattMax = Math.max.apply(null, wattVals);
          var tally = rows.map(function () { return 0; });
          [wHarga, wRate, wBat, wAntu, wRam, wStor, wRef, wWatt].forEach(function (w) { if (w >= 0) tally[w]++; });
          /* Tally bernama: "(3-2)" kriptik diganti "(POCO 3 - Redmi 2)" agar langsung paham. */
          function tallyTeks() {
            return rows.map(function (r, i) { return namaPendek(r) + " " + tally[i]; }).join(" - ");
          }
          function tokoMin(r) {
            var m = r.prices[0];
            for (var i = 1; i < r.prices.length; i++) if (r.prices[i].harga < m.harga) m = r.prices[i];
            return m.toko;
          }
          function kunciLayar(r) {
            for (var i = 0; i < r.sensors.length; i++) if (/fingerprint|sidik|face/i.test(r.sensors[i])) return r.sensors[i];
            return r.sensors[0] || "-";
          }
          function numbar(v, mx) {
            if (!mx) return "";
            return '<span class="numbar"><span style="width:' + Math.max(4, Math.round(v / mx * 100)) + '%"></span></span>';
          }
          /* Nilai-uang: AnTuTu per Rp1 juta. Penentu saat tally seri,
             sekaligus info belanja yang tak masuk 8 kategori angka. */
          var nilaiVals = rows.map(function (r, i) { return hargaVals[i] > 0 ? r.antutu / hargaVals[i] * 1000000 : 0; });
          var wNilai = pemenang(nilaiVals);
          function nilaiTeks(i) { return Number(Math.round(nilaiVals[i])).toLocaleString("id-ID"); }
          var skorMax = Math.max.apply(null, tally), juara = [];
          for (var ji = 0; ji < tally.length; ji++) if (tally[ji] === skorMax && skorMax > 0) juara.push(ji);
          /* Tujuan situs: membantu memutuskan. Seri pun wajib ada pemenangnya
             lewat tiebreak berlapis: nilai-uang, performa, harga, rating. */
          var juaraUmum = -1, alasan = "";
          if (juara.length === 1) {
            juaraUmum = juara[0];
            alasan = "unggul " + skorMax + " dari 8 kategori angka";
          } else {
            var tingkat = [
              { w: wNilai, apa: "nilai terbaik", ket: function (i) { return nilaiTeks(i) + " AnTuTu/Rp1 jt"; } },
              { w: wAntu, apa: "performa", ket: function (i) { return "AnTuTu " + Number(antuVals[i]).toLocaleString("id-ID"); } },
              { w: wHarga, apa: "harga termurah", ket: function (i) { return formatIDR(hargaVals[i]); } },
              { w: wRate, apa: "rating pengguna", ket: function (i) { return rateVals[i] + "/5"; } }
            ];
            for (var ti = 0; ti < tingkat.length; ti++) {
              if (tingkat[ti].w >= 0) {
                juaraUmum = tingkat[ti].w;
                alasan = "menang tipis lewat " + tingkat[ti].apa + " (" + tingkat[ti].ket(juaraUmum) + ")";
                break;
              }
            }
          }
          /* Alasan membeli ala Versus: beda % konkret, bukan angka mentah.
             "32% lebih kencang" langsung paham; "1.740.000 vs 1.320.000" tidak. */
          function persenLebih(menang, kalah) {
            if (!kalah) return "";
            var p = Math.round((menang - kalah) / kalah * 100);
            return p > 0 ? p + "% lebih " : "";
          }
          /* Pilihan cepat: bedah per kebutuhan dari pemenang tunggal tiap
             kategori + juara nilai-uang. Pendukung vonis, bukan vonisnya. */
          var cepat = [];
          if (wAntu >= 0 && rows.length > 1) {
            var antuLawan = Math.max.apply(null, antuVals.filter(function (v, i) { return i !== wAntu; }));
            cepat.push("Gaming: <b>" + esc(namaPendek(rows[wAntu])) + "</b> (" + persenLebih(antuVals[wAntu], antuLawan) + "kencang, AnTuTu " + Number(antuVals[wAntu]).toLocaleString("id-ID") + ")");
          }
          if (wBat >= 0 && rows.length > 1) {
            var batLawan = Math.max.apply(null, batVals.filter(function (v, i) { return i !== wBat; }));
            cepat.push("Baterai: <b>" + esc(namaPendek(rows[wBat])) + "</b> (" + esc(batVals[wBat]) + " mAh" + (batLawan && batVals[wBat] > batLawan ? ", +" + Math.round((batVals[wBat] - batLawan) / batLawan * 100) + "%" : "") + ")");
          }
          if (wHarga >= 0) cepat.push("Termurah: <b>" + esc(namaPendek(rows[wHarga])) + "</b> (" + formatIDR(hargaVals[wHarga]) + ")");
          if (wNilai >= 0 && rows.length > 1) {
            var nilaiLawan = Math.max.apply(null, nilaiVals.filter(function (v, i) { return i !== wNilai; }));
            cepat.push(COPY.nilaiUang + ": <b>" + esc(namaPendek(rows[wNilai])) + "</b> (" + nilaiTeks(wNilai) + " AnTuTu/Rp1 jt" + (nilaiLawan ? ", +" + Math.round((nilaiVals[wNilai] - nilaiLawan) / nilaiLawan * 100) + "% value" : "") + ")");
          }
          if (wWatt >= 0 && rows.length > 1) {
            var wattLawan = Math.max.apply(null, wattVals.filter(function (v, i) { return i !== wWatt; }));
            if (wattVals[wWatt] > wattLawan) cepat.push("Cas tercepat: <b>" + esc(namaPendek(rows[wWatt])) + "</b> (" + esc(rows[wWatt].battery.charging) + ")");
          }
          var vonisUmum;
          if (juaraUmum >= 0) {
            vonisUmum = '<b class="vonis-nama">' + esc(rows[juaraUmum].name) + "</b> " + alasan + " (" + esc(tallyTeks()) + ").";
            if (juara.length !== 1 && cepat.length) {
              vonisUmum += '<span class="vonis-cepat">Pertimbangan: ' + cepat.join(" · ") + ".</span>";
            }
          } else {
            vonisUmum = "<b>Skor identik di semua kategori.</b> Semua angka sama (" + esc(tallyTeks()) + ") - bedakan dari kamera, desain, pembaruan software, atau garansi.";
          }
          /* Panel vonis ala Versus: pemenang + alasan + bilah skor.
             Detail kategori tetap ada di seksi "Ringkasan skor" tabel. */
          var skorBar = rows.map(function (r, i) {
            var pct = skorMax > 0 ? Math.round(tally[i] / 8 * 100) : 0;
            return '<div class="skor-baris' + (i === juaraUmum ? " juara" : "") + '"><span class="nama">' + esc(namaPendek(r)) + '</span><span class="rel"><span style="width:' + pct + '%"></span></span><span class="angka">' + tally[i] + "</span></div>";
          }).join("");
          var vonisBar = '<div class="vonis-panel" role="status"><div class="vonis-judul">Hasil perbandingan</div>' + vonisUmum + skorBar + "</div>";
          function beda(fn) {
            if (!sorot) return "";
            var v = rows.map(fn);
            return v.every(function (x) { return String(x) === String(v[0]); }) ? "" : "beda";
          }
          /* Spec-sheet grid (div, bukan table): label kiri sticky, kolom HP sejajar.
             wIdx = indeks pemenang tunggal, -1 bila tidak ada. */
          function brs(label, fn, wIdx, align, sek) {
            var b = beda(fn);
            var vv = rows.map(fn);
            var sama = vv.every(function (x) { return String(x) === String(vv[0]); });
            var tutup = sek && sekTutup[sek];
            return '<div class="cmp-baris' + (sama ? " sama" : "") + (tutup ? " tutup" : "") + '"' + (sek ? ' data-sek="' + sek + '"' : "") + '><div class="cmp-label">' + esc(label) + "</div>" + rows.map(function (r, ri) {
              var cls = "cmp-val k" + ri + ((wIdx === ri) ? " menang" : b ? " beda" : "") + (align === "kiri" ? " kiri" : "");
              /* Lencana eksplisit: pemenang selalu berlabel, tak mengandalkan warna saja. */
              return '<div class="' + cls + '">' + ((wIdx === ri) ? '<span class="menang-pill">Unggul</span>' : "") + fn(r, ri) + "</div>";
            }).join("") + "</div>";
          }
          function seksi(judul, key, jumlah) {
            var tutup = !!sekTutup[key];
            return '<div class="cmp-sek"><button class="seksi-toggle" data-toggle="' + key + '" data-judul="' + esc(judul) + '" data-jml="' + jumlah + '" type="button" aria-expanded="' + (tutup ? "false" : "true") + '">' + (tutup ? "&#9656; " : "&#9662; ") + esc(judul) + ' <span class="hasil-info">(' + jumlah + ")</span></button></div>";
          }
          /* Sel panjang (kamera) diringkas: klaim utama tebal, sisanya abu kecil. */
          function ringkasKamera(cfg) {
            var parts = String(cfg).split(" + ");
            if (parts.length < 2) return esc(cfg);
            return "<b>" + esc(parts[0]) + '</b> <span class="kecil-abu">+ ' + esc(parts.slice(1).join(" + ")) + "</span>";
          }
          /* Kepala identitas ala GSMArena/Kimovil: foto kecil sejajar, nama lengkap
             (tautan ke spek) + varian RAM/storage, harga, tombol × pelepas.
             Tanpa rating dan tanpa tombol BELI ganda: rating ada di tabel,
             BELI ada di seksi "Harga dan pembelian" di akhir. */
          function duelHead() {
            return '<div class="duel-head" style="--n:' + rows.length + '">' + rows.map(function (r, ri) {
              var isJuara = (typeof juaraUmum !== "undefined" && juaraUmum === ri);
              return '<div class="duel-kartu' + (isJuara ? " juara" : "") + '" data-href="#/phone/' + esc(r.id) + '">' +
                '<button class="tray-hapus" data-lepas="' + esc(r.id) + '" type="button" aria-label="Hapus ' + esc(r.name) + ' dari perbandingan">×</button>' +
                '<a href="#/phone/' + esc(r.id) + '">' + phoneArt(r, 52, 68, 0) + "<br><b>" + esc(r.name) + "</b></a>" +
                '<a class="spek-link" href="#/phone/' + esc(r.id) + '">' + COPY.spesifikasi + ' <span aria-hidden="true">&rsaquo;</span></a>' +
                '<div class="skor-kecil">' + esc(r.memory.ramUtama) + "GB · " + esc(r.memory.storageUtama) + "GB</div>" +
                '<div class="skor-kecil">' + esc(String(r.platform.chipset).split("(")[0].trim()) + " · " + esc(r.battery.kapasitas) + " mAh</div>" +
                '<div class="harga-merah">' + formatIDR(r.hargaTermurah) + "</div></div>";
            }).join("") + "</div>";
          }
          /* Kepala model dibuat menempel (sticky) di bawah nav: saat menelusuri
             baris yang panjang, nama HP tetap terbaca sehingga mudah dibandingkan.
             Grid-nya sama persis dengan tabel agar kolom lurus; geser horizontal
             tabel disalin ke kepala ini agar nama tetap di atas kolomnya. */
          var kepala = '<div class="cmp-sticky"><div class="cmp-sticky-grid juara-' + juaraUmum + '" id="cmpStickyGrid" style="--n:' + rows.length + '">' +
            '<div class="cmp-head-label" id="cmpHeadLabel">Model</div>' +
            rows.map(function (r) {
              return '<div class="cmp-head-val"><b>' + esc(namaPendek(r)) + "</b><br><small>" + esc(r.memory.ramUtama) + "GB · " + esc(r.memory.storageUtama) + "GB</small></div>";
            }).join("") + "</div></div>";
          box.innerHTML = duelHead() + vonisBar + kepala + '<div class="scroll-x" id="cmpScroll"><div class="cmp juara-' + juaraUmum + '" style="--n:' + rows.length + '">' +
            /* Ringkasan skor di seksi pertama (pola Kimovil): baca pemenang tiap
               kategori tanpa menggulir ke bawah; detailnya di seksi masing-masing. */
            seksi("Ringkasan skor", "skor", 8) +
            brs("Harga terendah", function (r) { return formatIDR(r.hargaTermurah); }, wHarga, "", "skor") +
            brs("Skor AnTuTu", function (r) { return Number(r.antutu).toLocaleString("id-ID"); }, wAntu, "", "skor") +
            brs("Baterai", function (r) { return esc(r.battery.kapasitas) + " mAh"; }, wBat, "", "skor") +
            brs("Rating pengguna", function (r) { return r.ratingLive + "/5"; }, wRate, "", "skor") +
            brs("RAM", function (r) { return esc(r.memory.ramUtama) + " GB"; }, wRam, "", "skor") +
            brs("Penyimpanan", function (r) { return esc(r.memory.storageUtama) + " GB"; }, wStor, "", "skor") +
            brs("Refresh rate", function (r) { return esc(r.display.refreshRate) + " Hz"; }, wRef, "", "skor") +
            brs("Pengisian cepat", function (r) { return esc(r.battery.charging); }, wWatt, "kiri", "skor") +
            seksi("Harga", "harga", 1) +
            brs("Harga termurah", function (r) { return "<b>" + formatIDR(r.hargaTermurah) + "</b>"; }, wHarga, "", "harga") +
            seksi("Penilaian pengguna", "nilai", 1) +
            brs("Rating pengguna", function (r) { return r.ratingLive + "/5 (" + fmtJml(r.reviewCountLive) + " penilaian)"; }, wRate, "", "nilai") +
            seksi("Layar", "layar", 5) +
            brs("Layar", function (r) { return "<b>" + esc(r.display.ukuran) + "</b>, " + esc(r.display.tipe.split(",")[0]); }, -1, "kiri", "layar") +
            brs("Resolusi", function (r) { return esc(r.display.resolusi); }, -1, "kiri", "layar") +
            brs("Pelindung layar", function (r) { return esc(r.display.proteksi); }, -1, "kiri", "layar") +
            brs("Kecerahan", function (r) { return esc(r.display.kecerahan); }, -1, "kiri", "layar") +
            brs("Refresh rate", function (r) { return esc(r.display.refreshRate) + " Hz"; }, wRef, "", "layar") +
            seksi("Performa", "performa", 6) +
            brs("Sistem operasi", function (r) { return esc(r.platform.os); }, -1, "kiri", "performa") +
            brs("Chipset", function (r) { return esc(r.platform.chipset); }, -1, "kiri", "performa") +
            brs("GPU", function (r) { return esc(r.platform.gpu); }, -1, "kiri", "performa") +
            brs("RAM", function (r) { return esc(r.memory.ramUtama) + " GB"; }, wRam, "", "performa") +
            brs("Penyimpanan", function (r) { return esc(r.memory.storageUtama) + " GB (" + esc(r.memory.tipe) + ")"; }, wStor, "", "performa") +
            brs("Skor AnTuTu", function (r) { return Number(r.antutu).toLocaleString("id-ID") + numbar(r.antutu, antuMax); }, wAntu, "", "performa") +
            seksi("Kamera", "kamera", 4) +
            brs("Belakang", function (r) { return ringkasKamera(r.mainCamera.konfigurasi); }, -1, "kiri", "kamera") +
            brs("Depan", function (r) { return ringkasKamera(r.selfieCamera.resolusi); }, -1, "kiri", "kamera") +
            brs("Video belakang", function (r) { return esc(r.mainCamera.video); }, -1, "kiri", "kamera") +
            brs("Video depan", function (r) { return esc(r.selfieCamera.video); }, -1, "kiri", "kamera") +
            seksi("Baterai dan pengisian", "baterai", 3) +
            brs("Kapasitas", function (r) { return esc(r.battery.kapasitas) + " mAh" + numbar(r.battery.kapasitas, batMax); }, wBat, "", "baterai") +
            brs("Pengisian", function (r) { return esc(r.battery.charging) + numbar(watt(r.battery.charging), wattMax); }, wWatt, "kiri", "baterai") +
            brs("Pengisian nirkabel", function (r) { return r.battery.wireless ? "Ya" : "Tidak"; }, -1, "", "baterai") +
            seksi("Bodi", "bodi", 7) +
            brs("Dimensi", function (r) { return esc(r.body.dimensi); }, -1, "kiri", "bodi") +
            brs("Berat", function (r) { return esc(r.body.berat); }, -1, "", "bodi") +
            brs("Ketahanan air", function (r) { return esc(r.body.tahanAir); }, -1, "kiri", "bodi") +
            brs("SIM dan slot", function (r) { return esc(r.body.simDetail) + " / slot: " + esc(r.memory.slotKartu); }, -1, "kiri", "bodi") +
            brs("Jack 3,5 mm", function (r) { return esc(r.sound.jack); }, -1, "", "bodi") +
            brs("Pengeras suara", function (r) { return esc(r.sound.pengeras); }, -1, "kiri", "bodi") +
            brs("Kunci layar", function (r) { return esc(kunciLayar(r)); }, -1, "kiri", "bodi") +
            seksi("Konektivitas", "konek", 6) +
            brs("Dukungan 5G", function (r) { return r.network.dukungan5G ? "Ya" : "Tidak"; }, -1, "", "konek") +
            brs("NFC", function (r) { return r.comms.nfc ? "Ya" : "Tidak"; }, -1, "", "konek") +
            brs("Wi-Fi", function (r) { return esc(r.comms.wifi); }, -1, "kiri", "konek") +
            brs("Bluetooth", function (r) { return esc(r.comms.bluetooth); }, -1, "kiri", "konek") +
            brs("Port USB", function (r) { return esc(r.comms.usb); }, -1, "kiri", "konek") +
            brs("Tanggal rilis", function (r) { return esc(r.launch.rilis); }, -1, "", "konek") +
            /* Harga dan pembelian di seksi akhir (pola GSMArena Misc-Price /
               Kimovil Prices): semua keputusan beli terpusat, tombol BELI penuh. */
            seksi("Harga dan pembelian", "beli", 2) +
            brs("Toko termurah", function (r) { return esc(tokoMin(r)); }, -1, "kiri", "beli") +
            brs("Beli", function (r) { return tombolBeli(tokoMin(r), r.name, true); }, -1, "", "beli") +
            '<div class="cmp-baris cmp-kaki"><div class="cmp-label">Model</div>' + rows.map(function (r, ri) {
              return '<div class="cmp-val k' + ri + '"><a href="#/phone/' + esc(r.id) + '"><b>' + esc(namaPendek(r)) + "</b></a><br><span class=\"harga-merah\">" + formatIDR(r.hargaTermurah) + "</span></div>";
            }).join("") + "</div>" +
            "</div></div>" +
            '<p class="hasil-info">Lencana hijau berarti pemenang tunggal di kategorinya; tebal berarti nilai berbeda; kolom juara umum berlatar hijau muda. Klik judul seksi untuk melipat atau membuka. Centang "Sembunyikan yang sama" untuk fokus ke perbedaan saja. Kamera, OS, ketahanan air, dan berat tidak diperingkat karena angka terbesar belum tentu yang terbaik.</p>';
          /* Geser horizontal tabel disalin ke kepala sticky: nama model tetap
             lurus di atas kolomnya. Kolom label dikunci agar tetap di kiri. */
          var scGulir = document.getElementById("cmpScroll");
          var scGrid = document.getElementById("cmpStickyGrid");
          var scLabel = document.getElementById("cmpHeadLabel");
          if (scGulir && scGrid) {
            var samakanKepala = function () {
              var sl = scGulir.scrollLeft;
              scGrid.style.transform = sl ? "translateX(" + (-sl) + "px)" : "";
              if (scLabel) scLabel.style.transform = sl ? "translateX(" + sl + "px)" : "";
            };
            scGulir.addEventListener("scroll", samakanKepala, { passive: true });
            samakanKepala();
          }
          box.querySelectorAll("[data-toggle]").forEach(function (btn) {
            btn.onclick = function () {
              var key = btn.getAttribute("data-toggle");
              sekTutup[key] = !sekTutup[key];
              box.querySelectorAll('div[data-sek="' + key + '"]').forEach(function (el) { el.classList.toggle("tutup", !!sekTutup[key]); });
              btn.setAttribute("aria-expanded", sekTutup[key] ? "false" : "true");
              btn.innerHTML = (sekTutup[key] ? "&#9656; " : "&#9662; ") + esc(btn.getAttribute("data-judul")) + ' <span class="hasil-info">(' + esc(btn.getAttribute("data-jml")) + ")</span>";
            };
          });
          box.querySelectorAll("[data-lepas]").forEach(function (b) {
            b.onclick = function () {
              var buang = b.getAttribute("data-lepas");
              ids = ids.filter(function (x) { return x !== buang; });
              syncURL(); gambarTray(); muat();
            };
          });
          terapSama();
        }).catch(function (err) { box.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>"; });
      }
      if (cek) cek.onchange = function () { sorot = cek.checked; syncURL(); muat(); };
      if (cekS) cekS.onchange = function () { sembunyiSama = cekS.checked; syncURL(); terapSama(); };
      muat();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
    });
  }

  /* ---------- NEWS & FAVORIT ---------- */
  function renderNews() {
    setNav("news");
    setJudul("Berita dan panduan");
    app.innerHTML = '<div class="loading">Memuat berita...</div>';
    PhoneService.berita().then(function (news) {
      app.innerHTML = crumb([{ teks: "Beranda", href: "#/" }, { teks: "Berita dan panduan" }]) +
        '<div class="pad1012"><div class="judul-blok">Berita dan panduan (' + news.length + ")</div>" +
        iklanHTML("berita_atas") +
        '<div class="berita-grid">' + news.map(function (n) {
          return '<div class="berita-baris" data-href="#/news/' + n.id + '"><div class="berita-tgl"><b>' + esc(n.tanggal.slice(8, 10)) + "</b>" + bulanTahun(n.tanggal) + '</div><div class="min0"><span class="tag">' + esc(n.kategori) + '</span> <a class="berita-judul" href="#/news/' + n.id + '">' + esc(n.judul) + '</a><div class="berita-ringkas">' + esc(n.ringkasan) + '</div><div class="mt6"><a class="link-kecil" href="#/news/' + n.id + '">Baca selengkapnya &raquo;</a></div></div></div>';
        }).join("") + "</div></div>";      prosesIklan();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
    });
  }
  // Halaman artikel: untuk apa: tautan dari beranda/katalog bisa dibagikan dan dibaca penuh.
  // HP terkait: untuk apa: pembaca rumor/panduan langsung lompat ke tipe yang dibahas.
  function renderNewsDetail(nid) {
    setNav("news");
    setJudul("Artikel");
    app.innerHTML = '<div class="loading">Memuat artikel...</div>';
    PhoneService.artikel(nid).then(function (n) {
      setJudul(n.judul);
      app.innerHTML = crumb([{ teks: "Beranda", href: "#/" }, { teks: "Berita", href: "#/news" }, { teks: n.kategori }]) +
        '<div class="pad1012"><div class="judul-blok">' + esc(n.kategori) + "</div>" +
        "<h1 style=\"font-size:18px;margin:10px 0 4px\">" + esc(n.judul) + "</h1>" +
        '<div class="hasil-info">Diterbitkan ' + formatTanggal(n.tanggal) + "</div>" +
        '<p class="ringkas-box">' + esc(n.ringkasan) + "</p>" +
        '<div class="artikel-isi">' + esc(n.isi) + "</div>" +
        (n.terkait && n.terkait.length ? '<div class="mt12">' + blokJudul("HP yang dibahas di artikel ini") + n.terkait.map(barisHP).join("") + "</div>" : "") +
        '<div class="mt10"><a class="tombol" href="#/news">KEMBALI KE DAFTAR BERITA</a></div></div>';
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + '</div><p class="pad012"><a href="#/news">Kembali ke berita</a></p>';
    });
  }
  function renderFavorites() {
    setNav("favorites");
    setJudul("Favorit");
    var ids = favList();
    if (!ids.length) {
      app.innerHTML = crumb([{ teks: "Beranda", href: "#/" }, { teks: "Favorit" }]) + '<div class="kosong"><b>Belum ada favorit.</b><br>Ketuk ikon bintang pada HP untuk menyimpannya di sini.<br><br><a class="tombol tombol-biru" href="#/phones">Buka katalog</a></div>';
      return;
    }
    app.innerHTML = '<div class="loading">Memuat favorit...</div>';
    PhoneService.banding(ids.slice(0, 12)).then(function (rows) {
      var banding3 = ids.slice(0, 3).map(encodeURIComponent).join(",");
      app.innerHTML = crumb([{ teks: "Beranda", href: "#/" }, { teks: "Favorit (" + rows.length + ")" }]) +
        '<div class="pad1012"><div class="judul-blok">Perangkat favorit</div>' + rows.map(barisHP).join("") +
        '<div class="aksi-wrap">' +
        (rows.length >= 2 ? '<a class="tombol tombol-primer" href="#/compare?ids=' + banding3 + '">Bandingkan ' + Math.min(3, rows.length) + ' favorit pertama</a>' : "") +
        '<button class="link-bersih" id="hapusFav" type="button">Hapus semua favorit</button></div></div>';
      document.getElementById("hapusFav").onclick = function () {
        try { localStorage.removeItem("spekhp_fav"); } catch (e) {}
        favListCache = [];
        renderFavorites();
      };
    }).catch(function () {
      app.innerHTML = '<div class="error-box">Data favorit kedaluwarsa. Hapus dan simpan ulang dari katalog.</div>';
    });
  }

  cfgSiap().then(function () { route(); });
})();
