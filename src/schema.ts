export const typeDefs = `#graphql

type Query {
  hello: String
  user(id: ID): User
}

type Mutation {
  createUser(data: UserInput): User
  login(data: LoginInput): Session
}

type Session {
  user: User!
  token: String!
}

input LoginInput {
  email: String!
  password: String!
  rememberMe: Boolean
}


type User {
  id: ID!
  name: String!
  email: String!
  birthDate: String
}

input UserInput {
  name: String!
  email: String!
  password: String!
  birthDate: String
}
`;
