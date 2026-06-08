(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var activeIndex = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    slides[activeIndex].classList.remove('active');
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides[activeIndex].classList.add('active');
  }

  if (slides.length) {
    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(activeIndex + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(activeIndex - 1);
      });
    }

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(scope) {
    var keywordInput = scope.querySelector('[data-filter-keyword]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var keyword = normalize(keywordInput ? keywordInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      var matchedRegion = !region || cardRegion === region;
      card.classList.toggle('hidden-card', !(matchedKeyword && matchedYear && matchedRegion));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    Array.prototype.slice.call(scope.querySelectorAll('[data-filter-keyword], [data-filter-year], [data-filter-region]')).forEach(function (field) {
      field.addEventListener('input', function () {
        applyFilters(scope);
      });
      field.addEventListener('change', function () {
        applyFilters(scope);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var input = scope.querySelector('[data-filter-keyword]');
    if (query && input) {
      input.value = query;
      applyFilters(scope);
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.location.href = url;
    });
  });
})();
