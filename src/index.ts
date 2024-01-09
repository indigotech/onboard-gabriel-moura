import { ApolloServer } from 'apollo-server';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => {
    return 'Hello world!';
  },
};

export const server = new ApolloServer({
  schema,
  rootValue: root,
});

const port = 3000;

server.listen({ port }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
