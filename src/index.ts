import { initializeDbConnection, launchServer } from './setup';
import { appDataSource } from './data-source';
import dotenv from 'dotenv';

dotenv.config({});

export const startApp = async () => {
  await launchServer();
  await initializeDbConnection(appDataSource);
};

startApp();
