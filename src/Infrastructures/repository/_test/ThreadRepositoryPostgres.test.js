/* eslint-disable no-undef */

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const NewThread = require('../../../Domains/threads/entities/NewThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
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
      const fakeIdGenerator = () => '123';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'abc',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      const fakeIdGenerator = () => '123';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      await userRepositoryPostgres.addUser(registerUser);

      const threadPayload = {
        id: 'thread-123',
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
        date: new Date().toISOString(),
      };

      const threadId = await ThreadTableTestHelper.addThread(threadPayload);

      const threadDetail = {
        id: threadId,
        title: threadPayload.title,
        body: threadPayload.body,
        username: registerUser.username,
        date: threadPayload.date,
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const result = await threadRepositoryPostgres.getThreadById(threadId);

      expect(result).toStrictEqual(threadDetail);
    });

    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.getThreadById('thread-999')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyThreadAvailableStatus function', () => {
    it('should not throw NotFoundError when thread found', async () => {
      const fakeIdGenerator = () => '123';

      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await userRepositoryPostgres.addUser(new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      }));

      await threadRepositoryPostgres.addThread(new NewThread({
        title: 'abc',
        body: 'abcdef',
        owner: 'user-123',
      }));

      await expect(threadRepositoryPostgres.verifyThreadAvailableStatus('thread-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.verifyThreadAvailableStatus('thread-123')).rejects.toThrowError(NotFoundError);
    });
  });
});
