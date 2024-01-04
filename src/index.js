var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { graphql, buildSchema } = require("graphql")


// construct schema
var schema = buildSchema(`
  type Query {
    hello: String
  }
`)


// resolver function for every endpoint (populate the data for 'hello' field whenever it is queried)
var root = {
  hello: () => {
    return "Hello world!"
  },
}


// graphiql: true -> visualize and test queries on browser (GraphiQL)
var app = express()
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)


app.listen(4000)
console.log('Running server on http://localhost:4000/graphql')

