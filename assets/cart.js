class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items').updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartNote extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('change', debounce((event) => {
      const body = JSON.stringify({ note: event.target.value });
      fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }});
    }, 300))
  }
}

customElements.define('cart-note', CartNote);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');
    this.hoverEvent = new Event('mouseover');
    this.itemCountHolder = document.querySelector('[data-js-cart-item-count]');
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));

    this.querySelector('#cart').addEventListener('submit', (event) => {
      const container = this.querySelector('.cart-items');
      const actions = this.querySelector('.cart-items__actions');
      const hasTerms = container.classList.contains('js-has-terms');

      if (!hasTerms) {
        return;
      }

      const isTermsAccepted = container.querySelector('#agree').checked;
      actions.classList.remove('is-hovered');

      if (!isTermsAccepted) {
        event.preventDefault();
        actions.classList.add('is-hovered');
      }
    });

    window.addEventListener('load', () => {
      const container = this.querySelector('.cart-items');
      const hasTerms = container.classList.contains('js-has-terms');

      if (!hasTerms) {
        return;
      }

      const isTermsAccepted = container.querySelector('#agree').checked;
      this.handleTermsCheckbox(isTermsAccepted);
    });
  }

  onChange(event) {
    const isQuantityInput = event.target.classList.contains('quantity__input');
    const isAcceptTermsInput = event.target.id == 'agree';

    if (isAcceptTermsInput) {
      this.handleTermsCheckbox(event.target.checked);
    }

    if (isQuantityInput) {
      this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
    }
  }

  handleTermsCheckbox(isChecked) {
    this.querySelector('.cart-items__actions').classList.remove('is-hovered');
    this.querySelector('.cart-items').classList.toggle('agreed-to-terms', isChecked);
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents-body',
      },
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents-foot',
      },
      {
        id: 'cart-live-region-text',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-cart-messages'
      },
      {
        id: 'shopping-cart-line-item-status',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-cart-messages'
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
        this.classList.toggle('is-empty', parsedState.item_count === 0);

        this.itemCountHolder.innerText = parsedState.item_count;
        this.itemCountHolder.classList.toggle('is-active', parsedState.item_count > 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem =  document.getElementById(`CartItem-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();
        this.disableLoading();

      }).catch((e) => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        document.getElementById('cart-errors').textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      document.getElementById(`CartItem-error-${line}`)
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          document.getElementById(`CartItem-quantity-${line}`).value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    document.getElementById('main-cart-items').classList.add('cart__items--disabled');
    this.querySelectorAll(`#CartItem-${line} .loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    document.getElementById('main-cart-items').classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);
