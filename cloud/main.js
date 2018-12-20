/**
 * @author Jack Considine <jackconsidine3@gmail.com>
 * @package
 * 2018-11-27
 */

const TICKET = 'Ticket';
const EVENT = 'Event';
const MASTER_KEY = { useMasterKey: true };

const requireAuth = user => {
  if (!user) throw new Error('User must be authenticated!');
};

Parse.Cloud.define(
  'user:signup',
  async ({ params: { email, password, phone } }) => {
    return new Parse.User({
      email,
      password,
      username: email,
      phone
    }).save(MASTER_KEY);
  }
);

/**
 * retrieves tickets
 */
Parse.Cloud.define('tickets:list', async ({ user }) => {
  // Requires that a user be logged in to do anything
  requireAuth(user);
  const { Query } = Parse;
  const eventQ = new Query(EVENT).greaterThan('when', new Date());
  //   Query tickets for events that haven't yet happend
  const tickets = await new Query(TICKET)
    .matchesQuery('event', eventQ)
    .include('event')
    .include('user')
    .descending('createdAt')
    .find(MASTER_KEY);

  // Build a response object that contains all the data we want
  return tickets.map(t => {
    let phone, email;
    const contactmethod = t.get('contactMethod');
    if (contactmethod === 'both' || contactmethod === 'phone') {
      phone = t.get('user').get('phone');
    }
    if (contactmethod === 'both' || contactmethod === 'email') {
      email = t.get('user').getEmail();
    }
    /**
     * For this API response, return an object that merges the ticket with the event, with the
     * user's phone and email ** phone or email may be undefined, but one will exist **
     */
    return Object.assign({}, t.toJSON(), {
      event: t.get('event').toJSON(),
      phone,
      email
    });
  });
});

/**
 * retrieves tickets
 */
Parse.Cloud.define(
  'tickets:create',
  async ({ user, params: { contactMethod, ticketPrice, eventId } }) => {
    requireAuth(user);
    const acl = new Parse.ACL();
    acl.setWriteAccess(user.id, true);
    acl.setPublicReadAccess(true);

    const newTicket = new Parse.Object(TICKET, {
      contactMethod,
      ticketPrice,
      user,
      event: new Parse.Object(EVENT, { objectId: eventId })
    });
    // Add permissions
    newTicket.setACL(acl);

    const newTicketSaved = await newTicket.save(null, MASTER_KEY);
    return newTicketSaved.toJSON();
  }
);

/**
 * retrieves events
 * Create events from the admin panel
 */
Parse.Cloud.define('events:list', async ({ user }) => {
  requireAuth(user);
  const events = await new Parse.Query(EVENT)
    .greaterThan('when', new Date())
    .find(MASTER_KEY);
  return events.map(e => e.toJSON());
});
