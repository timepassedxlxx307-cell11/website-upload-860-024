(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setHidden(element, hidden) {
    if (element) {
      element.hidden = hidden;
    }
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var nextState = !menu.hidden;
      menu.hidden = nextState;
      button.textContent = nextState ? '☰' : '×';
    });
  }

  function makeSearch(input, panel) {
    if (!input || !panel || !window.SEARCH_MOVIES) {
      return;
    }
    var render = function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        panel.innerHTML = '';
        setHidden(panel, true);
        return;
      }
      var results = window.SEARCH_MOVIES.filter(function (item) {
        return item.text.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 10);
      if (!results.length) {
        panel.innerHTML = '<div class="search-empty">未找到相关影片</div>';
        setHidden(panel, false);
        return;
      }
      panel.innerHTML = results.map(function (item) {
        return '<a class="search-item" href="./' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.genre + '</span></span>' +
          '</a>';
      }).join('');
      setHidden(panel, false);
    };
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        setHidden(panel, true);
      }
    });
  }

  function setupSearch() {
    makeSearch(qs('#site-search'), qs('#search-panel'));
    makeSearch(qs('#mobile-site-search'), qs('#mobile-search-panel'));
  }

  function setupHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-slide-dot]', carousel);
    var prev = qs('[data-slide-prev]', carousel);
    var next = qs('[data-slide-next]', carousel);
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-dot')) || 0);
        play();
      });
    });
    if (slides.length > 1) {
      play();
    }
  }

  function setupFilters() {
    qsa('[data-filter-grid]').forEach(function (grid) {
      var section = grid.closest('.content-section') || document;
      var input = qs('[data-filter-input]', section);
      var buttons = qsa('[data-filter-value]', section);
      var value = 'all';
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        qsa('[data-card]', grid).forEach(function (card) {
          var text = (card.getAttribute('data-text') || '').toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesValue = value === 'all' || text.indexOf(value.toLowerCase()) !== -1 || (card.getAttribute('data-kind') || '').indexOf(value) !== -1;
          card.classList.toggle('is-hidden', !(matchesQuery && matchesValue));
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          value = button.getAttribute('data-filter-value') || 'all';
          apply();
        });
      });
    });
  }

  function setupBackTop() {
    qsa('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var player = qs('[data-player]');
    if (!player) {
      return;
    }
    var video = qs('video', player);
    var overlay = qs('.player-overlay', player);
    var started = false;
    var hls = null;
    var pending = false;
    function attach() {
      if (started || !video) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pending) {
            video.play().catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
      } else {
        video.src = source;
      }
    }
    function start() {
      pending = true;
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearch();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
