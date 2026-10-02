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
      '<button class="tombol tombol-mini" data-compare="' + esc(p.id) + '" type="button">BANDING</button></div></div></div>';
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
    var c = e.target.closest("[data-compare]");
    if (c) { location.hash = "#/compare?ids=" + encodeURIComponent(c.getAttribute("data-compare")); return; }
  });
  function kirimCari(v) {
    if (!v) return;
    location.hash = "#/phones?search=" + encodeURIComponent(v);
  }
  inputGlobal.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && inputGlobal.value.trim()) {
      autoBox.classList.remove("tampil");
      var v = inputGlobal.value.trim(); inputGlobal.value = "";
      kirimCari(v);
    }
  });
  btnCari.addEventListener("click", function () {
    if (inputGlobal.value.trim()) {
      var v = inputGlobal.value.trim(); inputGlobal.value = "";
      autoBox.classList.remove("tampil");
      kirimCari(v);
    }
  });
  var acTimer = null;
  inputGlobal.addEventListener("input", function () {
    clearTimeout(acTimer);
    var v = inputGlobal.value.trim();
    if (v.length < 2) { autoBox.classList.remove("tampil"); autoBox.innerHTML = ""; return; }
    acTimer = setTimeout(function () {
      api("/api/phones?search=" + encodeURIComponent(v) + "&limit=6").then(function (res) {
        autoBox.innerHTML = res.data.length ? res.data.map(function (p) {
          return '<button type="button" data-go="' + esc(p.id) + '"><span><b>' + esc(p.name) + '</b><br><span class="harga-kecil">' + esc(p.platform.chipset.split("(")[0]) + "</span></span>" + '<span class="ac-harga">' + formatIDR(p.hargaTermurah) + "</span></button>";
        }).join("") : '<button type="button">Tidak ada hasil untuk "' + esc(v) + '"</button>';
        autoBox.classList.add("tampil");
      }).catch(function () { autoBox.classList.remove("tampil"); });
    }, 200);
  });
  autoBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]");
    if (b) { autoBox.classList.remove("tampil"); inputGlobal.value = ""; location.hash = "#/phone/" + b.getAttribute("data-go"); }
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
        '<div class="blok">' + blokJudul("Komparasi yang sering dibuka") +
        '<div style="padding:8px;font-size:12.5px">' +
        '<div style="padding:5px 0;border-bottom:1px dotted #cfd3d8"><a href="#/compare?ids=poco-x6-pro,xiaomi-redmi-note-13-pro"><b>POCO X6 Pro vs Redmi Note 13 Pro 5G</b></a> <span class="harga-kecil">- beda Rp 500 ribu, beda kelas performa</span></div>' +
        '<div style="padding:5px 0;border-bottom:1px dotted #cfd3d8"><a href="#/compare?ids=samsung-galaxy-s24-ultra,iphone-15-pro-max"><b>Galaxy S24 Ultra vs iPhone 15 Pro Max</b></a> <span class="harga-kecil">- duel flagship 200MP vs 48MP</span></div>' +
        '<div style="padding:5px 0"><a href="#/compare?ids=infinix-note-40-pro,samsung-galaxy-a54"><b>Infinix Note 40 Pro vs Galaxy A54</b></a> <span class="harga-kecil">- 3 jutaan wireless charging vs IP67</span></div>' +
        "</div></div>" +
        '<div class="blok">' + blokJudul("Berita dan panduan", "Semua berita", "#/news") +
        news.slice(0, 3).map(function (n) {
          return '<div class="berita-baris"><div class="berita-tgl"><b>' + esc(n.tanggal.slice(8, 10)) + "</b>" + bulanTahun(n.tanggal) + '</div><div style="min-width:0"><span class="tag">' + esc(n.kategori) + '</span> <a class="berita-judul" href="#/news/' + n.id + '">' + esc(n.judul) + '</a><div class="berita-ringkas">' + esc(n.ringkasan) + "</div></div></div>";
        }).join("") + "</div>" +
        "</div>" +
        '<aside class="rail-kanan">' + railKananHTML(populer.data, murah.length ? murah : populer.data.slice(0, 3)) + "</aside></div>";
      ikatFinder({}, brands);
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
        var fav = isFav(p.id);
        var galWarna = 0, galView = "depan";
        function gambarGaleri() {
          document.getElementById("galeriUtama").innerHTML = phoneArt(p, 120, 160, galWarna, galView);
          document.getElementById("warnaNama").textContent = p.colors[galWarna] + " - tampak " + galView;
          var btns = app.querySelectorAll("[data-view]");
          for (var bi = 0; bi < btns.length; bi++) btns[bi].classList.toggle("pilih-view", btns[bi].getAttribute("data-view") === galView);
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
          '<div class="jangkar"><a href="#bagian-spek">SPESIFIKASI</a><a href="#bagian-harga">HARGA (' + p.prices.length + ' TOKO)</a><a href="#bagian-opini">OPINI (' + esc(p.ulasan.length) + ')</a><a href="#bagian-plusminus">PLUS MINUS</a></div>' +
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
          '<div class="harga-utama"><span class="ket">Harga termurah:</span><span class="besar">' + formatIDR(hmin) + '</span><span class="ket">dari ' + p.prices.length + ' toko - <a href="#bagian-harga">lihat semua</a></span></div>' +
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
          '<p class="hasil-info">Diurutkan dari termurah. Garansi dan ongkir mengikuti keterangan tiap toko.</p>' +
          '<div class="scroll-x"><table class="harga"><thead><tr><th>Toko</th><th>Harga</th><th>Stok</th><th>Rating</th><th>Ongkir</th><th>Garansi</th></tr></thead><tbody>' +
          p.prices.slice().sort(function (a, b) { return a.harga - b.harga; }).map(function (x, i) {
            return '<tr' + (i === 0 ? ' class="termurah"' : "") + "><td><b>" + esc(x.toko) + "</b>" + (i === 0 ? ' <span class="lencana">TERMURAH</span>' : "") + "</td><td><b>" + formatIDR(x.harga) + "</b></td><td>" + esc(x.stok) + "</td><td>" + esc(x.ratingToko) + "/5</td><td>" + esc(x.ongkir) + "</td><td>" + esc(x.garansi) + "</td></tr>";
          }).join("") +           "</tbody></table></div></div>" +
          '<div style="padding:0 12px" id="bagian-tren"><div class="judul-blok">Tren harga 6 bulan</div>' +
          '<p class="hasil-info">Ringkasan pergerakan harga termurah antar toko. Membantu menilai: beli sekarang atau tunggu.</p>' +
          '<div class="tren-wrap"><canvas id="trenCanvas" width="640" height="220" aria-label="Grafik tren harga"></canvas><div class="hasil-info" id="trenInfo">Memuat tren...</div></div></div>' +
          '<div style="padding:10px 12px" id="bagian-opini"><div class="judul-blok">Opini pengguna (' + esc(p.ulasan.length) + " tertulis)</div>" +
          '<div class="opini-ringkas"><span class="opini-skor">' + esc(p.ratingLive) + "</span><span>" + bintangTeks(p.ratingLive) + '<br><span class="hasil-info">' + esc(p.reviewCountLive) + " penilaian masuk</span></span><span id=\"distBox\" style=\"flex:1;min-width:200px\"></span></div>" +
          '<div class="form-opini"><b>Tulis opini</b><div id="errUlasan"></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="uNama" maxlength="40" placeholder="Nama (wajib)"><input id="uJudul" maxlength="80" placeholder="Judul (wajib)"></div>' +
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
        };
        document.getElementById("btnSalin").onclick = function (e) {
          var url = location.origin + location.pathname + "#/phone/" + p.id;
          function done() { e.target.textContent = "TAUTAN TERSALIN"; setTimeout(function () { e.target.textContent = "SALIN TAUTAN HP INI"; }, 2000); }
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
          else { try { var t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); } catch (err) {} done(); }
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
        (function distribusi() {
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
        })();
        // Grafik tren harga (canvas murni, tanpa library).
        api("/api/phones/" + encodeURIComponent(p.id) + "/price-history").then(function (h) {
          var info = document.getElementById("trenInfo");
          if (info) info.innerHTML = "6 bulan lalu <b>" + formatIDR(h.awal) + "</b> - kini <b>" + formatIDR(h.kini) + "</b> - turun <b>" + formatIDR(h.selisih) + " (" + esc(h.persen) + "%)</b>.";
          gambarTren(h.points);
        }).catch(function () {
          var info = document.getElementById("trenInfo");
          if (info) info.textContent = "Tren harga tidak tersedia.";
        });
        function gambarTren(points) {
          var cv = document.getElementById("trenCanvas");
          if (!cv || !cv.getContext) return;
          var ctx = cv.getContext("2d"), W = cv.width, H = cv.height, padL = 78, padB = 26, padT = 12, padR = 10;
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
        document.getElementById("uKirim").onclick = function () {
          var body = {
            nama: document.getElementById("uNama").value,
            judul: document.getElementById("uJudul").value,
            isi: document.getElementById("uIsi").value,
            rating: ratingDipilih
          };
          document.getElementById("errUlasan").innerHTML = "";
          api("/api/phones/" + encodeURIComponent(p.id) + "/reviews", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
          }).then(function (rs) {
            p.ulasan.unshift(rs.ulasan);
            document.getElementById("daftarUlasan").innerHTML = daftarUlasan(p.ulasan);
            document.getElementById("uNama").value = "";
            document.getElementById("uJudul").value = "";
            document.getElementById("uIsi").value = "";
          }).catch(function (err) {
            document.getElementById("errUlasan").innerHTML = '<div class="error-box">' + esc(err.message) + "</div>";
          });
        };
        function daftarUlasan(list) {
          if (!list.length) return '<div class="kosong">Belum ada opini tertulis untuk tipe ini.</div>';
          return list.map(function (u) {
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
      if (!ids.length && semuaHP.length >= 2) ids = [semuaHP[0].id, semuaHP[1].id];
      function opsi(sel) {
        return '<option value="">-- Pilih HP --</option>' + semuaHP.map(function (x) {
          return '<option value="' + esc(x.id) + '"' + (x.id === sel ? " selected" : "") + ">" + esc(x.name) + " - " + formatIDR(hargaMin(x)) + "</option>";
        }).join("");
      }
      var sorotAwal = query.sorot === "1";
      function hashUntuk(list, sorot) {
        var h = "#/compare?ids=" + list.map(encodeURIComponent).join(",");
        if (sorot) h += "&sorot=1";
        return h;
      }
      app.innerHTML = '<div class="crumbs"><a href="#/">Beranda</a> / <b>Bandingkan HP</b></div>' +
        '<div style="padding:10px 12px"><div class="judul-blok">Komparator spesifikasi</div>' +
        '<p class="hasil-info">Pilih 2 sampai 3 tipe. Hasil langsung tampil setiap pilihan diubah, dan tautan halaman ini bisa dibagikan. Sel hijau hanya untuk pemenang tunggal di kategorinya.</p>' +
        '<div class="banding-pilih">' + [0, 1, 2].map(function (i) {
          return '<select data-slot="' + i + '" aria-label="Pilihan HP ke-' + (i + 1) + '">' + opsi(ids[i] || "") + "</select>";
        }).join("") + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label class="hasil-info"><input type="checkbox" id="cekBeda"' + (sorotAwal ? " checked" : "") + "> Sorot baris yang nilainya berbeda</label>" +
        '<button class="tombol tombol-mini" id="btnSalinBanding" type="button">SALIN TAUTAN</button>' +
        '<button class="tombol tombol-mini" id="btnResetBanding" type="button">RESET</button>' +
        '<span class="hasil-info">Nama baris menempel saat tabel digeser di layar kecil.</span></div>' +
        '<div id="hasilBanding" style="margin-top:10px"></div></div>';
      app.querySelectorAll("[data-slot]").forEach(function (sel) {
        sel.onchange = function () {
          ids[parseInt(sel.getAttribute("data-slot"), 10)] = sel.value || null;
          var c = document.getElementById("cekBeda");
          location.hash = hashUntuk(ids.filter(Boolean), c && c.checked);
        };
      });
      document.getElementById("btnResetBanding").onclick = function () { location.hash = "#/compare"; };
      document.getElementById("btnSalinBanding").onclick = function (e) {
        var url = location.href;
        function done() { e.target.textContent = "TERSALIN"; setTimeout(function () { e.target.textContent = "SALIN TAUTAN"; }, 2000); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
        else done();
      };
      var cek = document.getElementById("cekBeda");
      function muat(sorot) {
        var list = ids.filter(Boolean);
        var box = document.getElementById("hasilBanding");
        if (!box) return;
        if (list.length < 2) {
          box.innerHTML = '<div class="kosong"><b>Pilih minimal 2 HP untuk membandingkan.</b><br>' +
            'Satu HP tidak bisa dibandingkan dengan dirinya sendiri. Coba duel populer ini:<br><br>' +
            '<a class="tombol" href="#/compare?ids=poco-x6-pro,xiaomi-redmi-note-13-pro">POCO X6 Pro vs Redmi Note 13 Pro</a> ' +
            '<a class="tombol" href="#/compare?ids=samsung-galaxy-s24-ultra,iphone-15-pro-max">S24 Ultra vs iPhone 15 Pro Max</a></div>';
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
          var tally = rows.map(function () { return 0; });
          [wHarga, wRate, wBat, wAntu, wRam, wStor, wRef, wWatt].forEach(function (w) { if (w >= 0) tally[w]++; });
          function nama(i) { return i >= 0 ? rows[i].name : "Seri"; }
          var skorMax = Math.max.apply(null, tally), juara = [];
          for (var ji = 0; ji < tally.length; ji++) if (tally[ji] === skorMax && skorMax > 0) juara.push(rows[ji].name);
          var vonisUmum = juara.length === 1
            ? "<b>" + esc(juara[0]) + "</b> unggul di " + skorMax + " dari 8 kategori angka (" + esc(tally.join("-")) + ")."
            : "Tidak ada pemenang mutlak (" + esc(tally.join("-")) + "). Pilih berdasar prioritas: harga, kamera, atau gaming.";
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
          function brs(label, fn, wIdx) {
            var b = beda(fn);
            return '<tr><td class="label">' + esc(label) + "</td>" + rows.map(function (r, ri) {
              var cls = (wIdx === ri) ? "menang" : b;
              return '<td class="' + cls + '">' + fn(r, ri) + "</td>";
            }).join("") + "</tr>";
          }
          function seksi(judul) {
            return '<tr class="seksi-banding"><td colspan="' + kol + '">' + esc(judul) + "</td></tr>";
          }
          function selisih(h) {
            return h === minH ? "" : '<span class="selisih">+' + formatIDR(h - minH) + " dari termurah</span>";
          }
          box.innerHTML = vonis + '<div class="scroll-x"><table class="banding"><tbody>' +
            '<tr><td class="label">Tipe</td>' + rows.map(function (r) {
              return '<td><a href="#/phone/' + esc(r.id) + '">' + phoneArt(r, 54, 72, 0) + "<br><b>" + esc(r.name) + "</b></a><br><span class=\"harga-merah\">" + formatIDR(r.hargaTermurah) + "</span>" + selisih(r.hargaTermurah) +
                '<br><a class="link-kecil" href="#/phone/' + esc(r.id) + '">Spek lengkap</a> ' +
                '<button class="hapus-link" data-hapus="' + esc(r.id) + '" type="button">Hapus</button></td>';
            }).join("") + "</tr>" +
            seksi("Harga") +
            brs("Harga termurah", function (r) { return "<b>" + formatIDR(r.hargaTermurah) + "</b>" + selisih(r.hargaTermurah); }, wHarga) +
            seksi("Penilaian pengguna") +
            brs("Rating", function (r) { return r.ratingLive + "/5 (" + r.reviewCountLive + " penilaian)"; }, wRate) +
            seksi("Layar") +
            brs("Panel", function (r) { return esc(r.display.ukuran + ", " + r.display.tipe.split(",")[0]); }) +
            brs("Resolusi", function (r) { return esc(r.display.resolusi); }) +
            brs("Refresh rate", function (r) { return esc(r.display.refreshRate) + " Hz"; }, wRef) +
            seksi("Performa") +
            brs("Chipset", function (r) { return esc(r.platform.chipset); }) +
            brs("RAM", function (r) { return esc(r.memory.ramUtama) + " GB"; }, wRam) +
            brs("Memori internal", function (r) { return esc(r.memory.storageUtama) + " GB (" + esc(r.memory.tipe) + ")"; }, wStor) +
            brs("Skor AnTuTu", function (r) { return Number(r.antutu).toLocaleString("id-ID"); }, wAntu) +
            seksi("Kamera") +
            brs("Belakang", function (r) { return esc(r.mainCamera.konfigurasi); }) +
            brs("Depan", function (r) { return esc(r.selfieCamera.resolusi); }) +
            seksi("Baterai dan pengisian") +
            brs("Kapasitas", function (r) { return esc(r.battery.kapasitas) + " mAh"; }, wBat) +
            brs("Pengisian", function (r) { return esc(r.battery.charging); }, wWatt) +
            seksi("Bodi dan konektivitas") +
            brs("Jaringan 5G", function (r) { return r.network.dukungan5G ? "Ya" : "Tidak"; }) +
            brs("NFC", function (r) { return r.comms.nfc ? "Ya" : "Tidak"; }) +
            brs("Tahan air", function (r) { return esc(r.body.tahanAir); }) +
            brs("Berat", function (r) { return esc(r.body.berat); }) +
            "</tbody></table></div>" +
            '<p class="hasil-info">Hijau hanya untuk pemenang tunggal. Megapixel kamera, sertifikasi tahan air, dan berat tidak diperingkat karena angka besar belum tentu lebih baik.</p>';
          box.querySelectorAll("[data-hapus]").forEach(function (btn) {
            btn.onclick = function () {
              var buang = btn.getAttribute("data-hapus");
              ids = ids.filter(function (x) { return x && x !== buang; });
              var c = document.getElementById("cekBeda");
              location.hash = hashUntuk(ids.filter(Boolean), c && c.checked);
            };
          });
        }).catch(function (err) { box.innerHTML = '<div class="error-box">' + esc(err.message) + "</div>"; });
      }
      if (cek) cek.onchange = function () { location.hash = hashUntuk(ids.filter(Boolean), cek.checked); };
      muat(sorotAwal);
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
        news.map(function (n) {
          return '<div class="berita-baris"><div class="berita-tgl"><b>' + esc(n.tanggal.slice(8, 10)) + "</b>" + bulanTahun(n.tanggal) + '</div><div style="min-width:0"><span class="tag">' + esc(n.kategori) + '</span> <a class="berita-judul" href="#/news/' + n.id + '">' + esc(n.judul) + '</a><div class="berita-ringkas">' + esc(n.ringkasan) + '</div><div style="margin-top:6px"><a class="tombol tombol-mini" href="#/news/' + n.id + '">BACA SELENGKAPNYA</a></div></div></div>';
        }).join("") + "</div>";
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

  route();
})();
