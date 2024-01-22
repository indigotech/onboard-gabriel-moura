import axios from 'axios';
import chai from 'chai';
import { UserInput } from './../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';

describe('Testing returned Custom Error', () => {
  it('should return duplicate email error', async () => {
    const user: UserInput = {
      name: 'Taq',
      email: 'taq@gmail.com',
      password: 'senhaforte123',
      birthDate: '01-01-2024',
    };

    const dbUser = { ...user };

    await dataSource.getRepository(User).save(dbUser);

    const response = await axios({
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
          data: user,
        },
      },
    });

    chai.expect(user.email).to.be.equal(dbUser.email);
    chai.expect(response.data.errors[0].code).to.be.equal(409);
    chai.expect(response.data.errors[0].message).to.be.equal('Email duplicado');

    await dataSource.getRepository(User).delete(dbUser);
  });
});
