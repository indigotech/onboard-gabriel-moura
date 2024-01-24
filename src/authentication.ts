import { verify } from 'jsonwebtoken';
import { CustomError } from './custom-error';

export const authLogin = async (context: { token: string }) => {
  const { token } = context;

  try {
    verify(token, process.env.JWT_SECRET as string);
  } catch (err) {
    throw new CustomError(401, 'Erro de autenticação');
  }
};
