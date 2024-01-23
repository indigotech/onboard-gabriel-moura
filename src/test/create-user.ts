import axios from 'axios';
import { expect } from 'chai';
import { UserInput } from '../resolvers';
import { dataSource } from '../data-source';
import { User } from '../user';

const usersToTest = [
  { name: 'Taq', email: 'taq@gmail.com', password: 'senhaforte123', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: 'senhafraca', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: 'F0RT3', birthDate: '01-01-2024' },
  { name: 'Taq', email: 'taq@gmail.com', password: '12345678', birthDate: '01-01-2024' },
];

const createUser = async (user: UserInput) => {
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
};

afterEach(async () => {
  await dataSource.getRepository(User).delete({});
});

describe('Testing createUser Mutation', () => {
  it('should create user successfully', async () => {
    const user = usersToTest[0];
    const createdUser = await createUser(user);

    expect(user.name).to.be.equal(createdUser.name);
    expect(user.email).to.be.equal(createdUser.email);
    expect(user.birthDate).to.be.equal(createdUser.birthDate);

    const newUser = await dataSource.getRepository(User).findOneBy({
      id: createdUser.id,
    });

    expect(user.name).to.be.equal(newUser?.name);
    expect(user.email).to.be.equal(newUser?.email);
    expect(user.birthDate).to.be.equal(newUser?.birthDate);
  });
});
