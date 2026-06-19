(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var cover = document.getElementById(options.coverId);
    var source = options.source;
    var started = false;

    function attachSource() {
      if (!video || !source) {
        return Promise.resolve();
      }
      if (started) {
        return video.play();
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      return video.play();
    }

    function play() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      attachSource().catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }
  }

  window.initMoviePlayer = initMoviePlayer;
})();
