(() => {
  if (customElements.get('products-carousel')) {
    return;
  }

  class ProductsCarousel extends HTMLElement {
    constructor() {
      super();

      this.slider = {};
      this.controls = null;
      this.controlsWrapper = this.querySelector('[data-controls-wrapper]');
      this.cardsSize = this.dataset.cardsSize || 'default';
      this.shouldDestroyOnDesktop = this.hasAttribute('data-destroy');
      this.breakpoints = {
        desktop: 990
      };
    }

    connectedCallback() {
      this.initSlider();
      this.toggleSliderHandler();
      window.addEventListener('resize', debounce(this.toggleSliderHandler.bind(this), 500));
    }

    initSlider() {
      const sliderList = this.querySelector('.splide');

      if (!sliderList) return;

      const sizeCardSettings = {
        default: {
          fixedWidth: '40rem',
          gap: '4.8rem',
          breakpoints: {
            [this.breakpoints.desktop]: {
              fixedWidth: '74%',
              gap: '3.2rem', 
            },
          },
        },
        large: {
          fixedWidth: '54rem',
          gap: '2.4rem',
          breakpoints: {
            [this.breakpoints.desktop]: {
              fixedWidth: '80%',
              gap: '1.6rem',
            },
          },
        },
      };

      const mainSettings = {
        trimSpace: 'move',
        waitForTransition: true,
        flickMaxPages: 0.5,
        pagination: false,
        arrows: false,
        speed: 300,
        easing: 'ease-in-out',
        ...sizeCardSettings[this.cardsSize]
      };

      this.controls = this.querySelectorAll('[data-control]');
      this.controls.forEach((control) => {
        control.addEventListener('click', this.onControlClick.bind(this));
      });
      this.slider = new Splide(this.querySelector('.splide'), mainSettings).mount();
    }

    toggleSliderHandler() {
      if (!this.shouldDestroyOnDesktop) return;
      try {
        this.toggleSlider(window.innerWidth >= this.breakpoints.desktop);
      } catch(e) {}
    }

    toggleSlider(destroy) {
      this.slider[destroy ? 'destroy' : 'mount'](destroy);
      this.controlsWrapper.classList.toggle('hidden', destroy);
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

  customElements.define('products-carousel', ProductsCarousel);
})();
