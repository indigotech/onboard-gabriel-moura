import axios from 'axios';
import chai from 'chai';
import { UserInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';

const user: UserInput = {
    name: 'Usuario',
    email: 'taqnovo@gmail.com',
    password: 'senhafort3',
    birthDate: '01-01-2024',
};

const createUser = async () => {
    await axios({
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
}

describe('Testing login mutation', () => {
    it('should return non-existing email error', async () => {
        await createUser();
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
                  loginData: {email: 'nao-existe', password: user.password},
              },
            },
        });
        chai.expect(response.data.errors[0].code).to.be.equal(401);
        chai.expect(response.data.errors[0].additionalInfo).to.be.equal('Email não existe');

        await dataSource.getRepository(User).delete(user);
    });

    it('should return incorrect password error', async () => {
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
                  loginData: {email: user.email, password: 'senhaerrada'},
              },
            },
        });
        chai.expect(response.data.errors[0].code).to.be.equal(401);
        chai.expect(response.data.errors[0].additionalInfo).to.be.equal('Senha incorreta');

        await dataSource.getRepository(User).delete(user);
    });
});