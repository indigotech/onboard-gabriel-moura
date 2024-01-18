import { launchServer } from './../index';

before(async () => {
  await launchServer();
});

require('./chai');
