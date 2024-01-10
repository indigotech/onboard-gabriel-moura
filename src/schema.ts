import { buildSchema } from 'graphql';

export const typeDefs = buildSchema(`

type Query {
  hello: String
}

type Mutation {
  createUser(data: UserInput): User
}

type User {
  id: ID,
  name: String,
  email: String,
  birthDate: String
}

input UserInput {
  name: String,
  email: String,
  password: String,
  birthDate: String
}

`);
