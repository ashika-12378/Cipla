(() => {
  if (customElements.get('product-card')) {
    return;
  }

  class ProductCard extends HTMLElement {
    constructor() {
      super();

      this.variantsSelect = this.querySelector('[data-product-select]');
      this.swatches = this.querySelectorAll('[data-swatches] input');
      this.media = this.querySelector('[data-product-media]');
      this.form = this.querySelector('form');
      this.cartDrawer = document.querySelector('cart-drawer');
      this.quickviewTemplate = document.querySelector('#product-quickview');
      this.productTitle = this.dataset.productTitle;
      this.productId = this.dataset.productId;

      this.swatches.forEach((swatch) => {
        swatch.addEventListener('change', this.onSwatchChange.bind(this));
      })

      if (this.variantsSelect) {
        this.variantsSelect.addEventListener('change', this.onVariantChange.bind(this));
      }

      this.form && this.form.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSwatchChange(event) {
      const optionSelector = `option[data-option${
        event.target.dataset.optionPosition
      }="${event.target.value}"]`;

      this.variantsSelect.value = this.variantsSelect.querySelector(optionSelector).value;
      this.variantsSelect.dispatchEvent(new Event('change'));
    }

    onVariantChange(event) {
      const selectedOption = event.target.selectedOptions[0];

      this.querySelectorAll('[data-product-link]').forEach((link) => {
        link.setAttribute('href', `${this.dataset.url}${selectedOption.value}`)
      })

      if (!selectedOption.dataset.imageSrc || !selectedOption.dataset.imageSrcset) {
        return;
      }

      this.media.classList.remove('has-hover');
      this.media.querySelector('[data-secondary-image]').style.display = 'none';
      this.media.querySelector('[data-primary-image]').src = selectedOption.dataset.imageSrc;
      this.media.querySelector('[data-primary-image]').srcset = selectedOption.dataset.imageSrcset;
    }

    onSubmit(event) {
      event.preventDefault();

      const submitter = event.target.querySelector('[type="submit"]');
      const dispatchSubmit = submitter.hasAttribute('data-url');

      if (!dispatchSubmit) {
        this.addItemToCart();

        return;
      }

      if (window.modals && window.modals[`Product-Quickview-${this.productId}`]) {
        const quickview = window.modals[`Product-Quickview-${this.productId}`];

        this.attachQuickview(submitter, quickview);

        return;
      }

      fetch(`${submitter.dataset.url}&variant=${this.variantsSelect.value}`)
        .then((response) => response.text())
        .then((responseText) => {
          this.buildQuickView(submitter, responseText);
        })
    }

    buildQuickView(submitter, responseText) {
      const productDetails = new DOMParser()
        .parseFromString(responseText, 'text/html')
        .querySelector('[data-product-details]');
      const productFeaturedMedia = Array.from(
        new DOMParser()
        .parseFromString(responseText, 'text/html')
        .querySelectorAll('[data-product-media]')
      ).filter((media) => media.children[0].tagName.toLowerCase() !== 'modal-opener' && media.children[0].tagName.toLowerCase() !== 'deferred-media');
      const quickview = this.quickviewTemplate.content.cloneNode(true).querySelector('.product-quickview');

      quickview.id = `${quickview.id}${this.productId}`;
      quickview.querySelectorAll('[data-modal-close]').forEach((element) => {
        element.id = `${element.id}${this.productId}`;
      });

      if (quickview.querySelector('[role="dialog"]').ariaLabel) {
        quickview.querySelector('[role="dialog"]').ariaLabel =
          quickview.querySelector('[role="dialog"]').ariaLabel.replace('{{ product_title }}', this.productTitle);
      }

      productFeaturedMedia.forEach((media, index) => {
        media.children[0].setAttribute('data-product-quickview-media', '');

        if (index === 0) {
          return;
        }

        media.children[0].style.display = 'none';
      });
      quickview.querySelector('[data-media-wrapper]').innerHTML = Array.from(productFeaturedMedia).map((media) => media.innerHTML).join('');
      quickview.querySelector('[data-details-wrapper]').innerHTML = productDetails.innerHTML;

      this.attachQuickview(submitter, quickview);
    }

    attachQuickview(submitter, quickview) {
      document.body.append(quickview);
      setTimeout(() => {
        quickview.show(submitter);
      }, 1);
    }

    addItemToCart() {
      if (!this.cartDrawer) {
        this.form && this.form.submit()

        return;
      }

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      formData.append('sections', this.cartDrawer.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;

      this.cartDrawer.setActiveElement(document.activeElement);

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            window.console.error(response.status);

            return;
          }

          this.cartDrawer.handleAddedItem(response);
        })
        .catch((error) => {
          window.console.error(error);
        });
    }
  }

  customElements.define('product-card', ProductCard);
})();
