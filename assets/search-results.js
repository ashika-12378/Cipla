const formData = new FormData(document.querySelector('.search-form').querySelector('form'));
const searchParams = new URLSearchParams(formData).toString();
const searchNav = document.querySelector('.js-results-nav');
const searchTitle = document.querySelector('.js-results-title');

const productsResults = fetch(`${window.location.pathname}?section_id=main-search&${searchParams}`)
  .then(response => {
    if (response.ok) {
      return response.text();
    }

    searchTitle?.classList.add('is-loaded');
  })
  .then(data => {
    if (!data) {
      searchTitle?.classList.add('is-loaded');
      return;
    }

    const parsedHTML = new DOMParser().parseFromString(data, 'text/html');
    const searchCounters = parsedHTML.querySelector('#search-counters');
    const searchCountersElements = searchCounters.querySelectorAll('[data-count]');
    let fullCount = 0;

    if (searchCountersElements.length == 0) {
      return;
    }

    [...searchCountersElements].forEach((element, index) => {
      const count = parseInt(element.innerHTML);
      const countParent = document.querySelector(`.js-results-count-parent:nth-child(${index + 1})`);
      const countElement = countParent.querySelector('.js-results-count');

      fullCount += count;

      countElement.innerHTML = `(${count})`;
      countElement.classList.add('is-loaded');

      if (count == 0) {
        countParent.classList.add('hidden');
      }

      searchNav.classList.add('is-loaded');
    });

    if (!searchTitle) {
      return;
    }

    const countTemp = `<strong>${fullCount}</strong>`;
    const termsTemp = `<span>“${searchParams.split('=')[1]}”</span>`;
    let termsStringWithCount = '';

    if (fullCount > 0) {
      if (fullCount == 1) {
        termsStringWithCount = window.theme.strings.search.results_with_count_and_term.one;
      } else {
        termsStringWithCount = window.theme.strings.search.results_with_count_and_term.other;
      }

      termsStringWithCount = termsStringWithCount.replace('{{ count }}', countTemp);
      termsStringWithCount = termsStringWithCount.replace('{{ terms }}', decodeURIComponent(termsTemp));

      searchTitle.innerHTML = termsStringWithCount.replace('+', ' ');
    }

    searchTitle.classList.add('is-loaded');
  }).catch((e) => {
    searchTitle?.classList.add('is-loaded');
  });
