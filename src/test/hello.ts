import axios from 'axios';
import chai from 'chai';

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
    chai.expect(response.status).to.be.equal(200);
    console.log(response.data.data);
  });
});
