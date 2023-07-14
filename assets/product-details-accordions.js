function handleProductAccordions() {
  const selectors = {
    accordion: '.js-main-product-accordion-group',
    details: 'details'
  };

  const accordions = [...document.querySelectorAll(
    selectors.accordion
  )];

  if (!accordions.length) {
    return;
  }

  accordions.forEach(accordion => {
    accordion.querySelector(selectors.details).addEventListener('toggle', handleAccordionToggle)
  })

  function handleAccordionToggle(e) {
    if (!e.target.open) {
      return;
    }

    accordions.forEach(accordion => {
      const detailsEl = accordion.querySelector(selectors.details)

      if (detailsEl.getAttribute('id') === e.target.getAttribute('id')) {
        return
      }

      detailsEl.removeAttribute('open')
    })
  }
}

handleProductAccordions();
