import axios from 'axios';
import { expect } from 'chai';

describe('Testing on server', () => {
  it('should return hello query from server', async () => {
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
    expect(response.status).to.be.equal(200);
    expect(response.data.data.hello).to.be.equal('Hello World!');
  });
});
