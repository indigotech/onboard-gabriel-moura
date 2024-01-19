import { DataSource } from 'typeorm';
import { User } from './user';

export const dataSource = new DataSource({
  type: 'postgres',
  url: '',
  entities: [User],
  synchronize: true,
});
