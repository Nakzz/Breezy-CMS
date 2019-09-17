const express = require('express');
const cors = require('cors')
const {
    keystone,
    apps
} = require('./index');
const {
    port
} = require('./config');
const initialData = require('./initialData');
var bodyParser = require('body-parser')
var moment = require('moment');

var apiRoutes = require('./routes/api')
var actionRoutes = require('./routes/actions.js') // from another file
var routes = require('./routes/index')

const {
    createApolloFetch
} = require('apollo-fetch');

const fetch = createApolloFetch({
    uri: 'http://localhost:3000/admin/api',

});


keystone
    .prepare({
        apps,
        dev: process.env.NODE_ENV !== 'production',
    })
    .then(async ({
        middlewares
    }) => {
        await keystone.connect(process.env.MONGODB_URI);

        // Initialise some data.
        // NOTE: This is only for test purposes and should not be used in production
        // const users = await keystone.lists.User.adapter.findAll();
        // if (!users.length) {
        //   Object.values(keystone.adapters).forEach(async adapter => {
        //     await adapter.dropDatabase();
        //   });
        //   // await keystone.createItems(initialData);
        // }

        const app = express();
        app.use(cors())
        app.use(bodyParser.json()); // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
            extended: true
        }));

        //ALL ROUTES
        // app.use('/api', apiRoutes);
        // app.use('/actions', actionRoutes);

        // app.use("/api", routes) 


        // app.get('/reset-db', async (req, res) => {
        //   Object.values(keystone.adapters).forEach(async adapter => {
        //     await adapter.dropDatabase();
        //   });
        //   await keystone.createItems(initialData);
        //   res.redirect('/admin');
        // });


        app.get('/get-recipes', async (req, res) => {
            console.log("GET RECIPE IS CALLED")
            fetch({
                query: `query {
              allRecipes 
              {
                id
                name
                price
                desc
                alcoholic
                status
                Relays{
                  relay{
                    relayNum
                  }
                  amount
                }
               }
            }`,
            }).then(allRecipes => {
                console.log(allRecipes.data.allRecipes)

                let publishedDrinks = allRecipes.data.allRecipes.filter(elem => elem.status == "published")

                res.send({
                    allRecipes: publishedDrinks
                })
            });
        })


        app.post('/purchase', async (req, res) => {

            console.log("Printing re body")
            console.log(req.body)

            var userRfidID = req.body["rfid"],
                userRecipeID = req.body["recipeID"];

            if (!userRecipeID || !userRfidID) {
                res.status(400).send({
                    status: "bad-request",
                    method: "Format data properly with following fields: rfid, recipeID"
                })
                return
            }


            let state = {
                useMoney: false,
                eventOn: false,
                method: null
            }

            fetch({
                query: `
                query {allRFIDS(where : {cardID : "${userRfidID}"}) 
                        {
                        id
                        cardID
                        balance
                        wopAvailable
                        allTransactions{
                            id
                        }
                                    assosciatedUser {
                                        offers {
                                            offer {
                                                id
                                                drink {
                                                    id
                                                }
                                                item {
                                                    id
                                                }
                                            }
                                            quantity
                                        }
                                    }
                        }
                        allRecipes(where : {id : "${userRecipeID}"}){
                        id
                        name
                        price
                        }
                        allEvents{
                        id
                        startTime
                        endTime
                        }
                    }`,
            }).then(db => {


                var allRFIDs = db.data.allRFIDS;
                allDrinks = db.data.allRecipes;
                allEvents = db.data.allEvents;


                state.drinkFound = allDrinks[0]
                state.rfidFound = allRFIDs[0]

                // console.log(state.rfidFound.assassosciatedUser)


                state.todayEvent = allEvents.filter(item => {
                    let {
                        startTime,
                        endTime
                    } = item;

                    startTime = new moment(startTime)
                    endTime = new moment(endTime)
                    var todayDate = moment()

                    console.log(startTime <= todayDate, endTime >= todayDate)
                    return startTime <= todayDate && endTime >= todayDate

                })

                if (state.todayEvent.length == 0) {
                    res.status(404).send({
                        status: "database-issue",
                        method: "No event is running now. Are you sure you can drink?"
                    })
                    return
                } else {
                    state.eventOn = true;
                    state.useMoney = true;
                }

                // check if RFID is in database
                if (!state.drinkFound || !state.rfidFound) {
                    if (!state.drinkFound) {
                        res.status(404).send({
                            status: "database-issue",
                            method: "recipe not found"
                        })
                    }

                    if (!state.rfidFound) {
                        res.status(404).send({
                            status: "database-issue",
                            method: "RFID not found"
                        })
                        return
                    }
                } else {
                    console.log("FOUND DRINK AND RFID")
                    console.log(state.drinkFound)
                    console.log(state.rfidFound)
                    state.useMoney = true;
                }

                //check price of drink
                // if drink is WOP and wopAvailalbe, decrement

                if (state.drinkFound.name == "WOP" && state.rfidFound.wopAvailable > 0 && state.eventOn) {
                    state.newWOP = parseInt(state.rfidFound.wopAvailable) - 1
                    console.log(" Will be decrementing wop")
                    state.method = "daily_WOP"
                    state.useMoney = false;

                } else if (state.rfidFound.assosciatedUser && state.rfidFound.assosciatedUser.offers && state.eventOn) {

                    let offers = state.rfidFound.assosciatedUser.offers

                    // console.log(offers)

                    offers = offers.filter(offer => {
                        // console.log(offer.offer)
                        // console.log(offer.offer.drink.id)
                        // console.log(state.drinkFound.id)
                        return state.drinkFound.id == offer.offer.drink.id && parseInt(offer.quantity) > 0
                    });

                    if (offers.length > 0) {

                        let offer = offers[0]

                        state.useMoney = false;
                        state.method = "offer"
                        state.offerId = offer.offer.id
                        state.offerCount = parseInt(offer.quantity) - 1
                        console.log("state.offerCount", state.offerCount)

                    }



                }

                if (state.useMoney && state.eventOn && state.rfidFound.balance >= state.drinkFound.price) {
                    state.newBalance = parseFloat(state.rfidFound.balance) - parseFloat(state.drinkFound.price)

                    console.log("new balance should be: ", state.newBalance)

                    state.useMoney = true;
                    state.method = "balance"

                } else if (!state.method && state.eventOn && state.rfidFound.balance <= state.drinkFound.price) {

                    console.log("No balance")
                    state.method = "no-balance"

                }



                //MAKE QUERY BASED ON CASES

                console.log(state.method)
                switch (state.method) {
                    case null:
                        console.log("Shouldn't be getting here")
                        break;

                        //WOP AVAILALBE CASE START
                    case "daily_WOP":
                        console.log("Decrementing wop")

                        fetch({
                            query: `
                            mutation{
                                updateRFID(id: "${state.rfidFound.id}", data: {
                                            wopAvailable: ${
                                                state.newWOP
                                            },
                                allTransactions: {
                    create: {
                            Recipes: {
                                connect: {
                                    id: "${state.drinkFound.id}"
                                }
                            },
                            assosciatedRfid: {
                                connect: {
                                    id: "${state.rfidFound.id}"
                                }
                            },
                            Event: {
                                connect: {
                                    id: "${state.todayEvent[0].id}"
                                }
                            }, 
                            price: 0,
                            }
                                } 
                                } ){
                                id
                                balance
                                wopAvailable
                                
                                }
                            
                            }
                        `
                        }).then(stat => {
                            console.log("Created transaction in RFID")

                            state.useMoney = false
                            res.send({
                                status: "success",
                                method: state.method,
                                result: stat.data
                            })

                        }).catch(e => {
                            console.log(e)
                            res.status(500).send({
                                e,
                                status: "Something went wrong while decrementing wop"
                            })
                        });

                        break;

                    case "offer":
                        console.log(state.offerCount)
                        fetch({
                            query: `
                                     mutation {
                                         updateRFID(id: "${state.rfidFound.id}", data: {
                                             allTransactions: {
                                                 create: {
                                                     Recipes: {
                                                         connect: {
                                                             id: "${state.drinkFound.id}"
                                                         }
                                                     },
                                                     assosciatedRfid: {
                                                         connect: {
                                                             id: "${state.rfidFound.id}"
                                                         }
                                                     },
                                                     Event: {
                                                         connect: {
                                                             id: "${state.todayEvent[0].id}"
                                                         }
                                                     },
                                                     price: 0,
                                                 },

                                             }
                                         }) {
                                             id
                                             balance
                                             wopAvailable
                                         }

                                         updateActivedOffer(id: "${state.offerId}", data : {
                                             quantity : ${state.offerCount}
                                         }){
                                            offer{
                                                name
                                            }
                                            quantity
                                         }

                                     }
                                  `
                        }).then(offerReq => {
                            console.log("Used offer", offerReq)

                            res.send({
                                status: "success",
                                method: "offer",
                                result: offerReq.data
                            })

                        }).catch(e => {
                            console.log(e)
                            res.send({
                                e,
                                status: "Something went wrong while decrementing offer"
                            })
                        });



                        break;

                    case "balance":

                        //TODO: add to transactions
                        fetch({
                            query: `
                                mutation{
                                updateRFID(id: "${state.rfidFound.id}", data: {
                                        balance: ${
                                            state.newBalance
                                        },
                                        allTransactions: {
                                            create: {
                                                Recipes: {
                                                    connect: {
                                                        id: "${state.drinkFound.id}"
                                                    }
                                                },
                                                assosciatedRfid: {
                                                    connect: {
                                                        id: "${state.rfidFound.id}"
                                                    }
                                                },
                                                Event: {
                                                    connect: {
                                                        id: "${state.todayEvent[0].id}"
                                                    }
                                                },
                                                price: ${state.drinkFound.price},
                                            }
                                        }
                                    
                                    }) {
                                    id
                                    balance
                                    wopAvailable
                                }
                                }`
                        }).then(stat => {
                            console.log("Changed balance")
                            res.send({
                                status: "success",
                                method: state.method,
                                result: stat.data
                            })

                        }).catch(e => {
                            console.log(e)
                            res.send({
                                e,
                                status: "Something went wrong while updating balance"
                            })

                        })

                        break;


                    default:

                        console.log("Failed for some reason- maybe balance?")
                        console.log(state.rfidFound)

                        res.status(500).send({
                            status: "failed",
                            method: state.method,
                            result: state.rfidFound // TODO: dont send all transactions and card id. 
                        })
                }

            });

        });


        app.use(middlewares);

        app.listen(port, error => {
            console.log("Listening at port", port)
            if (error) throw error;
        });
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });