(function () {
  function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function showButton() {
      if (button && video.paused && !video.ended) {
        button.classList.remove('is-hidden');
      }
    }

    function play() {
      attach();
      hideButton();
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          showButton();
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
