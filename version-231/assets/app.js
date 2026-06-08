(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var header = document.querySelector("[data-site-header]");
    if (header) {
      var updateHeader = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
        toggle.textContent = open ? "×" : "☰";
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-empty");
      }, { once: true });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;
      var show = function (nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        thumbs.forEach(function (thumb, i) {
          thumb.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      var play = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 6200);
      };
      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        play();
      };
      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      show(0);
      play();
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
      var input = filterPanel.querySelector("[data-filter-keyword]");
      var category = filterPanel.querySelector("[data-filter-category]");
      var year = filterPanel.querySelector("[data-filter-year]");
      var type = filterPanel.querySelector("[data-filter-type]");
      var clear = filterPanel.querySelector("[data-filter-clear]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-terms]"));
      var status = document.querySelector("[data-filter-status]");
      var empty = document.querySelector("[data-filter-empty]");
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      var apply = function () {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var channelValue = category ? category.value : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var terms = (card.getAttribute("data-terms") || "").toLowerCase();
          var ok = true;
          if (keyword && terms.indexOf(keyword) === -1) {
            ok = false;
          }
          if (channelValue && card.getAttribute("data-category") !== channelValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          if (typeValue && (card.getAttribute("data-type") || "").indexOf(typeValue) === -1) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (status) {
          status.textContent = keyword || channelValue || yearValue || typeValue ? "筛选结果已更新" : "";
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      [input, category, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (category) {
            category.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
      apply();
    }

    var playerData = document.getElementById("player-config");
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var start = document.querySelector("[data-player-start]");
    if (playerData && video && cover && start) {
      var config = {};
      try {
        config = JSON.parse(playerData.textContent || "{}");
      } catch (err) {
        config = {};
      }
      var loaded = false;
      var hlsInstance = null;
      var loadStream = function () {
        if (loaded || !config.src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = config.src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(config.src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = config.src;
        }
        loaded = true;
      };
      var begin = function (event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        loadStream();
        cover.classList.add("is-hidden");
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            cover.classList.remove("is-hidden");
          });
        }
      };
      start.addEventListener("click", begin);
      cover.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
