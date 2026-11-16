(function () {
  "use strict";

  var USER = "rillis";

  // Repositórios em destaque (ordem de exibição). O texto é opcional:
  // sem ele, usa a descrição do GitHub.
  var FEATURED = [
    { name: "enigma" },
    { name: "chess", text: "Xadrez em Java." },
    { name: "minesweeper", text: "Campo minado em Java." },
    { name: "shared-clipboard" },
    { name: "aps6-facerecognition" },
    { name: "includeplus" }
  ];

  // Repositórios que não aparecem na lista (ex.: o README do perfil)
  var HIDDEN = ["rillis"];

  var COLORS = {
    "Java": "#b07219", "Python": "#3572A5", "HTML": "#e34c26", "JavaScript": "#f1e05a",
    "TypeScript": "#3178c6", "PHP": "#4F5D95", "CSS": "#563d7c", "Batchfile": "#C1F12E",
    "Jupyter Notebook": "#DA5B0B", "VBA": "#867db1", "Shell": "#89e051", "C": "#555555",
    "C++": "#f34b7d", "C#": "#178600", "Go": "#00ADD8", "Rust": "#dea584", "Kotlin": "#A97BFF",
    "Markdown": "#083fa1"
  };

  var state = { repos: [], lang: null, sort: "created", q: "" };
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- util ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function langOf(r) { return r.language || "Markdown"; }
  function color(lang) { return COLORS[lang] || "var(--faint)"; }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "").replace(" de ", " ");
  }
  function ago(iso) {
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (d < 1) return "hoje";
    if (d < 30) return d + "d";
    if (d < 365) return Math.floor(d / 30) + "m";
    return Math.floor(d / 365) + "a";
  }
  var ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  // ---------- tema ----------
  $("ano-atual").textContent = new Date().getFullYear();
  $("theme-toggle").addEventListener("click", function () {
    var cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------- dados (cache de 10 min na sessão para poupar a API) ----------
  function load() {
    var KEY = "repos-cache-v1";
    try {
      var c = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (c && Date.now() - c.t < 600000) return Promise.resolve(c.d);
    } catch (e) {}
    return fetch("https://api.github.com/users/" + USER + "/repos?per_page=100&sort=created")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        var slim = data.map(function (r) {
          return {
            name: r.name, description: r.description, html_url: r.html_url, homepage: r.homepage,
            language: r.language, topics: r.topics || [], stars: r.stargazers_count,
            fork: r.fork, archived: r.archived, created_at: r.created_at, pushed_at: r.pushed_at
          };
        });
        try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: slim })); } catch (e) {}
        return slim;
      });
  }

  // ---------- render ----------
  function renderStats() {
    var repos = state.repos;
    var counts = {};
    repos.forEach(function (r) { var l = langOf(r); counts[l] = (counts[l] || 0) + 1; });
    var langs = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    var first = repos.reduce(function (m, r) { return r.created_at < m ? r.created_at : m; }, repos[0].created_at);
    var last = repos.reduce(function (m, r) { return r.pushed_at > m ? r.pushed_at : m; }, repos[0].pushed_at);

    $("s-repos").textContent = repos.length;
    $("s-langs").textContent = langs.length;
    $("s-since").textContent = new Date(first).getFullYear();
    $("s-last").textContent = ago(last);
    $("s-last").parentNode.title = new Date(last).toLocaleString("pt-BR");

    var pct = function (l) { return Math.round(counts[l] / repos.length * 100); };
    $("langbar").innerHTML = langs.map(function (l) {
      return '<i data-lang="' + esc(l) + '" style="flex:' + counts[l] + ';background:' + color(l) + '" title="' +
        esc(l) + " · " + counts[l] + " repos (" + pct(l) + '%)"></i>';
    }).join("");
    $("legend").innerHTML = langs.map(function (l) {
      return '<button type="button" data-lang="' + esc(l) + '" title="Filtrar ' + esc(l) + ' no arquivo"><span class="dot" style="background:' +
        color(l) + '"></span>' + esc(l) + ' <span class="n">' + (pct(l) || "<1") + "%</span></button>";
    }).join("");

    $("chips").innerHTML =
      '<button type="button" class="chip" data-lang="" aria-pressed="true">todas <span class="n">' + repos.length + "</span></button>" +
      langs.map(function (l) {
        return '<button type="button" class="chip" data-lang="' + esc(l) + '" aria-pressed="false"><span class="dot" style="background:' +
          color(l) + '"></span>' + esc(l) + ' <span class="n">' + counts[l] + "</span></button>";
      }).join("");
  }

  function renderFeatured() {
    var byName = {};
    state.repos.forEach(function (r) { byName[r.name.toLowerCase()] = r; });
    var html = FEATURED.map(function (f) {
      var r = byName[f.name.toLowerCase()];
      if (!r) return "";
      var l = langOf(r);
      return '<a class="card" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">' +
        '<div class="top"><span class="lang"><span class="dot" style="background:' + color(l) + '"></span>' + esc(l) + "</span>" + ARROW + "</div>" +
        "<h3>" + esc(r.name) + "</h3>" +
        "<p>" + esc(f.text || r.description || "Sem descrição.") + "</p>" +
        '<div class="top"><span>' + new Date(r.created_at).getFullYear() + "</span></div>" +
        "</a>";
    }).join("");
    $("featured").innerHTML = html;
    $("destaques").hidden = !html;
  }

  function groupKey(r) {
    if (state.sort === "name") return r.name.charAt(0).toUpperCase();
    return String(new Date(state.sort === "pushed" ? r.pushed_at : r.created_at).getFullYear());
  }

  function renderList() {
    var q = state.q.trim().toLowerCase();
    var items = state.repos.filter(function (r) {
      if (state.lang && langOf(r) !== state.lang) return false;
      if (!q) return true;
      return (r.name + " " + (r.description || "") + " " + langOf(r) + " " + r.topics.join(" ")).toLowerCase().indexOf(q) !== -1;
    });

    items.sort(function (a, b) {
      if (state.sort === "name") return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
      var k = state.sort === "pushed" ? "pushed_at" : "created_at";
      return b[k] < a[k] ? -1 : b[k] > a[k] ? 1 : 0;
    });

    $("count").textContent = items.length + (items.length === 1 ? " repo" : " repos");

    if (!items.length) {
      $("list").innerHTML = '<div class="empty">nada encontrado para essa busca.</div>';
      return;
    }

    var groups = [], cur = null;
    items.forEach(function (r) {
      var k = groupKey(r);
      if (!cur || cur.key !== k) { cur = { key: k, items: [] }; groups.push(cur); }
      cur.items.push(r);
    });

    var dateKey = state.sort === "pushed" ? "pushed_at" : "created_at";
    $("list").innerHTML = groups.map(function (g) {
      return '<div class="year"><h3>' + esc(g.key) + "</h3><ul>" + g.items.map(function (r) {
        var l = langOf(r);
        var badges = (r.fork ? '<span class="badge">fork</span>' : "") + (r.archived ? '<span class="badge">arquivado</span>' : "") +
          (r.stars ? '<span class="badge">★ ' + r.stars + "</span>" : "");
        var tags = r.topics.length ? '<span class="tags">' + r.topics.slice(0, 5).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</span>" : "";
        return '<li><a class="row" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">' +
          "<span><span class=\"name\">" + esc(r.name) + "</span>" + badges +
          '<span class="desc">' + esc(r.description || "—") + "</span>" + tags + "</span>" +
          '<span class="lang"><span class="dot" style="background:' + color(l) + '"></span>' + esc(l) + "</span>" +
          '<span class="meta date">' + fmtDate(r[dateKey]) + "</span>" +
          "</a></li>";
      }).join("") + "</ul></div>";
    }).join("");
  }

  // ---------- eventos ----------
  $("chips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    var lang = b.dataset.lang || null;
    state.lang = state.lang === lang ? null : lang;
    Array.prototype.forEach.call(this.children, function (c) {
      c.setAttribute("aria-pressed", String((c.dataset.lang || null) === state.lang));
    });
    renderList();
  });

  document.querySelector(".seg").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.sort = b.dataset.sort;
    Array.prototype.forEach.call(this.children, function (c) { c.setAttribute("aria-pressed", String(c === b)); });
    renderList();
  });

  // Barra de linguagens: destaque ao passar o mouse e clique para filtrar
  function highlight(lang) {
    var box = $("langs");
    box.classList.toggle("hl", !!lang);
    Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (el) {
      el.classList.toggle("on", el.dataset.lang === lang);
    });
  }
  $("langs").addEventListener("mouseover", function (e) {
    var el = e.target.closest("[data-lang]");
    highlight(el ? el.dataset.lang : null);
  });
  $("langs").addEventListener("mouseleave", function () { highlight(null); });
  $("legend").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]");
    if (!b) return;
    var chip = $("chips").querySelector('.chip[data-lang="' + CSS.escape(b.dataset.lang) + '"]');
    if (chip) { chip.click(); $("arquivo").scrollIntoView({ behavior: "smooth" }); }
  });

  $("q").addEventListener("input", function () { state.q = this.value; renderList(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== $("q")) { e.preventDefault(); $("q").focus(); }
    else if (e.key === "Escape" && document.activeElement === $("q")) { $("q").value = ""; state.q = ""; renderList(); $("q").blur(); }
  });

  // ---------- init ----------
  load().then(function (repos) {
    state.repos = repos.filter(function (r) { return HIDDEN.indexOf(r.name) === -1; });
    renderStats();
    renderFeatured();
    renderList();
  }).catch(function (err) {
    console.error("Falha ao carregar repositórios:", err);
    $("destaques").hidden = true;
    $("list").innerHTML = '<div class="empty">não consegui falar com a API do GitHub agora. ' +
      '<a href="https://github.com/' + USER + '?tab=repositories" style="color:var(--accent)">ver direto no GitHub ↗</a></div>';
  });
})();
