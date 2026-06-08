(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var input = document.querySelector("[data-live-search]");
        var list = document.querySelector("[data-card-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");
        var resultText = document.querySelector("[data-result-text]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function textOf(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var matched = !query || textOf(card).indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
            if (resultText) {
                resultText.textContent = query ? "匹配影片：" + visible : "";
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    window.bootMoviePlayer = function (playerId, source) {
        var box = document.getElementById(playerId);
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var cover = box.querySelector(".player-cover");
        var message = box.querySelector(".player-message");
        var hls = null;
        var attached = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attach() {
            if (attached || !video || !source) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("视频暂时无法加载，请稍后重试");
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (!video) {
                return;
            }
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    setMessage("点击视频区域继续观看");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", function () {
                cover.classList.add("is-hidden");
                play();
            });
        }

        if (video) {
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                setMessage("");
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("error", function () {
                setMessage("视频暂时无法加载，请稍后重试");
            });
            attach();
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    onReady(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
}());
