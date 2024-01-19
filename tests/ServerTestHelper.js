/* istanbul ignore file */

const ServerTestHelper = {
  async getAccessTokenHelper({ server }) {
    const userPayload = {
      username: 'syaokifaradisa',
      password: 'secret',
    };

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: userPayload.username,
        password: userPayload.password,
        fullname: 'Muhammad Syaoki Faradisa',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const { accessToken } = JSON.parse(responseAuth.payload).data;

    return accessToken;
  },
};

module.exports = ServerTestHelper;
