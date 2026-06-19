(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var select = area.querySelector("[data-filter-select]");
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
      var empty = area.querySelector("[data-empty-state]");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var genre = select ? select.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesGenre = !genre || text.indexOf(genre) !== -1;
          var show = matchesQuery && matchesGenre;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initRankingTabs() {
    var root = document.querySelector("[data-rank-tabs]");
    if (!root) {
      return;
    }
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-rank-tab]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-rank-panel]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-rank-tab");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-rank-panel") === key);
        });
      });
    });
  }

  function createSearchCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="movie-cover-link" href="' + escapeHtml(item.detail) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy">',
      '<span class="card-shade"></span>',
      '<span class="card-play">▶</span>',
      '<span class="card-duration">' + escapeHtml(item.duration) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-category" href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.categoryName) + '</a>',
      '<h3><a href="' + escapeHtml(item.detail) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>★ ' + escapeHtml(item.rating) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var heading = document.getElementById("searchHeading");
    var empty = document.getElementById("searchEmpty");
    var input = document.getElementById("searchPageInput");
    var query = getQuery("q").trim();
    if (input) {
      input.value = query;
    }
    var list = window.SEARCH_INDEX;
    var filtered;
    if (query) {
      var lower = query.toLowerCase();
      filtered = list.filter(function (item) {
        return [
          item.title,
          item.region,
          item.year,
          item.genre,
          item.tags,
          item.categoryName,
          item.oneLine
        ].join(" ").toLowerCase().indexOf(lower) !== -1;
      });
      if (heading) {
        heading.textContent = "搜索结果";
      }
    } else {
      filtered = list.slice(0, 24);
      if (heading) {
        heading.textContent = "精选影片";
      }
    }
    results.innerHTML = filtered.slice(0, 96).map(createSearchCard).join("");
    if (empty) {
      empty.hidden = filtered.length !== 0;
    }
  }

  function startVideoPlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    if (!video || !button || !options.source) {
      return;
    }
    var stage = video.closest(".video-stage");
    var initialized = false;
    var hls = null;

    function attach() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        video.src = options.source;
      }
      video.setAttribute("controls", "controls");
    }

    function play(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    if (stage) {
      stage.addEventListener("click", function (event) {
        if (event.target === button || button.contains(event.target)) {
          return;
        }
        if (video.paused) {
          play(event);
        }
      });
    }
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.Site = {
    startVideoPlayer: startVideoPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initRankingTabs();
    initSearchPage();
  });
})();
