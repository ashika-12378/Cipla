(() => {
  if (customElements.get('featured-collection')) {
    return;
  }

  class FeaturedCollection extends HTMLElement {
    constructor() {
      super();

      this.slider = {};
      this.controls = this.querySelectorAll('[data-control]');
      this.prevArrow = this.querySelector('[data-prev]');
      this.nextArrow = this.querySelector('[data-next]');

      this.controls.forEach((control) => {
        control.addEventListener('click', this.onControlClick.bind(this));
      });
    }

    connectedCallback() {
      const slider = this.querySelector('[data-slider]');

      const flip = document.querySelector('.featured-collection--flip');

      if (!slider) {
        return;
      }

      this.slider = new Splide(slider, {
        pagination: false,
        rewind: false,
        waitForTransition: false,
        flickMaxPages: 0.5,
        arrows: false,
        direction: flip ? 'rtl' : 'ltr',
        gap: '3.2rem',
        fixedWidth: '46.5%',
        breakpoints: {
          990: {
            arrows: false,
            gap: '1.2rem',
            fixedWidth: '47.5%'
          }
        }
      }).mount();

      this.slider.on('move', (newIndex, prevIndex, destIndex) => {
        this.nextArrow.classList.toggle('hidden', destIndex + 1 >= this.slider.length - 1);
        this.prevArrow.classList.toggle('hidden', destIndex === 0);
      });
    }

    onControlClick(event) {
      event.preventDefault();

      if (this.slider === {}) {
        return;
      }

      const action = event.target.hasAttribute('data-prev') ? '<' : '>';

      this.slider.go(action);
    }
  }

  customElements.define('featured-collection', FeaturedCollection);
})();
