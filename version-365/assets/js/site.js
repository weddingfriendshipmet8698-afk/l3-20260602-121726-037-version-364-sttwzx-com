
(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-control.prev');
    var next = carousel.querySelector('.hero-control.next');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        start();
      });
    });

    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupGrid(section) {
    var input = section.querySelector('.card-filter-input');
    var grid = section.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-sort]'));

    function filterCards(value) {
      var key = normalize(value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        card.classList.toggle('hidden-by-filter', key && haystack.indexOf(key) === -1);
      });
    }

    function sortCards(mode) {
      var sorted = cards.slice().sort(function (a, b) {
        var ay = Number(a.getAttribute('data-year') || 0);
        var by = Number(b.getAttribute('data-year') || 0);
        var at = a.getAttribute('data-title') || '';
        var bt = b.getAttribute('data-title') || '';
        if (mode === 'year-asc') {
          return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
        }
        if (mode === 'title') {
          return at.localeCompare(bt, 'zh-Hans-CN') || by - ay;
        }
        return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        filterCards(input.value);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        sortCards(button.getAttribute('data-sort'));
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchPageInput = document.getElementById('searchPageInput');
    if (searchPageInput && query) {
      searchPageInput.value = query;
    }
    if (input && query) {
      input.value = query;
      filterCards(query);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.tools-section')).forEach(setupGrid);
})();
