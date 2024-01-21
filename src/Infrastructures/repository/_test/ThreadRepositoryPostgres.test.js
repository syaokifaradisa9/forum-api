/* eslint-disable no-undef */

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const newThread = new NewThread({
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: threadId,
        title: 'abc',
        owner: userId,
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      // Assert
      const threadId = 'thread-123';
      const userId = 'user-123';
      const username = 'syaokifaradisa09';
      const threadDate = new Date().toISOString();

      const threadPayload = {
        id: 'thread-123',
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
        date: threadDate,
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({ id: userId, username });
      await ThreadTableTestHelper.addThread({ id: threadId, date: threadDate });
      const result = await threadRepositoryPostgres.getThreadById(threadId);

      // Assert
      expect(result).toStrictEqual({
        id: threadId,
        title: threadPayload.title,
        body: threadPayload.body,
        username,
        date: threadDate,
      });
    });

    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.getThreadById('thread-999')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyThreadAvailableStatus function', () => {
    it('should not throw NotFoundError when thread found', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId });

      // Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailableStatus('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.verifyThreadAvailableStatus('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
