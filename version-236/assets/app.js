function initMoviePlayer(streamUrl) {
  const video = document.getElementById("movie-player");
  const cover = document.querySelector(".player-cover");

  if (!video || !streamUrl) {
    return;
  }

  let attached = false;

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attachSource();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (!attached) {
      start();
    }
  });
}

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
      const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
      const previous = hero.querySelector("[data-hero-prev]");
      const next = hero.querySelector("[data-hero-next]");
      let current = 0;
      let timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          show(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.dataset.heroDot));
          startTimer();
        });
      });

      show(0);
      startTimer();
    }

    const input = document.querySelector("[data-search-input]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const typeFilter = document.querySelector("[data-type-filter]");
    const cards = Array.from(document.querySelectorAll(".searchable-grid .movie-card"));
    const empty = document.querySelector("[data-no-results]");

    if (input && cards.length) {
      const params = new URLSearchParams(window.location.search);
      const queryValue = params.get("q") || "";
      input.value = queryValue;

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        const keyword = normalize(input.value);
        const yearValue = yearFilter ? yearFilter.value : "";
        const typeValue = typeFilter ? typeFilter.value : "";
        let visibleCount = 0;

        cards.forEach(function (card) {
          const text = normalize(card.dataset.search);
          const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          const matchYear = !yearValue || card.dataset.year === yearValue;
          const matchType = !typeValue || card.dataset.type === typeValue;
          const visible = matchKeyword && matchYear && matchType;
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      input.addEventListener("input", applyFilter);

      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilter);
      }

      if (typeFilter) {
        typeFilter.addEventListener("change", applyFilter);
      }

      applyFilter();
    }
  });
})();
