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

export const initializeConnection = async () => {
  try {
    await appDataSource.initialize();
    console.log('Conectado ao db local!');
  } catch (error) {
    console.error('Erro na conexao', error);
  }
};
