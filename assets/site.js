(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = one('[data-menu-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSiteSearch() {
    all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = './search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var thumbs = all('[data-hero-thumb]', slider);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    all('[data-filter-input]').forEach(function (input) {
      var section = input.closest('section') || document;
      var cards = all('[data-search-card]', section);
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search-text'));
          card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function setupScrollRows() {
    all('.scroll-shell').forEach(function (shell) {
      var row = one('[data-scroll-row]', shell);
      var left = one('[data-scroll-left]', shell);
      var right = one('[data-scroll-right]', shell);
      if (!row) {
        return;
      }
      var move = function (direction) {
        row.scrollBy({ left: direction * Math.max(240, row.clientWidth * 0.72), behavior: 'smooth' });
      };
      if (left) {
        left.addEventListener('click', function () {
          move(-1);
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          move(1);
        });
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + item.url + '" title="' + escapeHtml(item.title) + '">',
      '<figure class="poster-frame">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<figcaption>' + escapeHtml(item.year) + '</figcaption>',
      '</figure>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = one('[data-search-results]');
    var form = one('[data-search-page-form]');
    var input = one('#global-search-input');
    var fallback = one('[data-search-fallback]');
    if (!results || !form || !input || !window.SEARCH_ITEMS) {
      return;
    }

    function render(query) {
      var text = normalize(query);
      input.value = query || '';
      if (!text) {
        results.innerHTML = '';
        if (fallback) {
          fallback.style.display = '';
        }
        return;
      }
      var matches = window.SEARCH_ITEMS.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.oneLine,
          (item.tags || []).join(' ')
        ].join(' '));
        return haystack.indexOf(text) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(cardTemplate).join('');
      if (fallback) {
        fallback.style.display = matches.length ? 'none' : '';
      }
    }

    var params = new URLSearchParams(window.location.search);
    render(params.get('q') || '');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState({}, '', nextUrl);
      render(query);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupFilters();
    setupScrollRows();
    setupSearchPage();
  });
})();
