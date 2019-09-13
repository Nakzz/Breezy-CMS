const express = require('express');
const cors = require('cors')
const { keystone, apps } = require('./index');
const { port } = require('./config');
const initialData = require('./initialData');
var bodyParser = require('body-parser')
var moment = require('moment');

var apiRoutes = require('./routes/api')
var actionRoutes = require('./routes/actions.js') // from another file
var routes = require('./routes/index')

const { createApolloFetch } = require('apollo-fetch');

const fetch = createApolloFetch({
  uri: 'http://localhost:3000/admin/api',
});


keystone
  .prepare({
    apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect(process.env.MONGODB_URI);

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      // await keystone.createItems(initialData);
    }

    const app = express();
    app.use(cors())
    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    }));

    //ALL ROUTES
    // app.use('/api', apiRoutes);
    // app.use('/actions', actionRoutes);

    // app.use("/api", routes) 


    app.get('/reset-db', async (req, res) => {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystone.createItems(initialData);
      res.redirect('/admin');
    });


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
                type
                alcoholic
                drink1 {
                  name
                  motorNum
                }
                drink1amt
                drink2 {
                  name
                  motorNum
                }
                drink2amt
                  drink3 {
                  name
                  motorNum
                }
                drink3amt
                  drink4 {
                  name
                  motorNum
                }
                drink4amt}
            }`,
        // variables: { id: 1 },
      }).then(allRecipes => {
        console.log(allRecipes)
        res.send(allRecipes.data)
      });
    })


    app.post('/purchase', async (req, res) => {

      console.log("Printing re body")
      console.log(req.body)

      fetch({
        query: `query {allRFIDS
        {
          id
          cardID
          balance
          wopAvailable
          allTransactions{
            id
          }
          offers{
            id
            drink{
              id
              name
            }
            quantity
            expires
          }
        }
        allRecipes{
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

        var userRfidID = req.body["rfid"],
          userRecipeID = req.body["recipeID"];
          allRFIDs = db.data.allRFIDS;
          allDrinks = db.data.allRecipes;
          allEvents = db.data.allEvents;

        let useMoney = false;
        eventOn = false;
        
        // console.log(userRecipeID)

        let drinkFound = allDrinks.filter(item => {
          return item.id == userRecipeID
        });

        let rfidFound = allRFIDs.filter(item => {
          return item.cardID == userRfidID
        })

        let todayEvent = allEvents.filter(item=>{
          let {startTime, endTime}= item;

          startTime = new moment(startTime)
          endTime = new moment(endTime)
          var todayDate = moment()

          console.log(startTime <= todayDate , endTime >= todayDate)
          return startTime <= todayDate && endTime >= todayDate

        })

        console.log(todayEvent.length , "event len")
        if(todayEvent.length == 0){
          res.send({ status: "database-issue" , method: "No event is running now. Are you sure you can drink?"})
          eventOn = false;
          useMoney = false;
          return
        } else {
          eventOn = true;
          useMoney = true;

        }

        // console.log(drinkFound[0])
        // console.log(rfidFound)
        // console.log(typeof(drinkFound[0]))

        // check if RFID is in database
        if (!drinkFound.length || !rfidFound.length) {
          res.send({ status: "database-issue", method:"user or recipe not found" })
          
          return
        } else {
          console.log("FOUND DRINK AND RFID")
          console.log(drinkFound)
          console.log(rfidFound)
          useMoney = true;
        }

        //check price of drink
        // if drink is WOP and wopAvailalbe, decrement
        console.log(drinkFound[0].name == "WOP", rfidFound[0].wopAvailable > 0)

        if (drinkFound[0].name == "WOP" && rfidFound[0].wopAvailable > 0 && eventOn) {
          let newWOP = parseInt(rfidFound[0].wopAvailable) - 1
          console.log("its wop and still avai", newWOP)

          console.log("foundRFID",rfidFound[0].id)
          console.log("todayEvent",todayEvent[0].id)
          console.log("drinkFound",drinkFound[0].id)
//TODO: add to transactions
          fetch({
            //TODO: not working
      //       query: `
      //     mutation{
      //       updateRFID (id: "${rfidFound[0].id}", data:{wopAvailable:${newWOP}, 
      //       allTransactions: create : {
      //         Recipes: {
      //           connect: {id:"${drinkFound[0].id}"}
      //         },
      //          assosciatedRfid: {
      //             connect: {id:"${rfidFound[0].id}"}
      //          },
      //          Event: {
      //            connect: {id:"${todayEvent[0].id}"}
      //         },
      //         price: ${0}
      //       }} ){
      //         id
      //         balance
      //         wopAvailable
      //       }
        
      //   }
      // `

      // createTransaction(data: {
      //   assosciatedRfid :{ 
      //     connect : {
      //       id: "${rfidFound[0].id}"

      //     }
      //   },
      //   price : "${0}",
      //   Recipes : {
      //     connect : {
      //       id : ${drinkFound[0].id} 
      //     }
      //   },
      // }
      // ){
      //   id
      // }
      query: `
          mutation{
            updateRFID (id: "${rfidFound[0].id}", 
            data:{wopAvailable:${newWOP} }){
              id
              balance
              wopAvailable
            }
            
            
        
         }
       `
          }).then(stat => {
            console.log("Created transaction in RFID")

            useMoney = false
            res.send({ status: "success",method:"daily_WOP", result: stat.data })
            

          


          }).catch(e => {
            console.log(e)
            res.send({ e, status: "Something went wrong while decrementing wop" })
          });

        } 
        
        //TODO: check if offers available
//         else if(rfidFound[0].offers.length > 0 && eventOn) {

//           console.log("offer len",rfidFound[0].offers.length)

//           let offers = rfidFound[0].offers
          
//           offers.forEach(offer => {
//             console.log("offers availalbe", offer)
            
//             if(parseInt(offer.quantity) > 0 && offer.drink.id == userRecipeID){
              
//               fetch({
//                 query: `
//             mutation{
//               updateOffer (id: "${offer.id}", data:{quantity:${parseInt(offer.quantity) -1}} ){
//                 drink{
//                   name
//                 }
//                 quantity
//                 expires
//               }
//             }
//           `
//               }).then(stat => {
//                 console.log("Used offer")
// useMoney = false;

//                 res.send({ status: "success", method: "offer", result: stat.data })
    
//               }).catch(e => {
//                 console.log(e)
//                 res.send({ e, status: "Something went wrong while decrementing offer" })
//               });

//             }

//           });


// // res.send({ status: "success", result: offers })

//         //TODO: add to transactions
//         }
        
        if (useMoney && eventOn && rfidFound[0].balance >= drinkFound[0].price) {
          let newBalance = parseFloat(rfidFound[0].balance) - parseFloat(drinkFound[0].price)
          console.log(parseFloat(rfidFound[0].balance))
          console.log(parseFloat(drinkFound[0].price))
          console.log("new balance should be: ", newBalance)
//TODO: add to transactions
          fetch({
            query: `
        mutation{
          updateRFID (id: "${rfidFound[0].id}", data:{balance:${newBalance}} ){
            id
            balance
            wopAvailable
          }
        }
      `
          }).then(stat => {
            console.log("Changed balance")
            res.send({ status: "success", method:"balance", result: stat.data })

          }).catch(e => {
            console.log(e)
            res.send({ e, status: "Something went wrong while updating balance" })

          }
          )

        } else {
          res.send({ status: "failed", method:"balance", result: stat.data })
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