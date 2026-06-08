(function () {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function restartHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showSlide(heroIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartHero();
    });
  });

  showSlide(0);
  restartHero();

  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    const scopeSelector = input.getAttribute('data-search-input');
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    const emptyState = document.querySelector(input.getAttribute('data-empty') || '');

    function filterCards() {
      const value = input.value.trim().toLowerCase();
      const cards = Array.from((scope || document).querySelectorAll('.movie-card'));
      let visible = 0;

      cards.forEach(function (card) {
        const content = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.innerText
        ].join(' ').toLowerCase();
        const matched = !value || content.includes(value);
        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    input.addEventListener('input', filterCards);
    filterCards();
  });

  const filterPills = Array.from(document.querySelectorAll('[data-filter-value]'));

  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      const value = pill.getAttribute('data-filter-value') || '';
      const target = document.querySelector(pill.getAttribute('data-filter-target') || '');
      const cards = Array.from((target || document).querySelectorAll('.movie-card'));

      filterPills
        .filter(function (item) {
          return item.getAttribute('data-filter-target') === pill.getAttribute('data-filter-target');
        })
        .forEach(function (item) {
          item.classList.toggle('active', item === pill);
        });

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.innerText
        ].join(' ');
        card.style.display = !value || haystack.includes(value) ? '' : 'none';
      });
    });
  });

  const players = Array.from(document.querySelectorAll('[data-video-url]'));

  players.forEach(function (stage) {
    const video = stage.querySelector('video');
    const cover = stage.querySelector('.player-cover');
    const button = stage.querySelector('.player-button');
    const url = stage.getAttribute('data-video-url');
    let started = false;
    let hls = null;

    function loadAndPlay() {
      if (!video || !url) {
        return;
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }

        started = true;
      }

      if (cover) {
        cover.classList.add('hidden');
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', loadAndPlay);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        loadAndPlay();
      });
    }

    video.addEventListener('click', function () {
      if (!started) {
        loadAndPlay();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
