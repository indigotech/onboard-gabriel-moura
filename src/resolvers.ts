interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  birthDate: string;
}

export const resolvers = {
  Mutation: {
    createUser: async (_parent: never, args: { data: UserInput }) => {
      const newUser: User = {
        id: 1,
        name: args.data.name,
        email: args.data.email,
        birthDate: args.data.birthDate,
      };
      return newUser;
    },
  },
};
