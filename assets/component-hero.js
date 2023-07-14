(() => {
  if (customElements.get('hero-slider')) {
    return;
  }

  class HeroSlider extends HTMLElement {
    constructor() {
      super();

      this.slider = {};
      this.controls = this.querySelectorAll('[data-control]');

      this.controls.forEach((control) => {
        control.addEventListener('click', this.onControlClick.bind(this));
      });
      this.viewportWidth = window.innerWidth;
      [
        'shopify:section:load',
        'load',
        'resize'
      ].forEach((event) => {
        window.addEventListener(event, () => {
          if (event == 'resize' && window.innerWidth == this.viewportWidth) return;
          this.viewportWidth = window.innerWidth;
          this.calcHeight();
        });
      });
    }

    connectedCallback() {
      this.slider = new Splide(this, {
        type: Number(this.dataset.slidesCount) > 1 ? 'loop' : 'slide',
        rewind: false,
        drag: Number(this.dataset.slidesCount) > 1,
        pagination: false,
        waitForTransition: true,
        arrows: false,
        speed: 600,
        easing: 'ease-in-out',
        autoplay: JSON.parse(this.dataset.autoplay),
        interval: Number(this.dataset.autoplayInterval),
        start: 0
      }).mount();
      this.addAnimationHanler();
      this.updateImageClasses();
    }

    addAnimationHanler() {
      this.querySelectorAll('[data-fade-in]')?.forEach((element) => {
        element.addEventListener('animationend', (event) => {
          this.addFadeAnimations();
        })
      })
    }

    updateImageClasses() {
      this.querySelectorAll('.lazyloading')?.forEach(lazyloadImage => {
        lazyloadImage.classList.remove('lazyloading')
        lazyloadImage.classList.add('lazyloaded')
      })
    }

    addFadeAnimations() {
      this.animatedElements = this.querySelectorAll('[data-fade-in]');
      this.animatedElements.forEach((element) => {
        element.classList.add('fade-in');
      })
    }

    onControlClick(event) {
      event.preventDefault();

      if (this.slider === {}) {
        return;
      }

      const action = event.target.hasAttribute('data-prev') ? '<' : '>';

      this.slider.go(action);
    }

    calcHeight() {
      const announcementBar = document.querySelector('.section--announcement-bar:not(.section--header + .section--announcement-bar)');
      const announcementBarHeight = announcementBar ? announcementBar.offsetHeight : 0;

      const headerOffset =
        announcementBarHeight +
        document.querySelector('.section--header').offsetHeight;

      this.querySelectorAll('.hero__block').forEach((element) => {
        const heroHeight = element.dataset.heroHeight;
        element.style.height =
          window.innerWidth > 989
            ? 'auto'
            : `calc(${heroHeight}vmax - ${headerOffset}px)`;
      });
    }
  }

  customElements.define('hero-slider', HeroSlider);
})();
