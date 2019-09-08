

exports = module.exports = function (app) {

    console.log("got to routes")
    
    app.get('/get-recipes',  async (req, res, next) =>{
        console.log("GET RECIPE IS CALLED")
            fetch({
              query: `query {
                allRecipes
                {
                  id
                  name
                  price
                  desc
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
        
            next()
              })

    console.log("dne routes")
    
};





    

  