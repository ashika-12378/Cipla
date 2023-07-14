/**
 * Showcase Media declared and run once per page.
 */
if (typeof showcaseMedia !== 'function') {
  var showcaseMedia = () => {
    const selectors = {
      wrapper: '[data-showcase-points="wrapper"]',
      productsWrapper: '[data-showcase-points="products"]',
      product: '[data-showcase-points="product"]',
      dot: '[data-showcase-points="button"]',
    };
    const classes = {
      active: 'is-active',
      fadeIn: 'fade-in'
    };
    const wrappers = document.querySelectorAll(selectors.wrapper);

    if (!wrappers.length) {
      return;
    }

    wrappers.forEach(wrapper => {
      const productsWrapper = wrapper.querySelector(selectors.productsWrapper)
      const dots = wrapper.querySelectorAll(selectors.dot)

      if (!productsWrapper || !dots.length) {
        return;
      }

      dots.forEach(dot => dot.addEventListener('click', handleDotClick))

      function handleDotClick(e) {
        const id = e.target.dataset?.id;
        const targetProductCard = productsWrapper.querySelector(`[data-showcase-id="${id}"]`);

        if (targetProductCard) {
          productsWrapper.querySelectorAll(selectors.product).forEach(product => {
            product.classList.remove(classes.active)
            product.classList.remove(classes.fadeIn);
          })
          targetProductCard.classList.add(classes.active)
          targetProductCard.classList.add(classes.fadeIn);
          dots.forEach(dot => dot.classList.remove(classes.active))
          e.target.classList.add(classes.active)
        }
      }
    })
  }

  showcaseMedia();
}
