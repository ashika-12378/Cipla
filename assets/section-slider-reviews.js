class SliderReviews extends HTMLElement {
  constructor() {
    super();

    this.sliderElement = this.querySelector("[data-slider-main]");
    this.controls = this.querySelectorAll("[data-control]");

    this.controls.forEach((control) => {
      control.addEventListener("click", this.onControlClick.bind(this));
    });

    if (this.sliderElement) {
      this.slider = new Splide(this.sliderElement, {
        pagination: false,
        waitForTransition: false,
        arrows: false,
        perPage: this.sliderElement.dataset.slidesPerPage,
        gap: "9.6rem",
        speed: 800,
        easing: 'ease-in-out',
        breakpoints: {
          990: {
            perPage: 1,
          },
        },
      }).mount();
    }
  }

  onControlClick(event) {
    event.preventDefault();

    if (!this.slider) {
      return;
    }

    const action = event.target.hasAttribute("data-prev") ? "<" : ">";

    this.slider.go(action);
  }
}

customElements.define("slider-reviews", SliderReviews);
