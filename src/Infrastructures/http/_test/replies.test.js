/* eslint-disable no-undef */

const pool = require('../../database/postgres/pool');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const requestPayload = {
        content: 'abc',
      };

      // Action
      const server = await createServer(container);

      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const server = await createServer(container);
      const {
        userId,
        accessToken,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type spesification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const server = await createServer(container);
      const {
        userId,
        accessToken,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan komentar baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'abc',
      };
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action
      const server = await createServer(container);
      const { userId } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete correctly', async () => {
      // Arrange
      const server = await createServer(container);
      const replyId = 'reply-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 'abc',
      };

      // Action
      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        replyId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const reply = await ReplyTableTestHelper.getReplyById(replyId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(reply.isdelete).toEqual(true);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);
      const notFoundReplyId = 'reply-456';
      const replyId = 'reply-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 'abc',
      };

      // Action
      const {
        accessToken,
        userId,
      } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        replyId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${notFoundReplyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Data balasan komentar tidak ditemukan');
    });

    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const replyId = 'reply-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 'abc',
      };

      // Action
      const { userId } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        replyId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
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
      const anotherUserId = 'user-456';
      const anotherUsername = 'usernamelain';
      const replyId = 'reply-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 'abc',
      };

      // Action
      const { accessToken } = await ServerTestHelper.getAccessTokenWithUserIdHelper({ server });

      await UsersTableTestHelper.addUser({
        id: anotherUserId,
        username: anotherUsername,
      });

      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: anotherUserId,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: anotherUserId,
        threadId,
      });

      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: anotherUserId,
        replyId,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki akses ke balasan komentar ini');
    });
  });
});
