/* PonselArena v2 frontend — plain, fetches /api/* (fullstack). No emoji. */
const $ = (s) => document.querySelector(s);
const fmtRp = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function api(path, opts) {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) throw new Error("API " + r.status);
  return r.json();
}

function phoneSVG() {
  return `<svg width="34" height="52" viewBox="0 0 34 52"><rect x="1" y="1" width="32" height="50" rx="6" fill="#eceff1" stroke="#9e9e9e"/><rect x="6" y="8" width="22" height="32" fill="#cfd8dc"/><circle cx="17" cy="46" r="2.4" fill="none" stroke="#9e9e9e"/><circle cx="17" cy="5" r="1.2" fill="#9e9e9e"/><circle cx="11" cy="13" r="3" fill="#78909c"/><circle cx="22" cy="13" r="3" fill="#78909c"/></svg>`;
}

const NAV = [["#/", "Home"], ["#/finder", "Phone Finder"], ["#/banding", "Compare"], ["#/berita", "News"]];
function renderNav() {
  const h = location.hash || "#/";
  $("#nav").innerHTML = NAV.map(([href, l]) => {
    const a = href === "#/" ? (h === "#/" || h.startsWith("#/hp/")) : h.startsWith(href);
    return `<a href="${href}" class="${a ? "active" : ""}">${l}</a>`;
  }).join("");
}

function fullName(p) {
  return p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`;
}

function rowHTML(p) {
  const rating = p.ratingAvg != null ? p.ratingAvg : p.rating;
  return `<div class="phonerow">
    <div class="thumb">${phoneSVG()}</div>
    <div>
      <span class="pname" data-go="${p.id}">${esc(fullName(p))}</span>
      <div class="pspec">${esc(p.displaySize)}&quot; &middot; ${esc(p.chipset.split("(")[0].trim())} &middot; ${esc(p.rear)} &middot; ${esc(p.battery)} mAh</div>
      <div class="pspec" style="color:#757575">${esc(p.os)} &middot; ${esc(p.network)}</div>
    </div>
    <div class="pmeta"><span class="star">${esc(rating)}</span>/5 &middot; ${(p.userReviews || []).length} review
      <div class="pr">${fmtRp(p.price)} <span class="note">pasar*</span></div>
      <div style="margin-top:6px"><button class="btn small" data-cmp="${p.id}">Compare</button></div>
    </div>
  </div>`;
}

function footer() {
  return `<div class="footer"><div class="footer-inner">
    <div><b>PONSELARENA</b><br>Database spesifikasi independen. Harga yang tampil hanya indikatif pasar dan bukan fokus utama. Data spesifikasi merujuk lembar produsen. Review dan rating berasal dari pengguna dan disimpan di server.</div>
    <div><b>Navigasi</b><br><a href="#/" style="color:#bdbdbd">Home</a><br><a href="#/finder" style="color:#bdbdbd">Phone Finder</a><br><a href="#/banding" style="color:#bdbdbd">Compare</a></div>
    <div><b>API</b><br><span style="color:#bdbdbd">GET /api/phones<br>GET /api/phones/:id<br>POST /api/phones/:id/reviews</span></div>
  </div></div>`;
}

async function render() {
  renderNav();
  const h = location.hash || "#/";
  const app = $("#app");
  try {
    if (h.startsWith("#/hp/")) return await vDetail(app, h.split("/")[2]);
    if (h.startsWith("#/finder")) return await vFinder(app);
    if (h.startsWith("#/banding")) return await vCompare(app);
    if (h.startsWith("#/berita")) return await vNews(app);
    return await vHome(app);
  } catch (e) {
    app.innerHTML = `<div class="box"><div class="box-b">Gagal memuat data server. Pastikan <code>node server.js</code> berjalan di port 3000.<br><span class="note">${esc(e.message)}</span></div></div>`;
  }
}
window.addEventListener("hashchange", render);

/* ---------- HOME ---------- */
async function vHome(app) {
  const [ph, br] = await Promise.all([api("/api/phones?sort=popularity"), api("/api/brands")]);
  const list = ph.data;
  const counts = {};
  list.forEach((p) => (counts[p.brand] = (counts[p.brand] || 0) + 1));
  const top = [...list].sort((a, b) => (b.votes.hit / (b.votes.hit + b.votes.miss)) - (a.votes.hit / (a.votes.hit + a.votes.miss))).slice(0, 8);
  app.innerHTML = `
  <div class="cols">
    <div class="side">
      <div class="box"><div class="box-h">Brands</div>
        <ul class="brandlist">${br.brands.map((b) => `<li><a href="#/finder?brand=${encodeURIComponent(b)}"><span>${esc(b)}</span><span class="n">${counts[b] || 0}</span></a></li>`).join("")}</ul>
      </div>
      <div class="box"><div class="box-h">Top by user votes</div>
        <ul class="toplist">${top.map((p, i) => `<li><span class="rank">${i + 1}</span><span data-go="${p.id}" style="cursor:pointer;color:#0b5cc0">${esc(p.name)}</span></li>`).join("")}</ul>
      </div>
    </div>
    <div>
      <h1 class="page">Latest phones</h1>
      <p class="sub">${list.length} devices in database. Spesifikasi sebagai fokus utama; harga hanya pelengkap bertanda pasar*.</p>
      <div class="box"><div class="box-h">All devices &mdash; sorted by popularity</div>${list.map(rowHTML).join("")}</div>
      ${footer()}
    </div>
  </div>`;
  bindRows(app);
}

/* ---------- FINDER ---------- */
async function vFinder(app) {
  const q = new URLSearchParams((location.hash.split("?")[1] || ""));
  const br = await api("/api/brands");
  app.innerHTML = `
  <div class="crumb"><a href="#/">Home</a> / Phone Finder</div>
  <h1 class="page">Phone Finder</h1>
  <p class="sub">Filter berbasis spesifikasi. Harga hanya batas atas opsional, bukan kriteria utama.</p>
  <div class="box"><div class="box-h">Filter</div><div class="box-b">
    <div class="filters">
      <div class="field"><label>Brand</label><select id="fBrand"><option value="all">All</option>${br.brands.map((b) => `<option ${q.get("brand") === b ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></div>
      <div class="field"><label>Keyword</label><input id="fQ" placeholder="Snapdragon, 200MP..."></div>
      <div class="field"><label>Min battery (mAh)</label><select id="fBat"><option value="0">Any</option><option value="5000">5000+</option><option value="5500">5500+</option><option value="6000">6000+</option></select></div>
      <div class="field"><label>Min RAM</label><select id="fRam"><option value="0">Any</option><option value="8">8 GB+</option><option value="12">12 GB+</option><option value="16">16 GB+</option></select></div>
      <div class="field"><label>Min main camera</label><select id="fCam"><option value="0">Any</option><option value="48">48 MP+</option><option value="50">50 MP+</option><option value="100">100 MP+</option></select></div>
      <div class="field"><label>Max market price (optional)</label><select id="fPrice"><option value="0">No limit</option><option value="5000000">5 jt</option><option value="7000000">7 jt</option><option value="10000000">10 jt</option><option value="15000000">15 jt</option></select></div>
      <div class="field"><label>Sort</label><select id="fSort"><option value="popularity">Popularity</option><option value="antutu">AnTuTu</option><option value="battery">Battery</option><option value="rating">Rating</option><option value="price_asc">Price (low)</option></select></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="fGo">Apply</button></div>
    </div>
  </div></div>
  <div class="box"><div class="box-h" id="fCount">Results</div><div id="fRes"><p class="note" style="padding:10px">Apply filter to load from server.</p></div></div>
  ${footer()}`;
  $("#fGo").onclick = async () => {
    const ps = new URLSearchParams({
      brand: $("#fBrand").value, q: $("#fQ").value,
      minBattery: $("#fBat").value, minRam: $("#fRam").value, minCam: $("#fCam").value,
      maxPrice: $("#fPrice").value, sort: $("#fSort").value,
    });
    const r = await api("/api/phones?" + ps.toString());
    $("#fCount").textContent = `Results (${r.data.length}) — via GET /api/phones`;
    $("#fRes").innerHTML = r.data.length ? r.data.map(rowHTML).join("") : `<p class="note" style="padding:10px">No match.</p>`;
    bindRows(app);
  };
  $("#fGo").click();
}

/* ---------- DETAIL ---------- */
async function vDetail(app, id) {
  const { data: p } = await api("/api/phones/" + encodeURIComponent(id));
  const total = p.votes.hit + p.votes.miss;
  const hitPct = total ? Math.round((p.votes.hit / total) * 100) : 0;
  const sim = (await api(`/api/phones?sort=popularity`)).data.filter((x) => x.id !== p.id).slice(0, 5);
  app.innerHTML = `
  <div class="crumb"><a href="#/">Home</a> / ${esc(p.brand)} / <b>${esc(p.name)}</b></div>
  <h1 class="page">${esc(fullName(p))}</h1>
  <p class="sub">${esc(p.tagline)} &middot; Announced ${esc(p.announced)} &middot; ${esc(p.status)}</p>
  <div class="detail-head">
    <div class="photobox">${phoneSVG()}
      <div class="swatches">${p.colors.map((c) => `<span class="sw" title="${esc(c.name)}" style="background:${esc(c.hex)}"></span>`).join("")}</div>
      <div class="note" style="margin-top:6px">${p.colors.map((c) => esc(c.name)).join(" &middot; ")}</div>
      <div style="margin-top:10px;display:flex;gap:6px;justify-content:center">
        <button class="btn small" data-cmp="${p.id}">Compare</button>
      </div>
    </div>
    <div class="box"><div class="box-h">Key specifications</div><div class="box-b"><ul class="keylist">
      <li><b>Network:</b> ${esc(p.network)}, ${esc(p.sim)}</li>
      <li><b>Display:</b> ${esc(p.displaySize)}&quot; ${esc(p.displayType)} (${esc(p.resolution)})</li>
      <li><b>Chipset:</b> ${esc(p.chipset)} — ${esc(p.cpu)} / ${esc(p.gpu)}</li>
      <li><b>Memory:</b> ${esc(p.ram.join("/"))} GB RAM, ${esc(p.storage.join("/"))} GB</li>
      <li><b>Camera:</b> ${esc(p.rear)}; front ${esc(p.front)}; video ${esc(p.video)}</li>
      <li><b>Battery:</b> ${esc(p.battery)} mAh, ${esc(p.charging)}</li>
      <li><b>Build:</b> ${esc(p.build)}, ${esc(p.ip)}, ${esc(p.weight)} g</li>
      <li><b>OS:</b> ${esc(p.os)}</li>
    </ul></div></div>
    <div class="box pricebox"><div class="box-h">Market price*</div><div class="box-b">
      <div class="p">${fmtRp(p.price)}</div>
      <div class="note">*Indikatif pasar, pelengkap saja. Bukan harga resmi toko.</div>
      <hr><div class="note">Rating pengguna: <b>${esc(p.ratingAvg)}/5</b> (${p.userRatingsCount} vote server + basis ${Number(p.votes).toLocaleString ? "" : ""}${esc(p.votes.hit + p.votes.miss)} awal)</div>
      <div class="note">Hit ${hitPct}% (${p.votes.hit.toLocaleString("id-ID")}) / Miss ${100 - hitPct}%</div>
      <div class="meter"><i style="width:${hitPct}%"></i></div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <button class="btn small" id="vHit">Hit</button>
        <button class="btn small" id="vMiss">Miss</button>
        <select id="rateSel" style="padding:5px;border:1px solid #bdbdbd"><option value="">Rate...</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select>
      </div>
    </div></div>
  </div>
  <div class="box"><div class="box-h">Full specifications</div>
    <table class="spec">
      <tr class="group"><td colspan="2">Network and launch</td></tr>
      <tr><th>Network / SIM</th><td>${esc(p.network)} / ${esc(p.sim)}</td></tr>
      <tr><th>Announced / Status</th><td>${esc(p.announced)} / ${esc(p.status)}</td></tr>
      <tr class="group"><td colspan="2">Body</td></tr>
      <tr><th>Dimensions / Weight</th><td>${esc(p.thickness)} mm / ${esc(p.weight)} g — ${esc(p.build)}</td></tr>
      <tr><th>Protection / Auth</th><td>${esc(p.ip)} / NFC ${p.nfc ? "Yes" : "No"} / ${esc(p.fingerprint)}</td></tr>
      <tr><th>Audio</th><td>Stereo ${p.stereo ? "Yes" : "No"} / 3.5mm ${p.jack ? "Yes" : "No"}</td></tr>
      <tr class="group"><td colspan="2">Display</td></tr>
      <tr><th>Panel</th><td>${esc(p.displaySize)}&quot; ${esc(p.displayType)} (${esc(p.resolution)}), ${esc(p.refresh)} Hz</td></tr>
      <tr class="group"><td colspan="2">Platform</td></tr>
      <tr><th>Chipset / CPU / GPU</th><td>${esc(p.chipset)}<br>${esc(p.cpu)}<br>${esc(p.gpu)}</td></tr>
      <tr><th>Memory</th><td>${esc(p.ram.join(" / "))} GB RAM, ${esc(p.storage.join(" / "))} GB</td></tr>
      <tr><th>OS</th><td>${esc(p.os)}</td></tr>
      <tr class="group"><td colspan="2">Camera</td></tr>
      <tr><th>Rear</th><td>${esc(p.rear)}</td></tr>
      <tr><th>Front</th><td>${esc(p.front)}</td></tr>
      <tr><th>Video</th><td>${esc(p.video)}</td></tr>
      <tr class="group"><td colspan="2">Battery</td></tr>
      <tr><th>Capacity / Charging</th><td>${esc(p.battery)} mAh — ${esc(p.charging)} (lab: ${esc(p.batteryTest)} h active)</td></tr>
      <tr class="group"><td colspan="2">Benchmarks (lab)</td></tr>
      <tr><th>AnTuTu / Geekbench</th><td>${Number(p.antutu * 1000).toLocaleString("id-ID")} / Single ${Number(p.geekSingle).toLocaleString("id-ID")}, Multi ${Number(p.geekMulti).toLocaleString("id-ID")}</td></tr>
    </table>
  </div>
  <div class="cols" style="grid-template-columns:1fr 1fr">
    <div class="box"><div class="box-h">Strengths</div><div class="box-b"><ul>${p.pros.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
    <div class="box"><div class="box-h">Weaknesses</div><div class="box-b"><ul>${p.cons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
  </div>
  <div class="box"><div class="box-h">User reviews (${p.userReviews.length}) — stored server-side</div><div class="box-b">
    <div id="revList">${p.userReviews.length ? p.userReviews.map((r) => `<div class="review"><b>${esc(r.name)}</b> — ${esc(r.rating)}/5 <span class="note">${esc(r.date)}</span><br>${esc(r.text)}</div>`).join("") : `<p class="note">No reviews yet. Be the first.</p>`}</div>
    <div class="form" style="margin-top:10px">
      <input id="rvName" placeholder="Name (optional)">
      <select id="rvRating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Bad</option></select>
      <textarea id="rvText" rows="3" placeholder="Write factual experience: battery, camera, performance..."></textarea>
      <button class="btn primary" id="rvSend">Submit review (POST /api)</button>
    </div>
  </div></div>
  <div class="box"><div class="box-h">Similar devices</div>${sim.map(rowHTML).join("")}</div>
  ${footer()}`;
  bindRows(app);
  $("#vHit").onclick = async () => { await api(`/api/phones/${p.id}/vote`, { method: "POST", body: JSON.stringify({ type: "hit" }) }); render(); };
  $("#vMiss").onclick = async () => { await api(`/api/phones/${p.id}/vote`, { method: "POST", body: JSON.stringify({ type: "miss" }) }); render(); };
  $("#rateSel").onchange = async (e) => { if (!e.target.value) return; await api(`/api/phones/${p.id}/rating`, { method: "POST", body: JSON.stringify({ value: Number(e.target.value) }) }); render(); };
  $("#rvSend").onclick = async () => {
    const name = $("#rvName").value, rating = $("#rvRating").value, text = $("#rvText").value;
    if (text.trim().length < 4) { alert("Review too short."); return; }
    await api(`/api/phones/${p.id}/reviews`, { method: "POST", body: JSON.stringify({ name, rating, text }) });
    render();
  };
}

/* ---------- COMPARE ---------- */
function getCmp() { try { return JSON.parse(localStorage.getItem("pa_cmp") || "[]"); } catch { return []; } }
function setCmp(a) { localStorage.setItem("pa_cmp", JSON.stringify(a)); }
async function vCompare(app) {
  const ids = getCmp();
  const { data: br } = await api("/api/brands");
  const all = (await api("/api/phones?sort=popularity")).data;
  let tbl = `<p class="note" style="padding:10px">Select up to 3 devices.</p>`;
  if (ids.length) {
    const { data } = await api("/api/compare?ids=" + ids.join(","));
    const rows = [
      ["Display", (p) => `${p.displaySize}" ${p.displayType}`],
      ["Chipset", (p) => p.chipset],
      ["RAM / Storage", (p) => `${Math.max(...p.ram)} GB / ${Math.max(...p.storage)} GB`],
      ["Rear camera", (p) => p.rear],
      ["Battery", (p) => `${p.battery} mAh — ${p.charging}`],
      ["Weight / Thickness", (p) => `${p.weight} g / ${p.thickness} mm`],
      ["AnTuTu", (p) => Number(p.antutu * 1000).toLocaleString("id-ID")],
      ["Market price*", (p) => fmtRp(p.price)],
    ];
    tbl = `<div style="overflow:auto"><table class="cmp"><tr><td class="lbl">Device</td>${data.map((p) => `<th>${esc(p.name)}<br><span class="note">${esc(p.chipset.split("(")[0])}</span></th>`).join("")}</tr>
      ${rows.map(([l, fn]) => `<tr><td class="lbl">${l}</td>${data.map((p) => `<td>${esc(fn(p))}</td>`).join("")}</tr>`).join("")}</table></div>`;
  }
  app.innerHTML = `<div class="crumb"><a href="#/">Home</a> / Compare</div>
  <h1 class="page">Compare (${ids.length}/3)</h1>
  <p class="sub">Specification-first comparison. Price shown last, indicative only.</p>
  <div class="box"><div class="box-h">Select devices</div><div class="box-b">
    ${all.map((p) => `<label style="display:inline-block;margin:0 12px 6px 0;font-size:13px"><input type="checkbox" data-pick="${p.id}" ${ids.includes(p.id) ? "checked" : ""}> ${esc(p.name)}</label>`).join("")}
    <div style="margin-top:8px"><button class="btn small" id="cClear">Clear</button></div>
  </div></div>
  <div class="box"><div class="box-h">Comparison table — GET /api/compare</div>${tbl}</div>${footer()}`;
  app.querySelectorAll("[data-pick]").forEach((c) => (c.onchange = () => {
    let cur = getCmp();
    if (c.checked) { if (cur.length >= 3) { alert("Max 3."); c.checked = false; return; } cur.push(c.getAttribute("data-pick")); }
    else cur = cur.filter((x) => x !== c.getAttribute("data-pick"));
    setCmp(cur); render();
  }));
  const cl = $("#cClear"); if (cl) cl.onclick = () => { setCmp([]); render(); };
}

/* ---------- NEWS ---------- */
async function vNews(app) {
  const { data } = await api("/api/news");
  app.innerHTML = `<div class="crumb"><a href="#/">Home</a> / News</div>
  <h1 class="page">News</h1><p class="sub">Via GET /api/news.</p>
  <div class="box"><div class="box-h">${data.length} articles</div>
  ${data.map((n) => `<div class="newsitem"><div class="k">${esc(n.tag)} — ${esc(n.date)} &middot; ${esc(n.read)}</div><h3>${esc(n.title)}</h3><div style="font-size:13.5px;color:#424242">${esc(n.desc)}</div></div>`).join("")}</div>
  ${footer()}`;
}

function bindRows(scope) {
  scope.querySelectorAll("[data-go]").forEach((el) => (el.onclick = () => (location.hash = "#/hp/" + el.getAttribute("data-go"))));
  scope.querySelectorAll("[data-cmp]").forEach((b) => (b.onclick = (e) => {
    e.stopPropagation();
    let cur = getCmp(); const id = b.getAttribute("data-cmp");
    if (!cur.includes(id)) { if (cur.length >= 3) { alert("Max 3. Clear compare first."); return; } cur.push(id); setCmp(cur); }
    location.hash = "#/banding";
  }));
}

/* search */
const qI = $("#q"), sug = $("#suggest");
let deb = null;
qI.addEventListener("input", () => {
  clearTimeout(deb);
  deb = setTimeout(async () => {
    const q = qI.value.trim();
    if (q.length < 2) { sug.style.display = "none"; return; }
    try {
      const r = await api("/api/phones?q=" + encodeURIComponent(q));
      const top = r.data.slice(0, 6);
      sug.innerHTML = top.length ? top.map((p) => `<div data-s="${p.id}"><b>${esc(p.name)}</b> <span class="note">${esc(p.chipset.split("(")[0])}</span></div>`).join("") : `<div>No match</div>`;
      sug.style.display = "block";
      sug.querySelectorAll("[data-s]").forEach((d) => (d.onclick = () => { sug.style.display = "none"; qI.value = ""; location.hash = "#/hp/" + d.getAttribute("data-s"); }));
    } catch { /* ignore */ }
  }, 200);
});
document.addEventListener("click", (e) => { if (!e.target.closest(".searchwrap")) sug.style.display = "none"; });
$("#qBtn").onclick = () => { location.hash = "#/finder"; setTimeout(() => { const f = $("#fQ"); if (f) { f.value = qI.value; $("#fGo").click(); } }, 300); };

render();
