import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';
import { CustomError } from './custom-error';

export const validateContext = async (context: { token: string }) => {
  const { token } = context;

  try {

    const payload = verify(token, process.env.JWT_SECRET as string) as {
      email: string,
      id: string,
      iat: number,
      exp: number, 
    };

  } catch (err: any) {

    if (err instanceof TokenExpiredError) {
      throw new CustomError(401, 'Erro de autenticação', 'Token expirado');
    }
    throw new CustomError(401, 'Erro de autenticação', 'Token inválido');

  }
};
