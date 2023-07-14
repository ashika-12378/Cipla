document.addEventListener( 'DOMContentLoaded', function () {
  new Splide( '#collection-carousel', {
    perPage: 4,
    height: 'auto',
    type: 'loop',
    perMove:1,
    loop: true,
     breakpoints: {
     450 : {
        perPage: 1,
      },
      630: {
        perPage: 2,
      },
      886: {
        perPage: 3,
      },
    },
  }).mount();
});
