class RecentlyViewed extends customElements.get('products-carousel') {
  constructor() {
    super();

    this.productHandle = this.dataset.productHandle;

    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      this.fetchRecentProducts();
    }

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 200px 0px'}).observe(this);
  }

  fetchRecentProducts() {
    const handles = localStorage.getItem('recently-viewed');

    if (!handles) {
      this.classList.add('hidden');
      return;
    }

    const handlesToFetch = handles.split(',').filter(handle => handle !== this.productHandle);

    if (handlesToFetch.length === 0) {
      this.classList.add('hidden');
      return;
    }

    const fetchProductsByHandle = handlesToFetch.map(handle => new Promise((resolve, reject) => {
      fetch(`${window.Shopify.routes.root}products/${handle}?view=card`)
        .then(response => response.text())
        .then(html => resolve(html))
        .catch(error => reject(error));
    }));
    Promise.all(fetchProductsByHandle)
      .then(html => {
        new DOMParser().parseFromString(html, 'text/html').querySelectorAll('product-card').forEach(product => {
          const productHtmlWrapper = document.createElement('DIV');

          productHtmlWrapper.classList.add('products-carousel__slide', 'splide__slide');
          productHtmlWrapper.appendChild(product);
          this.querySelector('.splide__list').append(productHtmlWrapper);
          this.initSlider();
        })
      })
  }
}

customElements.define('recently-viewed', RecentlyViewed);
