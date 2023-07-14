class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};

    this.input = this.querySelector('input[type="search"]'); // added by digifist
    this.clear = this.querySelector('[data-clear-field]'); // added by digifist
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.allPredictiveSearchInstances =
      document.querySelectorAll('predictive-search');
    this.isOpen = false;
    this.abortController = new AbortController();
    this.searchTerm = '';

    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.querySelector('form.js-search-form');
    form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));
    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.clear.addEventListener('click', this.onClear.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  onClear(event) {
    event.preventDefault();

    this.clear.classList.remove('is-active');
    this.input.value = '';
    this.input.classList.remove('has-search-input');
    this.input.focus();
    this.close(true);
  }

  onChange() {
    const newSearchTerm = this.getQuery();
    if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
      // Remove the results when they are no longer relevant for the new search term
      // so they don't show up when the dropdown opens again
      this.querySelector("#predictive-search-results-groups-wrapper")?.remove();
    }

    // Update the term asap, don't wait for the predictive search query to finish loading
    this.updateSearchForTerm(this.searchTerm, newSearchTerm);

    this.searchTerm = newSearchTerm;

    if (!this.searchTerm.length) {
      this.close(true);
      this.clear.classList.remove('is-active'); // added by digifist
      this.input.classList.remove('has-search-input'); // added by digifist
      return;
    }

    this.input.classList.add('has-search-input'); // added by digifist
    this.clear.classList.add('is-active'); // added by digifist
    this.getSearchResults(this.searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.searchTerm = '';
      this.abortController.abort();
      this.abortController = new AbortController();
      this.closeResults(true);
    }
  }

  onFocus() {
    const currentSearchTerm = this.getQuery();

    this.clear.classList.remove('is-active'); // added by digifist
    this.input.classList.remove('has-search-input'); // added by digifist

    if (!currentSearchTerm.length) return;

    this.clear.classList.add('is-active'); // added by digifist
    this.input.classList.add('has-search-input'); // added by digifist

    if (this.searchTerm !== currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.getSearchResults(this.searchTerm);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement) && this.input.value === '') this.close();
    })
  }

  onKeyup(event) {
    if (!this.getQuery().length) this.close(true);
    event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up')
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault();
    }
  }

  updateSearchForTerm(previousTerm, newTerm) {
    const searchForTextElement = this.querySelector(
      "[data-predictive-search-search-for-text]"
    );
    const currentButtonText = searchForTextElement?.innerText;
    if (currentButtonText) {
      if (currentButtonText.match(new RegExp(previousTerm, "g")).length > 1) {
        // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
        return;
      }
      const newButtonText = currentButtonText.replace(previousTerm, newTerm);
      searchForTextElement.innerText = newButtonText;
    }
  }

  switchOption(direction) {
    if (!this.getAttribute('open')) return;

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allElements = this.querySelectorAll('li');
    let activeElement = this.querySelector('li');
    let activeListItem = activeElement?.closest('[data-list-items]');

    if (moveUp && !selectedElement) return;

    this.statusElement.textContent = '';

    if (!moveUp && selectedElement) {
      const activeListItemNextElement = selectedElement?.closest('[data-list-items]').nextElementSibling?.querySelectorAll('li')[0];
      const firstListItemElement = this.querySelectorAll('[data-list-items]')[0].querySelectorAll('li')[0];

      activeElement = selectedElement.nextElementSibling || activeListItemNextElement || firstListItemElement;
    } else if (moveUp) {
      activeListItem = selectedElement?.closest('[data-list-items]');
      const activeListItemPrevElement = activeListItem.previousElementSibling?.querySelectorAll('li')[activeListItem.previousElementSibling?.querySelectorAll('li').length - 1];

      activeElement = selectedElement.previousElementSibling || activeListItemPrevElement || allElements[allElements.length - 1];
    }

    if (activeElement === selectedElement) return;

    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.setLiveRegionText(activeElement.textContent);
    this.input.setAttribute('aria-activedescendant', activeElement.id);
  }

  selectOption() {
    const selectedProduct = this.querySelector('[aria-selected="true"] a, [aria-selected="true"] button');

    if (selectedProduct) selectedProduct.click();
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(
      `${routes.predictive_search_url}?q=${encodeURIComponent(
        searchTerm
      )}&section_id=predictive-search`,
      { signal: this.abortController.signal }
    )
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
        // Save bandwidth keeping the cache in all instances synced
        this.allPredictiveSearchInstances.forEach(
          (predictiveSearchInstance) => {
            predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
          }
        );
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        if (error?.code === 20) {
          // Code 20 means the call was aborted
          return;
        }
        this.close();
        throw error;
      });
  }

  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute('results', true);

    this.setLiveRegionResults();
    this.open();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }

  getResultsMaxHeight() {
    const headerHeight = Math.floor(document.querySelector('.section--header')?.getBoundingClientRect().bottom) || 0;
    const menuDrawerSearch = Math.floor(this.input.offsetHeight) || 0;
    // The 3px magic number is due to CSS style issues in iOS
    const maxHeightSum = (headerHeight + menuDrawerSearch + 3);

    this.resultsMaxHeight = window.innerHeight - maxHeightSum;
    return this.resultsMaxHeight;
  }

  open() {
    if (!this.classList.contains('is-animated-in')) {
      this.animateIn();
    }

    this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    this.animateOut(clearSearchTerm);
  }

  handleClose(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.removeAttribute('results');
    }

    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false
    this.predictiveSearchResults.removeAttribute('style');

    this.isOpen = false;
  }

  animateIn() {
    this.classList.remove('is-animated-out');
    this.classList.remove('animate-out');
    this.classList.add('animate-in');

    setTimeout(() => {
      this.classList.add('is-animated-in');
    }, 550);
  }

  animateOut(clearSearchTerm = false) {
    this.classList.remove('is-animated-in');
    this.classList.remove('animate-in');
    this.classList.add('animate-out');
    this.classList.add('is-animated-out');

    setTimeout(() => {
      this.classList.remove('is-animated-out');
      this.handleClose(clearSearchTerm);
    }, 550);
  }
}

customElements.define('predictive-search', PredictiveSearch);
