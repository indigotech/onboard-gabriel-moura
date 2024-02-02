import { initializeDbConnection } from './setup';
import { dataSource } from './data-source';
import { User } from './user';
import { createFakeUser } from './fake-user-generator';
import dotenv from 'dotenv';

dotenv.config({});

export const populateDb = async () => {
  await initializeDbConnection(dataSource);
  const users = [];

  for (let i = 0; i < 100; i++) {
    const user = await createFakeUser({}, i);
    users.push(user);
  }

  await dataSource.getRepository(User).save(users);
};

populateDb();
