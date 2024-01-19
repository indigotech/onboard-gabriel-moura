import { User } from './user';
import { appDataSource } from './setup';
import { GraphQLError } from 'graphql';
import { validateStrongPassword } from './input-validation';
import bcrypt from 'bcrypt';

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export const resolvers = {
  Query: {
    hello: () => {
      return 'Hello World!';
    },
  },
  Mutation: {
    createUser: async (_parent: never, args: { data: UserInput }) => {
      if (!validateStrongPassword(args.data.password)) {
        throw new GraphQLError('erro: senha fraca');
      }

      const existingUser = await appDataSource.getRepository(User).findOne({
        where: {
          email: args.data.email,
        },
      });

      if (existingUser) {
        throw new GraphQLError('erro: email utilizado');
      }

      const user = new User();
      user.name = args.data.name;
      user.email = args.data.email;
      user.password = await bcrypt.hash(args.data.password, 2);
      user.birthDate = args.data.birthDate;

      const newUser = await appDataSource.getRepository(User).save(user);

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      };
    },
  },
};
