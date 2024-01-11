import { User } from './user';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'gbm',
  password: '123l',
  database: 'localserver',
  entities: [User],
  synchronize: true,
});

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
      await AppDataSource.initialize();
      console.log('Conectado ao db local!');

      const user = new User();
      user.name = args.data.name;
      user.email = args.data.email;
      user.password = args.data.password;
      user.birthDate = args.data.birthDate;

      await AppDataSource.manager.save(user);
      await AppDataSource.destroy();

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
      };
    },
  },
};
