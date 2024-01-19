/* istanbul ignore file */

const ServerTestHelper = {
  async getAccessTokenWithUserIdHelper({ server }) {
    const userPayload = {
      username: 'syaokifaradisa',
      password: 'secret',
    };

    const responseUser = await server.inject({
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

    const { id: userId } = JSON.parse(responseUser.payload).data.addedUser;
    const { accessToken } = JSON.parse(responseAuth.payload).data;

    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
