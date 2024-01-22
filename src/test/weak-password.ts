import axios from 'axios';
import chai from 'chai';
import { UserInput } from './../resolvers';

const tryWeakPassword = async (user: UserInput) => {
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

  return {
    code: response.data.errors[0].code,
    message: response.data.errors[0].message,
  };
};

const usersToTest = [
  { name: 'Taq', email: 'taq@gmail.com', password: 'senhafraca', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: 'F0RT3', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: '12345678', birthDate: '01-01-2024' },
];

describe('Testing Custom Error weak password message', () => {
  it('should return weak password error', async () => {
    for (const user of usersToTest) {
      chai.expect((await tryWeakPassword(user)).code).to.be.equal(400);
      chai.expect((await tryWeakPassword(user)).message).to.be.equal('Senha fraca');
    }
  });
});
