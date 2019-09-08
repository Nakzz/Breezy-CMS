const { Keystone } = require('@keystone-alpha/keystone');
const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { MongooseAdapter: Adapter } = require('@keystone-alpha/adapter-mongoose');

const { staticRoute, staticPath, distDir } = require('./config');
const { User, RFID, Offers, Products, Events, Transactions, Drinks, Recipes, RelaysAmount} = require('./models');

const PROJECT_NAME = "Breezy CMS";


/**
 * You've got a new KeystoneJS Project! Things you might want to do next:
 * - Add adapter config options (See: https://v5.keystonejs.com/keystone-alpha/adapter-mongoose/)
 * - Select configure access control and authentication (See: https://v5.keystonejs.com/api/access-control)
 */

const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter(),
   defaultAccess: {
    list: true,
    field: true,
  },
});


//Create all the lists from their model
keystone.createList('User', User);
keystone.createList('RFID', RFID);
keystone.createList('Offer', Offers);
keystone.createList('Product', Products);
keystone.createList('Event', Events);
keystone.createList('Transaction', Transactions);
keystone.createList('Drink', Drinks);
keystone.createList('Recipe', Recipes);
keystone.createList('RelaysAmount', RelaysAmount);


// const authStrategy = keystone.createAuthStrategy({
//   type: PasswordAuthStrategy,
//   list: 'User',
// });

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true,   })],
};
