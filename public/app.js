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
  function formatIDR(n) {
    try { return "Rp " + Number(n).toLocaleString("id-ID"); }
    catch (e) { return "Rp " + n; }
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
  function favList() {
    try { return JSON.parse(localStorage.getItem("spekhp_fav") || "[]"); }
    catch (e) { return []; }
  }
  function isFav(id) { return favList().indexOf(id) !== -1; }
  function toggleFav(id) {
    var l = favList(), i = l.indexOf(id);
    if (i === -1) l.push(id); else l.splice(i, 1);
    try { localStorage.setItem("spekhp_fav", JSON.stringify(l)); } catch (e) {}
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
  function phoneArt(p, w, h, idx, view) {
    w = w || 54; h = h || 72; idx = idx || 0; view = view || "depan";
    var aksen = (p.colorHex && p.colorHex[idx]) || "#9aa0a6";
    var nama = esc(p.name);
    if (view === "belakang") {
      return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 54 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tampak belakang ' + nama + '">' +
        '<rect x="8" y="1" width="38" height="70" rx="6" fill="' + esc(aksen) + '" stroke="#141518" stroke-width="1.5"/>' +
        '<rect x="10.5" y="3.5" width="33" height="65" rx="4" fill="none" stroke="#000" opacity="0.15"/>' +
        modulBelakang(p) +
        '<circle cx="27" cy="58" r="3" fill="none" stroke="#000" opacity="0.25"/>' +
        "</svg>";
    }
    var notch = (p.brand === "Apple")
      ? '<rect x="20" y="7.5" width="14" height="4" rx="2" fill="#141518"/>'
      : '<circle cx="27" cy="9.5" r="1.8" fill="#141518"/>';
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 54 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tampak depan ' + nama + '">' +
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
  }
  function api(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error) || ("Gagal memuat data (" + r.status + ")"));
        return j;
      });
    });
  }
  function setNav(kunci) {
    document.querySelectorAll("#navUtama a").forEach(function (a) {
      a.classList.toggle("aktif", a.getAttribute("data-nav") === kunci);
    });
  }
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
  function cfgSiap() {
    return Promise.all([
      api("/api/aff").then(function (j) { if (j) affCfg = j; }).catch(function () {}),
      api("/api/ads").then(function (j) { if (j) adsCfg = j; }).catch(function () {})
    ]);
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
  function iklanHTML(slot, format) {
    if (!adsCfg || adsCfg.aktif === false) return "";
    var label = format === "box" ? "300x250" : "Responsif";
    var sid = adsCfg.slot && adsCfg.slot[slot];
    var isi;
    if (adsCfg.client && sid) {
      isi = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + esc(adsCfg.client) + '" data-ad-slot="' + esc(sid) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    } else {
      isi = '<div class="iklan-kosong">Ruang iklan ' + esc(label) + ' tersedia<br><small>Pasang ID AdSense di data.js (ADS) atau hubungi redaksi untuk pasang di sini</small></div>';
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
  keAtas.onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); };
  window.addEventListener("scroll", function () {
    keAtas.classList.toggle("tampil", window.scrollY > 600);
  }, { passive: true });
  /* Tren harga responsif: gambar ulang mengikuti lebar wadah saat jendela diubah. */
  var trenPoints = null, trenTimer = null;
  window.addEventListener("resize", function () {
    if (trenTimer) clearTimeout(trenTimer);
    trenTimer = setTimeout(function () {
      if (trenPoints && document.getElementById("trenCanvas") && window.__trenRedraw) window.__trenRedraw();
    }, 200);
  });
  try {
    var d = new Date();
    var hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()];
    var bl = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][d.getMonth()];
    document.getElementById("utilTanggal").textContent = hari + ", " + d.getDate() + " " + bl + " " + d.getFullYear() + " - Database HP Indonesia, harga IDR";
  } catch (e) {}
  api("/api/health").then(function (h) {
    document.getElementById("mastStat").innerHTML = "<b>" + esc(h.totalPhones) + "</b><span>tipe HP</span>";
  }).catch(function () {});

  function hargaMin(p) {
    if (p.hargaTermurah != null) return p.hargaTermurah;
    if (p.prices) return Math.min.apply(null, p.prices.map(function (x) { return x.harga; }));
    return p.priceIDR;
  }
  function rateLive(p) { return p.ratingLive != null ? p.ratingLive : p.rating; }
  function countLive(p) { return p.reviewCountLive != null ? p.reviewCountLive : p.reviewCount; }

  /* Baris daftar ala GSMArena: thumb | nama+spek | harga+aksi */
  function barisHP(p) {
    var h = hargaMin(p), r = rateLive(p);
    return '<div class="baris-hp">' +
      '<a class="thumb" href="#/phone/' + esc(p.id) + '" tabindex="-1">' + phoneArt(p) + "</a>" +
      '<div style="min-width:0"><a class="baris-nama" href="#/phone/' + esc(p.id) + '">' + esc(p.name) + "</a>" +
      (p.network && p.network.dukungan5G ? '<span class="tag5g">5G</span>' : "") +
      '<div class="baris-sub">' + esc(p.brand) + " - Dirilis " + esc(p.launch ? p.launch.rilis : p.released) + " - " + esc(p.body.berat) + "</div>" +
      '<div class="baris-spek"><b>' + esc(p.display.ukuran) + "</b>, " + esc(p.display.tipe.split(",")[0]) + " - <b>" + esc(p.platform.chipset.split("(")[0].trim()) + "</b> - <b>" + esc(p.memory.ramUtama) + "GB/" + esc(p.memory.storageUtama) + "GB</b> - " + esc(p.battery.kapasitas) + " mAh</div>" +
      '<div class="skor-kecil"><span class="rate-num' + kelasRate(r) + '">' + esc(r) + '</span> ' + bintangTeks(r) + " " + esc(countLive(p)) + " penilaian</div></div>" +
      '<div class="baris-kanan"><div class="harga-merah">' + formatIDR(h) + '</div><div class="harga-kecil">dari ' + esc(p.prices ? p.prices.length : 1) + ' toko</div>' +
      '<div style="margin-top:6px;display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap"><a class="tombol tombol-mini" href="#/phone/' + esc(p.id) + '">SPEK</a>' +
      '<button class="tombol tombol-mini" data-compare="' + esc(p.id) + '" type="button">BANDING</button>' +
      '<button class="tombol tombol-mini fav-mini' + (isFav(p.id) ? " suka" : "") + '" data-fav="' + esc(p.id) + '" type="button" title="Simpan ke favorit" aria-label="Simpan ' + esc(p.name) + ' ke favorit">' + (isFav(p.id) ? "★ TERSIMPAN" : "☆ SIMPAN") + "</button></div></div></div>";
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
    return '<div class="finder-judul">Phone Finder</div><div class="finder-grup">' +
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
      '<label class="finder-cek" style="text-transform:none"><input type="checkbox" id="f5g" style="width:auto"' + (state.only5G ? " checked" : "") + "> Hanya 5G</label>" +
      '<label class="finder-cek" style="text-transform:none"><input type="checkbox" id="fWls" style="width:auto"' + (state.onlyWireless ? " checked" : "") + "> Ada wireless charging</label>" +
      '<button class="tombol tombol-primer tombol" id="fTerapkan" type="button">TERAPKAN FILTER</button>' +
      (compact ? "" : '<button class="tombol" id="fReset" type="button" style="width:100%;margin-top:6px">ATUR ULANG</button>') +
      "</div>";
  }
  function railKananHTML(populer, turun) {
    return '<div class="blok">' + blokJudul("Paling dilihat") +
      '<ol class="ol-pop" style="padding:6px 8px">' + populer.slice(0, 7).map(function (p, i) {
        return '<li><span class="no">' + (i + 1) + '.</span><span style="min-width:0"><a href="#/phone/' + esc(p.id) + '">' + esc(p.name) + "</a><small>" + esc(Number(p.hits).toLocaleString("id-ID")) + " dilihat - " + formatIDR(hargaMin(p)) + "</small></span></li>";
      }).join("") + "</ol></div>" +
      iklanHTML("rail", "box") +
      '<div class="blok">' + blokJudul("Harga terbaik 4 jutaan") +
      '<div style="padding:6px 8px;font-size:12px">' + turun.map(function (p) {
        return '<div style="padding:5px 0;border-bottom:1px dotted #cfd3d8"><a href="#/phone/' + esc(p.id) + '"><b>' + esc(p.name) + "</b></a><br><span class=\"harga-merah\">" + formatIDR(hargaMin(p)) + "</span> <span class=\"harga-kecil\">" + esc(p.memory.ramUtama) + "GB RAM</span></div>";
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
  function route() {
    var r = parseHash();
    window.scrollTo(0, 0);
    if (r.path === "/" || r.path === "") return renderHome();
    if (r.path === "/phones") return renderCatalog(r.query);
    if (r.path.indexOf("/phone/") === 0) return renderDetail(r.path.split("/")[2]);
    if (r.path === "/compare") return renderCompare(r.query);
    if (r.path.indexOf("/news/") === 0) return renderNewsDetail(r.path.split("/")[2]);
    if (r.path === "/news") return renderNews();
    if (r.path === "/favorites") return renderFavorites();
    app.innerHTML = '<div class="kosong"><h3>Halaman tidak ditemukan</h3><p><a href="#/">Kembali ke beranda</a></p></div>';
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("click", function (e) {
    /* Klik di luar slot menutup panel picker (tanpa ini panel mengambang). */
    if (!e.target.closest(".slot-hp") && window.__tutupPanel) window.__tutupPanel();
    /* Gulir dalam halaman TANPA mengubah hash: href="#bagian-x" menabrak router
       dan melempar user ke "Halaman tidak ditemukan". Tombol ini solusinya. */
    var g = e.target.closest("[data-goto]");
    if (g) {
      var t = document.getElementById(g.getAttribute("data-goto"));
      if (t) {
        if (t.scrollIntoView) t.scrollIntoView({ behavior: "smooth", block: "start" });
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
        if (b.classList.contains("fav-mini")) b.textContent = added ? "★ TERSIMPAN" : "☆ SIMPAN";
      });
      toast(added ? "Tersimpan di favorit" : "Dihapus dari favorit");
      if ((location.hash || "").indexOf("#/favorites") === 0) renderFavorites();
      return;
    }
    var c = e.target.closest("[data-compare]");
    if (c) { location.hash = "#/compare?ids=" + encodeURIComponent(c.getAttribute("data-compare")); return; }
  });
  function kirimCari(v) {
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
  var acTimer = null, acAktif = -1;
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
      api("/api/phones?search=" + encodeURIComponent(v) + "&limit=6").then(function (res) {
        autoBox.innerHTML = res.data.length ? res.data.map(function (p) {
          return '<button type="button" data-go="' + esc(p.id) + '"><span><b>' + esc(p.name) + '</b><br><span class="harga-kecil">' + esc(p.platform.chipset.split("(")[0]) + "</span></span>" + '<span class="ac-harga">' + formatIDR(p.hargaTermurah) + "</span></button>";
        }).join("") : '<button type="button" data-go-search="' + esc(v) + '">Tidak ada yang pas. Lihat hasil filter untuk "' + esc(v) + '" &raquo;</button>';
        acAktif = -1;
        autoBox.classList.add("tampil");
      }).catch(function () { autoBox.classList.remove("tampil"); });
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
    app.innerHTML = '<div class="loading">Memuat beranda...</div>';
    Promise.all([
      api("/api/brands"),
      api("/api/phones?sort=populer&limit=12"),
      api("/api/phones?sort=terbaru&limit=6"),
      api("/api/news"),
      api("/api/drops?limit=4")
    ]).then(function (res) {
      var brands = res[0], populer = res[1], terbaru = res[2], news = res[3], drops = res[4];
      var murah = populer.data.filter(function (p) { return hargaMin(p) < 5000000; }).slice(0, 4);
      app.innerHTML =
        '<div class="crumbs">Beranda / <b>Arsip ponsel dan pembanding harga</b></div>' +
        '<div class="kolom"><aside class="rail-kiri" id="finderHome">' + finderHTML(brands, {}, true) + "</aside>" +
        '<div class="badan">' +
        '<div class="blok">' + blokJudul("HP terbaru di database", "Indeks lengkap", "#/phones?sort=terbaru") +
        terbaru.data.map(barisHP).join("") + "</div>" +
        // Blok turun harga: untuk apa: jawaban "kapan beli". Ditaruh setelah terbaru agar momentum harga terlihat sebelum daftar populer.
        '<div class="blok">' + blokJudul("Turun harga terbesar", "Semua tipe", "#/phones?sort=termurah") +
        drops.map(function (p) {
          return '<div class="baris-hp"><a class="thumb" href="#/phone/' + esc(p.id) + '" tabindex="-1">' + phoneArt(p) + '</a>' +
            '<div style="min-width:0"><a class="baris-nama" href="#/phone/' + esc(p.id) + '">' + esc(p.name) + "</a>" +
            '<div class="baris-sub">6 bulan lalu ' + formatIDR(p.hargaTermurah + p.turunRp) + "</div>" +
            '<div class="baris-spek">Turun <b>' + formatIDR(p.turunRp) + " (" + esc(p.turunPersen) + '%)</b></div></div>' +
            '<div class="baris-kanan"><div class="harga-merah">' + formatIDR(p.hargaTermurah) + '</div><div class="harga-kecil">kini</div></div></div>';
        }).join("") + "</div>" +
        '<div class="blok">' + blokJudul("HP terpopuler", "Semua populer", "#/phones?sort=populer") +
        populer.data.slice(0, 6).map(barisHP).join("") + "</div>" +
        // Pintasan budget: untuk apa: mayoritas pembeli Indonesia mulai dari budget, bukan merek.
        '<div class="blok">' + blokJudul("Cari berdasar budget") +
        '<div class="budget-grid">' +
        '<a href="#/phones?maxPrice=2000000"><b>Di bawah 2 jt</b><span>HP kedua dan pelajar</span></a>' +
        '<a href="#/phones?maxPrice=3500000"><b>Di bawah 3,5 jt</b><span>NFC dan 90Hz+ paling laris</span></a>' +
        '<a href="#/phones?maxPrice=6000000"><b>Di bawah 6 jt</b><span>Gaming dan kamera OIS</span></a>' +
        '<a href="#/phones?minPrice=10000000"><b>Flagship 10 jt+</b><span>200MP, titanium, ProRes</span></a>' +
        "</div></div>" +
        '<div class="blok">' + blokJudul("Duel populer") +
        '<div style="padding:8px;font-size:12.5px">' +
        '<div style="padding:5px 0;border-bottom:1px dotted #cfd3d8"><a href="#/compare?ids=poco-x6-pro,xiaomi-redmi-note-13-pro"><b>POCO X6 Pro vs Redmi Note 13 Pro 5G</b></a> <span class="harga-kecil">- beda Rp 500 ribu, beda kelas performa</span></div>' +
        '<div style="padding:5px 0;border-bottom:1px dotted #cfd3d8"><a href="#/compare?ids=samsung-galaxy-s24-ultra,iphone-15-pro-max"><b>Galaxy S24 Ultra vs iPhone 15 Pro Max</b></a> <span class="harga-kecil">- duel flagship 200MP vs 48MP</span></div>' +
        '<div style="padding:5px 0"><a href="#/compare?ids=infinix-note-40-pro,samsung-galaxy-a54"><b>Infinix Note 40 Pro vs Galaxy A54</b></a> <span class="harga-kecil">- 3 jutaan wireless charging vs IP67</span></div>' +
      "</div></div>" +
        iklanHTML("home_feed") +
        '<div class="blok">' + blokJudul("Berita dan panduan", "Semua berita", "#/news") +
        news.slice(0, 3).map(function (n) {
          return '<div class="berita-baris"><div class="berita-tgl"><b>' + esc(n.tanggal.slice(8, 10)) + "</b>" + bulanTahun(n.tanggal) + '</div><div style="min-width:0"><span class="tag">' + esc(n.kategori) + '</span> <a class="berita-judul" href="#/news/' + n.id + '">' + esc(n.judul) + '</a><div class="berita-ringkas">' + esc(n.ringkasan) + "</div></div></div>";
        }).join("") + "</div>" +
        "</div>" +
        '<aside class="rail-kanan">' + railKananHTML(populer.data, murah.length ? murah : populer.data.slice(0, 3)) + "</aside></div>";
      ikatFinder({}, brands);
      prosesIklan();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">Gagal memuat beranda: ' + esc(err.message) + "</div>";
    });
  }
  function bacaFinder() {
    return {
      search: (document.getElementById("fSearch") || { value: "" }).value.trim(),
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

  /* ---------- KATALOG ---------- */
  function renderCatalog(q) {
    setNav("phones");
    var state = {
      search: q.search || "", brand: q.brand || "Semua", minPrice: q.minPrice || "",
      maxPrice: q.maxPrice || "", ram: q.ram || "", storage: q.storage || "",
      minBattery: q.minBattery || "", onlyWireless: q.onlyWireless === "1",
      sort: q.sort || "populer", page: parseInt(q.page || "1", 10) || 1, only5G: q.only5G === "1", limit: 8
    };
    app.innerHTML = '<div class="loading">Memuat katalog...</div>';
    Promise.all([api("/api/brands")]).then(function (r) {
      var brands = r[0];
      var adaFilter = state.search || state.brand !== "Semua" || state.minPrice || state.maxPrice || state.ram || state.storage || state.only5G || state.minBattery || state.onlyWireless;
      var judulKatalog = adaFilter ? "Hasil penyaringan" : "Semua HP di database";
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
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <b>Katalog HP</b>' +
        (state.brand !== "Semua" ? " / " + esc(state.brand) : "") +
        (state.search ? ' / pencarian "' + esc(state.search) + '"' : "") + "</div>" +
        '<div class="kolom-2"><aside class="rail-kiri">' + finderHTML(brands, state) +
        '<div style="margin-top:10px">' + blokJudul("Merek") + '<div style="border:1px solid #d4d7db;border-top:0;padding:6px 8px;font-size:12.5px">' +
        brands.map(function (b) {
          return '<div style="padding:2px 0"><a href="#/phones?brand=' + encodeURIComponent(b.brand) + '">' + esc(b.brand) + "</a> <span class=\"harga-kecil\">(" + b.count + ")</span></div>";
        }).join("") + "</div></div></aside>" +
        '<div class="badan"><div class="blok">' + blokJudul(judulKatalog) +
        iklanHTML("katalog_atas") +
        '<div id="chipBox">' + chipFilter() + "</div>" +
        '<div class="toolbar-finder"><span class="hasil-info" id="hasilInfo"></span><span style="margin-left:auto"></span>' +
        '<label class="hasil-info" for="fSort">Urutkan:</label><select id="fSort">' +
        [["populer", "Paling dilihat"], ["terbaru", "Rilis terbaru"], ["termurah", "Harga terendah"], ["termahal", "Harga tertinggi"], ["rating", "Rating tertinggi"], ["nama", "Nama A-Z"]].map(function (o) {
          return '<option value="' + o[0] + '"' + (state.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
        }).join("") + "</select></div>" +
        '<div id="hasilHP"></div><div class="paginasi" id="paginasi"></div></div></div></div>';
      ikatFinder(state, brands);
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
        var p = ["limit=" + state.limit, "page=" + state.page, "sort=" + encodeURIComponent(state.sort)];
        if (state.search) p.push("search=" + encodeURIComponent(state.search));
        if (state.brand !== "Semua") p.push("brand=" + encodeURIComponent(state.brand));
        if (state.minPrice) p.push("minPrice=" + encodeURIComponent(state.minPrice));
        if (state.maxPrice) p.push("maxPrice=" + encodeURIComponent(state.maxPrice));
        if (state.ram) p.push("ram=" + encodeURIComponent(state.ram));
        if (state.storage) p.push("storage=" + encodeURIComponent(state.storage));
        if (state.minBattery) p.push("minBattery=" + encodeURIComponent(state.minBattery));
        if (state.only5G) p.push("only5G=1");
        if (state.onlyWireless) p.push("onlyWireless=1");
        document.getElementById("hasilHP").innerHTML = '<div class="loading">Menyaring...</div>';
        api("/api/phones?" + p.join("&")).then(function (res) {
          document.getElementById("hasilInfo").textContent = res.total + " tipe ditemukan - hal. " + res.page + "/" + res.pages;
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
    app.innerHTML = '<div class="loading">Memuat spesifikasi...</div>';
    Promise.all([api("/api/phones/" + encodeURIComponent(id)), api("/api/phones/" + encodeURIComponent(id) + "/similar")])
      .then(function (res) {
        var p = res[0], similar = res[1];
        var hmin = Math.min.apply(null, p.prices.map(function (x) { return x.harga; }));
        var hminToko = p.prices.slice().sort(function (a, b) { return a.harga - b.harga; })[0].toko;
        var fav = isFav(p.id);
        var galWarna = 0, galView = "depan";
        function gambarGaleri() {
          document.getElementById("galeriUtama").innerHTML = phoneArt(p, 120, 160, galWarna, galView);
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
          '<div class="crumbs"><a href="#/">Beranda</a> / <a href="#/phones">Katalog</a> / <a href="#/phones?brand=' + encodeURIComponent(p.brand) + '">' + esc(p.brand) + "</a> / <b>" + esc(p.name) + "</b></div>" +
          '<div class="judul-hp"><h1>' + esc(p.brand) + " " + esc(p.name.replace(p.brand, "").trim() || p.name) + "</h1>" +
          '<div class="sub">Diumumkan ' + esc(p.launch.diumumkan) + " - Rilis " + esc(p.launch.rilis) + " - Dilihat " + esc(Number(p.hits).toLocaleString("id-ID")) + "x - AnTuTu " + esc(Number(p.antutu).toLocaleString("id-ID")) + "</div></div>" +
          '<div class="jangkar" role="navigation" aria-label="Lompat ke bagian"><button type="button" data-goto="bagian-spek">SPESIFIKASI</button><button type="button" data-goto="bagian-harga">HARGA (' + p.prices.length + ' TOKO)</button><button type="button" data-goto="bagian-tren">TREN</button><button type="button" data-goto="bagian-opini" id="jangkarOpini">OPINI (' + esc(p.ulasan.length) + ')</button><button type="button" data-goto="bagian-plusminus">PLUS MINUS</button></div>' +
          '<div class="detail-atas"><div class="galeri"><div class="lihat-toggle"><button type="button" data-view="depan" class="pilih-view">DEPAN</button><button type="button" data-view="belakang">BELAKANG</button></div><div class="galeri-utama" id="galeriUtama">' + phoneArt(p, 120, 160, 0, "depan") + "</div>" +
          '<div class="warna-pilih">' + p.colors.map(function (c, i) {
            return '<button class="warna-dot' + (i === 0 ? " pilih" : "") + '" data-warna="' + i + '" title="' + esc(c) + '" style="background:' + esc(p.colorHex[i] || "#888") + '" aria-label="' + esc(c) + '"></button>';
          }).join("") + '</div><div class="warna-nama" id="warnaNama">' + esc(p.colors[0]) + " - tampak depan</div>" +
          '<div class="tombol-tumpuk"><button class="tombol tombol-primer" id="btnBanding" type="button">BANDINGKAN HP INI</button>' +
          '<button class="tombol' + (fav ? " tombol-biru" : "") + '" id="btnFav" type="button">' + (fav ? "TERSIMPAN DI FAVORIT" : "SIMPAN KE FAVORIT") + "</button>" +
          '<button class="tombol" id="btnSalin" type="button">SALIN TAUTAN HP INI</button></div></div>' +
          '<div class="ringkasan"><div class="judul-blok">Spesifikasi utama</div>' +
          '<table class="kunci-tabel"><tbody>' +
          "<tr><td class=\"k\">Jaringan</td><td>" + esc(p.network.teknologi) + " - " + esc(p.network.sim) + "</td></tr>" +
          "<tr><td class=\"k\">Layar</td><td><b>" + esc(p.display.ukuran) + "</b>, " + esc(p.display.tipe) + " - " + esc(p.display.resolusi) + "</td></tr>" +
          "<tr><td class=\"k\">Chipset</td><td><b>" + esc(p.platform.chipset) + "</b> - " + esc(p.platform.cpu) + "</td></tr>" +
          "<tr><td class=\"k\">Memori</td><td><b>" + esc(p.memory.ramUtama) + "GB RAM</b>, " + esc(p.memory.storageUtama) + "GB (" + esc(p.memory.tipe) + ") - slot: " + esc(p.memory.slotKartu) + "</td></tr>" +
          "<tr><td class=\"k\">Kamera</td><td>" + esc(p.mainCamera.konfigurasi) + "</td></tr>" +
          "<tr><td class=\"k\">Baterai</td><td><b>" + esc(p.battery.kapasitas) + " mAh</b> - " + esc(p.battery.charging) + "</td></tr>" +
          "<tr><td class=\"k\">Skor</td><td><span class=\"rate-num" + kelasRate(p.ratingLive) + "\">" + esc(p.ratingLive) + "</span> " + bintangTeks(p.ratingLive) + " dari " + esc(p.reviewCountLive) + " penilaian</td></tr>" +
          "</tbody></table>" +
          '<div class="harga-utama"><span class="ket">Harga termurah:</span><span class="besar">' + formatIDR(hmin) + '</span><span class="ket">dari ' + p.prices.length + ' toko - <button class="link-kecil" type="button" data-goto="bagian-harga" style="border:0;background:none;color:#0d5cb6;cursor:pointer;padding:0">lihat semua</button></span>' + tombolBeli(hminToko, p.name, true) + "</div>" +
          "</div></div>" +
          '<div style="padding:10px 12px" id="bagian-spek"><div class="judul-blok">Spesifikasi lengkap ' + esc(p.name) + "</div>" +
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
          '<div style="padding:0 12px" id="bagian-harga"><div class="judul-blok">Harga ' + esc(p.name) + " di Indonesia</div>" +
          '<p class="hasil-info">Diurutkan dari termurah. Garansi dan ongkir mengikuti keterangan tiap toko. ' + esc(DISKLAIMER_AFF) + "</p>" +
          '<div class="scroll-x"><table class="harga"><thead><tr><th>Toko</th><th>Harga</th><th>Stok</th><th>Rating</th><th>Ongkir</th><th>Garansi</th><th>Beli</th></tr></thead><tbody>' +
          p.prices.slice().sort(function (a, b) { return a.harga - b.harga; }).map(function (x, i) {
            return '<tr' + (i === 0 ? ' class="termurah"' : "") + "><td><b>" + esc(x.toko) + "</b>" + (i === 0 ? ' <span class="lencana">TERMURAH</span>' : "") + "</td><td><b>" + formatIDR(x.harga) + "</b></td><td>" + esc(x.stok) + "</td><td>" + esc(x.ratingToko) + "/5</td><td>" + esc(x.ongkir) + "</td><td>" + esc(x.garansi) + "</td><td>" + tombolBeli(x.toko, p.name, true) + "</td></tr>";
          }).join("") +           "</tbody></table></div>" + iklanHTML("detail_tengah") + "</div>" +
          '<div style="padding:0 12px" id="bagian-tren"><div class="judul-blok">Tren harga 6 bulan</div>' +
          '<p class="hasil-info">Ringkasan pergerakan harga termurah antar toko. Membantu menilai: beli sekarang atau tunggu.</p>' +
          '<div class="tren-wrap"><canvas id="trenCanvas" width="640" height="220" aria-label="Grafik tren harga"></canvas><div class="hasil-info" id="trenInfo">Memuat tren...</div></div></div>' +
          '<div style="padding:10px 12px" id="bagian-opini"><div class="judul-blok" id="judulOpini">Opini pengguna (' + esc(p.ulasan.length) + " tertulis)</div>" +
          '<div class="opini-ringkas"><span class="opini-skor" id="skorOpini">' + esc(p.ratingLive) + "</span><span>" + bintangTeks(p.ratingLive) + '<br><span class="hasil-info" id="countOpini">' + esc(p.reviewCountLive) + " penilaian masuk</span></span><span id=\"distBox\" style=\"flex:1;min-width:200px\"></span></div>" +
          '<div class="form-opini"><b>Tulis opini</b><div id="errUlasan"></div>' +
          '<div class="form-opini-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="uNama" maxlength="40" placeholder="Nama (wajib)"><input id="uJudul" maxlength="80" placeholder="Judul (wajib)"></div>' +
          '<div class="rate-pilih" id="uRate">' + [1, 2, 3, 4, 5].map(function (v) {
            return '<button type="button" data-r="' + v + '"' + (v === 5 ? ' class="pilih"' : "") + ">" + v + "/5</button>";
          }).join("") + "</div>" +
          '<textarea id="uIsi" maxlength="1000" placeholder="Pengalaman memakai HP ini (wajib)"></textarea>' +
          '<button class="tombol tombol-primer" id="uKirim" type="button">KIRIM OPINI</button></div>' +
          '<div id="daftarUlasan">' + daftarUlasan(p.ulasan) + "</div></div>" +
          '<div style="padding:0 12px 12px" id="bagian-plusminus"><div class="judul-blok">Plus minus</div>' +
          '<div class="prokontra" style="margin-top:8px"><div class="pk-pro"><h4>Kelebihan</h4><ul>' + p.pros.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div><div class="pk-kontra"><h4>Kekurangan</h4><ul>' + p.cons.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></div></div>" +
          '<div style="padding:0 12px 14px"><div class="judul-blok">HP sejenis</div>' + similar.map(barisHP).join("") + "</div>";

        document.getElementById("btnBanding").onclick = function () {
          location.hash = "#/compare?ids=" + encodeURIComponent(p.id);
        };
        document.getElementById("btnFav").onclick = function (e) {
          var added = toggleFav(p.id);
          e.target.textContent = added ? "TERSIMPAN DI FAVORIT" : "SIMPAN KE FAVORIT";
          toast(added ? "Tersimpan di favorit" : "Dihapus dari favorit");
        };
        document.getElementById("btnSalin").onclick = function (e) {
          var url = location.origin + location.pathname + "#/phone/" + p.id;
          function done(ok) {
            toast(ok === false ? "Gagal menyalin" : "Tautan HP tersalin");
            e.target.textContent = "TAUTAN TERSALIN"; setTimeout(function () { e.target.textContent = "SALIN TAUTAN HP INI"; }, 2000);
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
        // Distribusi rating jujur: hanya dari opini tertulis yang ada, bukan data sintetis.
        function tulisDistribusi() {
          var box = document.getElementById("distBox");
          if (!box) return;
          if (!p.ulasan.length) { box.innerHTML = '<span class="hasil-info">Belum ada opini tertulis untuk distribusi.</span>'; return; }
          var cnt = [0, 0, 0, 0, 0, 0];
          p.ulasan.forEach(function (u) { if (u.rating >= 1 && u.rating <= 5) cnt[u.rating]++; });
          var max = Math.max(cnt[1], cnt[2], cnt[3], cnt[4], cnt[5], 1);
          var rows = "";
          for (var s = 5; s >= 1; s--) {
            var pct = Math.round((cnt[s] / p.ulasan.length) * 100);
            rows += '<div class="dist-baris"><span>' + s + '</span><span class="dist-bar"><span style="width:' + Math.max(2, Math.round((cnt[s] / max) * 100)) + '%"></span></span><span>' + cnt[s] + " (" + pct + '%)</span></div>';
          }
          box.innerHTML = '<span class="hasil-info">Distribusi ' + p.ulasan.length + " opini tertulis:</span>" + rows;
        }
        tulisDistribusi();
        prosesIklan();
        // Grafik tren harga (canvas murni, tanpa library).
        api("/api/phones/" + encodeURIComponent(p.id) + "/price-history").then(function (h) {
          var info = document.getElementById("trenInfo");
          if (info) info.innerHTML = "6 bulan lalu <b>" + formatIDR(h.awal) + "</b> - kini <b>" + formatIDR(h.kini) + "</b> - turun <b>" + formatIDR(h.selisih) + " (" + esc(h.persen) + "%)</b>.";
          gambarTren(h.points);
        }).catch(function () {
          var info = document.getElementById("trenInfo");
          if (info) info.textContent = "Tren harga tidak tersedia.";
        });
        function gambarTren(points) { trenPoints = points; window.__trenRedraw = drawTren; drawTren(); }
        function drawTren() {
          var points = trenPoints;
          var cv = document.getElementById("trenCanvas");
          if (!cv || !cv.getContext || !points) return;
          /* Lebar mengikuti wadah: teks tetap terbaca di HP kecil, tajam di desktop. */
          var wrapW = (cv.parentElement && cv.parentElement.clientWidth) || 640;
          var W = Math.max(300, Math.min(640, Math.round(wrapW) - 16));
          cv.width = W;
          var ctx = cv.getContext("2d"), H = cv.height, padL = 78, padB = 26, padT = 12, padR = 10;
          var vals = points.map(function (x) { return x.harga; });
          var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
          if (mx === mn) mx = mn + 1;
          function X(i) { return padL + (i * (W - padL - padR)) / (points.length - 1); }
          function Y(v) { return padT + (1 - (v - mn) / (mx - mn)) * (H - padT - padB); }
          ctx.clearRect(0, 0, W, H);
          ctx.font = "11px Arial"; ctx.fillStyle = "#6b7076"; ctx.strokeStyle = "#d4d7db";
          for (var g = 0; g <= 3; g++) {
            var gv = mn + ((mx - mn) * g) / 3, gy = Y(gv);
            ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
            var jt = gv >= 1000000 ? (Math.round(gv / 100000) / 10) + " jt" : Math.round(gv / 1000) + " rb";
            ctx.fillText("Rp " + jt, 6, gy + 4);
          }
          ctx.beginPath();
          points.forEach(function (pt, i) { if (i === 0) ctx.moveTo(X(i), Y(pt.harga)); else ctx.lineTo(X(i), Y(pt.harga)); });
          ctx.strokeStyle = "#0d5cb6"; ctx.lineWidth = 2; ctx.stroke();
          ctx.lineTo(X(points.length - 1), H - padB); ctx.lineTo(X(0), H - padB); ctx.closePath();
          ctx.fillStyle = "rgba(13,92,182,0.10)"; ctx.fill();
          ctx.fillStyle = "#0d5cb6";
          points.forEach(function (pt, i) { ctx.beginPath(); ctx.arc(X(i), Y(pt.harga), 3.5, 0, 7); ctx.fill(); });
          ctx.fillStyle = "#333";
          points.forEach(function (pt, i) { if (i % 2 === 0 || i === points.length - 1) ctx.fillText(pt.bulan, X(i) - 24, H - 8); });
          var lx = X(points.length - 1);
          ctx.fillStyle = "#b00020"; ctx.font = "bold 12px Arial";
          ctx.fillText(formatIDR(points[points.length - 1].harga), Math.min(lx - 30, W - 110), Y(points[points.length - 1].harga) - 8);
        }
        var ratingDipilih = 5;
        app.querySelectorAll("#uRate button").forEach(function (b) {
          b.onclick = function () {
            ratingDipilih = parseInt(b.getAttribute("data-r"), 10);
            app.querySelectorAll("#uRate button").forEach(function (x) {
              x.classList.toggle("pilih", parseInt(x.getAttribute("data-r"), 10) === ratingDipilih);
            });
          };
        });
        document.getElementById("uKirim").onclick = function (e) {
          var btn = e.target;
          if (btn.disabled) return;
          var body = {
            nama: document.getElementById("uNama").value,
            judul: document.getElementById("uJudul").value,
            isi: document.getElementById("uIsi").value,
            rating: ratingDipilih
          };
          document.getElementById("errUlasan").innerHTML = "";
          btn.disabled = true;
          btn.textContent = "MENGIRIM...";
          api("/api/phones/" + encodeURIComponent(p.id) + "/reviews", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
          }).then(function (rs) {
            p.ulasan.unshift(rs.ulasan);
            /* Skor tampil langsung berubah: sebelumnya diam sampai reload (menyesatkan). */
            p.ratingLive = rs.ratingLive;
            p.reviewCountLive = rs.reviewCountLive;
            document.getElementById("daftarUlasan").innerHTML = daftarUlasan(p.ulasan);
            document.getElementById("skorOpini").textContent = rs.ratingLive;
            document.getElementById("countOpini").textContent = rs.reviewCountLive + " penilaian masuk";
            document.getElementById("judulOpini").textContent = "Opini pengguna (" + p.ulasan.length + " tertulis)";
            document.getElementById("jangkarOpini").textContent = "OPINI (" + p.ulasan.length + ")";
            tulisDistribusi();
            document.getElementById("uNama").value = "";
            document.getElementById("uJudul").value = "";
            document.getElementById("uIsi").value = "";
            toast("Opini terkirim, terima kasih");
          }).catch(function (err) {
            document.getElementById("errUlasan").innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
          }).then(function () {
            btn.disabled = false;
            btn.textContent = "KIRIM OPINI";
          });
        };
        function daftarUlasan(list) {
          if (!list.length) return '<div class="kosong">Belum ada opini tertulis untuk tipe ini.</div>';          return list.map(function (u) {
            return '<div class="opini-item"><span class="rate-num' + kelasRate(u.rating) + '">' + esc(u.rating) + "</span> <b>" + esc(u.judul) + "</b><br>" + esc(u.isi) + "<br><small>Oleh " + esc(u.nama) + " - " + esc(u.tanggal) + "</small></div>";
          }).join("");
        }
      })
      .catch(function (err) {
        app.innerHTML = '<div class="error-box">Gagal memuat detail: ' + esc(err.message) + '</div><p style="padding:0 12px"><a href="#/phones">Kembali ke katalog</a></p>';
      });
  }

  /* ---------- COMPARE ---------- */
  function renderCompare(query) {
    setNav("compare");
    var ids = (query.ids || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 3);
    app.innerHTML = '<div class="loading">Memuat komparator...</div>';
    api("/api/phones?limit=24&sort=nama").then(function (semua) {
      var semuaHP = semua.data;
      var DUEL_AWAL = ["samsung-galaxy-s24-ultra", "iphone-15-pro-max"];
      var byId = {};
      semuaHP.forEach(function (x) { byId[x.id] = x; });
      ids = ids.filter(function (id) { return byId[id]; }).slice(0, 3);
      /* Duplikat di URL (ids=a,a) = bandingkan HP dengan dirinya: buang diam-diam. */
      ids = ids.filter(function (id, i) { return ids.indexOf(id) === i; });
      if (!ids.length) ids = DUEL_AWAL.filter(function (id) { return byId[id]; }).slice(0, 2);
      while (ids.length < 3) ids.push(null);
      var sorot = query.sorot === "1";
      /* Seksi yang dilipat user: disimpan per halaman agar tidak terbuka lagi tiap muat. */
      var sekTutup = {};
      /* Slot ke-3 opsional: default tampil 2 slot; tambah hanya bila diminta/sudah terisi. */
      var slot3Visible = !!ids[2];
      function slot3Tampil() { return slot3Visible || !!ids[2]; }
      function perbaruiSlot3() {
        var w = document.getElementById("slotWrap2"), b = document.getElementById("wrapSlot3Btn");
        if (w) w.hidden = !slot3Tampil();
        if (b) b.hidden = slot3Tampil();
      }
      function daftarAktif() { return ids.filter(Boolean); }
      function syncURL() {
        /* replaceState: URL tetap bisa dibagikan, tapi tanpa hashchange berarti
           tanpa render ulang, tanpa lompat scroll, tanpa menumpuk riwayat Back. */
        var h = "#/compare?ids=" + daftarAktif().map(encodeURIComponent).join(",");
        if (sorot) h += "&sorot=1";
        try { history.replaceState(null, "", h); } catch (e) {}
      }
      function namaPendek(r) { return (r.name.replace(r.brand, "").trim() || r.name); }
      function infoSlot(id) {
        var p = byId[id];
        if (!p) return "Slot kosong - ketik nama lalu pilih saran";
        return formatIDR(hargaMin(p)) + " - AnTuTu " + Number(p.antutu).toLocaleString("id-ID");
      }
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <b>Bandingkan HP</b></div>' +
        '<div style="padding:10px 12px"><div class="judul-blok">Komparator spesifikasi</div>' +
        '<p class="hasil-info">Ketik nama di slot (ada saran otomatis), atau pakai duel dan favorit di bawah. Hasil tampil langsung. Tautan halaman bisa dibagikan. Sel hijau hanya untuk pemenang tunggal.</p>' +
        '<div class="banding-pilih">' + [0, 1, 2].map(function (i) {
          var slot = '<div class="slot-hp"><label id="slotLabel' + i + '">HP ' + (i + 1) + '</label>' +
            '<div class="slot-baris"><button class="slot-tampil' + (byId[ids[i]] ? "" : " kosong") + '" data-pilih="' + i + '" type="button" aria-haspopup="listbox" aria-expanded="false" id="slotBtn' + i + '">' + esc(byId[ids[i]] ? byId[ids[i]].name : "Pilih HP...") + "</button>" +
            '<button class="tombol tombol-mini" data-bersih="' + i + '" type="button" title="Kosongkan slot ' + (i + 1) + '">X</button></div>' +
            '<div class="slot-panel" id="slotPanel' + i + '" hidden><input class="slot-cari" id="slotCari' + i + '" placeholder="Ketik untuk mencari..." autocomplete="off" aria-label="Cari HP untuk slot ' + (i + 1) + '"><div id="slotReko' + i + '"></div><div class="slot-daftar" id="slotDaftar' + i + '" role="listbox"></div></div>' +
            '<div class="hasil-info slot-info" id="slotInfo' + i + '">' + esc(infoSlot(ids[i])) + "</div></div>";
          /* Slot ke-3 opsional: disembunyikan sampai user memintanya atau sudah terisi. */
          if (i === 2) slot = '<div id="slotWrap2"' + ((slot3Visible || ids[2]) ? "" : " hidden") + ">" + slot + "</div>";
          return slot;
        }).join("") + "</div>" +
        '<div style="margin:0 0 4px"' + ((slot3Visible || ids[2]) ? ' hidden' : "") + ' id="wrapSlot3Btn"><button class="tombol" id="btnSlot3" type="button">+ TAMBAH HP KE-3 (OPSIONAL)</button></div>' +
        '<div id="cepatBox"></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px"><label class="hasil-info"><input type="checkbox" id="cekBeda"' + (sorot ? " checked" : "") + "> Sorot baris yang nilainya berbeda</label>" +
        '<button class="tombol tombol-mini" id="btnSalinBanding" type="button">SALIN TAUTAN</button>' +
        '<button class="tombol tombol-mini" id="btnResetBanding" type="button">RESET</button>' +
        '<span class="hasil-info">Nama baris menempel saat tabel digeser di layar kecil.</span></div>' +
        iklanHTML("banding_atas") +
        '<div id="hasilBanding" style="margin-top:10px"></div></div>';
      /* Picker custom (bukan datalist): berfungsi penuh di browser HP, ada harga
         di tiap saran, bisa keyboard, duplikat dikunci sejak daftar. */
      var panelBuka = -1, panelCari = ["", "", ""], panelAktif = [0, 0, 0];
      window.__tutupPanel = tutupPanel;
      function cocokPanel(i) {
        var q = panelCari[i].toLowerCase();
        return semuaHP.filter(function (x) {
          return !q || x.name.toLowerCase().indexOf(q) !== -1 || x.brand.toLowerCase().indexOf(q) !== -1;
        });
      }
      function gambarDaftar(i) {
        var box = document.getElementById("slotDaftar" + i);
        if (!box) return;
        var hasil = cocokPanel(i);
        if (panelAktif[i] >= hasil.length) panelAktif[i] = 0;
        box.innerHTML = hasil.length ? hasil.map(function (x, n) {
          var sudah = ids.some(function (y, yi) { return yi !== i && y === x.id; });
          return '<button class="slot-item' + (n === panelAktif[i] ? " aktif" : "") + (sudah ? " sudah" : "") + '" data-item="' + esc(x.id) + '" data-slotidx="' + i + '" type="button" role="option"' + (sudah ? ' title="Sudah dipilih di slot lain"' : "") + ">" + phoneArt(x, 30, 40, 0) + '<span style="min-width:0"><b>' + esc(x.name) + "</b><br><small>" + esc(x.platform.chipset.split("(")[0]) + " - " + esc(x.memory.ramUtama) + "GB</small></span>" + '<span class="ac-harga">' + formatIDR(hargaMin(x)) + "</span></button>";
        }).join("") : '<div class="kosong" style="padding:12px">Tidak ada yang cocok.</div>';
        box.querySelectorAll("[data-item]").forEach(function (b) {
          b.onclick = function (ev) {
            ev.stopPropagation();
            var si = parseInt(b.getAttribute("data-slotidx"), 10);
            var id = b.getAttribute("data-item");
            if (ids.some(function (y, yi) { return yi !== si && y === id; })) { toast("HP itu sudah ada di slot lain"); return; }
            tutupPanel();
            pilihSlot(si, id);
          };
        });
      }
      function bukaPanel(i) {
        tutupPanel();
        panelBuka = i; panelCari[i] = ""; panelAktif[i] = 0;
        var p = document.getElementById("slotPanel" + i), c = document.getElementById("slotCari" + i), btn = document.getElementById("slotBtn" + i);
        if (!p) return;
        p.hidden = false;
        if (btn) btn.setAttribute("aria-expanded", "true");
        gambarDaftar(i);
        gambarReko(i);
        if (c) { c.value = ""; setTimeout(function () { c.focus(); }, 0); }
      }
      /* Rekomendasi lawan: sepadan dengan HP yang sudah dipilih di slot lain
         (skor kemiripan server + selisih harga). Di-cache per HP. */
      var rekoCache = {};
      function gambarReko(i) {
        var box = document.getElementById("slotReko" + i);
        if (!box) return;
        var lawan = null;
        for (var k = 0; k < 3; k++) if (k !== i && ids[k]) { lawan = ids[k]; break; }
        if (!lawan || !byId[lawan]) { box.innerHTML = ""; return; }
        var p = byId[lawan];
        function tampil(list) {
          if (panelBuka !== i) return;
          var box2 = document.getElementById("slotReko" + i);
          if (!box2) return;
          var isi = (list || []).filter(function (x) { return ids.indexOf(x.id) === -1; }).slice(0, 3);
          if (!isi.length) { box2.innerHTML = ""; return; }
          box2.innerHTML = '<div class="reko-judul">COCOK DILAWANKAN DENGAN ' + esc(namaPendek(p).toUpperCase()) + "</div>" +
            isi.map(function (x) {
              var sel = Math.abs(x.hargaTermurah - hargaMin(p));
              return '<button class="slot-item reko" data-item="' + esc(x.id) + '" data-slotidx="' + i + '" type="button">' + phoneArt(x, 30, 40, 0) +
                '<span style="min-width:0"><b>' + esc(x.name) + "</b><br><small>Selisih " + formatIDR(sel) + " - AnTuTu " + Number(x.antutu).toLocaleString("id-ID") + "</small></span>" +
                '<span class="ac-harga">' + formatIDR(x.hargaTermurah) + "</span></button>";
            }).join("");
          box2.querySelectorAll("[data-item]").forEach(function (b) {
            b.onclick = function (ev) {
              ev.stopPropagation();
              tutupPanel();
              pilihSlot(i, b.getAttribute("data-item"));
            };
          });
        }
        if (rekoCache[lawan]) { tampil(rekoCache[lawan]); return; }
        box.innerHTML = '<div class="hasil-info" style="padding:6px 9px">Memuat rekomendasi lawan...</div>';
        api("/api/phones/" + encodeURIComponent(lawan) + "/similar").then(function (sim) {
          rekoCache[lawan] = sim;
          tampil(sim);
        }).catch(function () {
          if (panelBuka === i) {
            var b2 = document.getElementById("slotReko" + i);
            if (b2) b2.innerHTML = "";
          }
        });
      }
      function tutupPanel() {
        if (panelBuka < 0) return;
        var p = document.getElementById("slotPanel" + panelBuka), btn = document.getElementById("slotBtn" + panelBuka);
        if (p) p.hidden = true;
        if (btn) btn.setAttribute("aria-expanded", "false");
        panelBuka = -1;
      }
      function gambarSlot() {
        [0, 1, 2].forEach(function (i) {
          var btn = document.getElementById("slotBtn" + i), info = document.getElementById("slotInfo" + i);
          if (btn) {
            btn.textContent = byId[ids[i]] ? byId[ids[i]].name : "Pilih HP...";
            btn.classList.toggle("kosong", !byId[ids[i]]);
          }
          if (info) info.textContent = infoSlot(ids[i]);
        });
        gambarCepat();
      }
      function pilihSlot(i, id) {
        /* Duplikat = membandingkan HP dengan dirinya sendiri: ditolak dengan alasan. */
        if (id && ids.some(function (x, xi) { return xi !== i && x === id; })) {
          toast("HP itu sudah ada di slot lain");
          gambarSlot();
          return;
        }
        ids[i] = id || null;
        syncURL(); gambarSlot(); muat();
      }
      app.querySelectorAll("[data-pilih]").forEach(function (b) {
        b.onclick = function (ev) {
          ev.stopPropagation();
          var i = parseInt(b.getAttribute("data-pilih"), 10);
          if (panelBuka === i) tutupPanel(); else bukaPanel(i);
        };
      });
      [0, 1, 2].forEach(function (i) {
        var c = document.getElementById("slotCari" + i);
        if (!c) return;
        c.addEventListener("input", function () { panelCari[i] = c.value; panelAktif[i] = 0; gambarDaftar(i); });
        c.addEventListener("keydown", function (e) {
          var daftar = document.getElementById("slotDaftar" + i);
          var semua = daftar ? daftar.querySelectorAll("[data-item]") : [];
          if (e.key === "Escape") { tutupPanel(); document.getElementById("slotBtn" + i).focus(); return; }
          if (!semua.length) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            panelAktif[i] = (panelAktif[i] + (e.key === "ArrowDown" ? 1 : -1) + semua.length) % semua.length;
            gambarDaftar(i);
            var el = document.getElementById("slotDaftar" + i).querySelectorAll("[data-item]")[panelAktif[i]];
            if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
          } else if (e.key === "Enter") {
            e.preventDefault();
            var pil = document.getElementById("slotDaftar" + i).querySelectorAll("[data-item]")[panelAktif[i]];
            if (pil) pil.click();
          }
        });
      });
      app.querySelectorAll("[data-bersih]").forEach(function (b) {
        b.onclick = function () {
          var i = parseInt(b.getAttribute("data-bersih"), 10);
          ids[i] = null;
          if (i === 2) slot3Visible = false;
          perbaruiSlot3();
          syncURL(); gambarSlot(); muat();
        };
      });
      var btnSlot3 = document.getElementById("btnSlot3");
      if (btnSlot3) btnSlot3.onclick = function () {
        slot3Visible = true;
        perbaruiSlot3();
        bukaPanel(2);
      };
      function gambarCepat() {
        var box = document.getElementById("cepatBox");
        if (!box) return;
        var favs = favList().map(function (id) { return byId[id]; }).filter(function (p) { return p && ids.indexOf(p.id) === -1; });
        if (!favs.length) { box.innerHTML = ""; return; }
        box.innerHTML = '<div class="hasil-info" style="margin:8px 0 4px">Dari favorit - klik untuk mengisi slot kosong:</div><div style="display:flex;gap:6px;flex-wrap:wrap">' + favs.map(function (p) { return '<button class="tombol tombol-mini" data-cepat="' + esc(p.id) + '" type="button">+ ' + esc(namaPendek(p)) + "</button>"; }).join("") + "</div>";
        box.querySelectorAll("[data-cepat]").forEach(function (b) {
          b.onclick = function () {
            var urutan = slot3Tampil() ? [0, 1, 2] : [0, 1];
            var kosong = -1;
            for (var j = 0; j < urutan.length; j++) if (!ids[urutan[j]]) { kosong = urutan[j]; break; }
            if (kosong < 0 && !slot3Tampil()) {
              slot3Visible = true;
              perbaruiSlot3();
              kosong = 2;
            }
            if (kosong < 0) { toast("Slot penuh (maks 3) - kosongkan satu dulu"); return; }
            pilihSlot(kosong, b.getAttribute("data-cepat"));
          };
        });
      }
      document.getElementById("btnResetBanding").onclick = function () { location.hash = "#/compare"; };
      document.getElementById("btnSalinBanding").onclick = function (e) {
        var url = location.href;
        function done() { toast("Tautan perbandingan tersalin"); e.target.textContent = "TERSALIN"; setTimeout(function () { e.target.textContent = "SALIN TAUTAN"; }, 2000); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
        else done();
      };
      var cek = document.getElementById("cekBeda");
      if (cek) cek.onchange = function () { sorot = cek.checked; syncURL(); muat(); };
      gambarSlot();
      syncURL();
      function duelButtons() {
        return '<a class="tombol" href="#/compare?ids=poco-x6-pro,xiaomi-redmi-note-13-pro">POCO X6 Pro vs Redmi Note 13 Pro</a> ' +
          '<a class="tombol" href="#/compare?ids=samsung-galaxy-s24-ultra,iphone-15-pro-max">S24 Ultra vs iPhone 15 Pro Max</a> ' +
          '<a class="tombol" href="#/compare?ids=infinix-note-40-pro,samsung-galaxy-a54">Note 40 Pro vs Galaxy A54</a>';
      }
      /* Satu HP bukan jalan buntu: tampilkan ringkasannya + carikan lawan sepadan. */
      function renderTunggal(box, id) {
        var p = byId[id];
        if (!p) { box.innerHTML = '<div class="error-box">HP tidak dikenal.</div>'; return; }
        box.innerHTML = '<div class="tunggal"><div style="min-width:0"><b>' + esc(p.name) + "</b><br><span class=\"hasil-info\">" + formatIDR(hargaMin(p)) + " - AnTuTu " + Number(p.antutu).toLocaleString("id-ID") + " - " + esc(p.memory.ramUtama) + "GB RAM</span></div>" +
          '<div><button class="tombol tombol-primer tombol-mini" id="btnLawan" type="button">CARIKAN LAWAN SEPADAN</button></div></div>' +
          '<div class="kosong" style="border:0;padding:14px 6px 6px"><b>Butuh 1 HP lagi.</b> Ketik di slot atas, ambil dari favorit, atau buka duel:<br><br>' + duelButtons() + "</div>";
        document.getElementById("btnLawan").onclick = function () {
          var btn = this;
          btn.disabled = true;
          btn.textContent = "MENCARI...";
          api("/api/phones/" + encodeURIComponent(id) + "/similar").then(function (sim) {
            var lawan = null;
            for (var i = 0; i < sim.length; i++) if (ids.indexOf(sim[i].id) === -1) { lawan = sim[i].id; break; }
            if (!lawan) { toast("Tidak ada lawan sepadan yang belum dipilih"); btn.disabled = false; btn.textContent = "CARIKAN LAWAN SEPADAN"; return; }
            var kosong = -1;
            for (var k = 0; k < 3; k++) if (!ids[k]) { kosong = k; break; }
            if (kosong < 0) kosong = 1;
            pilihSlot(kosong, lawan);
            toast("Lawan ditemukan: " + (byId[lawan] ? namaPendek(byId[lawan]) : lawan));
          }).catch(function () { toast("Gagal mencari lawan"); btn.disabled = false; btn.textContent = "CARIKAN LAWAN SEPADAN"; });
        };
      }
      function muat() {
        var list = daftarAktif();
        var box = document.getElementById("hasilBanding");
        if (!box) return;
        if (list.length === 1) { renderTunggal(box, list[0]); prosesIklan(); return; }
        if (!list.length) {
          box.innerHTML = '<div class="kosong"><b>Belum ada HP dipilih.</b><br>Ketik nama di slot atas, atau langsung buka duel populer:<br><br>' + duelButtons() + "</div>";
          prosesIklan();
          return;
        }
        box.innerHTML = '<div class="loading">Membandingkan...</div>';
        api("/api/compare?ids=" + list.map(encodeURIComponent).join(",")).then(function (rows) {
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
          function nama(i) { return i >= 0 ? namaPendek(rows[i]) : "Seri"; }
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
          var skorMax = Math.max.apply(null, tally), juara = [];
          for (var ji = 0; ji < tally.length; ji++) if (tally[ji] === skorMax && skorMax > 0) juara.push(rows[ji].name);
          var vonisUmum = juara.length === 1
            ? "<b>" + esc(juara[0]) + "</b> unggul di " + skorMax + " dari 8 kategori angka (" + esc(tallyTeks()) + ")."
            : "Tidak ada pemenang mutlak (" + esc(tallyTeks()) + "). Pilih berdasar prioritas: harga, kamera, atau gaming.";
          var vonis = '<div class="vonis"><h4>Vonis singkat, berdasar angka di bawah</h4><div class="vonis-grid">' +
            '<div class="vonis-item"><small>Termurah</small><b>' + esc(nama(wHarga)) + "</b><br>" + (wHarga >= 0 ? formatIDR(hargaVals[wHarga]) : "harga sama") + "</div>" +
            '<div class="vonis-item"><small>Performa tertinggi</small><b>' + esc(nama(wAntu)) + "</b><br>" + (wAntu >= 0 ? "AnTuTu " + Number(antuVals[wAntu]).toLocaleString("id-ID") : "skor sama") + "</div>" +
            '<div class="vonis-item"><small>Baterai terbesar</small><b>' + esc(nama(wBat)) + "</b><br>" + (wBat >= 0 ? esc(batVals[wBat]) + " mAh" : "kapasitas sama") + "</div>" +
            '<div class="vonis-item"><small>Favorit pengguna</small><b>' + esc(nama(wRate)) + "</b><br>" + (wRate >= 0 ? esc(rateVals[wRate]) + "/5" : "rating sama") + "</div>" +
            '</div><div style="margin-top:8px">' + vonisUmum + "</div></div>";
          var kol = rows.length + 1;
          var minH = Math.min.apply(null, hargaVals);
          function beda(fn) {
            if (!sorot) return "";
            var v = rows.map(fn);
            return v.every(function (x) { return String(x) === String(v[0]); }) ? "" : "beda";
          }
          /* wIdx = indeks pemenang tunggal, -1 bila tidak ada. Hijau tidak pernah tertimpa kuning. */
          function brs(label, fn, wIdx, align, sek) {
            var b = beda(fn);
            var tutup = sek && sekTutup[sek];
            return '<tr' + (sek ? ' data-sek="' + sek + '"' : "") + (tutup ? ' class="tutup"' : "") + '><td class="label">' + esc(label) + "</td>" + rows.map(function (r, ri) {
              var cls = ((wIdx === ri) ? "menang" : b) + (align === "kiri" ? " kiri" : "");
              return '<td class="' + cls + '">' + fn(r, ri) + "</td>";
            }).join("") + "</tr>";
          }
          function seksi(judul, key, jumlah) {
            var tutup = !!sekTutup[key];
            return '<tr class="seksi-banding"><td colspan="' + kol + '"><button class="seksi-toggle" data-toggle="' + key + '" data-judul="' + esc(judul) + '" data-jml="' + jumlah + '" type="button" aria-expanded="' + (tutup ? "false" : "true") + '">' + (tutup ? "&#9656; " : "&#9662; ") + esc(judul) + ' <span class="hasil-info">(' + jumlah + ")</span></button></td></tr>";
          }
          /* Sel panjang (kamera) diringkas: klaim utama tebal, sisanya abu kecil. */
          function ringkasKamera(cfg) {
            var parts = String(cfg).split(" + ");
            if (parts.length < 2) return esc(cfg);
            return "<b>" + esc(parts[0]) + '</b> <span class="kecil-abu">+ ' + esc(parts.slice(1).join(" + ")) + "</span>";
          }
          function selisih(h) {
            return h === minH ? "" : '<span class="selisih">+' + formatIDR(h - minH) + " dari termurah</span>";
          }
          /* Kartu duel side-by-side di atas tabel: foto besar sejajar, harga,
             rating, dan CTA SPEK + BELI. Tabel di bawah untuk bedah baris. */
          function duelHead() {
            return '<div class="duel-head">' + rows.map(function (r) {
              return '<div class="duel-kartu"><a href="#/phone/' + esc(r.id) + '">' + phoneArt(r, 72, 96, 0) + "<br><b>" + esc(r.name) + "</b></a>" +
                '<div class="harga-merah">' + formatIDR(r.hargaTermurah) + "</div>" +
                '<div class="skor-kecil"><span class="rate-num' + kelasRate(r.ratingLive) + '">' + esc(r.ratingLive) + "</span> " + esc(r.reviewCountLive) + " penilaian</div>" +
                '<div class="aksi"><a class="tombol tombol-mini" href="#/phone/' + esc(r.id) + '">SPEK</a>' + tombolBeli(tokoMin(r), r.name, true) + "</div></div>";
            }).join("") + "</div>";
          }
          box.innerHTML = vonis + duelHead() + '<div class="scroll-x"><table class="banding"><tbody>' +
            '<tr><td class="label">Tipe</td>' + rows.map(function (r) {
              return '<td><b>' + esc(namaPendek(r)) + '</b> <button class="hapus-link" data-hapus="' + esc(r.id) + '" type="button">Hapus</button></td>';
            }).join("") + "</tr>" +
            seksi("Harga", "harga", 2) +
            brs("Harga termurah", function (r) { return "<b>" + formatIDR(r.hargaTermurah) + "</b>" + selisih(r.hargaTermurah); }, wHarga) +
            brs("Toko termurah", function (r) { return esc(tokoMin(r)) + " " + tombolBeli(tokoMin(r), r.name, true); }, -1, "kiri", "harga") +
            seksi("Penilaian pengguna", "nilai", 1) +
            brs("Rating", function (r) { return r.ratingLive + "/5 (" + r.reviewCountLive + " penilaian)"; }, wRate, "", "nilai") +
            seksi("Layar", "layar", 5) +
            brs("Ukuran dan panel", function (r) { return "<b>" + esc(r.display.ukuran) + "</b>, " + esc(r.display.tipe.split(",")[0]); }, -1, "kiri", "layar") +
            brs("Resolusi", function (r) { return esc(r.display.resolusi); }, -1, "kiri", "layar") +
            brs("Proteksi layar", function (r) { return esc(r.display.proteksi); }, -1, "kiri", "layar") +
            brs("Kecerahan", function (r) { return esc(r.display.kecerahan); }, -1, "kiri", "layar") +
            brs("Refresh rate", function (r) { return esc(r.display.refreshRate) + " Hz"; }, wRef, "", "layar") +
            seksi("Performa", "performa", 6) +
            brs("Sistem operasi", function (r) { return esc(r.platform.os); }, -1, "kiri", "performa") +
            brs("Chipset", function (r) { return esc(r.platform.chipset); }, -1, "kiri", "performa") +
            brs("GPU", function (r) { return esc(r.platform.gpu); }, -1, "kiri", "performa") +
            brs("RAM", function (r) { return esc(r.memory.ramUtama) + " GB"; }, wRam, "", "performa") +
            brs("Memori internal", function (r) { return esc(r.memory.storageUtama) + " GB (" + esc(r.memory.tipe) + ")"; }, wStor, "", "performa") +
            brs("Skor AnTuTu", function (r) { return Number(r.antutu).toLocaleString("id-ID") + numbar(r.antutu, antuMax); }, wAntu, "", "performa") +
            seksi("Kamera", "kamera", 4) +
            brs("Belakang", function (r) { return ringkasKamera(r.mainCamera.konfigurasi); }, -1, "kiri", "kamera") +
            brs("Depan", function (r) { return ringkasKamera(r.selfieCamera.resolusi); }, -1, "kiri", "kamera") +
            brs("Video belakang", function (r) { return esc(r.mainCamera.video); }, -1, "kiri", "kamera") +
            brs("Video depan", function (r) { return esc(r.selfieCamera.video); }, -1, "kiri", "kamera") +
            seksi("Baterai dan pengisian", "baterai", 3) +
            brs("Kapasitas", function (r) { return esc(r.battery.kapasitas) + " mAh" + numbar(r.battery.kapasitas, batMax); }, wBat, "", "baterai") +
            brs("Pengisian", function (r) { return esc(r.battery.charging) + numbar(watt(r.battery.charging), wattMax); }, wWatt, "kiri", "baterai") +
            brs("Wireless charging", function (r) { return r.battery.wireless ? "Ya" : "Tidak"; }, -1, "", "baterai") +
            seksi("Bodi", "bodi", 7) +
            brs("Dimensi", function (r) { return esc(r.body.dimensi); }, -1, "kiri", "bodi") +
            brs("Berat", function (r) { return esc(r.body.berat); }, -1, "", "bodi") +
            brs("Tahan air", function (r) { return esc(r.body.tahanAir); }, -1, "kiri", "bodi") +
            brs("SIM dan slot", function (r) { return esc(r.body.simDetail) + " / slot: " + esc(r.memory.slotKartu); }, -1, "kiri", "bodi") +
            brs("Jack 3,5 mm", function (r) { return esc(r.sound.jack); }, -1, "", "bodi") +
            brs("Pengeras suara", function (r) { return esc(r.sound.pengeras); }, -1, "kiri", "bodi") +
            brs("Kunci layar", function (r) { return esc(kunciLayar(r)); }, -1, "kiri", "bodi") +
            seksi("Konektivitas dan lain", "konek", 6) +
            brs("Jaringan 5G", function (r) { return r.network.dukungan5G ? "Ya" : "Tidak"; }, -1, "", "konek") +
            brs("NFC", function (r) { return r.comms.nfc ? "Ya" : "Tidak"; }, -1, "", "konek") +
            brs("WiFi", function (r) { return esc(r.comms.wifi); }, -1, "kiri", "konek") +
            brs("Bluetooth", function (r) { return esc(r.comms.bluetooth); }, -1, "kiri", "konek") +
            brs("USB", function (r) { return esc(r.comms.usb); }, -1, "kiri", "konek") +
            brs("Rilis", function (r) { return esc(r.launch.rilis); }, -1, "", "konek") +
            '<tr class="banding-bawah"><td class="label">Tipe</td>' + rows.map(function (r) {
              return '<td><a href="#/phone/' + esc(r.id) + '"><b>' + esc(namaPendek(r)) + "</b></a><br><span class=\"harga-merah\">" + formatIDR(r.hargaTermurah) + "</span></td>";
            }).join("") + "</tr>" +
            "</tbody></table></div>" +
            '<p class="hasil-info">Hijau hanya untuk pemenang tunggal. Klik judul seksi untuk melipat/membuka. Kamera, OS, tahan air, dan berat tidak diperingkat karena angka besar belum tentu lebih baik.</p>';
          box.querySelectorAll("[data-toggle]").forEach(function (btn) {
            btn.onclick = function () {
              var key = btn.getAttribute("data-toggle");
              sekTutup[key] = !sekTutup[key];
              box.querySelectorAll('tr[data-sek="' + key + '"]').forEach(function (tr) { tr.classList.toggle("tutup", !!sekTutup[key]); });
              btn.setAttribute("aria-expanded", sekTutup[key] ? "false" : "true");
              btn.innerHTML = (sekTutup[key] ? "&#9656; " : "&#9662; ") + esc(btn.getAttribute("data-judul")) + ' <span class="hasil-info">(' + esc(btn.getAttribute("data-jml")) + ")</span>";
            };
          });
          box.querySelectorAll("[data-hapus]").forEach(function (btn) {
            btn.onclick = function () {
              var buang = btn.getAttribute("data-hapus");
              /* In-place: tanpa location.hash agar tidak render ulang + lompat scroll. */
              ids = ids.map(function (x) { return x === buang ? null : x; });
              syncURL(); gambarSlot(); muat();
            };
          });
        }).catch(function (err) { box.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>"; });
      }
      if (cek) cek.onchange = function () { sorot = cek.checked; syncURL(); muat(); };
      muat();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
    });
  }

  /* ---------- NEWS & FAVORIT ---------- */
  function renderNews() {
    setNav("news");
    app.innerHTML = '<div class="loading">Memuat berita...</div>';
    api("/api/news").then(function (news) {
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <b>Berita dan panduan</b></div>' +
        '<div style="padding:10px 12px"><div class="judul-blok">Berita dan panduan (' + news.length + ")</div>" +
        iklanHTML("berita_atas") +
        news.map(function (n) {
          return '<div class="berita-baris"><div class="berita-tgl"><b>' + esc(n.tanggal.slice(8, 10)) + "</b>" + bulanTahun(n.tanggal) + '</div><div style="min-width:0"><span class="tag">' + esc(n.kategori) + '</span> <a class="berita-judul" href="#/news/' + n.id + '">' + esc(n.judul) + '</a><div class="berita-ringkas">' + esc(n.ringkasan) + '</div><div style="margin-top:6px"><a class="tombol tombol-mini" href="#/news/' + n.id + '">BACA SELENGKAPNYA</a></div></div></div>';
        }).join("") + "</div>";
      prosesIklan();
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
    });
  }
  // Halaman artikel: untuk apa: tautan dari beranda/katalog bisa dibagikan dan dibaca penuh.
  // HP terkait: untuk apa: pembaca rumor/panduan langsung lompat ke tipe yang dibahas.
  function renderNewsDetail(nid) {
    setNav("news");
    app.innerHTML = '<div class="loading">Memuat artikel...</div>';
    api("/api/news/" + encodeURIComponent(nid)).then(function (n) {
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <a href="#/news">Berita</a> / <b>' + esc(n.kategori) + "</b></div>" +
        '<div style="padding:10px 12px"><div class="judul-blok">' + esc(n.kategori) + "</div>" +
        "<h1 style=\"font-size:18px;margin:10px 0 4px\">" + esc(n.judul) + "</h1>" +
        '<div class="hasil-info">Diterbitkan ' + formatTanggal(n.tanggal) + "</div>" +
        '<p style="font-size:13px;background:#f4f5f6;border:1px solid #d4d7db;padding:8px 10px">' + esc(n.ringkasan) + "</p>" +
        '<div style="font-size:13.5px;white-space:pre-line">' + esc(n.isi) + "</div>" +
        (n.terkait && n.terkait.length ? '<div style="margin-top:12px">' + blokJudul("HP yang dibahas di artikel ini") + n.terkait.map(barisHP).join("") + "</div>" : "") +
        '<div style="margin-top:10px"><a class="tombol" href="#/news">KEMBALI KE DAFTAR BERITA</a></div></div>';
    }).catch(function (err) {
      app.innerHTML = '<div class="error-box">' + esc(err.message) + '</div><p style="padding:0 12px"><a href="#/news">Kembali ke berita</a></p>';
    });
  }
  function renderFavorites() {
    setNav("favorites");
    var ids = favList();
    if (!ids.length) {
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <b>Favorit</b></div><div class="kosong"><b>Belum ada favorit.</b><br>Gunakan tombol SIMPAN KE FAVORIT di halaman detail HP.<br><br><a class="tombol tombol-biru" href="#/phones">BUKA KATALOG</a></div>';
      return;
    }
    app.innerHTML = '<div class="loading">Memuat favorit...</div>';
    api("/api/compare?ids=" + ids.slice(0, 12).map(encodeURIComponent).join(",")).then(function (rows) {
      var banding3 = ids.slice(0, 3).map(encodeURIComponent).join(",");
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <b>Favorit (' + rows.length + ')</b></div>' +
        '<div style="padding:10px 12px"><div class="judul-blok">HP favorit saya</div>' + rows.map(barisHP).join("") +
        '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
        (rows.length >= 2 ? '<a class="tombol tombol-primer" href="#/compare?ids=' + banding3 + '">BANDINGKAN ' + Math.min(3, rows.length) + ' FAVORIT PERTAMA</a>' : "") +
        '<button class="tombol" id="hapusFav" type="button">HAPUS SEMUA FAVORIT</button></div></div>';
      document.getElementById("hapusFav").onclick = function () {
        try { localStorage.removeItem("spekhp_fav"); } catch (e) {}
        renderFavorites();
      };
    }).catch(function () {
      app.innerHTML = '<div class="error-box">Data favorit kedaluwarsa. Hapus dan simpan ulang dari katalog.</div>';
    });
  }

  cfgSiap().then(function () { route(); });
})();
