const {
    File,
    Text,
    Slug,
    Relationship,
    Select,
    Password,
    Checkbox,
    CalendarDay,
    DateTime,
    OEmbed,
    Float,
    Integer
} = require('@keystone-alpha/fields');
const { Wysiwyg } = require('@keystone-alpha/fields-wysiwyg-tinymce');
const { LocalFileAdapter } = require('@keystone-alpha/file-adapters');
const getYear = require('date-fns/get_year');
var moment = require('moment');
const { atTracking, createdAt } = require('@keystone-alpha/list-plugins');



const { staticRoute, staticPath, distDir } = require('./config');
const dev = process.env.NODE_ENV !== 'production';



// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
    if (!user) {
        return false;
    }
    return { id: user.id };
};
const userIsAdminOrOwner = auth => {
    const isAdmin = access.userIsAdmin(auth);
    const isOwner = access.userOwnsItem(auth);
    return isAdmin ? isAdmin : isOwner;
};

const access = {
    userIsAdmin: ({ authentication: { item: user } }) => Boolean(user && user.isAdmin),
    userOwnsItem : ({ authentication: { item: user } }) => {
        if (!user) {
            return false;
        }
        return { id: user.id };
    },
    userIsCurrentAuth: ({ authentication: { item } }) => {
      if (!item) {
        return false;
      }
      return { id: item.id };
    },
  };
  
  // Read: public / Write: admin
  const DEFAULT_LIST_ACCESS = {
    create: access.userIsAdmin,
    read: true,
    update: access.userIsAdmin,
    delete: access.userIsAdmin,
  };

  const ADMIN_LIST_ACCESS = {
    create: access.userIsAdmin,
    read: access.userIsAdmin,
    update: access.userIsAdmin,
    delete: access.userIsAdmin,
  };

    const ALL_ACCESS = {
        create: true,
        read: true,
        update: true,
        delete: true,
    };

//DEFINE ALL THE MODELS
exports.User = {
    fields: {
        // avatar: { type: File, adapter: avatarFileAdapter },
        name: { type: Text },
        email: { type: Text,  },
        password: { type: Password },
        phone: { type: Text },
        phoneVerified: { type: Checkbox },
        igHandle: {type: Text},
        RFID: { type: Relationship, ref: 'RFID' },
        prevRFID: { type: Text },
        offers: {
            type: Relationship,
            ref: 'ActivedOffer', 
            many: true
        },
        level: {
            type: Select,
            options: ['admin', 'manager', 'customer', 'eventGuest', 'board', 'support_board', 'attendee'],
            // access: {update: access.userIsAdmin }
        },
        note: { type: Text },
        isAdmin : {type: Checkbox,  
            access: {read:access.userIsAdmin ,update: access.userIsAdmin }
        },
        referal: { type: Relationship, ref: 'User.referred', many: true },
        referred: { type: Relationship, ref: 'User.referal', many: false },
         // This field name must match the `idField` setting passed to the auth
    // strategy constructor below
    googleId: { type: Text },
        slug: { type: Slug, from: 'email' },
    },
    labelResolver: item => `${item.name} <${item.email}>`,
    // access: {
    //     create: userIsAdmin,
    //     read: userIsAdminOrOwner,
    //     update: userIsAdminOrOwner,
    //     delete: userIsAdmin,
    // },
    access: ALL_ACCESS,
    plugins: [atTracking()]
};

exports.RFID = {
    fields: {
        // name: {type: Slug, from: 'cardID'},        
        assosciatedUser: {type: Relationship, ref: 'User.RFID'  },
        balance: { type: Float },
        cardID: { type: Text , isUnique: true}, //TODO: might have to display error
        lost: { type: Checkbox },
        wopAvailable: { type: Integer },
        allowed: { type: Checkbox , defaultValue: true},
        allTransactions: {type: Relationship, ref: 'Transaction', many: true},
        entry: {type: Integer, defaultValue:0}

    },
    labelResolver: item => {
        return  item.cardID
    }  ,
    access: ALL_ACCESS,
    
    plugins: [atTracking()]
}

exports.Transactions = {
    fields: {
        assosciatedRfid: { type: Relationship, ref: 'RFID.allTransactions' },
        whenCreated: { type: DateTime},
        Recipes: {type: Relationship, ref: 'Recipe'},
        product : {type: Relationship, ref: 'Product'},
        price: { type: Float },
        Event: { type: Relationship, ref: 'Event' },
        note: {type: Text}
    },
    labelResolver: item =>{
            // console.log(item)
        return item.price
    } , plugins: [atTracking() ,
         createdAt({ createdAtField: 'whenCreated' }),],
    access: ALL_ACCESS,
    
}

exports.Offers = {
    fields: {
        name: {
            type: Text
        },
        item: {
            type: Relationship,
            ref: 'Product',
            many: false
        },
        drink: {
            type: Relationship,
            ref: 'Recipe',
            many: false
        },

        slug: {
            type: Slug,
            from: 'name'
        },

    },
    labelResolver: item => `${item.name}`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    // plugins: [atTracking()]
    // hooks :{
    //     afterChange: async (...) => { ... },
    // TODO: remove offer is  quanity is 0 or expired
    // }
}

exports.ActiveOffers = {
    fields: {
         name: {
             type: Text
         },
        offer: {
            type: Relationship,
            ref: 'Offer',
            many: false
        },
        assosciatedUser: { type: Relationship, ref: 'User.offers', many: false },
        // expires: { type: DateTime },
        quantity: { type: Integer },
        slug: {
            type: Slug,
            from: 'id'
        },

    },
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    labelResolver: async (item) => {

        return `${item.name} <${item.quantity}>`
    },


    // hooks :{
    //     afterChange: async (...) => { ... },
    // TODO: remove offer is  quanity is 0 or expired
    // }
}

exports.Products = {
    fields: {
        name: { type: Text },
        type: {
            type: Select,
            options: ['Drink', 'Food', 'Item'],
        },
        private: { type: Checkbox },
        price: { type: Float },
        slug: { type: Slug, from: 'name' },
        
    },
    labelResolver: item => `${item.name} <${item.price}> `,
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
    plugins: [atTracking()]
}

exports.Drinks = {
    fields: {
        name: { type: Text },
        relayNum: {type: Integer, isUnique: true},
        slug: { type: Slug, from: 'name' },
    },
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },plugins: [atTracking()]
}


exports.Recipes = {
    fields: {
        name: { type: Text },
        price: { type: Float },
        desc: { type: Wysiwyg },

        alcoholic: { type: Checkbox, defaultValue:true },
        status: {
            type: Select,
            defaultValue: 'draft',
            options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
          },
        Relays : {type: Relationship, ref: 'RelaysAmount.for', many:true, required: true},
        slug: { type: Slug, from: 'name' },

        // img: { type: File, adapter: fileAdapter },
      
        //THIS WAS BACK IN AINCENT TIME WHEN AJ WAS STUPID AND COULDN'T Figure out how to add many relays with amounts
        // drink1: { type: Relationship, ref: 'Drink' },
        // drink1amt: { type: Float },
        // drink2: {type: Relationship, ref: 'Drink'},
        // drink2amt: { type: Float },
        // drink3: { type: Relationship, ref: 'Drink'},
        // drink3amt: { type: Float },
        // drink4: {type: Relationship, ref: 'Drink'},
        // drink4amt: { type: Float },
    },
    labelResolver: item => `${item.name} <${item.price}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: false,
    },plugins: [atTracking()]
}

exports.RelaysAmount = {
    fields: {
        name: {type:Text},
        amount: { type: Float },
        relay : {type: Relationship, ref: 'Drink'},
        for: {type: Relationship, ref: 'Recipe'},

    },
    labelResolver: item => item.name,
    access: {
        create: true,
        read: true,
        update: true,
        delete: false,
    },
}


exports.Events = {
    fields: {
        name: { type: Text },
        description: { type: Wysiwyg },
        Population: { type: Integer },
        maxPopulation: { type: Integer, defaultValue: 120 },
        totalVisits : {type: Integer},
        entry_fee: { type: Float },
        //TODO: drink state of each party, which shows avaialbe drinks at a given time from sensors
        private: { type: Checkbox },
        allowed_guests: { type: Relationship, ref: 'RFID.cardID', many: true },
        posted: { type: DateTime, format: 'DD/MM/YYYY'},
        startTime: { type: DateTime , format: 'MM/DD/YYYY h:mm A'},
        endTime: { type: DateTime , format: 'MM/DD/YYYY h:mm A'},
        // flyer: { type: File, adapter: fileAdapter },
        Transactions : { type: Relationship, ref: 'Transaction.whenCreated', many: true },
    },
    labelResolver: item => `${item.name} <${item.posted}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: false,
    },plugins: [atTracking()]
    // hooks: { //TODO: make sure begin time is later than end time
    //     validateInput: async ({ resolvedData, existingItem, actions }) => {
    //       const { startTime, endTime } = resolvedData;
    //       const { event: eventId } = existingItem ? existingItem : resolvedData;
            
    //       console.log(endTime) 
    //       console.log(typeof(endTime))
          
            
    //       if (
    //         false
    //       ) {
    //         throw 'Error rsvping to event';
    //       }
    //     },
    //   },
}
