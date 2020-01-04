// TODO: add body parser
        // add quer plugin
        const { createApolloFetch } = require('apollo-fetch');


const fetch = createApolloFetch({
    uri: 'http://breezy.club:2000/admin/api',
  });


// add population
// if rfidID is null- just normal population edit, 
// else rfid accidentalScan == false and then should have increment to entry 

exports.addPopulation = (req, res) =>{
// parse rfid. if there, add string to query to increment user entry
// if none, regular query string
    fetch({
        query: `
    mutation{
      updateEvent (id: "${this.state.eventID}",
       data:{Population:${this.state.population}, totalVisits: ${this.state.TotalVisit}}){
        id
        posted
        entry_fee
        Population
        totalVisits
      }
    }
  `
      }).then(stat => {
        console.log("Updated population and date", stat.data)
      }).catch(e => {
        console.log(e)
      });
}

// exit
// remove population

exports.removePopulation = (req,res) =>{
// parse rfid. if there, add string to query to increment user entry and accidentalScan()
//TODO: get current population population

    if(population >0){
        this.setState({
          population: population - 1
        }, ()=>{
          fetch({
            query: `
        mutation{
          updateEvent (id: "${this.state.eventID}",
           data:{Population:${this.state.population}}){
            id
            posted
            entry_fee
            Population
            totalVisits
          }
        }
      `
          }).then(stat => {
            console.log("Updated population and date", stat.data)
          }).catch(e => {
            console.log(e)
      
          });
        });
      }

}

function accidentalScan(rfid){

    //TODO: return true if scanned witinn 1 minutes of last updated

    return false;
}

exports.getOngoingEvent = (req,res) =>{
// TODO: send populationa and event id inforation
}

