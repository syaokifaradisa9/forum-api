/* eslint-disable no-undef */

const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should return added comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const commentId = 'comment-123';
      const newComment = new NewComment({
        content: 'abc',
        threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      const addComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addComment).toStrictEqual(new AddedComment({
        id: commentId,
        content: newComment.content,
        owner: userId,
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      // arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const firstCommentId = 'comment-123';
      const secondCommentId = 'comment-321';
      const username = 'syaokifaradisa09';

      const date = new Date();
      const comment1Date = date.toISOString();
      date.setHours(date.getHours() + 1);
      const comment2Date = date.toISOString();

      const comment1 = {
        id: firstCommentId,
        content: 'comment 1',
        threadId,
        owner: userId,
        date: comment1Date,
      };

      const comment2 = {
        id: secondCommentId,
        content: 'comment 2',
        threadId,
        owner: userId,
        date: comment2Date,
      };

      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId, username });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment(comment1);
      await CommentTableTestHelper.addComment(comment2);

      const comments = await commentRepositoryPosgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toEqual([
        new Comment({
          id: comment1.id,
          username,
          date: comment1.date,
          content: comment1.content,
          isdelete: false,
        }),
        new Comment({
          id: comment2.id,
          username,
          date: comment2.date,
          content: comment2.content,
          isdelete: false,
        }),
      ]);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should resolve and not throw AuthorizationError when user have access to comment', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Assert
      expect(commentRepositoryPosgres.verifyCommentOwner({
        id: commentId,
        owner: userId,
      })).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw AuthorizationError when doesnt have access to comment', async () => {
      // Arrange
      const commentId = 'comment-123';
      const userId = 'user-123';
      const anotherUserId = 'user-456';
      const threadId = 'thread-123';
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Assert
      expect(commentRepositoryPosgres.verifyCommentOwner({
        id: commentId,
        owner: anotherUserId,
      })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('verifyCommentAvailableStatus function', () => {
    it('should resolve and not throw NotFoundError when comment is available', async () => {
      // Arrange
      const commentId = 'comment-123';
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Assert
      expect(commentRepositoryPosgres.verifyCommentAvailableStatus(commentId))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is not available', async () => {
      // Arrange
      const commentId = 'comment-123';
      const notFoundCommentId = 'comment-456';
      const userId = 'user-123';
      const threadId = 'thread-123';

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Assert
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      expect(commentRepositoryPosgres.verifyCommentAvailableStatus(notFoundCommentId))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should change status isdelete to true when comment is deleted', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      await commentRepositoryPosgres.deleteCommentById('comment-123');
      const comment = await CommentTableTestHelper.getCommentById(commentId);

      // Assert
      expect(comment.isdelete).toEqual(true);
    });

    it('should throw NotFoundError when comment is not exists', async () => {
      // Arrange
      const commentId = 'comment-123';
      const notFoundCommentId = 'comment-456';
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });

      // Assert
      expect(commentRepositoryPosgres.deleteCommentById(notFoundCommentId))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
