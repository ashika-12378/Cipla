if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.productId = this.dataset.productId; 
      this.form = this.querySelector('form');
      this.form.querySelector('[name="id"]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartDrawer = document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      this.buyNowButton = this.querySelector('[data-fast-checkout]');
      this.checkoutInput = this.querySelector('input[name="return_to"][value="/checkout"]');

      if (this.buyNowButton) {
        this.buyNowButton.addEventListener('click', () => {
          this.buyNowButton.setAttribute('aria-disabled', true);
          this.buyNowButton.classList.add('is-loading');
          this.checkoutInput && this.checkoutInput.removeAttribute('disabled');
          this.form.submit();
        });
      }
    }

    onSubmitHandler(event) {
      if (!this.cartDrawer) return;

      event.preventDefault();
      if (this.submitButton.classList.contains('is-loading')) return;

      this.handleErrorMessage();
      this.cartDrawer.setActiveElement(document.activeElement);

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('is-loading');

      const fetchedData = this.addItemToCart();
      this.handleFetchedData(fetchedData);
    }

    addItemToCart() {
      return new Promise((resolve, reject) => {
        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        formData.append('sections', this.cartDrawer.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response) {
              resolve(response);
              return;
            }

            this.submitButton.classList.remove('is-loading');
            this.submitButton.removeAttribute('aria-disabled');

            reject(response);
          })
          .catch((e) => {
            window.console.error(error);
          });
      });
    }

    handleFetchedData(promise) {
      Promise.all([promise]).then((values) => {
        if (values.length === 0) {
          return;
        }

        const fetchedData = values[0];

        if (fetchedData.status) {
          this.handleErrorMessage(fetchedData.description);
          return;
        }

        this.cartDrawer.handleAddedItem(fetchedData);

        const quickview = document.querySelector(`#Product-Quickview-${this.productId}`);

        if (quickview) {
          quickview.hide();
        }
      })
      .catch((error) => {
        window.console.error(error);
      })
      .finally(() => {
        this.submitButton.classList.remove('is-loading');
        this.submitButton.removeAttribute('aria-disabled');
      });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.main-product__form-error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.main-product__form-error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}
