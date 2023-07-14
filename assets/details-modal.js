class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.detailsContainer = this.querySelector('details');
    this.summaryToggle = this.querySelector('summary');
    this.scrollUnlocked = this.hasAttribute('data-scroll-unlocked');
    this.hasPredictiveSearch = this.hasAttribute('data-has-predictive-search');
    this.predictiveSearch = this.detailsContainer.querySelector('predictive-search');

    this.detailsContainer.addEventListener(
      'keyup',
      (event) => event.code.toUpperCase() === 'ESCAPE' && this.close()
    );
    this.summaryToggle.addEventListener(
      'click',
      this.onSummaryClick.bind(this)
    );
    this.querySelector('button[type="button"]').addEventListener(
      'click',
      this.onButtonClick.bind(this)
    );

    this.summaryToggle.setAttribute('role', 'button');
  }

  isOpen() {
    return this.detailsContainer.hasAttribute('open');
  }

  onSummaryClick(event) {
    event.preventDefault();
    event.target.closest('details').hasAttribute('open')
      ? this.close()
      : this.open(event);
  }

  onBodyClick(event) {
    if (!this.contains(event.target) || event.target.classList.contains('modal-overlay')) this.close(false);
  }

  onButtonClick(event) {
    event.preventDefault();
    this.close();
  }

  open(event) {
    this.onBodyClickEvent =
      this.onBodyClickEvent || this.onBodyClick.bind(this);
    event.target.closest('details').setAttribute('open', true);
    document.body.addEventListener('click', this.onBodyClickEvent);

    if (!this.scrollUnlocked) {
      document.body.classList.add('overflow-hidden');
    }

    const transition = getComputedStyle(this.summaryToggle.nextElementSibling).getPropertyValue('transition');

    if (transition !== 'all 0s ease 0s') {
      this.summaryToggle.nextElementSibling.ontransitionend = () => {
        this.trapFocus();
      }
    } else {
      this.trapFocus();
    }
  }

  trapFocus() {
    trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    );
  }

  animatedClose(focusToggle = true) {
    this.predictiveSearch.close();
    this.classList.add('animate-out');

    setTimeout(() => {
      this.classList.remove('animate-out');
      this.closeDefault(focusToggle);
    }, 550);
  }

  close(focusToggle = true) {
    if (this.hasPredictiveSearch && this.predictiveSearch) {
      this.animatedClose(focusToggle);
      return;
    }

    this.closeDefault(focusToggle);
  }

  closeDefault(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.summaryToggle : null);
    this.detailsContainer.removeAttribute('open');
    document.body.removeEventListener('click', this.onBodyClickEvent);

    if (!this.scrollUnlocked) {
      document.body.classList.remove('overflow-hidden');
    }
  }
}

customElements.define('details-modal', DetailsModal);
