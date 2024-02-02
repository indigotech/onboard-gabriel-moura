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
  let users: UserInput[];
  const dbSize = 5;
  const defaultPageSize = 3;

  before(async () => {
    users = await Promise.all([
      createFakeUser({ name: 'B Usuario', email: 'user0@taq.com' }),
      createFakeUser({ name: 'De Code', email: 'user1@taq.com' }),
      createFakeUser({ name: 'Ze Dev', email: 'user2@taq.com' }),
      createFakeUser({ name: 'Da Taq', email: 'user3@taq.com' }),
      createFakeUser({ name: 'A Sobrenome', email: 'user4@taq.com' }),
    ]);
  });

  beforeEach(async () => {
    token = sign({ email: authenticatedUser.email }, process.env.JWT_SECRET as string);

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

    expect(resData.users).to.be.sortedBy('name');
    expect(resData.users.length).to.be.equal(defaultPageSize);
    expect(resData.totalUsers).to.be.equal(dbSize);
    expect(resData.previous).to.be.equal(false);
    expect(resData.next).to.be.equal(true);

    expect(users[4]).to.deep.include({
      id: +resData.users[0].id,
      name: resData.users[0].name,
      email: resData.users[0].email,
    });
    expect(users[0]).to.deep.include({
      id: +resData.users[1].id,
      name: resData.users[1].name,
      email: resData.users[1].email,
    });
    expect(users[3]).to.deep.include({
      id: +resData.users[2].id,
      name: resData.users[2].name,
      email: resData.users[2].email,
    });
  });

  it('should return list of $maxUsers: no previous, with next', async () => {
    const variables = { maxUsers: 4 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    expect(resData.users).to.be.sortedBy('name');
    expect(resData.users.length).to.be.equal(variables.maxUsers);
    expect(resData.totalUsers).to.be.equal(dbSize);
    expect(resData.previous).to.be.equal(false);
    expect(resData.next).to.be.equal(true);

    expect(users[4]).to.deep.include({
      id: +resData.users[0].id,
      name: resData.users[0].name,
      email: resData.users[0].email,
    });
    expect(users[0]).to.deep.include({
      id: +resData.users[1].id,
      name: resData.users[1].name,
      email: resData.users[1].email,
    });
    expect(users[3]).to.deep.include({
      id: +resData.users[2].id,
      name: resData.users[2].name,
      email: resData.users[2].email,
    });
    expect(users[1]).to.deep.include({
      id: +resData.users[3].id,
      name: resData.users[3].name,
      email: resData.users[3].email,
    });
  });

  it('should return list of first users but bigger than db: no previous, no next', async () => {
    const variables = { maxUsers: 10 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    expect(resData.users).to.be.sortedBy('name');
    expect(resData.totalUsers).to.be.equal(dbSize);
    expect(resData.totalUsers).to.be.equal(resData.users.length);
    expect(resData.previous).to.be.equal(false);
    expect(resData.next).to.be.equal(false);

    expect(users[4]).to.deep.include({
      id: +resData.users[0].id,
      name: resData.users[0].name,
      email: resData.users[0].email,
    });
    expect(users[0]).to.deep.include({
      id: +resData.users[1].id,
      name: resData.users[1].name,
      email: resData.users[1].email,
    });
    expect(users[3]).to.deep.include({
      id: +resData.users[2].id,
      name: resData.users[2].name,
      email: resData.users[2].email,
    });
    expect(users[1]).to.deep.include({
      id: +resData.users[3].id,
      name: resData.users[3].name,
      email: resData.users[3].email,
    });
    expect(users[2]).to.deep.include({
      id: +resData.users[4].id,
      name: resData.users[4].name,
      email: resData.users[4].email,
    });
  });

  it('should return shifted list of 3 users: with previous, with next', async () => {
    const variables = { step: 1 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    expect(resData.users).to.be.sortedBy('name');
    expect(resData.users.length).to.be.equal(defaultPageSize);
    expect(resData.totalUsers).to.be.equal(dbSize);
    expect(resData.previous).to.be.equal(true);
    expect(resData.next).to.be.equal(true);

    expect(users[0]).to.deep.include({
      id: +resData.users[0].id,
      name: resData.users[0].name,
      email: resData.users[0].email,
    });
    expect(users[3]).to.deep.include({
      id: +resData.users[1].id,
      name: resData.users[1].name,
      email: resData.users[1].email,
    });
    expect(users[1]).to.deep.include({
      id: +resData.users[2].id,
      name: resData.users[2].name,
      email: resData.users[2].email,
    });
  });

  it('should return list of last 3 users: with previous, no next', async () => {
    const variables = { step: 2 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    expect(resData.users).to.be.sortedBy('name');
    expect(resData.users.length).to.be.equal(defaultPageSize);
    expect(resData.totalUsers).to.be.equal(dbSize);
    expect(resData.previous).to.be.equal(true);
    expect(resData.next).to.be.equal(false);

    expect(users[3]).to.deep.include({
      id: +resData.users[0].id,
      name: resData.users[0].name,
      email: resData.users[0].email,
    });
    expect(users[1]).to.deep.include({
      id: +resData.users[1].id,
      name: resData.users[1].name,
      email: resData.users[1].email,
    });
    expect(users[2]).to.deep.include({
      id: +resData.users[2].id,
      name: resData.users[2].name,
      email: resData.users[2].email,
    });
  });

  it('should return shifted list of users bigger than db: with previous, no next', async () => {
    const variables = { maxUsers: 10, step: 3 };
    const usersResponse = await usersResponseData(token, variables);
    const resData = usersResponse.data.users;

    expect(resData.users).to.be.sortedBy('name');
    expect(resData.users.length).to.be.equal(dbSize - variables.step);
    expect(resData.totalUsers).to.be.equal(dbSize);
    expect(resData.previous).to.be.equal(true);
    expect(resData.next).to.be.equal(false);

    expect(users[1]).to.deep.include({
      id: +resData.users[0].id,
      name: resData.users[0].name,
      email: resData.users[0].email,
    });
    expect(users[2]).to.deep.include({
      id: +resData.users[1].id,
      name: resData.users[1].name,
      email: resData.users[1].email,
    });
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
