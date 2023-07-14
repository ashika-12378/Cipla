class StickyHeader extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.header = this.closest('.section--header');
      this.predictiveSearch = this.querySelector('predictive-search');
      this.enableStickyHeader = [true, 'true'].includes(this.dataset.enableStickyHeader);
      this.announcementBar = document.querySelector('announcement-bar');
      this.isTransparent = this.hasAttribute('data-transparent');
      this.dropdownLinks = this.querySelectorAll('[data-expand-on-hover]');
      this.overlay = this.querySelector('[data-overlay]');
      this.headerOffset = document.querySelector('.section--announcement-bar')?.offsetHeight || 0;

      this.setHeaderOffset();

      this.onScrollHandler = this.onScroll.bind(this);

      window.addEventListener('scroll', this.onScrollHandler, false);
      window.addEventListener('resize', this.setHeaderOffset.bind(this));
      this.dropdownLinks.forEach((link) => {
        link.addEventListener('mouseenter', (event) => this.dropdownOverlayToggle(event));
        link.addEventListener('mouseleave', (event) => this.dropdownOverlayToggle(event));
      })
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScrollHandler);
    }

    setHeaderOffset() {
      if (!this.isTransparent) {
        return;
      }

      let offset = 0;
      const headerInner = this.header.querySelector('.header__inner');
      const headerInnerHeight = headerInner.clientHeight || 0;
      const isAnnouncementBelow = this.announcementBar?.classList.contains('announcement-bar--is-bellow') || false;

      offset += headerInnerHeight;

      if (isAnnouncementBelow && this.announcementBar) {
        offset += this.announcementBar.clientHeight;
        this.announcementBar.style.top = `${offset}px`;
      }

      this.header.style.marginBottom = `-${offset}px`;
    }

    onScroll() {
      if (!this.enableStickyHeader || this.header.classList.contains('menu-open')) {
        return;
      }

      let bodyTopOffset = parseInt(document.body.style.top) === NaN ? 0 : parseInt(document.body.style.top);
      let scrollTop = 0;
      if (bodyTopOffset !== NaN && bodyTopOffset < 0) {
        scrollTop = bodyTopOffset * -1;
      } else {
        scrollTop = window.scrollY;
      }

      if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

      let isScrolledAfter = scrollTop > this.headerOffset;
      const isAnnouncementBelow = this.announcementBar?.classList.contains('announcement-bar--is-bellow') || false;

      isAnnouncementBelow ? isScrolledAfter = scrollTop > 0 : isScrolledAfter = scrollTop > this.headerOffset;

      if (isScrolledAfter) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        requestAnimationFrame(this.reset.bind(this));
      }

      this.classList.toggle('is-solid', isScrolledAfter && this.isTransparent);
    }

    reveal() {
      const isAnnouncementBelow = this.announcementBar?.classList.contains('announcement-bar--is-bellow') || false;
      this.header.classList.add('shopify-section-header-sticky', 'animate');
      this.header.classList.remove('shopify-section-header-hidden');

      if (this.announcementBar &&! this.isTransparent) {
        this.announcementBar.parentElement.style[isAnnouncementBelow ? 'paddingTop' : 'paddingBottom'] = `${this.header.offsetHeight}px`;
      }
    }

    reset() {
      const isAnnouncementBelow = this.announcementBar?.classList.contains('announcement-bar--is-bellow') || false;
      this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');

      if (this.announcementBar) {
        this.announcementBar.parentElement.style[isAnnouncementBelow ? 'paddingTop' : 'paddingBottom'] = '0px';
      }
    }

    closeMenuDisclosure() {
      this.disclosures = this.disclosures || this.header.querySelectorAll('details-disclosure');
      this.disclosures.forEach(disclosure => disclosure.close());
    }

    closeSearchModal() {
      this.searchModal = this.searchModal || this.header.querySelector('details-modal');

      if (!this.searchModal) {
        return;
      }

      this.searchModal.close(false);
    }

    dropdownOverlayToggle(event) {
      if (!this.overlay) {
        return;
      }

      this.overlay.classList.toggle('is-visible', event.type === 'mouseenter');
    }
  }

  customElements.define('sticky-header', StickyHeader);
