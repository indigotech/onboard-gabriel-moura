export const typeDefs = `#graphql

type Query {
  hello: String
}

type Mutation {
  createUser(data: UserInput): User
}

type User {
  id: ID!
  name: String!
  email: String!
  birthDate: String
  hashedPassword: String
  salt: String
}

input UserInput {
  name: String!
  email: String!
  password: String!
  birthDate: String
}
`;
