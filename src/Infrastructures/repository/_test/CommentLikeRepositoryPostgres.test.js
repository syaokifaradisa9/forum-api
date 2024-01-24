/* eslint-disable no-undef */

const LikeCommentRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikeTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getAlreadyLikeCommentStatus function', () => {
    it('should return true when user already like a comment', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentLikeId = 'like-123';

      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      await CommentLikeTableTestHelper.addLikeComment({
        id: commentLikeId,
        owner: userId,
        commentId,
      });

      const status = await likeCommentRepositoryPostgres.getAlreadyLikeCommentStatus({
        commentId,
        owner: userId,
      });

      // Assert
      expect(status).toEqual(true);
    });

    it('should return false when user not yet like a comment', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      const status = await likeCommentRepositoryPostgres.getAlreadyLikeCommentStatus({
        commentId,
        owner: userId,
      });

      // Assert
      expect(status).toEqual(false);
    });
  });

  describe('likeComment function', () => {
    it('should resolve and not throw NotFoundError when like a comment success', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });

      // Assert
      await expect(commentLikeRepositoryPostgres.likeComment({
        commentId,
        owner: userId,
      })).resolves.not.toThrowError(NotFoundError);
    });

    it('should resolve and not throw NotFoundError when unlike a comment success', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentLikeId = 'like-123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      await CommentLikeTableTestHelper.addLikeComment({
        id: commentLikeId,
        commentId,
        owner: userId,
      });

      // Assert
      await expect(commentLikeRepositoryPostgres.unlikeComment({
        commentId,
        owner: userId,
      })).resolves.not.toThrowError(NotFoundError);
    });
  });
});
