import axios from 'axios';

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
    console.log(response.status);
    console.log(response.data.data);
  });
});
