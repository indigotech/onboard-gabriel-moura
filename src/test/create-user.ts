import axios from 'axios';
import chai from 'chai';
import { UserInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';

describe('Testing createUser Mutation', () => {
  it('should return created user', async () => {
    const user: UserInput = {
      name: 'Taq',
      email: 'taq@gmail.com',
      password: 'forte123123',
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
          data: user,
        },
      },
    });

    chai.expect(user.name).to.be.equal(response.data.data.createUser.name);
    chai.expect(user.email).to.be.equal(response.data.data.createUser.email);
    chai.expect(user.birthDate).to.be.equal(response.data.data.createUser.birthDate);

    const createdUser = await dataSource.getRepository(User).findOneBy({
      id: response.data.data.createUser.id,
    });

    if (createdUser) {
      console.log('Created user: ', createdUser);
      chai.expect(user.name).to.be.equal(createdUser.name);
      chai.expect(user.email).to.be.equal(createdUser.email);
      chai.expect(user.birthDate).to.be.equal(createdUser.birthDate);

      console.log('Deleting user now...');
      await dataSource.getRepository(User).delete(createdUser.id);
    }
  });
});
