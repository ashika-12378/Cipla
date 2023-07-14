class LocalizationForm extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('[name="locale_code"], [name="country_code"]');

    this.input.addEventListener('change', this.onChange.bind(this));
  }

  onChange(event) {
    event.preventDefault();

    this.querySelector('form').submit();
  }
}

customElements.define('localization-form', LocalizationForm);
