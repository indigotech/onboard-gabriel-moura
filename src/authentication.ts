import { TokenExpiredError, verify } from 'jsonwebtoken';
import { CustomError } from './custom-error';

export const validateContext = async (context: { token: string }) => {
  const { token } = context;

  try {
    verify(token, process.env.JWT_SECRET as string);
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      throw new CustomError(401, 'Erro de autenticação', 'Token expirado');
    }
    throw new CustomError(401, 'Erro de autenticação', 'Token inválido');
  }
};
