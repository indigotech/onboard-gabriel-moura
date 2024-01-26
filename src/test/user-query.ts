import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { dataSource } from '../data-source';
import { User } from '../user';
import { UserInput } from '../resolvers';
import bcrypt from 'bcrypt';
import { expect } from 'chai';

const authenticatedUser: UserInput = {
  name: 'Authenticated User',
  email: 'taq@gmail.com',
  password: 'senhafort3',
  birthDate: '01-01-2024',
};

describe('Testing user query', () => {

  let token: string;

  beforeEach(async () => {
    token = sign(
      { email: authenticatedUser.email, password: authenticatedUser.password },
      process.env.JWT_SECRET as string,
    );
  });

  afterEach(async () => {
    await dataSource.getRepository(User).delete({});
  });

  it('should return user info succesfully', async () => {
      
    const user = new User();
    user.name = authenticatedUser.name;
    user.email = authenticatedUser.email;
    user.password = await bcrypt.hash(authenticatedUser.password, 2);
    user.birthDate = authenticatedUser.birthDate;

    const newUser = await dataSource.getRepository(User).save(user);

    expect(newUser.name).to.be.equal(authenticatedUser.name);
    expect(newUser.email).to.be.equal(authenticatedUser.email);
    expect(newUser.birthDate).to.be.equal(authenticatedUser.birthDate);
    expect(newUser.id).to.be.a('number');

    const response = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {
          Authorization: token,
      },
      data: {
          query: `
              query User ($id: ID) {
                  user(id: $id) {
                      id
                      name
                      email
                      birthDate
                  }
              }
          `,
          variables: {
            id: newUser.id,
          },
      },
    });

    expect(newUser.id).to.be.equal(+response.data.data.user.id);
    expect(newUser.name).to.be.equal(response.data.data.user.name);
    expect(newUser.email).to.be.equal(response.data.data.user.email);
    expect(newUser.birthDate).to.be.equal(response.data.data.user.birthDate);

  });

  it('should return auth error', async () => {
      
    const user = new User();
    user.name = authenticatedUser.name;
    user.email = authenticatedUser.email;
    user.password = await bcrypt.hash(authenticatedUser.password, 2);
    user.birthDate = authenticatedUser.birthDate;

    const newUser = await dataSource.getRepository(User).save(user);

    expect(newUser.name).to.be.equal(authenticatedUser.name);
    expect(newUser.email).to.be.equal(authenticatedUser.email);
    expect(newUser.birthDate).to.be.equal(authenticatedUser.birthDate);
    expect(newUser.id).to.be.a('number');

    const response = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {
      },
      data: {
          query: `
              query User ($id: ID) {
                  user(id: $id) {
                      id
                      name
                      email
                      birthDate
                  }
              }
          `,
          variables: {
            id: newUser.id,
          },
      },
    });

    expect(response.data.errors[0].code).to.be.equal(401);
    expect(response.data.errors[0].message).to.be.equal('Falha de autenticação');
  });

  it('should return bad request error, invalid id', async () => {
      
    const user = new User();
    user.name = authenticatedUser.name;
    user.email = authenticatedUser.email;
    user.password = await bcrypt.hash(authenticatedUser.password, 2);
    user.birthDate = authenticatedUser.birthDate;

    const newUser = await dataSource.getRepository(User).save(user);

    expect(newUser.name).to.be.equal(authenticatedUser.name);
    expect(newUser.email).to.be.equal(authenticatedUser.email);
    expect(newUser.birthDate).to.be.equal(authenticatedUser.birthDate);
    expect(newUser.id).to.be.a('number');

    const response = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {
        Authorization: token,
      },
      data: {
        query: `
            query User ($id: ID) {
                user(id: $id) {
                    id
                    name
                    email
                    birthDate
                }
            }
        `,
        variables: {
          id: newUser.id + 100,
        },
      },
    });

    expect(response.data.errors[0].code).to.be.equal(400);
    expect(response.data.errors[0].message).to.be.equal('Usuário não existe');
  });
});
