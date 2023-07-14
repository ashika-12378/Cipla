  document.addEventListener('DOMContentLoaded', function() {
    var offerWrappers = document.querySelectorAll('.offer-text_wrapper');
    offerWrappers.forEach(function(wrapper) {
      wrapper.addEventListener('click', function() {
        // Remove "-isactive" class from all offer wrappers
        offerWrappers.forEach(function(wrapper) {
          wrapper.classList.remove('-isactive');
        });

        // Add "-isactive" class to the clicked offer wrapper
        this.classList.add('-isactive');
      });
    });
  });