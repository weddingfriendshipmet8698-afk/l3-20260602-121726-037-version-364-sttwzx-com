
(function () {
  window.setupStaticPlayer = function (mediaUrl) {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('playButton');
    var shell = document.getElementById('playerShell');
    var loaded = false;

    function attachVideo() {
      if (!video || !mediaUrl || loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
      loaded = true;
    }

    function playVideo() {
      attachVideo();
      if (shell) {
        shell.classList.add('is-playing');
      }
      if (video) {
        video.controls = true;
        var playAction = video.play();
        if (playAction && playAction.catch) {
          playAction.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  };
})();
