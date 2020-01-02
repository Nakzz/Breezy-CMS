const moment = require('moment');

const {
    createApolloFetch
} = require('apollo-fetch');

const fetch = createApolloFetch({
    uri: 'http://localhost:3000/admin/api',

});

const createCsvWriter = require('csv-writer').createObjectCsvWriter;


let data;
// let eventDate = moment("21-10-2019","DD-MM-YYYY"); 

 fetch({
    query: `query {
        allTransactions {
        assosciatedRfid{
            cardID
        }
        Recipes{
            name
        }
        Event{
            name
            }
            price
            createdAt
        }
}`,
}).then(allTransaction => {
    
    let allTransactionArray = allTransaction.data.allTransactions

    // allTransactionArray.forEach(element => {
    //     // console.log(element)

    //     var updateDate = moment(element.createdAt, "YYYY-MM-DD")
    //     // if(Math.abs(moment.duration(eventDate.diff(updateDate)).days()) <= 1){
    //         // console.log(updateDate.toDate(), `${updateDate.}`)
    //         // console.log(element.createdAt)
    // });

    data = allTransactionArray.map(element =>{
        if(!element.assosciatedRfid){
            element.assosciatedRfid = {cardID : "guestID"}
        }
            let formatted ={}
            
            formatted.cardID= element.assosciatedRfid.cardID
            formatted.recipe = element.Recipes.name
            formatted.event = element.Event.name
            formatted.price = element.price
            // formatted.createdAt = moment(element.createdAt, "YYYY-MM-DD ").toDate()
            formatted.createdAt = element.createdAt


            // console.log(formatted)

            return formatted
        
       
    }).filter( item=> {
        if(item) return true
        else false
    } )

    console.log(data)
    console.log(data.length)

    const csvWriter = createCsvWriter({
        path: './csv/transactionReport.csv',
        header: [
          {id: 'cardID', title: 'CardID'},
          {id: 'recipe', title: 'RecipeName'},
          {id: 'event', title: 'EventName'},
          {id: 'price', title: 'Price'},
          {id: 'createdAt', title: 'Timestamp'}
        ]
      });
      
      
      csvWriter
        .writeRecords(data)
        .then(()=> console.log('The CSV file was written successfully'));

});
     

  