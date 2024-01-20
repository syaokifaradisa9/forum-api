/* eslint-disable no-undef */

const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

const pool = require('../../database/postgres/pool');

const NewThread = require('../../../Domains/threads/entities/NewThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
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
      const fakeIdGenerator = () => '123';

      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      await userRepositoryPostgres.addUser(registerUser);

      const newThread = new NewThread({
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
      });
      await threadRepositoryPostgres.addThread(newThread);

      const newComment = new NewComment({
        content: 'abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addComment = await commentRepositoryPostgres.addComment(newComment);

      expect(addComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'abc',
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      await UsersTableTestHelper.addUser(new RegisterUser({
        username: 'syaokifaradisa',
        password: 'secret_password',
        fullname: 'Syaoki Faradisa',
      }));

      await ThreadTableTestHelper.addThread(new NewThread({
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
      }));

      const date = new Date();
      const comment1Date = date.toISOString();
      date.setHours(date.getHours() + 1);
      const comment2Date = date.toISOString();

      const comment1 = {
        id: 'comment-1',
        content: 'comment 1',
        threadId: 'thread-123',
        owner: 'user-123',
        date: comment1Date,
      };

      const comment2 = {
        id: 'comment-2',
        content: 'comment 2',
        threadId: 'thread-123',
        owner: 'user-123',
        date: comment2Date,
      };

      await CommentTableTestHelper.addComment(comment1);
      await CommentTableTestHelper.addComment(comment2);

      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      const comments = await commentRepositoryPosgres.getCommentsByThreadId('thread-123');

      expect(comments).toEqual([
        new Comment({
          id: comment1.id,
          username: 'syaokifaradisa',
          date: comment1.date,
          content: comment1.content,
          isdelete: false,
        }),
        new Comment({
          id: comment2.id,
          username: 'syaokifaradisa',
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
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action and Assert
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      expect(commentRepositoryPosgres.verifyCommentOwner({
        id: 'comment-123',
        owner: 'user-123',
      })).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw AuthorizationError when doesnt have access to comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action and Assert
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      expect(commentRepositoryPosgres.verifyCommentOwner({
        id: 'comment-123',
        owner: 'user-321',
      })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('verifyCommentAvailableStatus function', () => {
    it('should resolve and not throw NotFoundError when comment is available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action and Assert
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      expect(commentRepositoryPosgres.verifyCommentAvailableStatus('comment-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action and Assert
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      expect(commentRepositoryPosgres.verifyCommentAvailableStatus('comment-321')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should resolve and not to throw NotFoundError when comment is deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPosgres.deleteCommentById('comment-123');

      const comment = await CommentTableTestHelper.getCommentById('comment-123');
      expect(comment.isdelete).toEqual(true);
    });

    it('should throw NotFoundError when comment is not exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action and Assert
      const commentRepositoryPosgres = new CommentRepositoryPostgres(pool, {});
      expect(commentRepositoryPosgres.deleteCommentById('comment-321')).rejects.toThrowError(NotFoundError);
    });
  });
});
