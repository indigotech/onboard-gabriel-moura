import axios from 'axios';
import chai from 'chai';
import { UserInput } from './../resolvers';

describe('Testing returned Custom Error', () => {
  it('should return invalid password error', async () => {
    const user: UserInput = {
      name: 'Taq',
      email: 'taqnovo1@gmail.com.br',
      password: 'senhafraca',
      birthDate: '01-01-2024',
    };

    const response = await axios({
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
          data: {
            name: user.name,
            email: user.email,
            password: user.password,
            birthDate: user.birthDate,
          },
        },
      },
    });
    console.log(response.data.errors[0].message);
    chai.expect(response.data.errors[0].code).to.be.equal(400);
  });
});
