/**
 * @author Jack Considine <jackconsidine3@gmail.com>
 * @package
 * 2018-11-25
 */

var Parse = window.Parse;
/**
 * The main component that holds the other components
 */
customElements.define(
  'main-app',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('main-template');
      const templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
      if (!Parse.User.current()) {
        window.location = '/login.html';
        return;
      }
      this.fetchTickets()
        .catch(e => {
          alert('Error fetching tickets!');
          return [];
        })
        .then(tickets => {
          this.tickets = tickets;
          this.setTickets.bind(this)();
        });

      this.fetchEvents()
        .catch(e => {
          alert('Error fetching events!');
          return [];
        })
        .then(events => {
          // Add events to the select dropdown
          const eventSelect = this.shadowRoot.querySelector('#eventSelect');
          events.forEach(e => {
            // add an option
            const optionNode = document.createElement('option');
            optionNode.setAttribute('value', e.objectId);
            optionNode.textContent = e.name;
            eventSelect.append(optionNode);
          });
        });
      // prevent flicker
      window.addEventListener(
        'load',
        () => {
          this.shadowRoot
            .querySelector('#wrapper')
            .setAttribute('style', 'display: block;');
        },
        false
      );

      // Set create ticket function
      const form = this.shadowRoot.querySelector('#newTicketForm');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const names = ['ticketPrice', 'event'];

        const [ticketPrice, eventId] = names.map(n => {
          return this.shadowRoot.querySelector(`*[name='${n}']`).value;
        });
        const contactMethod = this.shadowRoot.querySelector(
          "input[name='contactMethod']:checked"
        ).value;
        this.listTicket(contactMethod, ticketPrice, eventId).then(() => {
          this.fetchTickets()
            .catch(e => {
              alert('Error fetching tickets!');
              return [];
            })
            .then(tickets => {
              this.tickets = tickets;
              this.setTickets.bind(this)();
            });

          this.shadowRoot
            .querySelectorAll('input[type=radio]:checked')
            .forEach(attr => {
              attr.checked = false;
            });
          ['ticketPrice', 'event'].forEach(n => {
            this.shadowRoot.querySelector(`*[name='${n}']`).value = '';
          });
        });
      });
    }

    fetchTickets() {
      // PART 1: API ENDPOINT FOR FETCHING TICKETS
      return Parse.Cloud.run('tickets:list');
    }

    fetchEvents() {
      return Parse.Cloud.run('events:list');
    }

    listTicket(contactMethod, ticketPrice, eventId) {
      /**
       * ADD TICKET CODE
       */
      return Parse.Cloud.run('tickets:create', {
        contactMethod,
        ticketPrice,
        eventId
      });
    }

    setTickets() {
      // Fetch all posts
      const tickets = this.tickets;
      const ticketsElem = this.shadowRoot.querySelector('#tickets');
      ticketsElem.innerHTML = '';

      tickets.forEach(ticket => {
        const ticketNode = document.createElement('ticket-listing');
        ticketNode.setAttribute('price', ticket.ticketPrice);
        if (ticket.phone) {
          ticketNode.setAttribute('phone', ticket.phone);
        }
        if (ticket.email) {
          ticketNode.setAttribute('email', ticket.email);
        }

        ticketNode.setAttribute('event', ticket.event.name);
        ticketsElem.appendChild(ticketNode);
      });
    }
  }
);

customElements.define(
  'nav-bar',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('nav-bar');
      const templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(templateContent.cloneNode(true));

      this.shadowRoot
        .querySelector('#logoutButton')
        .addEventListener('click', this.logout);
    }

    logout() {
      Parse.User.logOut()
        .catch(() => {})
        .then(() => {
          window.location.href = 'login.html';
        });
    }
  }
);

/**
 * Component for displaying a ticket listing
 */
customElements.define(
  'ticket-listing',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('ticket-listing');
      const templateContent = template.content;
      const shadowRoot = this.attachShadow({ mode: 'open' });

      shadowRoot.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
      const ticketPrice = this.shadowRoot.querySelector('#ticket-price');
      const priceAttr = this.getAttribute('price');
      const telAttr = this.getAttribute('phone');
      const emailAttr = this.getAttribute('email');
      const eventAttr = this.getAttribute('event');

      if (priceAttr) {
        ticketPrice.textContent = `$${priceAttr}`;
      }

      // Contact info
      const phone = this.shadowRoot.querySelector('#telephone');
      const email = this.shadowRoot.querySelector('#email');
      const eventName = this.shadowRoot.querySelector('#event');

      if (telAttr) {
        phone.setAttribute('href', `tel:${telAttr.replace(/-/g, '')}`);
        phone.textContent = telAttr;
      }

      if (emailAttr) {
        email.setAttribute('href', `mailto:${emailAttr}`);
        email.textContent = emailAttr;
      }

      eventName.textContent = eventAttr;
    }
  }
);
