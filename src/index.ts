import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

export const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const port = 3000;

server.listen({ port }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
