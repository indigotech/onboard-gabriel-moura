import axios from 'axios';
import chai from 'chai';
import { UserInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';

const user: UserInput = {
    name: 'Usuario',
    email: 'taq@gmail.com',
    password: 'senhafort3',
    birthDate: '01-01-2024',
};

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

describe('Testing login mutation', () => {
    it('should return non-existing email error', async () => {
        const createdUser = await createUser();
        const response = await axios({
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
                  loginData: {email: 'nao-existe@taq.com', password: user.password},
              },
            },
        });

      chai.expect(response.data.errors[0].code).to.be.equal(401);
      chai.expect(response.data.errors[0].additionalInfo).to.be.equal('Email não existe');

      await dataSource.getRepository(User).delete(createdUser.id);
    });

  it('should return incorrect password error', async () => {
    const createdUser = await createUser();
    const response = await axios({
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
          loginData: { email: user.email, password: 'senhaerrada' },
        },
      },
    });
    
    chai.expect(user.email).to.be.equal(createdUser.email);
    chai.expect(response.data.errors[0].code).to.be.equal(401);
    chai.expect(response.data.errors[0].additionalInfo).to.be.equal('Senha incorreta');

    await dataSource.getRepository(User).delete(createdUser.id);
  });

  it('should login successfully', async () => {
    const createdUser = await createUser();
    const response = await axios({
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
          loginData: { email: user.email, password: user.password },
        },
      },
    });
    
    chai.expect(createdUser.name).to.be.equal(response.data.data.name);
    chai.expect(createdUser.email).to.be.equal(response.data.data.email);
    chai.expect(createdUser.birthDate).to.be.equal(response.data.data.birthDate);

    await dataSource.getRepository(User).delete(createdUser.id);
  });
});