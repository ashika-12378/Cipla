class ProductMediaGallery extends ModalDialog {
  constructor() {
    super();
  }

  show(opener) {
    super.show(opener);
    this.showMedia(this.openedBy.dataset.mediaId);
  }

  showMedia(id) {
    const galleryMedia = this.querySelector(`[data-media-id="${id}"]`);

    if (!galleryMedia) {
      return;
    }

    if (window.innerWidth < 990) {
      const mediaTrigger = galleryMedia.querySelector('button');

      this.querySelectorAll('[data-media-id]').forEach((media) => {
        media.style.display = 'none';
      })
      galleryMedia.style.display = 'block';

      if (mediaTrigger) {
        mediaTrigger.click();
        const iframe = galleryMedia.querySelector('iframe');

        if (iframe) {
          if (iframe.classList.contains('js-youtube')) {
            iframe.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*')
          } else if (iframe.classList.contains('js-vimeo')) {
            iframe.contentWindow.postMessage('{"method":"play"}', '*');
          }
        }
      }

      return;
    }

    this.querySelectorAll('[data-media-id]').forEach((media) => {
      media.style.display = 'block';
    })
    galleryMedia.scrollIntoView();
  }
}

customElements.define('product-media-gallery', ProductMediaGallery);
