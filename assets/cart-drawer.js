class CartDrawerRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartDrawer = this.closest('cart-drawer');
      cartDrawer.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-drawer-remove-button', CartDrawerRemoveButton);

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.drawer = document.getElementById('cart-drawer');
    this.cartDrawerOpen = document.querySelector('[data-js-cart-drawer="cartDrawerOpen"]');
    this.cartDrawerClose = document.querySelector('[data-js-cart-drawer="cartDrawerClose"]');
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.itemCountHolder = document.querySelector('[data-js-cart-item-count]');

    this.lineItemStatusElement = document.getElementById('cart-drawer-line-item-status');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));

    this.drawer.addEventListener('keyup', (event) => event.code === 'Escape' && this.close());
    this.querySelectorAll('[data-js-cart-drawer="cartDrawerClose"]').forEach((closeButton) => {
      this.activeElement = document.activeElement || this.cartDrawerOpen;
      closeButton.addEventListener('click', this.close.bind(this));
    });

    document.querySelectorAll('[data-js-cart-drawer="cartDrawerOpen"]').forEach((openButton) => {
      openButton.addEventListener('click', this.handleDrawerOpen.bind(this))
    });
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  /**
   * Open the cart-drawer
   */
  handleDrawerOpen() {
    if (theme.pageType === 'cart') {
      return;
    }
    this.open();
  }

  /**
   * Triggered whenever product-form was submitted and item was added to cart
   * @param  {Object} Added to cart item data
   */
  handleAddedItem(addedItemResponse) {
    const fetchedCartData = this.getCart();
    this.handleCartData(fetchedCartData, addedItemResponse);
  }

  /**
   * Get Cart data from Shopify Ajax API
   * @return {Object} Promise
   */
  getCart() {
    return new Promise((resolve, reject) => {
      fetch(`${routes.ajax_api}`)
        .then((response) => response.json())
        .then((response) => {
          if (response) {
            resolve(response);
            return;
          }

          reject(response);
        })
        .catch((e) => {
          window.console.error(error);
        });
    });
  }

  /**
   * Handle cart data after the response from Shopify Ajax API
   * @param  {Object} Promise
   * @param  {Object} Added to cart item data
   */
  handleCartData(promise, addedItemResponse = false) {
    Promise.all([promise]).then((values) => {
      if (values.length === 0) {
        return;
      }

      const cartData = values[0];

      if (addedItemResponse !== false) {
        const line = cartData.items.map((item, index) => {
          if (item.id === addedItemResponse.id) {
            return index;
          }
        });

        this.renderContents(cartData, addedItemResponse, line, '', false);
      }
    })
    .catch((error) => {
      window.console.error(error);
    });
  }

  /**
   * Get sections to render
   * @return {Object}
   */
  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        section: document.getElementById('cart-drawer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        this.renderContents(parsedState, false, line, name, true);

        if (quantity == 0) {
          this.updateTrappedFocus();
        }
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        document.getElementById('cart-drawer-errors').textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  open() {
    this.activeElement = document.activeElement || this.cartDrawerOpen;
    this.drawer.classList.add('animate', 'active');

    this.drawer.addEventListener('transitionend', () => {
      this.drawer.focus();
      trapFocus(this.drawer, this.cartDrawerClose);
    }, { once: true });

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.drawer.classList.remove('active');

    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  /**
   * Render Contents
   * @param  {Object} Cart data
   * @param  {Object/Boolean} Added to cart item data / False
   * @param  {Number}  Line item index
   * @param  {String}  Line item input name
   * @param  {Boolean} Whether Cart-drawer is opened
   */
  renderContents(parsedState, addedItemResponse = false, line, name, isDrawerOpened = false) {
    this.classList.toggle('is-empty', parsedState.item_count === 0);
    this.itemCountHolder.innerText = parsedState.item_count;
    this.itemCountHolder.classList.toggle('is-active', parsedState.item_count > 0);
    const cartFooter = document.getElementById('cart-drawer-footer');

    if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);

    this.getSectionsToRender().forEach((section => {
      let state = parsedState;

      if (addedItemResponse !== false) {
        state = addedItemResponse;
      }

      const elementToReplace =
        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

      elementToReplace.innerHTML =
        this.getSectionInnerHTML(state.sections[section.section], section.selector);
    }));

    this.updateLiveRegions(line, parsedState.item_count);
    const lineItem =  document.getElementById(`CartDrawerItem-${line}`);
    if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();
    this.disableLoading();

    if (!isDrawerOpened) {
      if (this.header) this.header.reveal();
      this.open();
    }
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  updateLiveRegions(line, itemCount) {
    if (line == '' || !line) {
      return;
    }

    if (this.currentItemCount === itemCount) {
      document.getElementById(`CartDrawerItem-error-${line}`)
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          document.getElementById(`CartDrawerItem-quantity-${line}`).value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-drawer-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  enableLoading(line) {
    document.getElementById('cart-drawer').classList.add('cart-drawer--disabled');
    this.querySelectorAll(`#CartDrawerItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    document.getElementById('cart-drawer').classList.remove('cart-drawer--disabled');
  }

  handleBodyClick(event) {
    const target = event.target;
    const isNotDrawer = (target !== this.drawer) && (!target.closest('cart-drawer'));
    const isNotButtonOpen = target !== this.cartDrawerOpen && !target.closest('[data-js-cart-drawer="cartDrawerOpen"]');
    const isCloseButton = (target === this.cartDrawerClose) || (target.closest('[data-js-cart-drawer="cartDrawerClose"]'));

    if (isNotDrawer && isNotButtonOpen || isCloseButton) {
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  updateTrappedFocus() {
    removeTrapFocus(document.activeElement);

    setTimeout(() => {
      this.setActiveElement(this.cartDrawerClose || this.cartDrawerOpen);
      this.drawer.focus();
      trapFocus(this.drawer, this.cartDrawerClose);
    });
  }
}

customElements.define('cart-drawer', CartDrawer);
