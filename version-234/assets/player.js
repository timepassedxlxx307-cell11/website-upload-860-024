import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
  var video = document.getElementById('movie-video');
  var configNode = document.getElementById('player-config');
  var overlay = document.querySelector('[data-play-overlay]');

  if (!video || !configNode || !overlay) {
    return;
  }

  var config = JSON.parse(configNode.textContent || '{}');
  var source = config.src || '';
  var hls = null;
  var prepared = false;

  function prepareVideo() {
    if (prepared || !source) {
      return;
    }

    prepared = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      overlay.innerHTML = '<span class="play-pulse">!</span>';
    }
  }

  function playVideo() {
    prepareVideo();
    overlay.classList.add('is-hidden');
    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.addEventListener('loadedmetadata', function () {
          video.play();
        }, { once: true });
      });
    }
  }

  overlay.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (!prepared) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
