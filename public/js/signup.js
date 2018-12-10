customElements.define(
  'signup-form',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('signup-template');
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
      const phone = this.shadowRoot.querySelector('#inputPhone').value;
      const email = this.shadowRoot.querySelector('#inputEmail').value;
      const password = this.shadowRoot.querySelector('#inputPassword').value;
      const confirmPassword = this.shadowRoot.querySelector(
        '#inputPasswordConfirm'
      ).value;

      if (password !== confirmPassword) {
        alert("password's don't match!");
      } else if (password.length < 6) {
        alert('Please make your password at least 6 characters');
      }

      this.signup(email, password, phone)
        .then(() => {
          alert('Success signing up! Please verify your email, then login');
          window.location.href = 'login.html';
        })
        .catch(e => {
          alert(e.message);
        });
    }

    signup(email, password, phone) {
      return Parse.Cloud.run('user:signup', {
        email,
        password,
        phone
      });
    }
  }
);
