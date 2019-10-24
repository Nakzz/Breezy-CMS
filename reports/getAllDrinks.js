const {
    createApolloFetch
} = require('apollo-fetch');

const fetch = createApolloFetch({
    uri: 'http://localhost:3000/admin/api',

});

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


 fetch({
                query: `query {
                    allRecipes{
                        name
                      }
            }`,
            }).then(allRecipesData => {

                let allRecipes = allRecipesData.data.allRecipes

                allRecipes.forEach(element => {
console.log(`'${element.name}',`)
                    
                });

            });


            // 'WOP',
            // 'Hard Lemonade',
            // 'Vodka-Cran-Lemonade',
            // 'Rum shot',
            // 'Cheap Vodka Shot',
            // 'Premium Vodka Shot',
            // 'Tequila shot',
            // 'Rum and coke',
            // 'Vodka-Cran',
            // 'Blackout cup',
            // 'Harder Lemonade',
            // 'Beer',
            // 'Long Island Iced Tea',
            // 'Water',
            // 'Cranberry Juice',
            // 'Lemonade',
            // 'Iced Tea',
            // 'Horchata',
            // 'Mango Sunrise',
            // 'Summer Breezy Breeze ',
            // 'DRS Dark',
            // 'Hennesey Shot',
     

