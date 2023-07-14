(() => {
  if (customElements.get('modal-newsletter')) {
    return;
  }

  class modalNewsletter extends HTMLElement {
    constructor() {
      super();

      this.visibleIn = Number(this.getAttribute('data-visible-in'));
      this.expires = Number(this.getAttribute('data-expires'));
      this.opener = this.querySelector('[data-modal-opener]');
      this.openButton = this.opener.querySelector('button');
      this.newsletterFormWrapper = this.querySelector('.js-newsletter-form');
      this.modal = document.querySelector(this.opener.getAttribute('data-modal'));
      this.section = document.querySelector('#shopify-section-newsletter-modal');
      this.cookieActive = getCookie('_newsletter_modal');

      [...this.querySelectorAll('[data-deny-newsletter]')].forEach((closeButton) => {
        closeButton.addEventListener('click', this.onCloseButtonClick.bind(this))
      });

      this.section.addEventListener('shopify:section:select', this.openModal.bind(this));
      this.section.addEventListener('shopify:section:load', this.openModal.bind(this));
      this.section.addEventListener('shopify:section:reorder', this.openModal.bind(this));

      this.section.addEventListener('shopify:section:deselect', this.closeModal.bind(this));
      this.section.addEventListener('shopify:section:unload', this.closeModal.bind(this));
    }

    connectedCallback() {
      if (Shopify.designMode && this.hasAttribute('open-in-design-mode')) {
        this.openModal();
        eraseCookie('_newsletter_modal');
        this.querySelector('modal-dialog').classList.remove('cookie-active');
        return;
      }

      if (this.cookieActive === null) {
        const isSubmitted = this.newsletterFormWrapper.classList.contains('is-submitted');
        const isNotSubmitted = this.newsletterFormWrapper.classList.contains('is-not-submitted');
        const hasErrors = this.newsletterFormWrapper.classList.contains('has-errors');

        const challenge = document.querySelectorAll('.shopify-challenge__container');
        const openedModal = hasErrors || isNotSubmitted;

        if (isSubmitted || isNotSubmitted) {
          this.querySelector('modal-dialog').classList.add('cookie-active');
          setCookie('_newsletter_modal', 'none', this.expires);
          return;
        }

        if (openedModal) {
          this.openModal();
        }

        if (challenge.length === 0 && !openedModal) {
          this.openModal(this.visibleIn);
        }
      } else {
        this.querySelector('modal-dialog').classList.add('cookie-active');
      }
    }

    openModal(delay = 0) {
      if (this.modal) {
        setTimeout(() => {
          this.modal.show(this.openButton);
        }, delay);
      }
    }

    closeModal() {
      if (this.modal) {
        this.modal.hide();
      }
    }

    onCloseButtonClick(event) {
      event.preventDefault();
      setCookie('_newsletter_modal', 'none', this.expires);
      this.closeModal();
      this.querySelector('modal-dialog').classList.add('cookie-active');
    }
  }

  customElements.define('modal-newsletter', modalNewsletter);
})();
