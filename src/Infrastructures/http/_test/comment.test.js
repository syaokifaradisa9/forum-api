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

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const threadId = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      const commentId = await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const comment = await CommentTableTestHelper.getCommentById(commentId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(comment.isdelete).toEqual(true);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const threadId = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-321`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Data komentar tidak ditemukan');
    });

    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const { userId } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      const threadId = await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-321`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when user not have access', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'thread-123';
      const anotherUserId = 'user-321';
      const userCommentId = 'comment-123';
      const anotherUserCommentId = 'comment-321';

      // Action
      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await UsersTableTestHelper.addUser({
        id: anotherUserId,
        username: 'syaokifaradisa123',
        password: 'secret',
        fullname: 'Muhammad Syaoki Faradisa',
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: userCommentId,
        threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: anotherUserCommentId,
        threadId,
        owner: anotherUserId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${anotherUserCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki akses ke komentar ini');
    });
  });
});
