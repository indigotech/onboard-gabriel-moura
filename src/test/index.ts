import axios from 'axios';
import { launchServer } from './../index';

describe('Testing on server', () => {
  before(async () => {
    await launchServer();
  });

  it('prints Hello World', () => {
    console.log('Hello World');
  });

  it('query from server', async () => {
    const response = await axios({
      url: 'http://localhost:3000',
      method: 'post',
      data: {
        query: `
          query Hello {
            hello
          }
        `,
      },
    });
    console.log(response.status);
    console.log(response.data);
  });
});
