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
    token = sign({ email: authenticatedUser.email }, process.env.JWT_SECRET as string);
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
  });

  it('should return auth error: missing token', async () => {
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

    const res = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {},
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
    expect(res.data.errors[0].additionalInfo).to.be.equal('Token inválido');
  });

  it('should return auth error: invalid token', async () => {
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

    const res = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {
        Authorization: token + 'invalid_token',
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
    expect(res.data.errors[0].additionalInfo).to.be.equal('Token inválido');
  });

  it('should return auth error: expired token', async () => {
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

    const exp_token = sign(
      {
        email: authenticatedUser.email,
        iat: Math.floor(Date.now() / 1000) - 60 * 60 * 2,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
    );

    const res = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      headers: {
        Authorization: exp_token,
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
    expect(res.data.errors[0].additionalInfo).to.be.equal('Token expirado');
  });

  it('should return not found error, invalid id', async () => {
    const newUser = await dataSource.getRepository(User).save({
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      password: await bcrypt.hash(authenticatedUser.password, 2),
      birthDate: authenticatedUser.birthDate,
    });

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

    expect(res.data.errors[0].code).to.be.equal(404);
    expect(res.data.errors[0].message).to.be.equal('Usuário não encontrado');
  });
});
