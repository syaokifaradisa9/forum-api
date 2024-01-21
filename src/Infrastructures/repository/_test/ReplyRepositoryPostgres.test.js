/* eslint-disable no-undef */

const pool = require('../../database/postgres/pool');

const AddedReply = require('../../../Domains/replies/Entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const Reply = require('../../../Domains/replies/Entities/Reply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should return addedReply correctly', async () => {
      // Arrange
      const fakeIdgenerator = () => '123';
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const dateThread = new Date().toISOString();
      const dateComment = new Date().toISOString();

      const requestPayload = {
        content: 'abc',
        commentId,
        owner: userId,
      };
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdgenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
        date: dateThread,
      });
      await CommentTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
        date: dateComment,
      });

      const addedReply = await replyRepositoryPostgres.addReply(requestPayload);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: requestPayload.content,
        owner: requestPayload.owner,
      }));
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      const username = 'syaokifaradisa09';
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const firstReplyId = 'reply-123';
      const secondReplyId = 'reply-456';

      const date = new Date();
      const firstReplyDate = date.toISOString();
      date.setHours(date.getHours() + 1);
      const secondReplyDate = date.toISOString();

      const firstRequestReplyPayload = {
        id: firstReplyId,
        content: 'abc',
        commentId,
        owner: userId,
        date: firstReplyDate,
        isdelete: false,
      };

      const secondRequestReplyPayload = {
        id: secondReplyId,
        content: 'abc',
        commentId,
        owner: userId,
        date: secondReplyDate,
        isdelete: false,
      };

      // Action
      await UsersTableTestHelper.addUser({ id: 'user-123', username });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        owner: userId,
        date: firstReplyDate,
      });

      await CommentTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
        date: firstReplyDate,
      });

      await ReplyTableTestHelper.addReply(firstRequestReplyPayload);
      await ReplyTableTestHelper.addReply(secondRequestReplyPayload);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(replies).toEqual([
        new Reply({
          id: firstReplyId,
          content: firstRequestReplyPayload.content,
          date: firstRequestReplyPayload.date,
          username,
          isdelete: firstRequestReplyPayload.isdelete,
          commentId,
        }),
        new Reply({
          id: secondReplyId,
          content: secondRequestReplyPayload.content,
          date: secondRequestReplyPayload.date,
          username,
          isdelete: secondRequestReplyPayload.isdelete,
          commentId,
        }),
      ]);
    });
  });

  describe('deleteReplyById function', () => {
    it('should change status isdelete to true when reply is deleted', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      //   Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await ReplyTableTestHelper.addReply({ id: replyId });
      await replyRepositoryPostgres.deleteReplyById(replyId);
      const reply = await ReplyTableTestHelper.getReplyById(replyId);

      // Assert
      expect(reply.isdelete).toEqual(true);
    });

    it('should throw NotFoundError when reply is not exists', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const notFoundReplyId = 'reply-321';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      //   Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await ReplyTableTestHelper.addReply({ id: replyId });

      // Assert
      await expect(replyRepositoryPostgres.deleteReplyById(notFoundReplyId))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should resolve and not throw AuthorizationError when user have access to reply', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
      });

      // Assert
      expect(replyRepositoryPostgres.verifyReplyOwner({
        id: replyId,
        owner: userId,
      })).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw AuthorizationError when doesnt have access to reply', async () => {
      // Arrange
      const userId = 'user-123';
      const anotherUserId = 'user-456';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
      });

      // Assert
      expect(replyRepositoryPostgres.verifyReplyOwner({
        id: replyId,
        owner: anotherUserId,
      })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('verifyReplyAvailableStatus function', () => {
    it('should resolve and not throw NotFoundError when reply is available', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
      });

      // Assert
      expect(replyRepositoryPostgres.verifyReplyAvailableStatus(replyId))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is not available', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const notFoundReplyId = 'reply-456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await ReplyTableTestHelper.addReply({
        id: replyId,
        owner: userId,
      });

      // Assert
      expect(replyRepositoryPostgres.verifyReplyAvailableStatus(notFoundReplyId))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
