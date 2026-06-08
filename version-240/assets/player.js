(function () {
  function mountMoviePlayer(videoUrl, videoId, playButtonId, coverId) {
    const video = document.getElementById(videoId);
    const playButton = document.getElementById(playButtonId);
    const cover = document.getElementById(coverId);
    let loaded = false;
    let hls = null;

    if (!video) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function showCover() {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    }

    function playVideo() {
      loadVideo();
      hideCover();
      video.setAttribute('controls', 'controls');

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showCover();
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', toggleVideo);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.mountMoviePlayer = mountMoviePlayer;
})();
