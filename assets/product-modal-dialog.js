if (!customElements.get('product-modal-dialog')) {
  class ProductModalDialog extends ModalDialog {
    constructor() {
      super();
    }

    show(opener) {
      super.show(opener);
      this.calcTopOffset();
    }

    calcTopOffset() {
      const bar = document.querySelector('.section--announcement-bar');
      const header = document.querySelector('.section--header');
      const isScrolled = window.scrollY > 0;
      const headerSticky = header.classList.contains('shopify-section-header-sticky');
      const headerVisible = isScrolled && !header.classList.contains('shopify-section-header-hidden');
      const hasBar = !isScrolled && bar
      const deviceIsMobile = window.outerWidth <= 990

      if (isScrolled || deviceIsMobile) {
        this.style.top = headerVisible && !deviceIsMobile && headerSticky
          ? `${header.offsetHeight}px`
          : '0px';

        return;
      }

      this.style.top = hasBar
        ? `${bar.offsetHeight + header.offsetHeight}px`
        : `${header.offsetHeight}px`;
    }
  }

  customElements.define('product-modal-dialog', ProductModalDialog);
}
