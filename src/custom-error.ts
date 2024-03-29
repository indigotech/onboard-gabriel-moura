import { GraphQLError } from 'graphql';

export class CustomError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(code: number, message: string, additionalInfo?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
  }
}

export const formatError = (error: GraphQLError) => {
  if (error.originalError instanceof CustomError) {
    const formattedError = error.originalError as CustomError;
    return {
      code: formattedError.code,
      message: formattedError.message,
      additionalInfo: formattedError?.additionalInfo,
    };
  }

  return {
    code: 500,
    message: 'Erro interno',
  };
};
