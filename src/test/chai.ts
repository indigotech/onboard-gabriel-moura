import axios from 'axios';
import { launchServer } from './../index';
import chai from 'chai';

describe('Connect on server and chai expect', () => {
  before(async () => {
    await launchServer();
  });

  it('Connection Status Code 200', async () => {
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
    chai.expect(response.status).to.be.equal(200);
    chai.expect(response.data.data.hello).to.be.equal('Hello World!');
  });
});
