import { User } from './user';
import { dataSource } from './data-source';
import { CustomError } from './custom-error';
import { validateStrongPassword } from './input-validation';
import bcrypt from 'bcrypt';

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
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
        throw new CustomError(400, 'Senha fraca', 'Deve ter 6 caracteres, com no mínimo 1 letra e 1 dígito');
      }

      const existingUser = await dataSource.getRepository(User).findOne({
        where: {
          email: args.data.email,
        },
      });

      if (existingUser) {
        throw new CustomError(409, 'Email duplicado');
      }

      const user = new User();
      user.name = args.data.name;
      user.email = args.data.email;
      user.password = await bcrypt.hash(args.data.password, 2);
      user.birthDate = args.data.birthDate;

      const newUser = await dataSource.getRepository(User).save(user);

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthDate: newUser.birthDate,
      };
    },

    login: async (_parent: never, args: { data: LoginInput }) => {

      const user = await dataSource.getRepository(User).findOne({
        where: {
          email: args.data.email,
        },
      });

      if (!user) {
        throw new CustomError(401, 'Falha de autenticação', 'Email não existe');
      }

      if (!(await bcrypt.compare(args.data.password, user.password))) {
        throw new CustomError(401, 'Falha de autenticação', 'Senha incorreta');
      }

      return {
        user: {
          user
        },
        token: 'the_token'
      };
    }
  },
};
