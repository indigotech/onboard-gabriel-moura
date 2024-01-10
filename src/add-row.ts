import { DataSource } from 'typeorm';
import { User } from './user';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'gbm',
  password: '123l',
  database: 'localserver',
  entities: [User],
});

AppDataSource.initialize().then(async () => {
  console.log('Conectado ao db local!');
  const user = new User();
  user.login = 'ana2';
  await AppDataSource.manager.save(user);
  console.log('User saved. Id: ', user.id);
  const savedUsers = await AppDataSource.manager.find(User);
  console.log('All saved users: ', savedUsers);
  await AppDataSource.destroy();
});
