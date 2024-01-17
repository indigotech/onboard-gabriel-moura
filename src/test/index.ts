import { launchServer, initializeDbConnection } from './../setup';
import { testDataSource } from '../data-source';
import dotenv from 'dotenv';

before(async () => {
  await initializeDbConnection(testDataSource);
  await launchServer();
  dotenv.config({
    path: __dirname + '/./../../test.env',
  });
});

require('./hello.ts');
