var moment = require('moment');

const {
    createApolloFetch
} = require('apollo-fetch');

const fetch = createApolloFetch({
    uri: 'http://localhost:3000/admin/api',

});

const adminID = ['20133293', '22124087211169', '22124087211']
let allDrinks = ['WOP',
'Hard Lemonade',
'Vodka-Cran-Lemonade',
'Rum shot',
'Cheap Vodka Shot',
'Premium Vodka Shot',
'Tequila shot',
'Rum and coke',
'Vodka-Cran',
'Blackout cup',
'Harder Lemonade',
'Beer',
'Long Island Iced Tea',
'Water',
'Cranberry Juice',
'Lemonade',
'Iced Tea',
'Horchata',
'Mango Sunrise',
'Summer Breezy Breeze ',
'DRS Dark',
'Hennesey Shot','Halloween Drank' ]


let eventDate = moment("21-10-2019","DD-MM-YYYY"); 

let popularDrinks = new Array(allDrinks.length).fill(0);

 fetch({
                query: `query {
                   allTransactions {
                    assosciatedRfid{
                        cardID
                    }
                    Recipes{
                        name
                    }
                       price
                       createdAt
                   }
            }`,
            }).then(allTransaction => {

                console.log(allTransaction.data.allTransactions.length)
                
                let allTransactionArray = allTransaction.data.allTransactions


                
                let stats = {
                    sum: 0,
                    freeGave :0,
                    freeGaveCount: 0,
                    totalCount : allTransactionArray.length
                };

                allTransactionArray.forEach(element => {
                    // console.log(element)

                    var updateDate = moment(element.createdAt, "YYYY-MM-DD")
                    // if(Math.abs(moment.duration(eventDate.diff(updateDate)).days()) <= 1){
                        // console.log(updateDate.isSame(eventDate), updateDate.date())
                  
                    

                    stats.sum = stats.sum + element.price

                    if(element.assosciatedRfid && adminID.includes(element.assosciatedRfid.cardID )){
                        stats.freeGaveCount = stats.freeGaveCount + 1
                        stats.freeGave = stats.freeGave + element.price
                    }

                    let recipeName = element.Recipes.name





                    // if(!allDrinks.includes(recipeName))
                    //     allDrinks.push(recipeName)

                    
                    

                    // stats.MostPopularDrinks = [
                    //     {
                    //         recipeName : stats.MostPopularDrinks.recipeName + 1

                    //     }
                    // ] 

                    allDrinks.forEach( (e, i)=>{
                        if(e == recipeName){
                            popularDrinks[i] = popularDrinks[i] +1
                            
                        }
                    })
                    
                // }
                    

                });

                

                console.log("Event stats for: ", eventDate.toDate())
                
                console.log(stats)

                // console.log(popularDrinks)


                var mostPopularDrinks = {};
                
                allDrinks.forEach((key, i) => mostPopularDrinks[key] = popularDrinks[i]);


                var sortable = [];
                for (var drink in mostPopularDrinks) {
                    sortable.push([drink, mostPopularDrinks[drink]]);
                }
                
                sortable.sort(function(a, b) {
                    return a[1] - b[1];
                });

                console.log(sortable)

            });
     

