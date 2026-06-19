(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer(panel) {
    var video = panel.querySelector('video');
    var button = panel.querySelector('[data-play-button]');
    var note = panel.querySelector('[data-player-note]');
    var src = panel.getAttribute('data-src');

    if (!video || !button || !src) {
      return;
    }

    function setNote(text) {
      if (note) {
        note.textContent = text;
      }
    }

    function playWithNative() {
      video.src = src;
      video.play().catch(function () {
        setNote('浏览器已加载播放源，请再次点击视频播放按钮。');
      });
    }

    function playWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setNote('播放源已载入，请再次点击视频播放按钮。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setNote('播放初始化遇到问题，已尝试使用浏览器原生能力播放。');
            hls.destroy();
            playWithNative();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        playWithNative();
      } else {
        setNote('当前浏览器不支持 HLS 播放，请更换支持的浏览器访问。');
      }
    }

    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      setNote('正在初始化播放源…');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        playWithNative();
        return;
      }

      loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
        .then(playWithHls)
        .catch(function () {
          setNote('播放器脚本加载失败，已尝试使用浏览器原生播放能力。');
          playWithNative();
        });
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
