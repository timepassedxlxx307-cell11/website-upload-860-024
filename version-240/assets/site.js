(function () {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      const opened = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
      slide.setAttribute('aria-hidden', slideIndex === activeSlide ? 'false' : 'true');
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const searchInput = document.getElementById('search-input');
  const typeFilter = document.getElementById('type-filter');
  const yearFilter = document.getElementById('year-filter');
  const cards = Array.from(document.querySelectorAll('.movie-card[data-search]'));
  const emptyState = document.querySelector('.empty-state');

  function filterCards() {
    if (!cards.length) {
      return;
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const type = typeFilter ? typeFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = (card.getAttribute('data-search') || '').toLowerCase();
      const cardType = card.getAttribute('data-type') || '';
      const cardYear = card.getAttribute('data-year') || '';
      const matched = (!query || haystack.indexOf(query) !== -1) && (!type || cardType === type) && (!year || cardYear === year);

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput || typeFilter || yearFilter) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }
})();
