import axios from "axios";
import { UserInput } from "../resolvers";
import { dataSource } from "../data-source";
import { User } from "../user";
import bcrypt from 'bcrypt';
import { expect } from "chai";
import exp from "constants";

const authenticatedUser: UserInput = {
  name: 'Authenticated User',
  email: 'taq@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

const newUser: UserInput = {
  name: 'New User',
  email: 'emailnovo@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

describe('Testing token authentication', () => {

  afterEach(async () => {
    dataSource.getRepository(User).delete({});
  });

  it('should create user successfully', async () => {

    const dbUser = new User();
    dbUser.name = authenticatedUser.name;
    dbUser.email = authenticatedUser.email;
    dbUser.password = await bcrypt.hash(authenticatedUser.password, 2);
    dbUser.birthDate = authenticatedUser.birthDate;

    await dataSource.getRepository(User).save(dbUser);
  
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
          loginData: { email: authenticatedUser.email, password: authenticatedUser.password },
        },
      },
    });

    expect(authenticatedUser.name).to.be.equal(dbUser.name);
    expect(authenticatedUser.email).to.be.equal(dbUser.email);
    expect(authenticatedUser.birthDate).to.be.equal(dbUser.birthDate);

    expect(dbUser.id).to.be.equal(+loginResponse.data.data.login.user.id);
    
    expect(authenticatedUser.email).to.be.equal(loginResponse.data.data.login.user.email);
    expect(authenticatedUser.name).to.be.equal(loginResponse.data.data.login.user.name);
    expect(authenticatedUser.birthDate).to.be.equal(loginResponse.data.data.login.user.birthDate);

    const token = loginResponse.data.data.login.token;

    const createUserResponse = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {
        Authorization: token
      },
      data: {
        query: `
          mutation CreateUser ($data: UserInput) {
            createUser(data: $data) {
              id
              name
              email
              birthDate
            }
          }
        `,
        variables: {
          data: newUser,
        },
      },
    });

    expect(newUser.name).to.be.equal(createUserResponse.data.data.createUser.name);
    expect(newUser.email).to.be.equal(createUserResponse.data.data.createUser.email);
    expect(newUser.birthDate).to.be.equal(createUserResponse.data.data.createUser.birthDate);

  });

  it('should return auth error: invalid token request', async () => {

    const dbUser = new User();
    dbUser.name = authenticatedUser.name;
    dbUser.email = authenticatedUser.email;
    dbUser.password = await bcrypt.hash(authenticatedUser.password, 2);
    dbUser.birthDate = authenticatedUser.birthDate;

    await dataSource.getRepository(User).save(dbUser);
  
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
          loginData: { email: authenticatedUser.email, password: authenticatedUser.password },
        },
      },
    });

    expect(authenticatedUser.name).to.be.equal(dbUser.name);
    expect(authenticatedUser.email).to.be.equal(dbUser.email);
    expect(authenticatedUser.birthDate).to.be.equal(dbUser.birthDate);

    expect(dbUser.id).to.be.equal(+loginResponse.data.data.login.user.id);
    
    expect(authenticatedUser.email).to.be.equal(loginResponse.data.data.login.user.email);
    expect(authenticatedUser.name).to.be.equal(loginResponse.data.data.login.user.name);
    expect(authenticatedUser.birthDate).to.be.equal(loginResponse.data.data.login.user.birthDate);

    const createUserResponse = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      data: {
        query: `
          mutation CreateUser ($data: UserInput) {
            createUser(data: $data) {
              id
              name
              email
              birthDate
            }
          }
        `,
        variables: {
          data: newUser,
        },
      },
    });

    expect(createUserResponse.data.errors[0].code).to.be.equal(401);
    expect(createUserResponse.data.errors[0].message).to.be.equal('Erro de autenticação');

  });
});
