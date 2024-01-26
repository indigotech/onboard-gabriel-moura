import axios from 'axios';
import { expect } from 'chai';
import { UserInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';
import jwt from 'jsonwebtoken';

const usersToTest = [
  { name: 'Taq', email: 'taq@gmail.com', password: 'senhaforte123', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: 'senhafraca', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: 'F0RT3', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: '12345678', birthDate: '01-01-2024' },
];

describe('Testing createUser mutation', () => {
  
  let token: string;

  beforeEach(async () => {
    token = jwt.sign('auth_token', process.env.JWT_SECRET as string);
  });
  
  afterEach(async () => {
    await dataSource.getRepository(User).delete({});
  });

  it('should create user successfully', async () => {
    const user = usersToTest[0];
    const createdUser = await createUser(user, token);

    expect(user.name).to.be.equal(createdUser.data.createUser.name);
    expect(user.email).to.be.equal(createdUser.data.createUser.email);
    expect(user.birthDate).to.be.equal(createdUser.data.createUser.birthDate);

    const newUser = await dataSource.getRepository(User).findOneBy({
      id: createdUser.data.createUser.id,
    });

    expect(user.name).to.be.equal(newUser?.name);
    expect(user.email).to.be.equal(newUser?.email);
    expect(user.birthDate).to.be.equal(newUser?.birthDate);
  });

  it('should return weak password error', async () => {
    for (const user of usersToTest.slice(1, 4)) {
      const createdUser = await createUser(user, token);
      expect(createdUser.errors[0].code).to.be.equal(400);
      expect(createdUser.errors[0].message).to.be.equal('Senha fraca');
    }
  });

  it('should return duplicate email error', async () => {
    const user = usersToTest[0];

    const dbUser = { ...user };
    dataSource.getRepository(User).save(dbUser);

    const createdUser = await createUser(user, token);

    expect(user.email).to.be.equal(dbUser.email);
    expect(createdUser.errors[0].code).to.be.equal(409);
    expect(createdUser.errors[0].message).to.be.equal('Email duplicado');
  });
  
});

const createUser = async (user: UserInput, token: string) => {
  const createUserResponse = await axios({
    url: 'http://localhost:3000',
    method: 'post',
    headers: {
      Authorization: token
    },
    data: {
      query: `
            mutation Mutation($data: UserInput) {
              createUser(data: $data) {
                id
                name
                email
                birthDate
              }
            }
        `,
      variables: {
        data: user,
      },
    },
  });
  return createUserResponse.data;
};
