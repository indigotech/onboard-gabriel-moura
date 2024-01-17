import { DataSource } from 'typeorm';
import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

export const initializeDbConnection = async (dataSource: DataSource) => {
  try {
    await dataSource.initialize();
    console.log('Conectado ao db!');
  } catch (error) {
    console.error('Erro na conexao do db', error);
  }
};

export const launchServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const port = 3000;

  const { url } = await server.listen({ port });
  console.log('Server ready at', url);
};
