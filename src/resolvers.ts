import { User } from './user';
import { appDataSource } from './setup';
import { GraphQLError } from 'graphql';
import { validateStrongPassword } from './input-validation';

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export const resolvers = {
  Query: {
    hello: () => {
      return 'Hello World';
    },
  },
  Mutation: {
    createUser: async (_parent: never, args: { data: UserInput }) => {
      await appDataSource.initialize();
      console.log('Conectado ao db local!');

      if (validateStrongPassword(args.data.password) && true) {
        const user = new User();
        user.name = args.data.name;
        user.email = args.data.email;
        user.password = args.data.password;
        user.birthDate = args.data.birthDate;

        await appDataSource.manager.save(user);
        await appDataSource.destroy();

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        };
      } else {
        await appDataSource.destroy();
        throw new GraphQLError('erro: senha fraca!');
      }
    },
  },
};
