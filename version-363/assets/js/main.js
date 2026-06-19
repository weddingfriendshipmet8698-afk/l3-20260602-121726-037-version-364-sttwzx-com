(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function setupCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
      if (!scope) {
        return;
      }
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var genre = panel.querySelector("[data-filter-genre]");
      var reset = panel.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      function apply() {
        var q = normalize(input && input.value);
        var y = normalize(year && year.value);
        var g = normalize(genre && genre.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && normalize(card.getAttribute("data-year")) !== y) {
            ok = false;
          }
          if (g && text.indexOf(g) === -1) {
            ok = false;
          }
          card.hidden = !ok;
        });
      }
      [input, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) input.value = "";
          if (year) year.value = "";
          if (genre) genre.value = "";
          apply();
        });
      }
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="poster-frame" href="movie/' + movie.id + '.html" aria-label="' + escapeHtml(movie.title) + '">',
      '<img class="poster-img" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'">',
      '<span class="play-chip">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-root]");
    if (!root || !window.MOVIES_INDEX) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var year = root.querySelector("[data-search-year]");
    var category = root.querySelector("[data-search-category]");
    var results = root.querySelector("[data-search-results]");
    var note = root.querySelector("[data-search-note]");
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    function render() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var c = normalize(category && category.value);
      var list = window.MOVIES_INDEX.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine, movie.category].join(" "));
        if (q && text.indexOf(q) === -1) return false;
        if (y && String(movie.year) !== y) return false;
        if (c && normalize(movie.categorySlug) !== c) return false;
        return true;
      }).slice(0, 180);
      results.innerHTML = "";
      if (!list.length) {
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "没有找到匹配内容";
        results.appendChild(empty);
      } else {
        list.forEach(function (movie) {
          results.appendChild(createSearchCard(movie));
        });
      }
      if (note) {
        note.textContent = "当前显示 " + list.length + " 条结果";
      }
    }
    [input, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
