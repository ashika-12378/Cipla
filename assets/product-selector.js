(() => {
  if (customElements.get('product-selector')) {
    return;
  }

  class ProductSelector extends HTMLElement {
    constructor() {
      super();

      this.addEventListener(
        'change',
        debounce(this.onOptionChange.bind(this), 200)
      );
    }

    connectedCallback() {
      this.initSlider();
    }

    onOptionChange(event) {
      this.updateOptions(event);
      this.updateMasterId();

      if (
        event.target.hasAttribute('data-purchase-option') ||
        event.target.hasAttribute('data-selling-plan-option')
      ) {
        if (event.target.hasAttribute('data-selling-plan-option')) {
          this.selectSellingPlanGroup(event.target);
          this.updateSellingPlanId(event.target.value);
          this.updateProductInfo();
        } else if (event.target.hasAttribute('data-purchase-option')) {
          this.selectFirstSellingPlanGroupOption(event.target);
        }

        this.toggleAddButton(true, '');

        return;
      }

      this.toggleAddButton(true, '');
      this.updatePickupAvailability();
      this.selectSellingPlanGroup();

      if (!this.currentVariant) {
        this.toggleAddButton(true, window.theme.strings.product.unavailable);
        this.setUnavailable();

        return;
      }

      this.updateMedia();
      if (!this.closest('modal-dialog')) this.updateURL();
      this.updateVariantInput();
      this.updateSellingPlanId('');
      this.updateProductInfo();
    }

    initSlider() {
      const sliderList = this.querySelectorAll('.splide');

      if (!sliderList.length) return;

      const mainSettings = {
        trimSpace: 'move',
        autoWidth: true,
        waitForTransition: true,
        pagination: false,
        arrows: true,
        focus: 0,
        omitEnd: true,
        speed: 300,
        easing: 'ease-in-out',
        gap: '0.8rem',
      };

      sliderList.forEach(function (sliderListEl) {
        const slider = new Splide(
          sliderListEl,
          mainSettings
        )

        // Turn off arrows and drag when not enough elements
        slider.on('ready resize', () => {
          setTimeout(() => {
            const TOLERANCE = 4;

            const childrenWidth = [...slider.Components.Elements.slides].reduce(
              (acc, val) => {
                const style = val.currentStyle || window.getComputedStyle(val);
                acc += val.clientWidth + parseInt(style.marginRight);
                return acc;
              },
              0
            );

            const wrapperWidth =
              slider.Components.Elements.list.clientWidth + TOLERANCE;

            if (childrenWidth <= wrapperWidth) {
              slider.options = {
                arrows: false,
                drag: false,
              };
            } else {
              slider.options = {
                arrows: true,
                drag: true,
              };
              sliderListEl.classList.add('is-overflow');
              sliderListEl.parentElement.classList.add('is-slider-active');
            }
          }, 200);
        });

        slider.mount();
      })
    }

    updateOptions(event) {
      const { name, value } = event.target;
      const targetInstance = name.includes('options[')
        ? this.querySelector(
            `[name="${
              name.split('options[')[1].split(']')[0]
            }"][value="${value}"]`
          )
        : this.querySelector(`[name="options[${name}]"]`);

      if (targetInstance) {
        if (targetInstance.type === 'select-one') {
          targetInstance.value = value;
        } else if (targetInstance.type === 'radio') {
          targetInstance.checked = true;
        }
      }

      this.options = Array.from(
        this.querySelectorAll('select, input:checked'),
        (element) => {
          const valueLabel = this.querySelector(
            `#${element.dataset.valueLabel}`
          );
          const elementValue = element.value;
          if (!valueLabel) return elementValue;
          const valueLabelString = valueLabel.hasAttribute('data-option-value')
            ? `${elementValue}`
            : `: ${elementValue}`;
          valueLabel.innerText = valueLabelString;
          return elementValue;
        }
      );
    }

    selectSellingPlanGroup(checkedInput) {
      const input =
        checkedInput || this.querySelector('#Product-Purchase-Option-One-Time');

      if (!input) {
        this.querySelectorAll(
          '[name="purchase_option"], [data-selling-plan-option]'
        ).forEach((option) => {
          option.checked = false;
        });

        return;
      }

      if (checkedInput) {
        checkedInput
          .closest('[data-purchase-option-wrapper]')
          .querySelector('[data-purchase-option]').checked = true;
      } else {
        const sellingPlanGroupIds = this.currentVariant.selling_plan_allocations
          .map((alloc) => alloc.selling_plan_group_id)
          .join(',');

        input.checked = true;
        this.querySelectorAll('[data-purchase-option-wrapper]').forEach(
          (plan) => {
            if (!plan.hasAttribute('data-selling-plan-group-id')) {
              return;
            }

            plan.classList.toggle(
              'hidden',
              !sellingPlanGroupIds.includes(plan.dataset.sellingPlanGroupId)
            );
          }
        );
      }

      this.updateURL(input.value);
      this.querySelectorAll('[data-selling-plan-option]').forEach((option) => {
        if (option === checkedInput) {
          return;
        }

        option.checked = false;
      });
    }

    selectFirstSellingPlanGroupOption(checkedInput) {
      this.querySelectorAll('[data-selling-plan-option]').forEach((option) => {
        option.checked = false;
      });

      const firstSellingPlanOption = checkedInput
        .closest('[data-purchase-option-wrapper]')
        .querySelector('[data-selling-plan-option]');

      if (!firstSellingPlanOption) {
        this.updateURL();
        this.updateSellingPlanId('');
        this.updateProductInfo();

        return;
      }

      firstSellingPlanOption.checked = true;
      this.updateURL(firstSellingPlanOption.value);
      this.updateSellingPlanId(firstSellingPlanOption.value);
      this.updateProductInfo();
    }

    updateSellingPlanId(sellingPlanId) {
      const sellingPlanInput = document.querySelector(
        'product-form [name="selling_plan"]'
      );

      sellingPlanInput.value = sellingPlanId;
    }

    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      });
    }

    updateMedia() {
      if (!this.currentVariant.featured_media) return;

      const productMedia =
        document.querySelector(
          `[data-product-quickview-media][data-media-id="${this.currentVariant.featured_media.id}"]`
        ) || document.querySelector('product-media');

      if (!productMedia) {
        return;
      }

      if (typeof productMedia.goToSlide === 'function') {
        productMedia.goToSlide(this.currentVariant.featured_media.id);
      } else {
        document
          .querySelectorAll('[data-product-quickview-media]')
          .forEach((media) => {
            media.style.display = 'none';
          });
        productMedia.style.display = 'block';
      }
    }

    updateURL(sellingPlanId) {
      if (!window.location.href.includes('/products')) {
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);

      searchParams.set('variant', this.currentVariant.id);

      if (sellingPlanId) {
        searchParams.set('selling_plan', sellingPlanId);
      } else {
        searchParams.delete('selling_plan');
      }

      window.history.replaceState(
        {},
        '',
        `${this.dataset.url}?${searchParams.toString()}`
      );
    }

    updateVariantInput() {
      const productForms = document.querySelectorAll(
        `#product-form-${this.dataset.section}, #product-form-installment`
      );

      if (this.hasAttribute('data-variant-id')) {
        this.setAttribute('data-variant-id', this.currentVariant.id);
      }

      productForms.forEach((form) => {
        const input = form.querySelector('[name="id"]');

        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    updatePickupAvailability() {
      const pickUpAvailabilityNode = document.querySelector(
        'pickup-availability'
      );

      if (!pickUpAvailabilityNode || !this.currentVariant) return;

      pickUpAvailabilityNode.dataset.variantId = this.currentVariant.id;

      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailabilityNode.setAttribute('available', '');
        pickUpAvailabilityNode.fetchAvailability(
          pickUpAvailabilityNode.dataset.variantId
        );

        return;
      }

      pickUpAvailabilityNode.removeAttribute('available');
      pickUpAvailabilityNode.innerHTML = '';
    }

    updateProductInfo() {
      const sellingPlansWrapper = this.querySelector(
        '[data-selling-plans-wrapper]'
      );

      if (sellingPlansWrapper) sellingPlansWrapper.classList.add('is-loading');

      fetch(
        `${this.dataset.url}?${
          this.hasAttribute('data-variant-id')
            ? 'variant=' + this.dataset.variantId
            : new URLSearchParams(window.location.search).toString()
        }&section_id=${this.dataset.section}`
      )
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            'text/html'
          );

          this.changeProductPrice(html);
          this.updateInventoryNotice(html);
          this.hasAttribute('data-product-requires-selling-plan') &&
          !document.querySelector('[name="selling_plan"]').value
            ? this.toggleAddButton(true, 'Please select selling plan')
            : this.toggleAddButton(
                !this.currentVariant.available,
                window.theme.strings.product.soldOut
              );

          if (sellingPlansWrapper) {
            this.changeSellingPlansPrices(html);
            sellingPlansWrapper.classList.remove('is-loading');
          }

          this.changeSellingPlanDescription(html);
        });
    }

    updateInventoryNotice(html) {
      const destination = document.querySelector('[data-inventory-notice]');
      const source = html.querySelector('[data-inventory-notice]');

      if (source && destination) destination.innerHTML = source.innerHTML;
    }

    changeProductPrice(html) {
      const id = `price-${this.dataset.section}`;
      const destination = document.getElementById(id);
      const source = html.getElementById(id);

      if (source && destination) destination.outerHTML = source.outerHTML;

      const price = document.getElementById(`price-${this.dataset.section}`);

      if (price) price.classList.remove('visibility-hidden');
    }

    changeSellingPlansPrices(html) {
      const onTimePriceId = `#price-one-time-${this.dataset.section}`;
      const plansPricesDestinations = document.querySelectorAll(
        '[data-selling-plan-group-price]'
      );

      if (!this.querySelector(onTimePriceId) && !plansPricesDestinations) {
        return;
      }

      if (this.querySelector(onTimePriceId)) {
        this.querySelector(onTimePriceId).textContent =
          html.querySelector(onTimePriceId).textContent;
      }

      if (plansPricesDestinations) {
        plansPricesDestinations.forEach((destination) => {
          destination.innerHTML = html.querySelector(
            `[data-selling-plan-group-price][data-selling-plan-group-name="${destination.dataset.sellingPlanGroupName}"]`
          ).innerHTML;
        });
      }
    }

    changeSellingPlanDescription(html) {
      const sellingPlansDescription = this.querySelector(
        '[data-selling-plan-description]'
      );

      if (sellingPlansDescription) {
        sellingPlansDescription.innerHTML = html.querySelector(
          '[data-selling-plan-description]'
        ).innerHTML;
      }
    }

    toggleAddButton(disable = true, text) {
      const productForm = document.getElementById(
        `product-form-${this.dataset.section}`
      );

      if (!productForm) return;

      const addButton = productForm.querySelector('[name="add"]');
      const buyNowButton = productForm.querySelector('[data-fast-checkout]');
      const addButtonText = productForm.querySelector('[name="add"] > span');

      if (!addButton) return;

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        buyNowButton && buyNowButton.setAttribute('disabled', 'disabled');

        if (text) {
          addButtonText.textContent = text;
          addButton.classList.remove('is-loading');
        } else {
          addButton.classList.add('is-loading');
        }
      } else {
        addButton.removeAttribute('disabled');
        buyNowButton && buyNowButton.removeAttribute('disabled');
        addButtonText.textContent = window.theme.strings.product.addToCart;
        addButton.classList.remove('is-loading');
        buyNowButton && buyNowButton.classList.remove('is-loading');
      }
    }

    setUnavailable() {
      const button = document.getElementById(
        `product-form-${this.dataset.section}`
      );
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span');
      const price = document.getElementById(`price-${this.dataset.section}`);

      if (!addButton) return;

      addButtonText.textContent = window.theme.strings.product.unavailable;

      if (price) price.classList.add('visibility-hidden');
    }

    getVariantData() {
      return JSON.parse(this.querySelector('[data-product-json]').textContent)
        .variants;
    }
  }

  customElements.define('product-selector', ProductSelector);
})();
