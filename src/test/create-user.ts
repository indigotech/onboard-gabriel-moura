import axios from 'axios';
import { UserInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';

describe('Testing createUser Mutation', () => {
  it('should return created user on test db', async () => {
    const user: UserInput = {
      name: 'Taq',
      email: 'taq@gmail.com.br',
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
          data: {
            name: user.name,
            email: user.email,
            password: user.password,
            birthDate: user.birthDate,
          },
        },
      },
    });

    const createdUser = await dataSource.getRepository(User).findOneBy({
      id: response.data.data.createUser.id,
    });

    if (createdUser) {
      console.log('Usuario criado: ', createdUser);

      console.log('Deleting user now...');
      await dataSource.getRepository(User).delete(createdUser.id);
    }
  });
});
