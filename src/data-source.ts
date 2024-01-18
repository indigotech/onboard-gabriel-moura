import { DataSource } from 'typeorm';
import { User } from './user';

export const appDataSource = new DataSource({
  type: 'postgres',
  url: '',
  entities: [User],
  synchronize: true,
});

export const testDataSource = new DataSource({
  type: 'postgres',
  url: '',
  entities: [User],
  synchronize: true,
});
