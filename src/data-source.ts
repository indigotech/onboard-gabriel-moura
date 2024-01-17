import { DataSource } from 'typeorm';
import { User } from './user';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'gbm',
  password: '123l',
  database: 'localserver',
  entities: [User],
  synchronize: true,
});

export const testDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'gbm',
  password: '123t',
  database: 'test',
  entities: [User],
  synchronize: true,
});
