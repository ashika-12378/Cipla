class AnnouncementBar extends HTMLElement {
  constructor() {
    super();

    this.sliderElement = this.querySelector('[data-slider]');
    this.slider = null;

    window.addEventListener('resize', debounce(this.initSlider.bind(this), 100));
  }

  connectedCallback() {
    this.initSlider();
  }

  initSlider() {
    const sliderElement = this.querySelector('.splide');

    if (!sliderElement) return;

    if (window.innerWidth >= 990 && sliderElement.hasAttribute('data-slider-destroy-desktop')) {
      sliderElement.classList.add('is-initialized');

      if (this.slider !== null) {
        this.slider.destroy(true);
        this.slider = null;
      }

      return;
    }

    if (this.slider !== null) return;

    this.slider = new Splide(sliderElement, {
      drag: false,
      pagination: false,
      rewind: true,
      waitForTransition: false,
      arrows: false,
      autoplay: true,
      interval: Number(this.sliderElement.dataset.interval)
    }).mount();
  }
}

customElements.define('announcement-bar', AnnouncementBar);
