import { User } from './user';
import { appDataSource } from './setup';

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
      const user = new User();
      user.name = args.data.name;
      user.email = args.data.email;
      user.password = args.data.password;
      user.birthDate = args.data.birthDate;

      const userRepository = appDataSource.getRepository(User);
      await userRepository.save(user);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
      };
    },
  },
};
