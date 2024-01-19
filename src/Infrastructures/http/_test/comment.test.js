/* eslint-disable no-undef */

const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'abc',
      };

      const server = await createServer(container);

      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const id = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'abc',
        body: 'abcdef',
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};

      const server = await createServer(container);
      const {
        userId,
        accessToken,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const threadId = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'abc',
        body: 'abcdef',
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type spesification', async () => {
      const requestPayload = {
        content: true,
      };

      const server = await createServer(container);
      const {
        userId,
        accessToken,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const threadId = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'abc',
        body: 'abcdef',
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request missing authentication', async () => {
      const requestPayload = {
        content: 'abc',
      };

      const server = await createServer(container);
      const { userId } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const threadId = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'abc',
        body: 'abcdef',
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
