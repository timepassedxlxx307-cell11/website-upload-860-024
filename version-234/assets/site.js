(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function closeSearchBoxes() {
    qsa('[data-search-results]').forEach(function (box) {
      box.classList.remove('is-open');
      box.innerHTML = '';
    });
  }

  function renderSearch(input) {
    var holder = input.closest('.search-holder');
    var box = holder ? qs('[data-search-results]', holder) : null;
    var list = window.SEARCH_INDEX || [];
    var query = input.value.trim().toLowerCase();

    if (!box) {
      return;
    }

    if (!query) {
      box.classList.remove('is-open');
      box.innerHTML = '';
      return;
    }

    var results = list.filter(function (item) {
      return item.search.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 10);

    if (!results.length) {
      box.innerHTML = '<div class="search-result-item"><div></div><div><strong>暂无匹配影片</strong><small>换个关键词试试</small></div></div>';
      box.classList.add('is-open');
      return;
    }

    box.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="./' + item.file + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<div><strong>' + item.title + '</strong><small>' + item.meta + '</small></div>' +
        '</a>';
    }).join('');
    box.classList.add('is-open');
  }

  qsa('[data-global-search]').forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) {
        renderSearch(input);
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.search-holder')) {
      closeSearchBoxes();
    }
  });

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero-carousel]');

  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  qsa('[data-page-search]').forEach(function (input) {
    var scope = input.closest('[data-filter-scope]') || document;
    var cards = qsa('.movie-card', scope);
    var countNode = qs('[data-filter-count]', scope);
    var emptyNode = qs('[data-empty-state]', scope);

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var match = !query || haystack.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = visible + ' 部影片';
      }

      if (emptyNode) {
        emptyNode.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  qsa('[data-back-top]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  });
})();
