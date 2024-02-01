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

const populateDb = async () => {
  const user0 = await createFakeUser({ name: 'B Usuario', email: 'user1@taq.com' });
  const user1 = await createFakeUser({ name: 'De Code', email: 'user2@taq.com' });
  const user2 = await createFakeUser({ name: 'Ze Dev', email: 'user2@taq.com' });
  const user3 = await createFakeUser({ name: 'Da Taq', email: 'user3@taq.com' });
  const user4 = await createFakeUser({ name: 'A Sobrenome', email: 'user4@taq.com' });

  return [user0, user1, user2, user3, user4,];
};

describe('Testing users list query with pagination', () => {
  let token: string;
  let users: UserInput[];
  const dbSize = 5;

  before(async () => {
    users = [
      await createFakeUser({ name: 'B Usuario', email: 'user0@taq.com' }),
      await createFakeUser({ name: 'De Code', email: 'user1@taq.com' }),
      await createFakeUser({ name: 'Ze Dev', email: 'user2@taq.com' }),
      await createFakeUser({ name: 'Da Taq', email: 'user3@taq.com' }),
      await createFakeUser({ name: 'A Sobrenome', email: 'user4@taq.com' })
    ]
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
    const variables = { maxUsers: 3, step: 10 };
    const usersResponse = await usersResponseData(token, variables);  

    expect(usersResponse.errors[0].code).to.be.equal(400);
    expect(usersResponse.errors[0].message).to.be.equal('Requisição inválida');
    expect(usersResponse.errors[0].additionalInfo).to.be.equal('Erro ao acessar usuário');
  });

  it('should return list of 3 first users successfully: no previous, with next', async () => {
    const variables = {};
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.users.length).to.be.equal(3);
    expect(usersResponse.data.users.totalUsers).to.be.equal(dbSize);
    expect(usersResponse.data.users.previous).to.be.equal(false);
    expect(usersResponse.data.users.next).to.be.equal(true);

    expect(usersResponse.data.users.users[0].name).to.be.equal('A Sobrenome');
    expect(usersResponse.data.users.users[0].email).to.be.equal('user4@taq.com');
    expect(usersResponse.data.users.users[1].name).to.be.equal('B Usuario');
    expect(usersResponse.data.users.users[1].email).to.be.equal('user0@taq.com');
    expect(usersResponse.data.users.users[2].name).to.be.equal('Da Taq');
    expect(usersResponse.data.users.users[2].email).to.be.equal('user3@taq.com');
  });

  it('should return list of $maxUsers: no previous, with next', async () => {
    const variables = { maxUsers: 4 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.users.length).to.be.equal(variables.maxUsers);
    expect(usersResponse.data.users.totalUsers).to.be.equal(dbSize);
    expect(usersResponse.data.users.previous).to.be.equal(false);
    expect(usersResponse.data.users.next).to.be.equal(true);

    expect(usersResponse.data.users.users[0].name).to.be.equal('A Sobrenome');
    expect(usersResponse.data.users.users[0].email).to.be.equal('user4@taq.com');
    expect(usersResponse.data.users.users[1].name).to.be.equal('B Usuario');
    expect(usersResponse.data.users.users[1].email).to.be.equal('user0@taq.com');
    expect(usersResponse.data.users.users[2].name).to.be.equal('Da Taq');
    expect(usersResponse.data.users.users[2].email).to.be.equal('user3@taq.com');
    expect(usersResponse.data.users.users[3].name).to.be.equal('De Code');
    expect(usersResponse.data.users.users[3].email).to.be.equal('user1@taq.com');
  });

  it('should return list of first users but bigger than db: no previous, no next', async () => {
    const variables = { maxUsers: 10 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.totalUsers).to.be.equal(dbSize);
    expect(usersResponse.data.users.totalUsers).to.be.equal(usersResponse.data.users.users.length);
    expect(usersResponse.data.users.previous).to.be.equal(false);
    expect(usersResponse.data.users.next).to.be.equal(false);

    expect(usersResponse.data.users.users[0].name).to.be.equal('A Sobrenome');
    expect(usersResponse.data.users.users[0].email).to.be.equal('user4@taq.com');
    expect(usersResponse.data.users.users[1].name).to.be.equal('B Usuario');
    expect(usersResponse.data.users.users[1].email).to.be.equal('user0@taq.com');
    expect(usersResponse.data.users.users[2].name).to.be.equal('Da Taq');
    expect(usersResponse.data.users.users[2].email).to.be.equal('user3@taq.com');
    expect(usersResponse.data.users.users[3].name).to.be.equal('De Code');
    expect(usersResponse.data.users.users[3].email).to.be.equal('user1@taq.com');
    expect(usersResponse.data.users.users[4].name).to.be.equal('Ze Dev');
    expect(usersResponse.data.users.users[4].email).to.be.equal('user2@taq.com');
  });

  it('should return shifted list of 3 users: with previous, with next', async () => {
    const variables = { step: 1 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.users.length).to.be.equal(3);
    expect(usersResponse.data.users.totalUsers).to.be.equal(dbSize);
    expect(usersResponse.data.users.previous).to.be.equal(true);
    expect(usersResponse.data.users.next).to.be.equal(true);

    expect(usersResponse.data.users.users[0].name).to.be.equal('B Usuario');
    expect(usersResponse.data.users.users[0].email).to.be.equal('user0@taq.com');
    expect(usersResponse.data.users.users[1].name).to.be.equal('Da Taq');
    expect(usersResponse.data.users.users[1].email).to.be.equal('user3@taq.com');
    expect(usersResponse.data.users.users[2].name).to.be.equal('De Code');
    expect(usersResponse.data.users.users[2].email).to.be.equal('user1@taq.com');
  });

  it('should return list of last 3 users: with previous, no next', async () => {
    const variables = { step: 2 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.users.length).to.be.equal(3);
    expect(usersResponse.data.users.totalUsers).to.be.equal(dbSize);  
    expect(usersResponse.data.users.previous).to.be.equal(true);
    expect(usersResponse.data.users.next).to.be.equal(false);

    expect(usersResponse.data.users.users[0].name).to.be.equal('Da Taq');
    expect(usersResponse.data.users.users[0].email).to.be.equal('user3@taq.com');
    expect(usersResponse.data.users.users[1].name).to.be.equal('De Code');
    expect(usersResponse.data.users.users[1].email).to.be.equal('user1@taq.com');
    expect(usersResponse.data.users.users[2].name).to.be.equal('Ze Dev');
    expect(usersResponse.data.users.users[2].email).to.be.equal('user2@taq.com');
  });

  it('should return shifted list of users bigger than db: with previous, no next', async () => {
    const variables = { maxUsers: 10, step: 3 };
    const usersResponse = await usersResponseData(token, variables);

    expect(usersResponse.data.users.users).to.be.sortedBy('name');
    expect(usersResponse.data.users.users.length).to.be.equal(2);
    expect(usersResponse.data.users.totalUsers).to.be.equal(dbSize);
    expect(usersResponse.data.users.previous).to.be.equal(true);
    expect(usersResponse.data.users.next).to.be.equal(false);

    expect(usersResponse.data.users.users[0].name).to.be.equal('De Code');
    expect(usersResponse.data.users.users[0].email).to.be.equal('user1@taq.com');
    expect(usersResponse.data.users.users[1].name).to.be.equal('Ze Dev');
    expect(usersResponse.data.users.users[1].email).to.be.equal('user2@taq.com');
  });
});

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
