import { launchServer } from './../index';

before(async () => {
  await launchServer();
});

require('./hello-query');
