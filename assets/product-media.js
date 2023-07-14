(() => {
  if (customElements.get("product-media")) {
    return;
  }

  class ProductMedia extends HTMLElement {
    constructor() {
      super();

      this.mainSliderElement = this.querySelector("[data-main-product-slider]");
      this.mainSliderDrag =
        Number(this.mainSliderElement.dataset.slidesCount) !== 1;
      this.autoHeight = this.hasAttribute("data-autoheight");
      this.mainSlider = {
        element: this.mainSliderElement,
        bar: this.querySelector("[data-main-product-slider-progress-bar]"),
        instance: null,
        options: {
          pagination: false,
          rewind: true,
          waitForTransition: true,
          flickMaxPages: 0.5,
          arrows: false,
          drag: this.mainSliderDrag,
          speed: 300,
          easing: "ease-in-out",
        },
      };

      this.thumbsSlider = {
        element: this.querySelector("[data-main-product-thumbs]"),
        nextArrow: this.querySelector("[data-thumbs-next]"),
        instance: null,
        options: {
          pagination: false,
          rewind: true,
          waitForTransition: true,
          flickMaxPages: 0.5,
          arrows: false,
          isNavigation: true,
          direction: "ltr",
          perPage: 3,
          gap: "1.6rem",
          speed: 300,
          easing: "ease-in-out",
          breakpoints: {
            425: {
              perPage: 4,
            },
          },
        },
      };

      this.controls = this.querySelectorAll("[data-control]");

      this.controls.forEach((control) => {
        control.addEventListener("click", this.onControlClick.bind(this));
      });

      if (this.thumbsSlider.nextArrow) {
        this.thumbsSlider.nextArrow.addEventListener("click", (event) => {
          this.onControlClick(event, this.thumbsSlider.instance);
        });
      }

      window.addEventListener("DOMContentLoaded", this.initSlider.bind(this));
      window.addEventListener(
        "resize",
        debounce(this.initSlider.bind(this), 500)
      );
    }

    connectedCallback() {
      this.initSlider();

      document.body.addEventListener(
        "touchstart",
        () => {
          this.querySelectorAll("deferred-media[data-autoplay]").forEach(
            (media) => {
              const iframe = media.querySelector("iframe");

              if (!iframe) return;

              if (iframe.classList.contains("js-youtube")) {
                iframe.contentWindow.postMessage(
                  '{"event":"command","func":"' + "playVideo" + '","args":""}',
                  "*"
                );
              }

              if (iframe.classList.contains("js-vimeo")) {
                iframe.contentWindow.postMessage('{"method":"play"}', "*");
              }
            }
          );
        },
        { once: true }
      );
    }

    onControlClick(event, sliderInstance = this.mainSlider.instance) {
      event.preventDefault();

      if (!sliderInstance) {
        return;
      }

      const action = event.target.hasAttribute("data-prev") ? "<" : ">";

      sliderInstance.go(action);
    }

    initSlider() {
      if (
        window.innerWidth >= 990 &&
        !this.mainSlider.element.hasAttribute("data-main-slider-desktop")
      ) {
        this.mainSlider.element.classList.add("is-initialized");

        if (this.mainSlider.instance) {
          this.mainSlider.instance.destroy(true);
          this.mainSlider.instance = null;
        }

        return;
      }

      if (this.mainSlider.instance) {
        return;
      }

      if (this.thumbsSlider.element) {
        this.thumbsSlider.instance = new Splide(
          this.thumbsSlider.element,
          this.thumbsSlider.options
        ).mount();
      }

      this.mainSlider.instance = new Splide(
        this.mainSlider.element,
        this.mainSlider.options
      );

      if (this.autoHeight) {
        this.mainSlider.instance.on("mounted", () => {
          this.changeListHeight(
            this.mainSlider.instance.Components.Elements.root,
            this.mainSlider.instance.Components.Elements.slides
          );
        });

        this.mainSlider.instance.on("moved", () => {
          this.changeListHeight(
            this.mainSlider.instance.Components.Elements.root,
            this.mainSlider.instance.Components.Elements.slides
          );
        });
      }

      if (this.mainSlider.bar) {
        this.mainSlider.instance.on("mounted move", () => {
          const sliderEnd =
            this.mainSlider.instance.Components.Controller.getEnd() + 1;
          this.mainSlider.bar.style.width = `${
            (100 * (this.mainSlider.instance.index + 1)) / sliderEnd
          }%`;
        });
      }

      this.thumbsSlider.instance
        ? this.mainSlider.instance.sync(this.thumbsSlider.instance).mount()
        : this.mainSlider.instance.mount();
    }

    changeListHeight(rootEl, slides) {
      rootEl.querySelector(".splide__list").style.height = `${
        slides.find((slide) => slide.classList.contains("is-active"))
          .offsetHeight
      }px`;
    }

    goToSlide(mediaId) {
      if (!this.mainSlider.instance) {
        const media = this.mainSlider.element.querySelector(
          `[data-media-id="${mediaId}"]`
        );

        if (!media) {
          return;
        }

        media.scrollIntoView({
          behavior: "smooth",
        });

        return;
      }

      const slideIndex = this.mainSlider.instance.s.Elements.slides.findIndex(
        (slide) => Number(slide.dataset.mediaId) === mediaId
      );

      this.mainSlider.instance.go(slideIndex);
    }
  }

  customElements.define("product-media", ProductMedia);
})();
