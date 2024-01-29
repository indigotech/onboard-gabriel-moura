import axios from 'axios';
import { sign, verify } from 'jsonwebtoken';
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
      { email: authenticatedUser.email },
      process.env.JWT_SECRET as string,
    );
  });

  afterEach(async () => {
    await dataSource.getRepository(User).delete({});
  });

  it('should return user info succesfully', async () => {
      
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

    expect(newUser.name).to.be.equal(authenticatedUser.name);
    expect(newUser.email).to.be.equal(authenticatedUser.email);
    expect(newUser.birthDate).to.be.equal(authenticatedUser.birthDate);

    const res = await axios({
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

    expect(newUser.id).to.be.equal(+res.data.data.user.id);
    expect(newUser.name).to.be.equal(res.data.data.user.name);
    expect(newUser.email).to.be.equal(res.data.data.user.email);
    expect(newUser.birthDate).to.be.equal(res.data.data.user.birthDate);

    const payload = verify(token, process.env.JWT_SECRET as string) as {
      email: string;
      [key: string]: any;
    };

    expect(payload.email).to.be.equal(newUser.email);

  });

  it('should return auth error', async () => {
      
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

    expect(newUser.name).to.be.equal(authenticatedUser.name);
    expect(newUser.email).to.be.equal(authenticatedUser.email);
    expect(newUser.birthDate).to.be.equal(authenticatedUser.birthDate);

    const res = await axios({
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

    expect(res.data.errors[0].code).to.be.equal(401);
    expect(res.data.errors[0].message).to.be.equal('Erro de autenticação');
  });

  it('should return bad request error, invalid id', async () => {
      
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

    expect(newUser.name).to.be.equal(authenticatedUser.name);
    expect(newUser.email).to.be.equal(authenticatedUser.email);
    expect(newUser.birthDate).to.be.equal(authenticatedUser.birthDate);

    const res = await axios({
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

    expect(res.data.errors[0].code).to.be.equal(400);
    expect(res.data.errors[0].message).to.be.equal('ID inválido');
  });
});
