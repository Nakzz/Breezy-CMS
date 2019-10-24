const { createApolloFetch } = require('apollo-fetch');


const fetch = createApolloFetch({
    uri: 'http://breezy.club:2000/admin/api',
  });

// add 5 dollar
// userID


// validate user
// return user type

//validate breezer
exports.validateBreezer = (req, res) =>{

    console.log("GET user IS CALLED")
    var userRfidID = req.body["rfid"]

    fetch({
        query: `query {allRFIDS(where : {cardID : "${userRfidID}"}) 
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
    }}`,
    }).then(allRFID => {
        // console.log(allRFID.data.allRFIDS)

        if(allRFID.data.allRFIDS[0]){
            
            let method = "" //THE USER STATUS based on assosiatedUser
            //TODO: if assosiatedUSER is null- return atendee, return method as atendee
            if (allRFID.data.allRFIDS[0].assosciatedUser){
                method = allRFID.data.allRFIDS[0].assosciatedUser.level
            } else if(allRFID.data.allRFIDS[0].allowed) {
                method= "Event Guest"
            } 
            else {
                method = "Atendee";
            }

            res.send({
                allRFID: allRFID.data.allRFIDS[0],
                method: method,
            })
        }else{
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