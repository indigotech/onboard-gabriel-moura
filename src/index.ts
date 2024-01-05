import { ApolloServer } from "apollo-server";
var { buildSchema } = require("graphql")


var schema = buildSchema(`
  type Query {
    hello: String
  }
`)

var root = {
    hello: () => {
      return "Hello world!"
    },
  }

export const server = new ApolloServer({
    schema,
    rootValue: root
});

const port = 3000;

server.listen({port}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});