import { initializeDbConnection } from './setup';
import { dataSource } from './data-source';
import { faker } from '@faker-js/faker';
import { User } from './user';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config({});

export const createFakeUser = async (i: number) => {

  return {
    name: faker.person.fullName(),
    email: 'newuser' + i + '@taq.com',
    password: await bcrypt.hash('senhaforte123' + i, 2),
    birthDate: faker.date.birthdate().toString()
  };

};

export const populateDb = async () => {

  await initializeDbConnection(dataSource);
  const users = [];

  for (let i = 0; i < 100; i++) {
    const user = await createFakeUser(i);
    users.push(user);
  }

  await dataSource.getRepository(User).save(users);
  
};

populateDb();
