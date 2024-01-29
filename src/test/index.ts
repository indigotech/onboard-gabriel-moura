import { launchServer, initializeDbConnection } from './../setup';
import { dataSource } from '../data-source';
import dotenv from 'dotenv';

before(async () => {
  dotenv.config({
    path: 'test.env',
  });
  await initializeDbConnection(dataSource);
  await launchServer();
});

require('./hello');
require('./create-user');
require('./login');
require('./user-query');
require('./users');
