import axios from "axios";
import { UserInput } from "../resolvers";
import { dataSource } from "../data-source";
import { User } from "../user";
import bcrypt from 'bcrypt';
import { expect } from "chai";

const authenticatedUser: UserInput = {
  name: 'Authenticated User',
  email: 'taq@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

const newUser: UserInput = {
  name: 'Authenticated User',
  email: 'emailnovo@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

describe('Testing token authentication', () => {

  afterEach(async () => {
    dataSource.getRepository(User).delete({});
  });

  it('should create user successfully authenticated', async () => {

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
    expect(authenticatedUser.email).to.be.equal(dbUser.email);

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
    console.log(createUserResponse.data);
  });
});