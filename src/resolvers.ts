import { User } from './user';
import { dataSource } from './data-source';
import { CustomError } from './custom-error';
import { validateStrongPassword } from './input-validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authLogin } from './authentication';

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const resolvers = {
  Query: {
    hello: () => {
      return 'Hello World!';
    },

    user: async (_parent: never, args: { id: number }, context: { token: string }) => {
      await authLogin(context);

      const user = await dataSource.getRepository(User).findOneBy({
        id: args.id,
      });

      if (!user) {
        throw new CustomError(400, 'ID inválido');
      }

      return user;
    },
  },

  Mutation: {
    createUser: async (_parent: never, args: { data: UserInput }, context: { token: string }) => {
      await authLogin(context);

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

      return newUser;
    },

    login: async (_parent: never, args: { data: LoginInput }) => {
      const user = await dataSource.getRepository(User).findOne({
        where: {
          email: args.data.email,
        },
      });

      if (!user) {
        throw new CustomError(401, 'Erro de autenticação', 'Email não existe');
      }

      if (!(await bcrypt.compare(args.data.password, user.password))) {
        throw new CustomError(401, 'Erro de autenticação', 'Senha incorreta');
      }

      const token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.JWT_SECRET as string,
        args.data.rememberMe ? { expiresIn: '7d' } : { expiresIn: '1h' },
      );

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          birthDate: user.birthDate,
        },
        token: token,
      };
    },
  },
};
