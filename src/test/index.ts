import { launchServer, initializeDbConnection } from './../setup';
import { dataSource } from '../data-source';
import dotenv from 'dotenv';
import chai from 'chai';
import chaiSorted from 'chai-sorted';

before(async () => {
  dotenv.config({
    path: 'test.env',
  });
  chai.use(chaiSorted);
  await initializeDbConnection(dataSource);
  await launchServer();
});

require('./hello');
require('./create-user');
require('./login');
require('./user');
require('./pagination');
