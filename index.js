const { Keystone } = require('@keystone-alpha/keystone');
const { GoogleAuthStrategy } = require('@keystone-alpha/auth-passport');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { MongooseAdapter: Adapter } = require('@keystone-alpha/adapter-mongoose');

const { staticRoute, staticPath, distDir } = require('./config');
const {
    User,
    RFID,
    Offers,
    Products,
    Events,
    Transactions,
    Drinks,
    Recipes,
    RelaysAmount,
    ActiveOffers
} = require('./models');

const PROJECT_NAME = "Breezy CMS";

const cookieSecret = '<Something super secret>';
/**
 * You've got a new KeystoneJS Project! Things you might want to do next:
 * - Add adapter config options (See: https://v5.keystonejs.com/keystone-alpha/adapter-mongoose/)
 * - Select configure access control and authentication (See: https://v5.keystonejs.com/api/access-control)
 */

 // const authStrategy = keystone.createAuthStrategy({
 //   type: PasswordAuthStrategy,
 //   list: 'User',
 // });


const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter({
      mongoUri: "mongodb://localhost/breezy-cms"
  }),
   defaultAccess: {
    list: true,
    field: true,
  },
//   cookieSecret,
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
keystone.createList('ActivedOffer', ActiveOffers);



// const googleStrategy = keystone.createAuthStrategy({
//   type: GoogleAuthStrategy,
//   list: 'User',
//   config: {
//     idField: 'googleId',
//     appId: '127811358196-mdu0m8koevfjukmh1hu9n6ig35v8om0r.apps.googleusercontent.com',
//     appSecret: 'b-LGspw-JL_1MUeLtJePJTkA',
//     loginPath: '/auth/google',
//     callbackPath: '/auth/google/callback',


//     // Once a user is found/created and successfully matched to the
//     // googleId, they are authenticated, and the token is returned here.
//     // NOTE: By default KeystoneJS sets a `keystone.sid` which authenticates the
//     // user for the API domain. If you want to authenticate via another domain,
//     // you must pass the `token` as a Bearer Token to GraphQL requests.
//     onAuthenticated: ({ token, item, isNewItem }, req, res) => {
//       console.log("onAuthenticated is called")
//       console.log(item);
//       console.log(token);
//       res.redirect('/');
//     },

//     // If there was an error during any of the authentication flow, this
//     // callback is executed
//     onError: (error, req, res) => {
//       console.log("Error was found")
//       console.error(error);
//       res.redirect('/?error=Uh-oh');
//     },
//   },
// });

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ 
      enableDefaultRoute: true, 
    //   googleStrategy,
          pages: [{
                  label: 'User Management',
                  children: ['User', 'RFID', 'Offer', 'Transaction', 'ActivedOffer'],
              },
              {
                  label: 'Event Management',
                  children: ['Event', 'Product'],
              },
              {
                  label: 'Drink Management',
                  children: ['RelaysAmount', 'Drink', 'Recipe'],
              },

          ],
      })],
};
