import { DataSource } from 'typeorm';
import { User } from './user';
import { Address } from './address';

export const dataSource = new DataSource({
  type: 'postgres',
  url: '',
  entities: [User, Address],
  synchronize: true,
});
