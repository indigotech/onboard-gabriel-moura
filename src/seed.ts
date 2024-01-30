import { initializeDbConnection } from './setup';
import { dataSource } from './data-source';
import { faker } from '@faker-js/faker';
import { User } from './user';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config({});

export const createFakeUser = async (user: Partial<User>, i?: number) => {
  
  const n = i ? i : 0;

  return {
    name: user.name ?? faker.person.fullName(),
    email: user.email ?? 'newuser' + n + '@taq.com',
    password: await bcrypt.hash(user.password ?? 'senhaforte0' + n, 2),
    birthDate: user.birthDate ?? faker.date.birthdate().toString()
  };

};

export const populateDb = async () => {

  await initializeDbConnection(dataSource);
  const users = [];

  for (let i = 0; i < 100; i++) {
    const user = await createFakeUser({}, i);
    users.push(user);
  }

  await dataSource.getRepository(User).save(users);
  
};
