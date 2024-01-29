import { DataSource } from 'typeorm';
import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { formatError } from './custom-error';

export const initializeDbConnection = async (dataSource: DataSource) => {
  await dataSource
    .setOptions({
      url: process.env.URL,
    })
    .initialize();
  console.log('Conectado ao db!');
};

export const launchServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    context: async ({ req }) => ({ token: req.headers.authorization || '' }),
  });

  const port = 3000;

  const { url } = await server.listen({ port });
  console.log('Server ready at', url);
};
