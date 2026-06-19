(function () {
  var app = document.querySelector('[data-search-app]');

  if (!app || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  var input = app.querySelector('[data-search-input]');
  var category = app.querySelector('[data-search-category]');
  var type = app.querySelector('[data-search-type]');
  var results = app.querySelector('[data-search-results]');
  var count = app.querySelector('[data-result-count]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(item) {
    var title = escapeHtml(item.title);
    var region = escapeHtml(item.region);
    var type = escapeHtml(item.type);
    var year = escapeHtml(item.year);
    var oneLine = escapeHtml(item.oneLine);
    var cover = escapeHtml(item.cover);
    var id = escapeHtml(item.id);
    var tags = item.tags.slice(0, 4).map(function (tag) {
      return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-title="' + title + '">',
      '  <a class="poster-link" href="./movies/' + id + '.html" aria-label="查看 ' + title + '">',
      '    <img src="' + cover + '" alt="' + title + '" loading="lazy" />',
      '    <span class="poster-glow"></span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta">',
      '      <span>' + year + '</span>',
      '      <span>' + region + '</span>',
      '      <span>' + type + '</span>',
      '    </div>',
      '    <h3><a href="./movies/' + id + '.html">' + title + '</a></h3>',
      '    <p>' + oneLine + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function apply() {
    var keyword = normalize(input.value);
    var categoryValue = normalize(category.value);
    var typeValue = normalize(type.value);
    var filtered = window.MOVIE_SEARCH_DATA.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags.join(' '),
        item.oneLine
      ].join(' '));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchCategory = !categoryValue || normalize(item.categorySlug) === categoryValue;
      var matchType = !typeValue || normalize(item.type).indexOf(typeValue) !== -1;
      return matchKeyword && matchCategory && matchType;
    });

    filtered.sort(function (a, b) {
      return b.hotWeight - a.hotWeight || b.year - a.year;
    });

    count.textContent = '共找到 ' + filtered.length + ' 部，当前显示前 120 部结果。';
    results.innerHTML = filtered.slice(0, 120).map(card).join('\n');
  }

  input.value = initialQuery;
  input.addEventListener('input', apply);
  category.addEventListener('change', apply);
  type.addEventListener('change', apply);
  apply();
})();
