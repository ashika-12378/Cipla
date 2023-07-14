(() => {
  if (customElements.get('featured-articles')) {
    return;
  }

  class FeaturedArticles extends HTMLElement {
    constructor() {
      super();

      this.slider = {};
    }

    connectedCallback() {
      this.slider = new Splide(this.querySelector('[data-slider]'), {
        pagination: false,
        rewind: false,
        waitForTransition: false,
        flickMaxPages: 0.5,
        arrows: false,
        gap: '4.8rem',
        fixedWidth: '35.1rem',
        autoHeight: true,
        breakpoints: {
        990: {
          arrows: false,
          gap: '2.4rem',
          fixedWidth: '24.4rem'
        }
      }
      }).mount();
    }
  }

  customElements.define('featured-articles', FeaturedArticles);
})();
