const {
    createApolloFetch
} = require('apollo-fetch');

const fetch = createApolloFetch({
    uri: 'http://localhost:3000/admin/api',

});

const adminID = ['20133293', '22124087211169', '22124087211']
let allDrinks = [ 'WOP',
'Beer',
'Hard Lemonade',
'Vodka-Cran-Lemonade',
'Rum and coke',
'Vodka-Cran',
'Cheap Vodka Shot',
'Tequila shot',
'Premium Vodka Shot',
'Rum shot' ]

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
                   }
            }`,
            }).then(allTransaction => {

                // console.log(allTransaction)
                
                let allTransactionArray = allTransaction.data.allTransactions

                let stats = {
                    sum: 0,
                    freeGave :0,
                    freeGaveCount: 0,
                    totalCount : allTransactionArray.length
                };

                allTransactionArray.forEach(element => {
                    // console.log(element)
                    stats.sum = stats.sum + element.price

                    if(adminID.includes(element.assosciatedRfid.cardID )){
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
                    
                    
                    

                });

                

                
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
     

