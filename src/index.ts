import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initializeConnection } from './setup';

export const launchServer = async () => {
  await initializeConnection();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const port = 3000;

  const { url } = await server.listen({ port });
  console.log('Server ready at', url);
};
