import { initializeDbConnection, launchServer } from './setup';
import { dataSource } from './data-source';
import dotenv from 'dotenv';

dotenv.config({});

export const startApp = async () => {
  await launchServer();
  await initializeDbConnection(dataSource);
};

startApp();
