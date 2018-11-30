customElements.define(
  'login-form',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('signin-template');
      const templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
      const form = this.shadowRoot.querySelector('form');
      form.addEventListener('submit', this.onSubmit.bind(this), false);
    }

    onSubmit(e) {
      e.preventDefault();
      //   Get inputs
      const email = this.shadowRoot.querySelector('#inputEmail').value;
      const password = this.shadowRoot.querySelector('#inputPassword').value;
      this.login(email, password);
    }

    login(email, password) {
      // Add login method here
      Parse.User.logIn(email, password)
        .then(user => {
          window.location.href = 'index.html';
        })
        .catch(e => {
          alert(e.message);
        });
    }
  }
);
