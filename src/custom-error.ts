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
  const formattedError = error.originalError as CustomError;
  return {
    code: formattedError.code,
    message: formattedError.message,
    additionalInfo: formattedError?.additionalInfo,
  };
};
