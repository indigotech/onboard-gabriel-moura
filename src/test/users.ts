import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { dataSource } from '../data-source';
import { User, UserInput } from '../user';
import { Address } from '../address';
import { createFakeUser, createFakeAddress } from '../fake-data-generator';
import { expect } from 'chai';

const authenticatedUser: UserInput = {
  name: 'Authenticated User',
  email: 'taq@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

describe('Testing users list query with pagination', () => {
  let token: string;
  let fakeUsers: UserInput[];
  let dbAdresses: Address[];
  let dbUsers: User[];

  const dbSize = 5;
  const defaultPageSize = 3;

  before(async () => {
    fakeUsers = await Promise.all([
      createFakeUser({ name: 'B Usuario', email: 'user0@taq.com' }),
      createFakeUser({ name: 'De Code', email: 'user1@taq.com' }),
      createFakeUser({ name: 'Ze Dev', email: 'user2@taq.com' }),
      createFakeUser({ name: 'Da Taq', email: 'user3@taq.com' }),
      createFakeUser({ name: 'A Sobrenome', email: 'user4@taq.com' }),
    ]);

    const fakeAddresses = await Promise.all([
      createFakeAddress(
        { street: 'Avenida Central', neighborhood: 'Nova Fortaleza', city: 'Fortaleza', state: 'CE' },
        517,
      ),
      createFakeAddress({ city: 'Manaus', state: 'AM', complement: 'Apto 51' }),
      createFakeAddress({}, 446),
      createFakeAddress({ neighborhood: 'Sumaré' }, 2194),
      createFakeAddress({}, 62),
      createFakeAddress({}, 46),
      createFakeAddress({}, 44),
      createFakeAddress({}, 847),
      createFakeAddress({ city: 'Jundiai' }, 243),
      createFakeAddress({ neighborhood: 'Pacaembu' }, 123),
    ]);

    dbAdresses = await dataSource.getRepository(Address).save(fakeAddresses);
  });

  beforeEach(async () => {
    token = sign({ email: authenticatedUser.email }, process.env.JWT_SECRET as string);

    const users = [];

    for (let i = 0; i < fakeUsers.length; i++) {
      const addr0 = dbAdresses[2 * i];
      const addr1 = dbAdresses[2 * i + 1];

      users.push({
        name: fakeUsers[i].name,
        email: fakeUsers[i].email,
        password: fakeUsers[i].password,
        birthDate: fakeUsers[i].birthDate,
        address: [addr0, addr1],
      });
    }

    dbUsers = await dataSource.getRepository(User).save(users);
  });

  afterEach(async () => {
    await dataSource.getRepository(Address).delete({});
    await dataSource.getRepository(User).delete({});
  });

  it('should return auth error: invalid token', async () => {
    const variables = {};
    const usersResponse = await usersResponseData(token + 'invalid_token', variables);

    expect(usersResponse.errors[0].code).to.be.equal(401);
    expect(usersResponse.errors[0].message).to.be.equal('Erro de autenticação');
  });

  it('should return bad request error: maxUsers = 0', async () => {
    const variables = { maxUsers: 0 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.errors[0].code).to.be.equal(400);
    expect(usersResponse.errors[0].message).to.be.equal('Requisição inválida');
    expect(usersResponse.errors[0].additionalInfo).to.be.equal('Tamanho da página deve ser maior que zero');
  });

  it('should return bad request error: step bigger than db', async () => {
    const variables = { step: 10 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.errors[0].code).to.be.equal(400);
    expect(usersResponse.errors[0].message).to.be.equal('Requisição inválida');
    expect(usersResponse.errors[0].additionalInfo).to.be.equal('Erro ao acessar usuário');
  });

  it('should return bad request error: negative step', async () => {
    const variables = { step: -2 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.errors[0].code).to.be.equal(400);
    expect(usersResponse.errors[0].message).to.be.equal('Requisição inválida');
    expect(usersResponse.errors[0].additionalInfo).to.be.equal('Erro ao acessar usuário');
  });

  it('should return list of 3 (default) first users successfully: no previous, with next', async () => {
    const variables = {};
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    assertPaginationData(resData, defaultPageSize, dbSize, false, true);

    assertUserInfo(dbUsers[4], resData.users[0]);
    assertUserInfo(dbUsers[0], resData.users[1]);
    assertUserInfo(dbUsers[3], resData.users[2]);
  });

  it('should return list of $maxUsers: no previous, with next', async () => {
    const variables = { maxUsers: 4 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    assertPaginationData(resData, variables.maxUsers, dbSize, false, true);

    assertUserInfo(dbUsers[4], resData.users[0]);
    assertUserInfo(dbUsers[0], resData.users[1]);
    assertUserInfo(dbUsers[3], resData.users[2]);
    assertUserInfo(dbUsers[1], resData.users[3]);
  });

  it('should return list of first users but bigger than db: no previous, no next', async () => {
    const variables = { maxUsers: 10 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    assertPaginationData(resData, dbSize, dbSize, false, false);

    assertUserInfo(dbUsers[4], resData.users[0]);
    assertUserInfo(dbUsers[0], resData.users[1]);
    assertUserInfo(dbUsers[3], resData.users[2]);
    assertUserInfo(dbUsers[1], resData.users[3]);
    assertUserInfo(dbUsers[2], resData.users[4]);
  });

  it('should return shifted list of 3 users: with previous, with next', async () => {
    const variables = { step: 1 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    assertPaginationData(resData, defaultPageSize, dbSize, true, true);

    assertUserInfo(dbUsers[0], resData.users[0]);
    assertUserInfo(dbUsers[3], resData.users[1]);
    assertUserInfo(dbUsers[1], resData.users[2]);
  });

  it('should return list of last 3 users: with previous, no next', async () => {
    const variables = { step: 2 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    assertPaginationData(resData, defaultPageSize, dbSize, true, false);

    assertUserInfo(dbUsers[3], resData.users[0]);
    assertUserInfo(dbUsers[1], resData.users[1]);
    assertUserInfo(dbUsers[2], resData.users[2]);
  });

  it('should return shifted list of users bigger than db: with previous, no next', async () => {
    const variables = { maxUsers: 10, step: 3 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    assertPaginationData(resData, dbSize - variables.step, dbSize, true, false);

    assertUserInfo(dbUsers[1], resData.users[0]);
    assertUserInfo(dbUsers[2], resData.users[1]);
  });
});

const usersResponseData = async (token: string, variables: { maxUsers?: number; step?: number }) => {
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
                  address {
                    id
                    postalCode
                    street
                    streetNumber
                    complement
                    neighborhood
                    city
                    state
                  }
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

const assertUserInfo = (dbUser: User, resUser: User) => {
  expect(dbUser).to.deep.include({
    id: +resUser.id,
    name: resUser.name,
    email: resUser.email,
  });

  expect(dbUser.address.length).to.be.equal(resUser.address.length);

  for (let i = 0; i < dbUser.address.length; i++) {
    expect(dbUser.address).to.deep.include({
      ...resUser.address[i],
      id: +resUser.address[i].id,
    });
  }
};

const assertPaginationData = (
  resData: { users: User[]; totalUsers: number; previous: boolean; next: boolean },
  expectedUsersLength: number,
  expectedTotalUsers: number,
  expectedPrevious: boolean,
  expectedNext: boolean,
) => {
  expect(resData.users).to.be.sortedBy('name');
  expect(resData.users.length).to.be.equal(expectedUsersLength);
  expect(resData.totalUsers).to.be.equal(expectedTotalUsers);
  expect(resData.previous).to.be.equal(expectedPrevious);
  expect(resData.next).to.be.equal(expectedNext);
};
