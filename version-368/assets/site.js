(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('.hero-arrow.prev');
    const next = hero.querySelector('.hero-arrow.next');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        start();
      });
    });

    start();
  }
})();

function initMoviePlayer(videoId, videoUrl, buttonId) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  let ready = false;

  if (!video || !button || !videoUrl) {
    return;
  }

  const load = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
  };

  const play = function () {
    load();
    button.classList.add('hidden');

    const attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        button.classList.remove('hidden');
      });
    }
  };

  button.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('hidden');
    }
  });
}

function startMovieSearch(items) {
  const list = Array.isArray(items) ? items : [];
  const params = new URLSearchParams(window.location.search);
  const input = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const sortFilter = document.getElementById('sortFilter');
  const results = document.getElementById('searchResults');

  if (!input || !typeFilter || !sortFilter || !results) {
    return;
  }

  input.value = params.get('q') || '';
  sortFilter.value = params.get('sort') || 'match';

  const render = function () {
    const query = input.value.trim().toLowerCase();
    const type = typeFilter.value;
    const sort = sortFilter.value;

    let filtered = list.filter(function (movie) {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' '),
        String(movie.year)
      ].join(' ').toLowerCase();

      const matchText = !query || haystack.indexOf(query) !== -1;
      const matchType = !type || movie.type === type;
      return matchText && matchType;
    });

    filtered.sort(function (a, b) {
      if (sort === 'year') {
        return Number(b.year) - Number(a.year);
      }

      if (sort === 'rating') {
        return Number(b.rating) - Number(a.rating);
      }

      if (sort === 'views') {
        return Number(b.views) - Number(a.views);
      }

      return Number(b.rating) - Number(a.rating);
    });

    results.innerHTML = filtered.slice(0, 240).map(function (movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="./' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-badge">▶</span>',
        '    <span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  };

  input.addEventListener('input', render);
  typeFilter.addEventListener('change', render);
  sortFilter.addEventListener('change', render);
  render();
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
}
