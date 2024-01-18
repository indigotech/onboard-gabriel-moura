import { launchServer, initializeDbConnection } from './../setup';
import { testDataSource } from '../data-source';
import dotenv from 'dotenv';

before(async () => {
  dotenv.config({
    path: __dirname + '/./../../test.env',
  });
  await initializeDbConnection(testDataSource);
  await launchServer();
});

require('./hello.ts');
