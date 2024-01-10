import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'gbm',
  password: '123l',
  database: 'localserver',
});

AppDataSource.initialize().then(() => {
  console.log('Conectado ao db local!');
});
