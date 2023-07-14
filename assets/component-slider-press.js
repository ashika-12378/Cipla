class SliderPress extends HTMLElement {
  constructor() {
    super();

    this.mainSliderElement = this.querySelector("[data-slider-main]");
    this.thumbsSliderElement = this.querySelector("[data-slider-thumbs]");
    this.thumbsSlidesCount = Number(
      this.thumbsSliderElement?.dataset?.slidesCount || 0
    );

    if (this.mainSliderElement && this.thumbsSliderElement) {
      this.mainSlider = new Splide(this.mainSliderElement, {
        pagination: false,
        waitForTransition: false,
        arrows: false,
      });
      this.thumbsSlider = new Splide(this.thumbsSliderElement, {
        pagination: false,
        waitForTransition: false,
        arrows: false,
        drag: true,
        isNavigation: true,
        perPage: this.thumbsSlidesCount,
        gap: "1rem",
        autoWdith: true,
        breakpoints: {
          1200: {
            gap: 0,
            perPage: this.thumbsSlidesCount >= 2 ? 2 : this.thumbsSlidesCount,
          },
          990: {
            perPage: 1,
            autoWidth: false,
          },
        },
      }).mount();

      this.mainSlider.sync(this.thumbsSlider).mount();
    }
  }
}

customElements.define("slider-press", SliderPress);
