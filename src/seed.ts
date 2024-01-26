import { initializeDbConnection } from './setup';
import { dataSource } from './data-source';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { User } from './user';
import dotenv from 'dotenv';

dotenv.config({});

const createFakeUser = async () => {
    const user = new User();
    user.name = faker.person.fullName();
    user.email = faker.internet.email();
    user.password = await bcrypt.hash(faker.internet.password(), 2);
    user.birthDate = faker.date.birthdate().toString();

    return user;
};

export const populateDb = async () => {
    await initializeDbConnection(dataSource);
    for (let i = 0; i < 100; i++) {
      const user = await createFakeUser();
      await dataSource.getRepository(User).save(user);
    }
};

populateDb();



