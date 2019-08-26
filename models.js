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

const { staticRoute, staticPath, distDir } = require('./config');
const dev = process.env.NODE_ENV !== 'production';

const fileAdapter = new LocalFileAdapter({
    directory: `${dev ? '' : `${distDir}/`}${staticPath}/uploads`,
    route: `${staticRoute}/uploads`,
});
const avatarFileAdapter = new LocalFileAdapter({
    directory: `${staticPath}/avatars`,
    route: `${staticRoute}/avatars`,
});

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
const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };


//DEFINE ALL THE MODELS
exports.User = {
    fields: {
        avatar: { type: File, adapter: avatarFileAdapter },

        name: { type: Text },
        email: { type: Text, isUnique: true },
        password: { type: Password },
        phone: { type: Text, defaultValue: null, isUnique: true },
        phoneVerified: { type: Checkbox },
        RFID: { type: Relationship, ref: 'RFID' },
        prevRFID: { type: Text },
        balance: { type: Float },
        offers: { type: Relationship, ref: 'Offers', many: true },
        level: {
            type: Select,
            options: ['admin', 'manager', 'customer'],
        },
        note: { type: Text },
        referal: { type: Relationship, ref: 'User', many: true },
    },
    labelResolver: item => `${item.name} <${item.email}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: false,
    },
};

exports.RFID = {
    fields: {
        cardID: { type: Text },
        linked: { type: Checkbox },
        lost: { type: Checkbox },
        allowed: { type: Checkbox },
        wopAvailable: { type: Integer }
    },
    labelResolver: item => `${item.cardID} <${item.linked}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
}

exports.Offers = {
    fields: {
        item: { type: Relationship, ref: 'Products', many: false },
        For: { type: Relationship, ref: 'User', many: false },
        expires: { type: DateTime },
        quantity: { type: Integer },
    },
    labelResolver: item => `${item.item} <${item.quantity}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
}

exports.Products = {
    fields: {
        name: { type: Text },
        price: { type: Float },
        private: { type: Checkbox },
        type: {
            type: Select,
            options: ['Drink', 'Food', 'Item'],
        },
    },
    labelResolver: item => `${item.name} <${item.price}> <${item.type}> <${item.private}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: true,
    },
}

//TODO: Recipes : Look into customField types?

exports.Events = {
    fields: {
        name: { type: Text },
        Population: { type: Integer },
        entry_fee: { type: Float },
        //TODO: drink state of each party, which shows avaialbe drinks at a given time from sensors
        private: { type: Checkbox },
        allowed_guests: { type: Relationship, ref: 'RFID', many: true },
        posted: { type: DateTime, format: 'DD/MM/YYYY' },
        flyer: { type: File, adapter: fileAdapter },
    },
    labelResolver: item => `${item.name} <${item.posted}>`,
    access: {
        create: true,
        read: true,
        update: true,
        delete: false,
    },
}

// TODO: Transactions