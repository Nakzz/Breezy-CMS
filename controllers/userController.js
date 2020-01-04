const { createApolloFetch } = require('apollo-fetch');
var moment = require('moment');

const fetch = createApolloFetch({
    uri: 'http://breezy.club:2000/admin/api',
  });

/*
 * Helper method that resolves Assosiated User object if user is found 
 * 	based on the given RFID or resolves an error. 
 *
 * Hint: read through validateBreezer function in the buttom. 
 * 	It performs a GraphQL query and does some extra evet checking
 * 	However, you can just do the assisiated user checking
 * 	read this to undertand how to write async functions: 
 * 	https://javascript.info/async-await
 *
 */

async function findAssosiatedUser(rfid){

}

/*
 * Register user to the database with whatever info is sent.
 * user_Info{name, password, email,ig, phone, gender, DOB, }
 */

exports.registerUser = (req, res) =>{
//TODO: get userInfo
	//if email or ig or phone not available- send error
	//
	//check if email or ig or phone is assosiated with another account or not
	//	if so, send error
	//
	//create a queryString based on whatever info is available, and send it to server
	// if successfull, send success. 
}

/*
 *add offer to user 
 *
 * rfid, offerInfo(offerDrink, offerNumber)
 */

exports.addOffer = (req, res) =>{
// TODO: if required field are not availalbe, send error
	//
	// check if rfid has assosiated user, if not, send error
	//
	// add offer based on req 
}

// add 5 dollar
// userID
exports.addBalanceToBreezer = (req, res) =>{ 
    console.log(req.body)
    console.log("GET user IS CALLED")
    var userRfidID = req.body["rfid"],
    balanceToAdd = req.body["amount"]

    if(!userRfidID && !balanceToAdd){
        //TODO: send error since fields are empty
    }

    //IDEA: build a query processor class. It can take strings for addToQuery call
    // and on processd function call it will generate remainerder of the brackets
    fetch({
        query: `query {
                        allRFIDS(where : {cardID : "${userRfidID}"}){
                        id
                        cardID
                        balance
                        wopAvailable
                        entry
                        allowed
                        assosciatedUser{
                            id
                            level
                        }
                        updatedAt
                    }


                    }
`,
    }).then(allRFID => {
let query = "mutation {";
        if(allRFID.data.allRFIDS[0]){
            
            let rfid = allRFID.data.allRFIDS[0]
            //TODO: /add to user recahrge fied iff assosiated 
            if(rfid.assosciatedUser){
//TODO: create new model for recharge history.
// - amount, userid, whenCreated, paymentMethod {venmo, cashapp, cash, square}
            }
        
        
query =+ `
    updateRFID(id:"${rfid.id}", data:{
      balance: ${rfid.balance + balanceToAdd}
    }){
      balance
    }
  }
  
}`

console.log(`Query sending to modify user balance: ${query}`)

    fetch({query:query}).then(modifedRFID=>{
console.log(`modifedRFID: ${modifedRFID}`)

    }).catch(e=>{ // Do I even need this block here? Since catching already catches outside
console.log(e)
//TODO: i think the only case is when user wasn't modified or somth
    })
        
        } else{
            //TODO: RFID wasn't found in system. 
        }




        }).catch(e=>{
//TODO: what cases will this be caught?
    })
}

// validate user
// return user type

//validate breezer
exports.validateBreezer = (req, res) =>{

    console.log(req.body)
    console.log("GET user IS CALLED")
    var userRfidID = req.body["rfid"]
    console.log(userRfidID)

    if(!userRfidID){
        //TODOD: send error since fields are empty
    }

    fetch({
        query: `query {
            allRFIDS(where : {cardID : "${userRfidID}"}) 
        {
            id
        cardID
        balance
        wopAvailable
        entry
        allowed
        assosciatedUser{
            level
        }
        updatedAt
    }

      allEvents(where: {allowed_guests_some: {
        cardID: "${userRfidID}"
      }}) {
        allowed_guests{
          cardID
        }
        startTime
        endTime
      }
}
`,
    }).then(allRFID => {
        console.log(allRFID.data.allEvents)

        let allEvents = allRFID.data.allEvents;
        let todayEvent = allEvents.filter(item => {
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

       
        if (todayEvent.length > 0) {

            console.log(todayEvent[0].allowed_guests)
            method= "Event Guest"
            res.send({
                allRFID: allRFID.data.allRFIDS[0],
                method: method,
            })
        }

        else if(allRFID.data.allRFIDS[0]){
            
            let method = "" //THE USER STATUS based on assosiatedUser
            //TODO: if assosiatedUSER is null- return atendee, return method as atendee
            if (allRFID.data.allRFIDS[0].assosciatedUser){
                method = allRFID.data.allRFIDS[0].assosciatedUser.level
            } 
            
            // else if(allRFID.data.allRFIDS[0].allowed) {
            //     method= "Event Guest"
            // } 
            else {
                method = "Atendee";
            }

            res.send({
                allRFID: allRFID.data.allRFIDS[0],
                method: method,
            })
        }
        
        else{
            res.status(404).send({
                status: "database-issue",
                method: "RFID not found"
            })
        }


    }).catch(e=>{
        console.log("Error at getUser", e)


    });

}

