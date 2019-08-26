const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { Text, Checkbox, Password } = require('@keystone-alpha/fields');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { MongooseAdapter: Adapter } = require('@keystone-alpha/adapter-mongoose');

const { staticRoute, staticPath, distDir } = require('./config');
const { User, RFID} = require('./models');

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



// keystone.createList('User', {
//   fields: {
//     name: { type: Text },
//     email: {
//       type: Text,
//       isUnique: true,
//     },
//     isAdmin: { type: Checkbox },
//     password: {
//       type: Password,
//     },
//   },
//   access: {
//     read: access.userIsAdminOrOwner,
//     update: access.userIsAdminOrOwner,
//     create: access.userIsAdmin,
//     delete: access.userIsAdmin,
//   },
// });

// const authStrategy = keystone.createAuthStrategy({
//   type: PasswordAuthStrategy,
//   list: 'User',
// });

keystone.createList('User', User);
keystone.createList('RFID', RFID);

// const authStrategy = keystone.createAuthStrategy({
//   type: PasswordAuthStrategy,
//   list: 'User',
// });

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true,   })],
};
