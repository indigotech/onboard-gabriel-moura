import axios from 'axios';
import chai from 'chai';
import { UserInput, LoginInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';
import { expect } from 'chai';

const user: UserInput = {
    name: 'Usuario',
    email: 'taq@gmail.com',
    password: 'senhafort3',
    birthDate: '01-01-2024',
};

describe('Testing login mutation', () => {

  let createdUser: User;

  beforeEach(async () => {
    createdUser = await createUser();
  });

  afterEach(async () => {
    await dataSource.getRepository(User).delete({});
  });

  it('should return non-existing email error', async () => {

    const res = await login({ email: 'nao-existe@taq.com', password: user.password });

    expect(res.errors[0].code).to.be.equal(401);
    expect(res.errors[0].additionalInfo).to.be.equal('Email não existe'); 

  });

  it('should return incorrect password error', async () => {

    const res = await login({ email: user.email, password: 'senhaerrada' });
    
    expect(user.email).to.be.equal(createdUser.email);
    expect(res.errors[0].code).to.be.equal(401);
    expect(res.errors[0].additionalInfo).to.be.equal('Senha incorreta');

  });

  it('should login successfully', async () => {

    const res = await login({ email: user.email, password: user.password });
    
    expect(createdUser.name).to.be.equal(res.data.login.user.name);
    expect(createdUser.email).to.be.equal(res.data.login.user.email);
    expect(createdUser.birthDate).to.be.equal(res.data.login.user.birthDate);

  });

});

const createUser = async () => {
  const createUserResponse = await axios({
    url: 'http://localhost:3000',
    method: 'post',
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

  return createUserResponse.data.data.createUser;
}

const login = async (login: LoginInput) => {
  const loginResponse = await axios({
    url: 'http://localhost:3000',
    method: 'post',
    data: {
      query: `
        mutation Login ($loginData: LoginInput) {
          login(data: $loginData) {
            user {
              id
              name
              email
              birthDate
            }
            token
          }
        }
      `,
      variables: {
        loginData: login,
      },
    },
  });
  return loginResponse.data;
}