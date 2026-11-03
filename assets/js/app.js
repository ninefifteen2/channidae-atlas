/* 鳢科图谱 · Channidae Atlas — app logic */
(function () {
  "use strict";

  var DATA = window.ATLAS || { species: [] };
  var SPECIES = DATA.species.slice();
  var TRADE = (DATA.trade || []).slice();
  var ALL = SPECIES.concat(TRADE);
  var IUCN = {
    LC: ["无危", "Least Concern"], NT: ["近危", "Near Threatened"],
    VU: ["易危", "Vulnerable"], EN: ["濒危", "Endangered"],
    CR: ["极危", "Critically Endangered"], DD: ["数据缺乏", "Data Deficient"],
    NE: ["未评估", "Not Evaluated"], EW: ["野外灭绝", "Extinct in the Wild"],
    EX: ["灭绝", "Extinct"]
  };
  var THREAT = { CR: 0, EN: 1, VU: 2, NT: 3, LC: 4, DD: 5, NE: 6, EW: 7, EX: 8 };

  var state = {
    q: "", genus: "all", region: "all", iucn: "all",
    photoOnly: false, sort: "name",
    filtered: [], collapsed: {}, modalList: [], modalIndex: -1
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(id) { for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i]; return null; }
  function fmtSize(s) { return s == null || s === "" ? "—" : (Math.round(s * 10) / 10) + " cm"; }
  function zhName(sp) { return sp.zh || sp.sci; }
  function isThreat(code) { return code === "VU" || code === "EN" || code === "CR"; }

  /* ---------------- filtering ---------------- */
  function matches(sp) {
    if (state.genus !== "all" && sp.genus !== state.genus) return false;
    if (state.region !== "all" && (sp.regions || []).indexOf(state.region) < 0) return false;
    if (state.iucn === "threatened" && !isThreat(sp.iucn)) return false;
    if (state.iucn !== "all" && state.iucn !== "threatened" && sp.iucn !== state.iucn) return false;
    if (state.photoOnly && !sp.img) return false;
    var q = state.q.trim().toLowerCase();
    if (q) {
      var hay = [sp.zh, sp.sci, sp.en, (sp.alias || []).join(" "), sp.author].join(" ").toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  }
  function sortList(list) {
    var s = state.sort;
    return list.sort(function (a, b) {
      if (s === "size-desc" || s === "size-asc") {
        var av = a.size == null ? -1 : a.size, bv = b.size == null ? -1 : b.size;
        if (av === -1 && bv !== -1) return 1;
        if (bv === -1 && av !== -1) return -1;
        return s === "size-desc" ? bv - av : av - bv;
      }
      if (s === "iucn") {
        var d = (THREAT[a.iucn] == null ? 9 : THREAT[a.iucn]) - (THREAT[b.iucn] == null ? 9 : THREAT[b.iucn]);
        return d !== 0 ? d : a.sci.localeCompare(b.sci);
      }
      return a.sci.localeCompare(b.sci);
    });
  }
  function applyFilters() {
    state.filtered = sortList(SPECIES.filter(matches));
    renderCards();
    renderTree();
    var n = state.filtered.length;
    $("#result-count").textContent = n;
    $("#result-note").textContent = n === SPECIES.length ? "" : "（共 " + SPECIES.length + " 种）";
    $("#empty-state").hidden = n !== 0;
    $("#cards").hidden = n === 0;
    syncHash();
  }

  /* ---------------- cards ---------------- */
  function iucnTag(code) {
    var label = IUCN[code] ? IUCN[code][0] : "未评估";
    return '<span class="card-tag"><i class="iucn-dot"></i>' + code + " " + label + "</span>";
  }
  function cardHTML(sp) {
    var genusClass = sp.genus === "Parachanna" ? " parachanna" : "";
    var fig;
    if (sp.img) {
      var alt = zhName(sp) + " " + sp.sci;
      fig = '<span class="card-figure">' +
        '<span class="card-genus' + genusClass + '">' + esc(sp.genus) + "</span>" +
        '<img src="' + esc(sp.img.card) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">' +
        (sp.iucn && sp.iucn !== "NE" ? iucnTag(sp.iucn) : "") +
        "</span>";
    } else {
      fig = '<span class="card-figure">' +
        '<span class="card-genus' + genusClass + '">' + esc(sp.genus) + "</span>" +
        '<span class="card-photo-none">' +
        '<svg viewBox="0 0 120 50" aria-hidden="true"><path d="M8 26c12-15 34-18 48-8l14-9-3 15 3 14-14-8c-14 9-36 7-48-4z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="22" cy="23" r="1.8" fill="currentColor"/></svg>' +
        "<span>暂无开放影像</span></span></span>";
    }
    var zh = sp.zh
      ? '<span class="card-zh">' + esc(sp.zh) + (sp.zh_t ? '<span class="aster">*</span>' : "") + "</span>"
      : '<span class="card-zh"><span class="none">' + esc(sp.sci) + "</span></span>";
    var latin = sp.zh ? '<span class="card-latin">' + esc(sp.sci) + "</span>" : '<span class="card-latin">' + esc(sp.en || "") + "</span>";
    var region = (sp.regions || [])[0] || "—";
    return '<button type="button" class="card" data-id="' + esc(sp.id) + '" aria-label="查看 ' + esc(zhName(sp)) + " " + esc(sp.sci) + '">' +
      fig +
      '<span class="card-body">' + zh + latin +
      '<span class="card-meta"><span class="size">' + fmtSize(sp.size) + "</span>" +
      '<span class="sep"></span><span class="iucn ' + esc(sp.iucn) + '"><i></i>' + esc(region) + "</span></span>" +
      "</span></button>";
  }
  function renderCards() {
    $("#cards").innerHTML = state.filtered.map(cardHTML).join("");
    renderTrade();
    observeCards();
  }

  function tradeCardHTML(sp) {
    return '<button type="button" class="card trade-card" data-id="' + esc(sp.id) + '" aria-label="查看 ' + esc(zhName(sp)) + " " + esc(sp.sci) + '">' +
      '<span class="card-figure">' +
      '<span class="card-genus">' + esc(sp.genus) + "</span>" +
      (sp.img ? '<img src="' + esc(sp.img.card) + '" alt="' + esc(zhName(sp) + " " + sp.sci) + '" loading="lazy" decoding="async">' : "") +
      '<span class="card-tag trade-tag">未定种</span>' +
      "</span>" +
      '<span class="card-body"><span class="card-zh">' + esc(sp.zh) + "</span>" +
      '<span class="card-latin">' + esc(sp.sci) + "</span>" +
      '<span class="card-meta"><span class="iucn ' + esc(sp.iucn) + '"><i></i>' + esc((sp.regions || [])[0] || "—") + " · 未定种</span></span></span></button>";
  }
  function renderTrade() {
    var block = $("#trade-block");
    if (!block) return;
    var filtering = state.q.trim() !== "" || state.genus !== "all" || state.region !== "all" ||
      state.iucn !== "all" || state.photoOnly;
    if (!TRADE.length || filtering) { block.hidden = true; return; }
    block.hidden = false;
    $("#trade-cards").innerHTML = TRADE.map(tradeCardHTML).join("");
  }

  var cardObserver = null;
  function observeCards() {
    if (!("IntersectionObserver" in window)) {
      $$(".card").forEach(function (c) { c.classList.add("is-in"); });
      return;
    }
    if (cardObserver) cardObserver.disconnect();
    cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); cardObserver.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$(".card").forEach(function (c) { cardObserver.observe(c); });
  }

  /* ---------------- tree ---------------- */
  var TREE = { row: 30, top: 40, bottom: 30, width: 1180, x: [52, 240, 600], labelX: 624, sizeX: 1140 };

  function treeData() {
    var root = {
      id: "channidae", rank: "family", zh: "鳢科", sci: "Channidae",
      children: [
        { id: "genus-Parachanna", rank: "genus", genus: "Parachanna", zh: "副鳢属", sci: "Parachanna", children: [] },
        { id: "genus-Channa", rank: "genus", genus: "Channa", zh: "鳢属", sci: "Channa", children: [] }
      ]
    };
    var map = { Channa: root.children[1], Parachanna: root.children[0] };
    state.filtered.forEach(function (sp) {
      map[sp.genus].children.push({
        id: sp.id, rank: "species", zh: sp.zh, sci: sp.sci, sp: sp
      });
    });
    root.children.forEach(function (g) {
      g.children.sort(function (a, b) { return a.sci.localeCompare(b.sci); });
    });
    return root;
  }

  function renderTree() {
    var svg = $("#tree-svg");
    var root = treeData();
    var y = TREE.top;
    var rows = [];
    var first = true;

    root.y = 104;
    root.children.forEach(function (g) {
      if (!g.children.length) return;
      y += first ? 34 : 48;
      g.y = y;
      first = false;
      if (state.collapsed[g.id]) {
        y += 30;
        rows.push({ node: g, collapsed: true });
      } else {
        var sy = y + 36;
        g.children.forEach(function (sp) {
          sp.y = sy;
          sy += TREE.row;
          rows.push({ node: sp, collapsed: false });
        });
        y = sy + 12;
      }
    });

    var total = y + 26;
    var active = root.children.filter(function (g) { return g.children.length; });
    if (!active.length) {
      svg.innerHTML = "";
      $("#tree-empty").hidden = false;
      svg.setAttribute("height", "0");
      return;
    }
    $("#tree-empty").hidden = true;

    var parts = [];
    function link(px, py, cx, cy, genus, hot) {
      var mx = cx - 34;
      var s = cy > py ? 1 : -1;
      var d = "M" + px + " " + py + " H" + (mx - 7) +
        " Q" + mx + " " + py + " " + mx + " " + (py + 7 * s) +
        " V" + (cy - 7 * s) + " Q" + mx + " " + cy + " " + (mx + 7) + " " + cy +
        " H" + cx;
      return '<path class="tree-link ' + (genus ? "genus " : "") + (hot ? "is-hot" : "") + '" d="' + d + '"/>';
    }

    root.children.forEach(function (g) {
      if (!g.children.length) return;
      parts.push(link(TREE.x[0], root.y, TREE.x[1], g.y, true));
    });

    root.children.forEach(function (g) {
      if (!g.children.length) return;
      var color = g.genus === "Channa" ? "#b9cdb9" : "#e0a15c";
      var hot = state.q && g.children.some(function (c) { return c.sp && hit(c.sp); });
      if (!state.collapsed[g.id]) {
        g.children.forEach(function (sp) {
          var h = state.q && hit(sp.sp);
          parts.push(link(TREE.x[1], g.y, TREE.x[2], sp.y, false, h));
        });
      }
      var totalGenus = SPECIES.filter(function (x) { return x.genus === g.genus; }).length;
      var countText = g.children.length === totalGenus
        ? totalGenus + " 种"
        : g.children.length + " / " + totalGenus + " 种";
      parts.push('<g class="tree-node genus" data-node="' + g.id + '" role="treeitem" aria-expanded="' + (!state.collapsed[g.id]) + '">' +
        '<circle cx="' + TREE.x[1] + '" cy="' + g.y + '" r="5" stroke="' + color + '"/>' +
        '<text x="' + (TREE.x[1] + 18) + '" y="' + (g.y - 12) + '">' +
        '<tspan class="tree-genus-zh">' + esc(g.zh) + '</tspan><tspan dx="9" class="tree-genus-sci">' + esc(g.sci) + "</tspan>" +
        '<tspan dx="10" class="tree-count">' + countText + " · " + (g.genus === "Channa" ? "亚洲" : "非洲") + (state.collapsed[g.id] ? " · 已折叠" : "") + "</tspan></text>" +
        "</g>");
    });

    root.children.forEach(function (g) {
      if (!g.children.length || state.collapsed[g.id]) return;
      g.children.forEach(function (sp) {
        var h = state.q && hit(sp.sp);
        var label;
        if (sp.zh) {
          label = '<tspan class="tree-zh">' + esc(sp.zh) + (sp.sp.zh_t ? "*" : "") + '</tspan><tspan dx="9" class="tree-sci">' + esc(sp.sci) + "</tspan>";
        } else {
          label = '<tspan class="tree-sci" style="font-size:13px;fill:rgba(241,232,214,.88)">' + esc(sp.sci) + "</tspan>";
        }
        parts.push('<g class="tree-row' + (h ? " is-hot" : "") + '" data-node="' + sp.id + '" role="treeitem">' +
          '<circle cx="' + TREE.x[2] + '" cy="' + sp.y + '" r="2.8" fill="#15251f" stroke="' + (sp.sp.genus === "Channa" ? "#b9cdb9" : "#e0a15c") + '" stroke-width="1.2"/>' +
          '<text x="' + TREE.labelX + '" y="' + (sp.y + 4.5) + '">' + label + "</text>" +
          '<text class="tree-size" x="' + TREE.sizeX + '" y="' + (sp.y + 4) + '" text-anchor="end">' + fmtSize(sp.sp.size) + "</text>" +
          "</g>");
      });
    });

    parts.push('<g class="tree-root">' +
      '<circle cx="' + TREE.x[0] + '" cy="' + root.y + '" r="7" fill="#15251f" stroke="#d3ab6a" stroke-width="1.4"/>' +
      '<text x="' + (TREE.x[0] - 16) + '" y="' + (root.y - 40) + '" class="tree-root-zh">鳢科</text>' +
      '<text x="' + (TREE.x[0] - 16) + '" y="' + (root.y - 22) + '" class="tree-root-sci">CHANNIDAE · 57 SPP.</text>' +
      "</g>");

    svg.setAttribute("viewBox", "0 0 " + TREE.width + " " + total);
    svg.setAttribute("width", TREE.width);
    svg.setAttribute("height", total);
    svg.innerHTML = parts.join("");
  }

  function hit(sp) {
    var q = state.q.trim().toLowerCase();
    if (!q) return false;
    return [sp.zh, sp.sci, sp.en, (sp.alias || []).join(" ")].join(" ").toLowerCase().indexOf(q) >= 0;
  }

  $("#tree-svg").addEventListener("click", function (e) {
    var node = e.target.closest("[data-node]");
    if (!node) return;
    var id = node.getAttribute("data-node");
    if (id.indexOf("genus-") === 0) {
      state.collapsed[id] = !state.collapsed[id];
      renderTree();
    } else {
      openModal(id);
    }
  });
  $("#tree-expand").addEventListener("click", function () { state.collapsed = {}; renderTree(); });
  $("#tree-collapse").addEventListener("click", function () {
    state.collapsed = { "genus-Channa": true, "genus-Parachanna": true };
    renderTree();
  });

  /* ---------------- modal ---------------- */
  var modal = $("#modal");
  var lastFocus = null;

  function openModal(id, list) {
    var sp = byId(id);
    if (!sp) return;
    state.modalList = list && list.length ? list : state.filtered;
    state.modalIndex = state.modalList.findIndex(function (s) { return s.id === id; });
    if (state.modalIndex < 0) { state.modalList = [sp]; state.modalIndex = 0; }
    fillModal(sp);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    lastFocus = document.activeElement;
    if (history.replaceState) history.replaceState(null, "", "#sp=" + sp.id);
    setTimeout(function () { $(".modal-close").focus(); }, 30);
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (location.hash.indexOf("#sp=") === 0 && history.replaceState) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocus) lastFocus.focus();
  }
  function stepModal(dir) {
    if (!state.modalList.length) return;
    state.modalIndex = (state.modalIndex + dir + state.modalList.length) % state.modalList.length;
    fillModal(state.modalList[state.modalIndex]);
  }
  function fillModal(sp) {
    var img = $("#modal-img");
    if (sp.img) {
      img.src = sp.img.full;
      img.alt = zhName(sp) + " " + sp.sci;
      img.style.display = "";
    } else {
      img.src = "assets/img/placeholder.svg";
      img.alt = zhName(sp) + " 暂无影像";
      img.style.display = "";
    }
    $("#modal-credit").innerHTML = sp.img
      ? "摄影 / 图像：" + esc(sp.img.credit.artist) + " · " +
        (sp.img.credit.license_url
          ? '<a href="' + esc(sp.img.credit.license_url) + '" target="_blank" rel="noopener">' + esc(sp.img.credit.license) + "</a>"
          : esc(sp.img.credit.license)) +
        (sp.img.credit.page
          ? ' · <a href="' + esc(sp.img.credit.page) + '" target="_blank" rel="noopener">' + esc(sp.img.credit.source) + "</a>"
          : " · " + esc(sp.img.credit.source))
      : "暂无开放版权影像 · 该种仅有模式描述或极少野外记录";

    var code = sp.iucn || "NE";
    var iucnLabel = (IUCN[code] || IUCN.NE)[0];
    var facts;
    if (sp.undetermined) {
      facts = [
        ["中文名", esc(sp.zh)],
        ["英文名", sp.en ? esc(sp.en) : "—"],
        ["分类地位", "未定种（水族贸易型），尚无正式学名"],
        ["分布", esc(sp.dist_zh || "—")],
        ["栖息环境", esc([sp.water, sp.zone].filter(Boolean).join(" · ") || "—")]
      ];
    } else {
      facts = [
        ["中文名", sp.zh ? esc(sp.zh) + (sp.zh_t ? ' <span class="mark-trans">*</span>' : "") : "暂无通用中文名"],
        ["英文名", sp.en ? esc(sp.en) : "—"],
        ["最大体长", fmtSize(sp.size)],
        ["IUCN 等级", '<span class="iucn-badge ' + esc(code) + '"><i></i>' + code + " " + iucnLabel + (sp.iucn_date ? " · " + esc(sp.iucn_date) : "") + "</span>"],
        ["分布", esc(sp.dist_zh || "—")],
        ["栖息环境", esc([sp.water, sp.zone].filter(Boolean).join(" · ") || "—")]
      ];
    }
    if (sp.alias && sp.alias.length) facts.splice(1, 0, ["俗名", esc(sp.alias.join("、"))]);

    var morph = [];
    if (sp.dorsal) morph.push(["背鳍软条", sp.dorsal]);
    if (sp.anal) morph.push(["臀鳍软条", sp.anal]);
    if (sp.pectoral) morph.push(["胸鳍软条", sp.pectoral]);
    if (sp.ll) morph.push(["侧线鳞", sp.ll]);
    if (sp.vert) morph.push(["脊椎骨", sp.vert]);
    if (sp.body) morph.push(["体形", sp.body]);

    var path = 'Animalia › Chordata › Actinopterygii › Anabantiformes › <em>Channidae</em> › <em>' +
      esc(sp.genus) + "</em> › " + esc(sp.epithet);

    $("#modal-body").innerHTML =
      '<p class="modal-kicker"><i></i>' + esc(sp.genus.toUpperCase()) + " · " + (sp.genus === "Channa" ? "鳢属" : "副鳢属") + "</p>" +
      '<h2 id="modal-title">' + esc(sp.zh || sp.sci) + "</h2>" +
      '<p class="modal-latin">' + esc(sp.sci) + "</p>" +
      '<p class="modal-author">' + esc(sp.author || "") + "</p>" +
      (sp.en ? '<p class="modal-en">' + esc(sp.en) + "</p>" : "") +
      '<p class="modal-path">' + path + "</p>" +
      '<dl class="modal-facts">' + facts.map(function (f) {
        return '<div class="modal-fact' + (f[0] === "栖息环境" ? " wide" : "") + '"><dt>' + f[0] + "</dt><dd>" + f[1] + "</dd></div>";
      }).join("") + "</dl>" +
      (morph.length
        ? '<div class="modal-section"><h3>形态特征 · Morphology</h3><ul class="morph-list">' +
          morph.map(function (m) { return "<li>" + m[0] + "<b>" + esc(m[1]) + "</b></li>"; }).join("") + "</ul></div>"
        : "") +
      (sp.bio_en
        ? '<div class="modal-section"><h3>生物学 · Biology（FishBase 原文）</h3><p>' + esc(sp.bio_en) + "</p></div>"
        : "") +
      (sp.morph_en
        ? '<div class="modal-section"><h3>原始描述摘录</h3><p>' + esc(sp.morph_en) + "</p></div>"
        : "") +
      (sp.note
        ? '<div class="modal-section"><h3>分类说明 · Note</h3><p>' + esc(sp.note) + "</p></div>"
        : "") +
      '<div class="modal-links">' +
      (sp.fb ? '<a href="' + esc(sp.fb) + '" target="_blank" rel="noopener">FishBase 物种页 ↗</a>' : "") +
      (sp.img && sp.img.credit.page ? '<a href="' + esc(sp.img.credit.page) + '" target="_blank" rel="noopener">图像原始页面 ↗</a>' : "") +
      '<a href="#species" data-close>返回图鉴</a>' +
      "</div>";

    $("#modal").querySelector(".modal-media").scrollTop = 0;
    $("#modal-body").scrollTop = 0;
    $("#modal-prev").style.display = state.modalList.length > 1 ? "" : "none";
    $("#modal-next").style.display = state.modalList.length > 1 ? "" : "none";
  }

  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) { e.preventDefault(); closeModal(); return; }
    if (e.target.closest("#modal-prev")) { stepModal(-1); return; }
    if (e.target.closest("#modal-next")) { stepModal(1); }
  });
  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") stepModal(-1);
    if (e.key === "ArrowRight") stepModal(1);
  });

  $("#cards").addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (card) openModal(card.getAttribute("data-id"), state.filtered);
  });
  $("#trade-cards").addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (card) openModal(card.getAttribute("data-id"), TRADE);
  });

  /* ---------------- filters UI ---------------- */
  function setChip(group, value) {
    $$('.chips[data-filter="' + group + '"] .chip').forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-value") === value);
    });
  }
  $$(".chips").forEach(function (box) {
    box.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      var group = box.getAttribute("data-filter");
      var val = chip.getAttribute("data-value");
      state[group] = val;
      setChip(group, val);
      applyFilters();
    });
  });

  var searchTimer = null;
  $("#search").addEventListener("input", function (e) {
    state.q = e.target.value;
    $("#search-clear").hidden = !state.q;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 140);
  });
  $("#search-clear").addEventListener("click", function () {
    $("#search").value = ""; state.q = ""; this.hidden = true; applyFilters(); $("#search").focus();
  });
  $("#photo-only").addEventListener("change", function (e) { state.photoOnly = e.target.checked; applyFilters(); });
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; applyFilters(); });
  $("#reset-filters").addEventListener("click", function () {
    state.q = ""; state.genus = "all"; state.region = "all"; state.iucn = "all"; state.photoOnly = false;
    $("#search").value = ""; $("#search-clear").hidden = true; $("#photo-only").checked = false;
    setChip("genus", "all"); setChip("region", "all"); setChip("iucn", "all");
    applyFilters();
  });

  function fillCounts() {
    var t = SPECIES.filter(function (s) { return isThreat(s.iucn); }).length;
    var lc = SPECIES.filter(function (s) { return s.iucn === "LC"; }).length;
    var nt = SPECIES.filter(function (s) { return s.iucn === "NT"; }).length;
    var ne = SPECIES.filter(function (s) { return s.iucn === "NE"; }).length;
    var map = { threatened: t, LC: lc, NT: nt, NE: ne };
    $$("[data-count]").forEach(function (el) { el.textContent = map[el.getAttribute("data-count")] || ""; });
  }

  /* ---------------- hash / nav ---------------- */
  function syncHash() {
    if (state.q) {
      history.replaceState(null, "", "#q=" + encodeURIComponent(state.q));
    } else if (location.hash.indexOf("#q=") === 0) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }
  function readHash() {
    var m = location.hash.match(/^#q=(.+)$/);
    if (m) {
      state.q = decodeURIComponent(m[1]);
      $("#search").value = state.q;
      $("#search-clear").hidden = false;
    }
  }

  function navSpy() {
    var links = $$(".site-nav a");
    var sections = links.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  function revealOnScroll() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    $$(".section-head, .fact-panel, .diagnosis li, .about-block").forEach(function (el) {
      el.classList.add("reveal"); io.observe(el);
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    if (DATA.hero && DATA.hero.credit) {
      $("#hero-caption").textContent = "封面：" + DATA.hero.credit;
    }
    var qp = new URLSearchParams(location.search);
    if (qp.get("q")) {
      state.q = qp.get("q");
      $("#search").value = state.q;
      $("#search-clear").hidden = false;
    }
    readHash();
    fillCounts();
    applyFilters();
    navSpy();
    var m = location.hash.match(/^#sp=(.+)$/);
    if (m) setTimeout(function () { openModal(decodeURIComponent(m[1])); }, 60);
    if (qp.get("sp")) setTimeout(function () { openModal(qp.get("sp")); }, 80);
    if (qp.get("go")) {
      setTimeout(function () {
        var el = document.getElementById(qp.get("go"));
        if (el) {
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, el.offsetTop - 70);
        }
      }, 260);
    }
  }
  init();
})();
