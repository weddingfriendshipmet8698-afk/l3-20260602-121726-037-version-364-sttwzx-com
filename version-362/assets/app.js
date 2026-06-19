(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    activate(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    if (!input || !scopes.length) {
      return;
    }

    function apply() {
      var keyword = normalize(input.value);
      var typeValue = normalize(typeFilter ? typeFilter.value : '');
      var yearValue = normalize(yearFilter ? yearFilter.value : '');

      scopes.forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var typeText = normalize(card.getAttribute('data-type'));
          var yearText = normalize(card.getAttribute('data-year'));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = !typeValue || typeText.indexOf(typeValue) !== -1;
          var matchYear = !yearValue || yearText.indexOf(yearValue) !== -1;

          card.style.display = matchKeyword && matchType && matchYear ? '' : 'none';
        });
      });
    }

    input.addEventListener('input', apply);

    if (typeFilter) {
      typeFilter.addEventListener('change', apply);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }

    apply();
  }

  toggleMobileMenu();
  initHero();
  initCardFilter();
})();
