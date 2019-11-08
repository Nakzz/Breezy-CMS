const { createApolloFetch } = require('apollo-fetch');
var moment = require('moment');

const fetch = createApolloFetch({
    uri: 'http://breezy.club:2000/admin/api',
  });

// add 5 dollar
// userID


// validate user
// return user type

//validate breezer
exports.validateBreezer = (req, res) =>{

    console.log(req.body)
    console.log("GET user IS CALLED")
    var userRfidID = req.body["rfid"]
    console.log(userRfidID)

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
// returns entry number