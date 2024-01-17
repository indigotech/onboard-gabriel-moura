import { initializeDbConnection, launchServer } from './setup';
import { appDataSource } from './data-source';

export const startApp = async () => {
  await launchServer();
  await initializeDbConnection(appDataSource);
};
