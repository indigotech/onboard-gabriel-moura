import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { dataSource } from '../data-source';
import { User } from '../user';
import { UserInput } from '../resolvers';
import { createFakeUser } from '../fake-user-generator';
import { expect } from 'chai';

const authenticatedUser: UserInput = {
  name: 'Authenticated User',
  email: 'taq@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

describe('Testing users list query with pagination', () => {
  let token: string;

  beforeEach(async () => {
    token = sign({ email: authenticatedUser.email }, process.env.JWT_SECRET as string);

    const users = [];
    for (let i = 0; i < 50; i++) {
      const user = await createFakeUser({}, i);
      users.push(user);
    }
    await dataSource.getRepository(User).save(users);
  });

  afterEach(async () => {
    await dataSource.getRepository(User).delete({});
  });

  it('should return auth error: invalid token', async () => {
    const variables = {};
    const usersResponse = await usersResponseData(token + 'invalid_token', variables);

    expect(usersResponse.errors[0].code).to.be.equal(401);
    expect(usersResponse.errors[0].message).to.be.equal('Erro de autenticação');
  });

  it('should return list of 10 first users successfully: no previous, with next', async () => {
    const variables = {};
    const usersResponse = await usersResponseData(token, variables);

    // expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.previous).to.be.equal(false);
    expect(usersResponse.data.users.next).to.be.equal(true);
  });

  it('should return list of $maxUsers: no previous, with next', async () => {
    const variables = { maxUsers: 20 };
    const usersResponse = await usersResponseData(token, variables);

    // expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.totalUsers).to.be.equal(50);
    expect(usersResponse.data.users.previous).to.be.equal(false);
    expect(usersResponse.data.users.next).to.be.equal(true);
  });

  it('should return list of first users but bigger than db: no previous, no next', async () => {
    const variables = { maxUsers: 60 };
    const usersResponse = await usersResponseData(token, variables);

    // expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.totalUsers).to.be.equal(50);
    expect(usersResponse.data.users.totalUsers).to.be.equal(usersResponse.data.users.users.length);
    expect(usersResponse.data.users.previous).to.be.equal(false);
    expect(usersResponse.data.users.next).to.be.equal(false);
  });

  it('should return shifted list of 10 users: with previous, with next', async () => {
    const variables = { step: 20 };
    const usersResponse = await usersResponseData(token, variables);

    // expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.totalUsers).to.be.equal(50);
    expect(usersResponse.data.users.users.length).to.be.equal(10);
    expect(usersResponse.data.users.previous).to.be.equal(true);
    expect(usersResponse.data.users.next).to.be.equal(true);
  });

  it('should return list of last 10 users: with previous, no next', async () => {
    const variables = { step: 40 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.totalUsers).to.be.equal(50);
    expect(usersResponse.data.users.users.length).to.be.equal(10);
    expect(usersResponse.data.users.previous).to.be.equal(true);
    expect(usersResponse.data.users.next).to.be.equal(false);
  });

  it('should return shifted list of users bigger than db: with previous, no next', async () => {
    const variables = { maxUsers: 60, step: 40 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.totalUsers).to.be.equal(50);
    expect(usersResponse.data.users.users.length).to.be.equal(10);
    expect(usersResponse.data.users.previous).to.be.equal(true);
    expect(usersResponse.data.users.next).to.be.equal(false);
  });

  it('should return bad request error: step bigger than db', async () => {
    const variables = { maxUsers: 5, step: 50 };
    const usersResponse = await usersResponseData(token, variables);  

    expect(usersResponse.errors[0].code).to.be.equal(400);
    expect(usersResponse.errors[0].message).to.be.equal('Erro ao acessar usuário');
  });
});

//   it('should return list of users succesfully, maximum default (10)', async () => {
//     const nDbUsers = 20;
//     const users = [];

//     for (let i = 0; i < nDbUsers; i++) {
//       const user = await createFakeUser({}, i);
//       users.push(user);
//     }
//     await dataSource.getRepository(User).save(users);

//     const res = await usersResponse(token);

//     expect(res.data.data.users.length).to.be.equal(10);
//     expect(res.data.data.users).to.be.sortedBy('name');
//   });

//   it('should return list of users succesfully, passing arg max users', async () => {
//     const nDbUsers = 20;
//     const maxUsers = 5;
//     const users = [];

//     for (let i = 0; i < nDbUsers; i++) {
//       const user = await createFakeUser({}, i);
//       users.push(user);
//     }
//     await dataSource.getRepository(User).save(users);

//     const res = await usersResponse(token, maxUsers);

//     expect(res.data.data.users.length).to.be.equal(maxUsers);
//     expect(res.data.data.users).to.be.sortedBy('name');
//   });

//   it('should return list of all users succesfully, maxUsers greater than dbUsers', async () => {
//     const nDbUsers = 10;
//     const maxUsers = 15;
//     const users = [];

//     for (let i = 0; i < nDbUsers; i++) {
//       const user = await createFakeUser({}, i);
//       users.push(user);
//     }
//     await dataSource.getRepository(User).save(users);

//     const res = await usersResponse(token, maxUsers);

//     expect(res.data.data.users.length).to.be.equal(users.length);
//     expect(res.data.data.users).to.be.sortedBy('name');
//   });

//   it('should return empty list: max users 0', async () => {
//     const nDbUsers = 10;
//     const maxUsers = 0;
//     const users = [];

//     for (let i = 0; i < nDbUsers; i++) {
//       const user = await createFakeUser({}, i);
//       users.push(user);
//     }
//     await dataSource.getRepository(User).save(users);

//     const res = await usersResponse(token, maxUsers);

//     expect(res.data.data.users).to.be.empty;
//   });

//   it('should return empty list: no users on db', async () => {
//     const maxUsers = 10;
//     const res = await usersResponse(token, maxUsers);

//     expect(res.data.data.users).to.be.empty;
//   });

//   it('should return auth error: invalid token', async () => {
//     const nDbUsers = 20;
//     const users = [];

//     for (let i = 0; i < nDbUsers; i++) {
//       const user = await createFakeUser({}, i);
//       users.push(user);
//     }
//     await dataSource.getRepository(User).save(users);

//     const res = await usersResponse(token + 'invalid_token');

//     expect(res.data.errors[0].code).to.be.equal(401);
//     expect(res.data.errors[0].message).to.be.equal('Erro de autenticação');
//     expect(res.data.errors[0].additionalInfo).to.be.equal('Token inválido');
//   });
// });

// const usersResponse = async (token: string, maxUsers?: number) => {
//   const res = await axios({
//     url: 'http://localhost:3000',
//     method: 'post',
//     headers: {
//       Authorization: token,
//     },
//     data: {
//       query: `
//                 query Users($maxUsers: Int) {
//                     users(maxUsers: $maxUsers) {
//                         id
//                         name
//                         email
//                         birthDate
//                     }
//                 }
//             `,
//       variables: {
//         maxUsers: maxUsers,
//       },
//     },
//   });

//   return res;
// };

const usersResponseData = async (token: string, variables: { maxUsers?: number, step?: number}) => {
  const res = await axios({
    url: 'http://localhost:3000',
    method: 'post',
    headers: {
      Authorization: token,
    },
    data: {
      query: `
              query Users($maxUsers: Int, $step: Int) {
                users(maxUsers: $maxUsers, step: $step) {
                  users {
                    id
                    name
                    email
                    birthDate
                  }
                  totalUsers
                  previous
                  next
                }
              }
            `,
      variables: variables,
    },
  });

  return res.data;
};
