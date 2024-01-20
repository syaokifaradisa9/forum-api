/* eslint-disable no-undef */

const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const requestPayload = {
        title: 'abc',
        body: 'abc',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseData = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseData.status).toEqual('success');
      expect(responseData.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        content: 'abc',
        body: 'abc',
      };

      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type spesification', async () => {
      const requestPayload = {
        title: 123,
        body: true,
      };

      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request missing authentication', async () => {
      const requestPayload = {
        title: 'abc',
        body: 'abc',
      };

      const server = await createServer({ container });
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread correctly', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'thread-123';

      // Arrange User
      await UsersTableTestHelper.addUser({});
      await ThreadTableTestHelper.addThread({ id: threadId });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseData = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseData.status).toEqual('success');
      expect(responseData.data.thread).toBeDefined();
    });
  });
});
