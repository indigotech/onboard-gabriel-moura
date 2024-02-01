export const typeDefs = `#graphql

type Query {
  hello: String
  user(id: ID): User
  users(maxUsers: Int, step: Int): UserPage
}

type Mutation {
  createUser(data: UserInput): User
  login(data: LoginInput): Session
}

type Session {
  user: User!
  token: String!
}

type UserPage {
  users: [User]
  totalUsers: Int
  previous: Boolean
  next: Boolean
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
