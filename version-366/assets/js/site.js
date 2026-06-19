(function () {
    "use strict";

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-menu]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupMissingImages() {
        qsa("img[data-poster]").forEach(function (img) {
            img.addEventListener("error", function () {
                var wrap = img.closest(".poster-wrap") || img.closest(".hero-slide") || img.parentElement;
                if (wrap) {
                    wrap.classList.add("image-missing");
                }
                img.remove();
            });
        });
    }

    function setupHero() {
        var carousel = qs("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = qsa("[data-hero-slide]", carousel);
        var dots = qsa("[data-hero-dot]", carousel);
        var prev = qs("[data-hero-prev]", carousel);
        var next = qs("[data-hero-next]", carousel);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function autoplay() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                autoplay();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                autoplay();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                autoplay();
            });
        });
        autoplay();
    }

    function getParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupFilters() {
        var bars = qsa("[data-filter-bar]");
        bars.forEach(function (bar) {
            var input = qs("[data-filter-input]", bar);
            var year = qs("[data-filter-year]", bar);
            var region = qs("[data-filter-region]", bar);
            var type = qs("[data-filter-type]", bar);
            var reset = qs("[data-filter-reset]", bar);
            var list = qs("[data-card-list]");
            var count = qs("[data-result-count]");
            if (!list) {
                return;
            }
            var cards = qsa(".movie-card, .ranking-row", list);

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var pass = true;

                    if (keyword && search.indexOf(keyword) === -1) {
                        pass = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        pass = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        pass = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        pass = false;
                    }
                    card.classList.toggle("card-hidden", !pass);
                    if (pass) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "共 " + visible + " 部影片";
                }
            }

            if (input && !input.value) {
                input.value = getParam("q");
            }
            [input, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    [input, year, region, type].forEach(function (control) {
                        if (control) {
                            control.value = "";
                        }
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function setupPlayer() {
        var video = qs("#movie-player");
        var button = qs("[data-play-button]");
        if (!video || !button) {
            return;
        }
        var src = video.getAttribute("data-video-src");
        var started = false;

        function start() {
            if (!src) {
                return;
            }
            if (!started) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                started = true;
            }
            button.classList.add("is-hidden");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupMissingImages();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
