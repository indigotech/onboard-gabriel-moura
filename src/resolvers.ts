import { User } from './user';
import { dataSource } from './data-source';
import { CustomError } from './custom-error';
import { validateStrongPassword } from './input-validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateContext } from './authentication';

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
      await validateContext(context);

      const user = await dataSource.getRepository(User).findOneBy({
        id: args.id,
      });

      if (!user) {
        throw new CustomError(404, 'Usuário não encontrado');
      }

      return user;
    },

    users: async (_parent: never, args: { maxUsers?: number, step?: number }, context: { token: string }) => {
      await validateContext(context);

      const max = args.maxUsers ? args.maxUsers : 10;
      const step = args.step ? args.step : 0;
      const totalUsers = await dataSource.getRepository(User).count();

      if (step >= totalUsers) {
        throw new CustomError(400, 'Erro ao acessar usuário');
      };

      const users = await dataSource.getRepository(User).find({
          skip: step,
          take: max,
          order: {
            name: 'ASC'
          }
        }
      );

      const nextUser = await dataSource.getRepository(User).findOne({
          where: {
            id: users[users.length - 1].id + 1,
          },
        }
      );

      const after = nextUser ? true : false;
      
      return {
        users: users,
        totalUsers: totalUsers,
        before: step,
        after: after,
      };
    },
  },

  Mutation: {
    createUser: async (_parent: never, args: { data: UserInput }, context: { token: string }) => {
      await validateContext(context);

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
        args.data.rememberMe ? { expiresIn: '7 days' } : { expiresIn: '2h' },
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
